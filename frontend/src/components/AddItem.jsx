import React, { useState, useEffect } from "react";
import Axios from "axios";

function Item() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerItem, setPricePerItem] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";


  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await Axios.get(`${API_URL}/items/get-items`);
        if (res.data.success) setItemsList(res.data.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  // Update suggestions when typing
  useEffect(() => {
    if (!name) return setSuggestions([]);
    const filtered = itemsList.filter((i) =>
      i.name.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestions(filtered);
  }, [name, itemsList]);

  // When user selects suggestion, autofill quantity and price
  const handleSelectSuggestion = (item) => {
    setName(item.name);
    const unitPrice = (Number(item.price) / Number(item.quantity)) || 0;
    setPricePerItem(unitPrice.toFixed(2));
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    const qty = Number(quantity);
    const price = Number(pricePerItem);

    if (isNaN(qty) || qty <= 0) {
      setErrors({ quantity: "Quantity must be a positive number" });
      setLoading(false);
      return;
    }
    if (isNaN(price) || price <= 0) {
      setErrors({ pricePerItem: "Price must be a positive number" });
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Check for existing items with same name & unit price
      const existingItem = itemsList.find(
        (i) =>
          i.name.toLowerCase() === name.toLowerCase() &&
          Number((i.price / i.quantity).toFixed(2)) === price
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + qty;
        const newTotalPrice = Number((newQuantity * price).toFixed(2));

        await Axios.patch(`${API_URL}/items/update-item`, {
          itemId: existingItem._id,
          newQuantity,
          newPrice: newTotalPrice,
        });

        setSuccess(`Existing item updated. New quantity: ${newQuantity}`);
      } else {
        const totalPrice = Number((qty * price).toFixed(2));
        await Axios.post(`${API_URL}/items/add-item`, {
          name,
          quantity: qty,
          price: totalPrice,
          invoiceNumber,
          message,
        });

        setSuccess("Item created successfully!");
      }

      // Reset form
      setName("");
      setQuantity("");
      setPricePerItem("");
      setInvoiceNumber("");
      setMessage("");
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Failed to submit item" });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-white bg-green-200 text-black placeholder-gray-600";
  const errorClass = "text-red-600 text-sm mt-1";

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-green-400 rounded-xl shadow-xl relative">
      <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-md">
        Add New Item
      </h2>

      {success && (
        <div className="bg-white text-green-600 px-4 py-2 rounded mb-4 text-center font-medium shadow-sm">
          {success}
        </div>
      )}
      {errors.submit && (
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-center font-medium shadow-sm">
          {errors.submit}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder="Item Name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow-md">
              {suggestions.map((i) => (
                <li
                  key={i._id}
                  className="px-3 py-2 cursor-pointer hover:bg-green-200"
                  onClick={() => handleSelectSuggestion(i)}
                >
                  {i.name} - ₹{((i.price / i.quantity) || 0).toFixed(2)} per unit
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.name && <span className={errorClass}>{errors.name}</span>}

        <input
          type="number"
          placeholder="Quantity"
          className={inputClass}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {errors.quantity && <span className={errorClass}>{errors.quantity}</span>}

        <input
          type="number"
          placeholder="Price per Item"
          className={inputClass}
          value={pricePerItem}
          onChange={(e) => setPricePerItem(e.target.value)}
        />
        {errors.pricePerItem && <span className={errorClass}>{errors.pricePerItem}</span>}

        <input
          type="text"
          placeholder="Invoice Number"
          className={inputClass}
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />
        {errors.invoiceNumber && <span className={errorClass}>{errors.invoiceNumber}</span>}

        <textarea
          placeholder="Message (Optional)"
          rows={3}
          className={`${inputClass} resize-none`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {errors.message && <span className={errorClass}>{errors.message}</span>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-white text-green-600 font-bold py-3 rounded-lg shadow-md hover:scale-105 transform transition duration-300"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default Item;
