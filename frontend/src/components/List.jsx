import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import Axios from "axios";

export default function List() {
  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: "", action: "", data: null });
  const [editFields, setEditFields] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const API_ITEMS = "http://localhost:5000/api/v1/items";
  const API_FORMS = "http://localhost:5000/api/v1/forms";

  const fetchAll = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [itemsRes, formsRes] = await Promise.all([
        Axios.get(`${API_ITEMS}/get-items`),
        Axios.get(`${API_FORMS}/get-forms`),
      ]);

      console.log("itemsRes:", itemsRes?.data ?? itemsRes);
      console.log("formsRes:", formsRes?.data ?? formsRes);

      const itemsData =
        itemsRes?.data?.items ??
        itemsRes?.data?.data ??
        itemsRes?.data ??
        (Array.isArray(itemsRes) ? itemsRes : null) ??
        null;
      const formsData =
        formsRes?.data?.forms ??
        formsRes?.data?.data ??
        formsRes?.data ??
        (Array.isArray(formsRes) ? formsRes : null) ??
        null;

      if (Array.isArray(itemsData)) {
        setItems(itemsData);
      } else {
        setItems([]);
        if (itemsRes?.data && !Array.isArray(itemsData)) {
          setErrorMessage((prev) => prev || "Items endpoint returned unexpected shape. See console.");
        }
      }

      if (Array.isArray(formsData)) {
        setForms(formsData);
      } else {
        setForms([]);
        if (formsRes?.data && !Array.isArray(formsData)) {
          setErrorMessage((prev) => prev || "Forms endpoint returned unexpected shape. See console.");
        }
      }
    } catch (e) {
      console.error("fetchAll error:", e);
      setItems([]);
      setForms([]);
      setErrorMessage("Network or server error while fetching data. Check console/network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openEditModalForItem = (item) => {
    setEditFields({
      name: item.name ?? "",
      price: item.price ?? "",
      quantity: item.quantity ?? "",
      invoiceNumber: item.invoiceNumber ?? "",
      message: item.message ?? "",
      consumable: !!(item.consumed ?? item.consumable),
    });
    setModal({ show: true, type: "item", action: "edit", data: item });
  };

  const openDeleteModal = (type, data) => setModal({ show: true, type, action: "delete", data });
  const closeModal = () => setModal({ show: false, type: "", action: "", data: null });

  const handleDelete = async () => {
    const { type, data } = modal;
    try {
      if (type === "item") {
        await Axios.delete(`${API_ITEMS}/delete-item`, { data: { itemId: data._id } });
      } else {
        await Axios.delete(`${API_FORMS}/delete-form`, { data: { formId: data._id } });
      }
      await fetchAll();
    } catch (e) {
      console.error("delete error:", e);
      setErrorMessage("Failed to delete. See console.");
    } finally {
      closeModal();
    }
  };

  const toggleAvailable = async (id) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    const newVal = !item.isAvailable;
    const backup = [...items];
    setItems((s) => s.map((it) => (it._id === id ? { ...it, isAvailable: newVal } : it)));
    try {
      await Axios.patch(`${API_ITEMS}/update-item`, { itemId: id, newIsAvailable: newVal });
      await fetchAll();
    } catch (e) {
      console.error("toggleAvailable error:", e);
      setItems(backup);
      setErrorMessage("Failed to update availability");
    }
  };

  const toggleConsumable = async (id) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    const newVal = !(item.consumed ?? item.consumable ?? false);
    const backup = [...items];
    setItems((s) => s.map((it) => (it._id === id ? { ...it, consumed: newVal } : it)));
    try {
      await Axios.patch(`${API_ITEMS}/update-item`, { itemId: id, newConsumable: newVal });
      await fetchAll();
    } catch (e) {
      console.error("toggleConsumable error:", e);
      setItems(backup);
      setErrorMessage("Failed to update consumable flag");
    }
  };

  const handleEditChange = (field, value) => setEditFields((s) => ({ ...s, [field]: value }));

  const handleEditSave = async () => {
    const { data } = modal;
    if (!data) return closeModal();
    const payload = {
      itemId: data._id,
      newName: editFields.name,
      newPrice: editFields.price,
      newQuantity: editFields.quantity,
      newInvoiceNumber: editFields.invoiceNumber,
      newMessage: editFields.message,
      newConsumable: !!editFields.consumable,
    };
    try {
      await Axios.patch(`${API_ITEMS}/update-item`, payload);
      await fetchAll();
    } catch (e) {
      console.error("handleEditSave error:", e);
      setErrorMessage("Failed to save changes");
    } finally {
      closeModal();
    }
  };

  if (loading) return <div className="text-center mt-12 text-green-600">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-green-400 rounded-xl shadow-xl relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("items")} className={`px-6 py-2 font-bold rounded-l-lg ${activeTab === "items" ? "bg-white text-green-600" : "bg-green-200 text-black"}`}>Items</button>
          <button onClick={() => setActiveTab("forms")} className={`px-6 py-2 font-bold rounded-r-lg ${activeTab === "forms" ? "bg-white text-green-600" : "bg-green-200 text-black"}`}>Forms</button>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="bg-white px-3 py-1 rounded shadow-sm">Refresh</button>
        </div>
      </div>

      {errorMessage && <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-center">{errorMessage}</div>}

      {modal.show && modal.action === "delete" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold text-center mb-3">Confirm Delete</h2>
            <p className="text-center mb-4">Are you sure you want to delete this {modal.type}?</p>
            <div className="flex justify-center gap-3">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
              <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modal.show && modal.action === "edit" && modal.type === "item" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold text-center mb-3">Edit item</h2>
            <div className="flex flex-col gap-3">
              <input value={editFields.name} onChange={(e) => handleEditChange("name", e.target.value)} className="px-3 py-2 border rounded" placeholder="Name" />
              <input value={editFields.price} onChange={(e) => handleEditChange("price", e.target.value)} type="number" className="px-3 py-2 border rounded" placeholder="Price" />
              <input value={editFields.quantity} onChange={(e) => handleEditChange("quantity", e.target.value)} type="number" className="px-3 py-2 border rounded" placeholder="Quantity" />
              <input value={editFields.invoiceNumber} onChange={(e) => handleEditChange("invoiceNumber", e.target.value)} className="px-3 py-2 border rounded" placeholder="Invoice Number" />
              <input value={editFields.message} onChange={(e) => handleEditChange("message", e.target.value)} className="px-3 py-2 border rounded" placeholder="Message" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!editFields.consumable} onChange={(e) => handleEditChange("consumable", e.target.checked)} />
                <span>Consumable</span>
              </label>
              <div className="flex justify-center gap-3 mt-2">
                <button onClick={handleEditSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "items" && (
        <div className="flex flex-col gap-4">
          {items.length === 0 && <div className="text-center text-gray-700">No items found</div>}
          {items.map((item) => (
            <div key={item._id} className="flex justify-between items-start bg-green-200 px-4 py-3 rounded-lg shadow-md">
              <div>
                <h3 className="font-bold text-lg text-green-700">{item.name}</h3>
                <p className="text-sm text-gray-700">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-700">Price: ₹{item.price}</p>
                <p className="text-sm text-gray-700">Invoice: {item.invoiceNumber || "-"}</p>
                {item.message && <p className="text-sm text-gray-700">Message: {item.message}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2 mb-2">
                  <button onClick={() => toggleAvailable(item._id)} className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isAvailable ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{item.isAvailable ? "Available" : "Not Available"}</button>
                  <button onClick={() => toggleConsumable(item._id)} className={`px-3 py-1 rounded-full text-xs font-semibold ${(item.consumed ?? item.consumable) ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{(item.consumed ?? item.consumable) ? "Consumable" : "Non-Consumable"}</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModalForItem(item)} className="p-2 bg-white rounded-full shadow-md hover:bg-green-100"><Edit size={16} className="text-green-700" /></button>
                  <button onClick={() => openDeleteModal("item", item)} className="p-2 bg-white rounded-full shadow-md hover:bg-red-100"><Trash2 size={16} className="text-red-600" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "forms" && (
        <div className="flex flex-col gap-4">
          {forms.length === 0 && <div className="text-center text-gray-700">No forms found</div>}
          {forms.map((form) => (
            <div key={form._id} className="flex justify-between items-start bg-green-200 px-4 py-3 rounded-lg shadow-md">
              <div>
                <h3 className="font-bold text-lg text-green-700">{form.shop}</h3>
                <p className="text-sm text-gray-700">Item: {form.item}</p>
                <p className="text-sm text-gray-700">Quantity: {form.quantity ?? "-"}</p>
                <p className="text-sm text-gray-700">Unit Price: ₹{form.price ?? "-"}</p>
                <p className="text-sm text-gray-700 font-semibold">Total Price: ₹{form.totalPrice ?? "-"}</p>
                <p className="text-sm text-gray-700">Room: {form.room}</p>
                {form.message && <p className="text-sm text-gray-700">Message: {form.message}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openDeleteModal("form", form)} className="p-2 bg-white rounded-full shadow-md hover:bg-red-100"><Trash2 size={16} className="text-red-600" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
