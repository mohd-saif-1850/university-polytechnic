import React, { useState, useEffect } from "react";
import Axios from "axios";

function Form() {
  const [shop, setShop] = useState("");
  const [item, setItem] = useState("");
  const [room, setRoom] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [itemsList, setItemsList] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";


  const fetchItems = async () => {
    try {
      const res = await Axios.get(`${API_URL}/items/get-items`);
      if (res.data.success) setItemsList(res.data.items || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!item) {
      setUnitPrice("");
      setTotalPrice("");
      return;
    }
    const found = itemsList.find((i) => String(i.name).toLowerCase() === String(item).toLowerCase());
    if (!found) {
      setUnitPrice("");
      setTotalPrice("");
      return;
    }
    if (!found.isAvailable || (Number(found.quantity) || 0) <= 0) {
      setUnitPrice("");
      setTotalPrice("");
      return;
    }
    const totalItemPrice = Number(found.price) || 0;
    const itemTotalQty = Number(found.quantity) || 1;
    const perUnit = itemTotalQty > 0 ? totalItemPrice / itemTotalQty : totalItemPrice;
    setUnitPrice(perUnit.toFixed(2));
    const q = Number(quantity) || 0;
    setTotalPrice(q > 0 ? (perUnit * q).toFixed(2) : "");
  }, [item, quantity, itemsList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    if (!shop) {
      setErrors({ shop: "Shop is required" });
      setLoading(false);
      return;
    }
    if (!item) {
      setErrors({ item: "Item is required" });
      setLoading(false);
      return;
    }
    const q = Number(quantity);
    if (!q || q <= 0) {
      setErrors({ quantity: "Enter a valid quantity" });
      setLoading(false);
      return;
    }

    try {
      const resItems = await Axios.get(`${API_URL}/items/get-items`);
      const freshItems = resItems.data?.items || [];
      const found = freshItems.find((i) => String(i.name).toLowerCase() === String(item).toLowerCase());
      if (!found) {
        setErrors({ item: "Selected item not found" });
        setLoading(false);
        return;
      }
      if (!found.isAvailable) {
        setErrors({ item: "Selected item is not available" });
        setLoading(false);
        return;
      }
      if ((Number(found.quantity) || 0) < q) {
        setErrors({ quantity: `Only ${found.quantity} available` });
        setLoading(false);
        return;
      }

      const res = await Axios.post(`${API_URL}/forms/add-form`, {
        shop,
        item,
        room: room || 0,
        message,
        quantity: q
      });

      if (res.data?.success) {
        setShop("");
        setItem("");
        setRoom("");
        setQuantity("");
        setUnitPrice("");
        setTotalPrice("");
        setMessage("");
        setSuccess(res.data.message || "Form submitted successfully!");
        await fetchItems();
      } else {
        setErrors({ submit: res.data?.message || "Failed to submit form" });
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      setErrors({ submit: serverMsg || "Failed to submit form" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "px-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-white bg-green-200 text-black placeholder-gray-600";
  const priceClass =
    "px-4 py-3 rounded-lg border border-green-200 bg-gray-300 text-gray-700 cursor-not-allowed";
  const errorClass = "text-red-600 text-sm mt-1";

  const availableItems = itemsList.filter(i => i.isAvailable && (Number(i.quantity) || 0) > 0);

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-green-400 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-md">Add New Form</h2>

      {success && <div className="bg-white text-green-600 px-4 py-2 rounded mb-4 text-center font-medium shadow-sm">{success}</div>}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input type="text" placeholder="Shop Name" className={inputClass} value={shop} onChange={(e) => setShop(e.target.value)} />
        {errors.shop && <span className={errorClass}>{errors.shop}</span>}

        <select value={item} onChange={(e) => setItem(e.target.value)} className={inputClass}>
          <option value="">Select Item</option>
          {availableItems.map((i) => (
            <option key={i._id} value={i.name}>
              {i.name} - ₹{((Number(i.price) || 0) / (Number(i.quantity) || 1)).toFixed(2)} per unit — {i.quantity} in stock
            </option>
          ))}
        </select>
        {errors.item && <span className={errorClass}>{errors.item}</span>}

        <input type="number" placeholder="Quantity" className={inputClass} value={quantity} min={1} onChange={(e) => setQuantity(e.target.value)} />
        {errors.quantity && <span className={errorClass}>{errors.quantity}</span>}

        <input type="text" placeholder="Price per Unit" className={priceClass} value={unitPrice ? `₹${unitPrice}` : ""} disabled />
        <input type="text" placeholder="Total Price" className={priceClass} value={totalPrice ? `₹${totalPrice}` : ""} disabled />

        <input type="number" placeholder="Room Number" className={inputClass} value={room} onChange={(e) => setRoom(e.target.value)} />
        {errors.room && <span className={errorClass}>{errors.room}</span>}

        <textarea placeholder="Message (Optional)" rows={3} className={`${inputClass} resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} />
        {errors.message && <span className={errorClass}>{errors.message}</span>}
        {errors.submit && <div className="text-red-600 text-sm">{errors.submit}</div>}

        <button type="submit" disabled={loading} className="mt-4 bg-white text-green-600 font-bold py-3 rounded-lg shadow-md hover:scale-105 transform transition duration-300">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default Form;
