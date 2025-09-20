import React, { useState, useEffect } from "react";
import Axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

function List() {
  const [tab, setTab] = useState("items");
  const [items, setItems] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editData, setEditData] = useState({});
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  // Convert any value to number safely
  const safeNumber = (v) => {
    if (v === undefined || v === null) return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  // Normalize items
  const normalizeItems = (rawItems) => {
    return rawItems.map((i) => {
      const quantity = safeNumber(i.quantity ?? i.qty ?? i.count ?? i.units ?? i.availableQuantity ?? i.amount);
      const totalPrice = safeNumber(i.price ?? i.totalPrice ?? i.amount ?? i.total);
      const unitPrice = !Number.isNaN(quantity) && quantity > 0 ? totalPrice / quantity : safeNumber(i.unitPrice ?? i.pricePerUnit ?? i.pricePerItem);
      return {
        ...i,
        __parsed: {
          quantity: Number.isNaN(quantity) ? null : quantity,
          totalPrice: Number.isNaN(totalPrice) ? null : totalPrice,
          unitPrice: Number.isNaN(unitPrice) ? null : unitPrice,
        },
      };
    });
  };

  const normalizeForms = (rawForms) => {
    return rawForms.map((f) => {
      const quantity = safeNumber(f.quantity ?? f.qty ?? f.count);
      const totalPrice = safeNumber(f.totalPrice ?? f.price ?? f.amount);
      const unitPrice = !Number.isNaN(quantity) && quantity > 0 ? totalPrice / quantity : totalPrice;
      return {
        ...f,
        __parsed: {
          quantity: Number.isNaN(quantity) ? null : quantity,
          totalPrice: Number.isNaN(totalPrice) ? null : totalPrice,
          unitPrice: Number.isNaN(unitPrice) ? null : unitPrice,
        },
      };
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemRes, formRes] = await Promise.all([
        Axios.get(`${API_URL}/items/get-items`),
        Axios.get(`${API_URL}/forms/get-forms`),
      ]);
      setItems(normalizeItems(itemRes.data.items || []));
      setForms(normalizeForms(formRes.data.forms || []));
    } catch (err) {
      console.error(err);
      setItems([]);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "item") {
        await Axios.delete(`${API_URL}/items/delete-item`, { data: { itemId: deleteTarget.id } });
      } else {
        await Axios.delete(`${API_URL}/forms/delete-form`, { data: { formId: deleteTarget.id } });
      }
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      if (editTarget.type === "item") {
        await Axios.patch(`${API_URL}/items/update-item`, { itemId: editTarget.id, ...editData });
      } else {
        await Axios.patch(`${API_URL}/forms/update-form`, { formId: editTarget.id, ...editData });
      }
      setEditTarget(null);
      setEditData({});
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "-";

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-green-400 rounded-xl shadow-xl text-white">
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setTab("items")}
          className={`px-6 py-2 rounded-l-lg font-semibold ${tab === "items" ? "bg-white text-green-600" : "bg-green-600"}`}
        >
          Items
        </button>
        <button
          onClick={() => setTab("forms")}
          className={`px-6 py-2 rounded-r-lg font-semibold ${tab === "forms" ? "bg-white text-green-600" : "bg-green-600"}`}
        >
          Forms
        </button>
      </div>

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white text-green-700 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-green-600 text-white">
              {tab === "items" ? (
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Price/Item</th>
                  <th className="p-3">Total Price</th>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Actions</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-3 text-left">Shop</th>
                  <th className="p-3">Item</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Room</th>
                  <th className="p-3">Price/Item</th>
                  <th className="p-3">Total Price</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {tab === "items" &&
                items.map((i) => {
                  const { quantity, totalPrice, unitPrice } = i.__parsed;
                  return (
                    <tr key={i._id} className="border-b">
                      <td className="p-3">{i.name || "-"}</td>
                      <td className="p-3 text-center">{quantity ?? "—"}</td>
                      <td className="p-3 text-center">{unitPrice != null ? `₹${unitPrice.toFixed(2)}` : "—"}</td>
                      <td className="p-3 text-center">{totalPrice != null ? `₹${totalPrice.toFixed(2)}` : "—"}</td>
                      <td className="p-3 text-center">{i.invoiceNumber || "-"}</td>
                      <td className="p-3 text-center">{formatDate(i.createdAt)}</td>
                      <td className="p-3">{i.message || "-"}</td>
                      <td className="p-3 flex gap-3 justify-center">
                        <FaEdit
                          className="text-blue-500 cursor-pointer"
                          onClick={() => {
                            setEditTarget({ type: "item", id: i._id });
                            setEditData({
                              newName: i.name || "",
                              newQuantity: quantity || "",
                              newPrice: totalPrice || "",
                              newInvoiceNumber: i.invoiceNumber || "",
                              newMessage: i.message || "",
                            });
                          }}
                        />
                        <FaTrash className="text-red-500 cursor-pointer" onClick={() => setDeleteTarget({ type: "item", id: i._id })} />
                      </td>
                    </tr>
                  );
                })}

              {tab === "forms" &&
                forms.map((f) => {
                  const { quantity, totalPrice, unitPrice } = f.__parsed;
                  return (
                    <tr key={f._id} className="border-b">
                      <td className="p-3">{f.shop || "-"}</td>
                      <td className="p-3">{f.item || "-"}</td>
                      <td className="p-3 text-center">{quantity ?? "—"}</td>
                      <td className="p-3 text-center">{f.room || "-"}</td>
                      <td className="p-3 text-center">{unitPrice != null ? `₹${unitPrice.toFixed(2)}` : "—"}</td>
                      <td className="p-3 text-center">{totalPrice != null ? `₹${totalPrice.toFixed(2)}` : "—"}</td>
                      <td className="p-3 text-center">{formatDate(f.createdAt)}</td>
                      <td className="p-3">{f.message || "-"}</td>
                      <td className="p-3 flex gap-3 justify-center">
                        <FaEdit
                          className="text-blue-500 cursor-pointer"
                          onClick={() => {
                            setEditTarget({ type: "form", id: f._id });
                            setEditData({
                              newShop: f.shop || "",
                              newRoom: f.room || "",
                              newItem: f.item || "",
                              newQuantity: quantity || "",
                              newMessage: f.message || "",
                            });
                          }}
                        />
                        <FaTrash className="text-red-500 cursor-pointer" onClick={() => setDeleteTarget({ type: "form", id: f._id })} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <h3 className="text-xl font-semibold mb-4 text-red-600">Confirm Delete</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this {deleteTarget.type}?
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handleDelete} className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded-lg">
                Delete
              </button>
              <button onClick={() => setDeleteTarget(null)} className="bg-gray-300 cursor-pointer px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4 text-green-600">Edit {editTarget.type}</h3>
            <div className="flex flex-col gap-3">
              {Object.keys(editData).map((key) => (
                <input
                  key={key}
                  className="border p-2 rounded w-full"
                  value={editData[key]}
                  onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                />
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={handleEdit} className="bg-green-500 cursor-pointer text-white px-4 py-2 rounded-lg">
                Save
              </button>
              <button onClick={() => setEditTarget(null)} className="bg-gray-300 cursor-pointer px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default List;
