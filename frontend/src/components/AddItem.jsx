import React, { useState, useEffect } from "react";
import Axios from "axios";

function Item() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await Axios.get(`${API_URL}/items/get-items`);
      if (res.data.success) setItemsList(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Suggestions
  useEffect(() => {
    if (!name) return setSuggestions([]);
    const filtered = itemsList.filter((i) =>
      i.name.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestions(filtered);
  }, [name, itemsList]);

  const handleSelectSuggestion = (item) => {
    setSelectedItem(item);
    setName(item.name);
    setQuantity(item.quantity);
    setUnitPrice((item.price / item.quantity).toFixed(2));
    setInvoiceNumber(item.invoiceNumber || "");
    setSuggestions([]);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnitPrice("");
    setInvoiceNumber("");
    setMessage("");
    setSelectedItem(null);
    setPendingUpdate(null);
    setShowModal(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (!qty || qty <= 0) {
      setErrors({ quantity: "Enter a valid quantity" });
      setLoading(false);
      return;
    }

    if (!price || price <= 0) {
      setErrors({ unitPrice: "Enter a valid unit price" });
      setLoading(false);
      return;
    }

    try {
      if (selectedItem) {
        // Update existing item
        const unitPriceDB = Number((selectedItem.price / selectedItem.quantity).toFixed(2));
        const invoiceDB = selectedItem.invoiceNumber || "";

        if (unitPriceDB !== price || invoiceDB !== invoiceNumber) {
          setPendingUpdate({ qty, price });
          setShowModal(true);
          setLoading(false);
          return;
        }

        await Axios.patch(`${API_URL}/items/update-item`, {
          itemId: selectedItem._id,
          newQuantity: qty,
          newTotalPrice: qty * price,
        });
        showSuccess("Item updated successfully.");
        resetForm();
      } else {
        // Add new item
        const totalPrice = qty * price;
        await Axios.post(`${API_URL}/items/add-item`, {
          name,
          quantity: qty,
          unitPrice : totalPrice / qty,
          price: totalPrice,
          invoiceNumber,
          message,
        });
        showSuccess("Item added successfully.");
        resetForm();
      }
      fetchItems();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || "Error submitting item" });
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = async () => {
    if (pendingUpdate && selectedItem) {
      await Axios.patch(`${API_URL}/items/update-item`, {
        itemId: selectedItem._id,
        newQuantity: pendingUpdate.qty,
        newTotalPrice: pendingUpdate.qty * pendingUpdate.unitPrice,
        newInvoiceNumber: invoiceNumber,
        newUnitPrice: pendingUpdate.unitPrice,
      });
      showSuccess("Item updated successfully.");
      resetForm();
      fetchItems();
    }
  };

  const inputClass =
    "px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-white bg-green-200 text-black placeholder-gray-600";
  const errorClass = "text-red-600 text-sm mt-1";

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-green-400 rounded-xl shadow-xl relative">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Add or Update Item</h2>

      {success && <div className="bg-white text-green-600 px-4 py-2 rounded mb-4 text-center font-medium shadow-md">{success}</div>}
      {errors.submit && <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-center font-medium shadow-sm">{errors.submit}</div>}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="relative">
          <input type="text" placeholder="Item Name" className={`${inputClass} w-full`} value={name} onChange={(e) => setName(e.target.value)} />
          {suggestions.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow-md">
              {suggestions.map((i) => (
                <li key={i._id} className="px-3 py-2 cursor-pointer hover:bg-green-200" onClick={() => handleSelectSuggestion(i)}>
                  {i.name} - ₹{((i.price / i.quantity) || 0).toFixed(2)} per unit
                </li>
              ))}
            </ul>
          )}
        </div>

        <input type="number" placeholder="Quantity" className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        {errors.quantity && <span className={errorClass}>{errors.quantity}</span>}

        <input type="number" placeholder="Unit Price" className={inputClass} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        {errors.unitPrice && <span className={errorClass}>{errors.unitPrice}</span>}

        <input type="text" placeholder="Invoice Number" className={inputClass} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />

        <textarea placeholder="Message (Optional)" rows={3} className={`${inputClass} resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} />

        <button type="submit" disabled={loading} className="mt-4 cursor-pointer bg-white text-green-600 font-bold py-3 rounded-lg shadow-md hover:scale-105 transform transition duration-300">
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-green-800 font-semibold mb-2">Confirm Update</h3>
            <p className="text-gray-700 mb-4">You are about to modify the price or invoice number of an existing item. Please confirm to proceed.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              <button onClick={handleModalConfirm} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Item;
