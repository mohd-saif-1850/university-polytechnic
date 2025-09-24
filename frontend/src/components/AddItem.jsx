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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await Axios.get(`${API_URL}/items/get-items`);
      if (res.data.success) {
        setItemsList(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
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
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    const qty = Number(quantity);
    const price = Number(unitPrice);
    const wordCount = name.trim().split(/\s+/).length;

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

    if (wordCount > 50) {
      setErrors({ name: "Item name cannot exceed 50 words" });
      setLoading(false);
      return;
    }

    const exists = itemsList.some(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
      setErrors({ name: "This item already exists" });
      setLoading(false);
      return;
    }

    try {
      const totalPrice = qty * price;
      await Axios.post(`${API_URL}/items/add-item`, {
        name: name.trim(),
        quantity: qty,
        unitPrice: price,
        price: totalPrice,
        invoiceNumber,
        message,
      });

      showSuccess("Item added successfully.");
      resetForm();
      fetchItems();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || "Error submitting item" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-white bg-green-200 text-black placeholder-gray-600";
  const errorClass = "text-red-600 text-sm mt-1";

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-green-400 rounded-xl shadow-xl relative">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Add Item
      </h2>

      {success && (
        <div className="bg-white text-green-600 px-4 py-2 rounded mb-4 text-center font-medium shadow-md">
          {success}
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-center font-medium shadow-sm">
          {errors.submit}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item Name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="Unit Price"
          className={inputClass}
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />
        {errors.unitPrice && <span className={errorClass}>{errors.unitPrice}</span>}

        <input
          type="text"
          placeholder="Invoice Number"
          className={inputClass}
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />

        <div className="flex flex-col">
          <textarea
            placeholder="Message (Optional, max 200 characters)"
            rows={3}
            className={`${inputClass} resize-none`}
            value={message}
            onChange={(e) => {
              const text = e.target.value;
              if (text.length <= 200) {
                setMessage(text);
                setErrors((prev) => ({ ...prev, message: "" }));
              } else {
                setErrors((prev) => ({
                  ...prev,
                  message: "Message cannot exceed 200 characters.",
                }));
              }
            }}
          />
          
          <div className="text-sm text-white mt-1 font-medium">
            {message.length}/200 Charcters
          </div>

  {errors.message && (
    <span className={errorClass}>{errors.message}</span>
  )}
</div>


        <button
          type="submit"
          disabled={loading}
          className="mt-4 cursor-pointer bg-white text-green-600 font-bold py-3 rounded-lg shadow-md hover:scale-105 transform transition duration-300"
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default Item;
