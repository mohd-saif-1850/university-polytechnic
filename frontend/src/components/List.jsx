import React, { useState, useEffect } from "react";
import Axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

function List() {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("items");
  const [items, setItems] = useState([]);
  const [forms, setForms] = useState([]);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addData, setAddData] = useState({
    name: "",
    quantity: "",
    unitPrice: "",
    invoiceNumber: "",
    message: "",
  });
  const [addErrors, setAddErrors] = useState({});
  const [editTarget, setEditTarget] = useState(null);
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemRes, formRes] = await Promise.all([
        Axios.get(`${API_URL}/items/get-items`),
        Axios.get(`${API_URL}/forms/get-forms`),
      ]);

      const normalizedItems = (itemRes.data.items || []).map((i) => {
        const quantity = safeNumber(i.quantity);
        const unitPrice = safeNumber(i.price / i.quantity);
        const totalPrice = safeNumber(i.price);
        return { ...i, quantity, unitPrice, totalPrice, isAvailable: i.quantity > 0 && i.isAvailable };
      });
      
      const normalizedForms = (formRes.data.forms || []).map((f) => {
        const quantity = safeNumber(f.quantity);
        const unitPrice = safeNumber(f.price);
        const totalPrice = safeNumber(f.totalPrice);
        return { ...f, quantity, unitPrice, totalPrice };
      });

      setItems(normalizedItems);
      setForms(normalizedForms);
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

  const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleString("en-IN") : "-";

  const toggleAvailable = async (itemId) => {
    const idx = items.findIndex((it) => it._id === itemId);
    if (idx === -1) return;
    const current = items[idx];
    const newStatus = !current.isAvailable;
    setItems((prev) =>
      prev.map((it) => (it._id === itemId ? { ...it, isAvailable: newStatus } : it))
    );

    try {
      await Axios.patch(`${API_URL}/items/update-item`, {
        itemId,
        newIsAvailable: newStatus,
      });
    } catch (err) {
      console.error(err);
      setItems((prev) =>
        prev.map((it) => (it._id === itemId ? { ...it, isAvailable: current.isAvailable } : it))
      );
    }
  };

  const validateAddData = () => {
    const errs = {};
    if (!addData.name?.trim()) errs.name = "Name required";
    if (!safeNumber(addData.quantity) || safeNumber(addData.quantity) <= 0) errs.quantity = "Enter valid quantity";
    if (!safeNumber(addData.unitPrice) || safeNumber(addData.unitPrice) <= 0) errs.unitPrice = "Enter valid unit price";
    return errs;
  };

  const handleAddItem = async () => {
    const errs = validateAddData();
    setAddErrors(errs);
    if (Object.keys(errs).length) return;

    const quantity = safeNumber(addData.quantity);
    const unitPrice = safeNumber(addData.unitPrice);
    const totalPrice = quantity * unitPrice;

    const tmpId = `tmp_${Date.now()}`;
    const newItem = {
      _id: tmpId,
      name: addData.name.trim(),
      quantity,
      unitPrice,
      totalPrice,
      invoiceNumber: addData.invoiceNumber || "",
      message: addData.message || "",
      isAvailable: quantity > 0,
      createdAt: new Date().toISOString(),
    };

    setItems((p) => [newItem, ...p]);
    setAddItemOpen(false);
    setAddData({ name: "", quantity: "", unitPrice: "", invoiceNumber: "", message: "" });
    setAddErrors({});

    try {
      const res = await Axios.post(`${API_URL}/items/add-item`, {
        name: newItem.name,
        quantity,
        price: totalPrice,
        invoiceNumber: newItem.invoiceNumber,
        message: newItem.message,
        isAvailable: newItem.isAvailable,
      });

      if (res.data?.success && res.data.item) {
        const added = res.data.item;
        const quantity = safeNumber(added.quantity);
        const unitPrice = safeNumber(added.price / quantity);
        const totalPrice = safeNumber(added.price);
        setItems((prev) => prev.map((it) => (it._id === tmpId ? { ...added, quantity, unitPrice, totalPrice } : it)));
      } else fetchData();
    } catch (err) {
      console.error(err);
      setItems((p) => p.filter((it) => it._id !== tmpId));
    }
  };

  const openEdit = (item) => {
    setEditTarget(item._id);
    setEditData({
      newName: item.name,
      newQuantity: item.quantity,
      newUnitPrice: item.unitPrice,
      newInvoiceNumber: item.invoiceNumber || "",
      newMessage: item.message || "",
      newIsAvailable: item.isAvailable,
    });
    setEditErrors({});
  };

  const validateEditData = () => {
    const errs = {};
    if (!editData.newName?.trim()) errs.newName = "Name required";
    if (!safeNumber(editData.newQuantity) || safeNumber(editData.newQuantity) < 0) errs.newQuantity = "Enter valid quantity";
    if (!safeNumber(editData.newUnitPrice) || safeNumber(editData.newUnitPrice) < 0) errs.newUnitPrice = "Enter valid unit price";
    return errs;
  };

  const handleEditSave = async () => {
    const errs = validateEditData();
    setEditErrors(errs);
    if (Object.keys(errs).length) return;

    const quantity = safeNumber(editData.newQuantity);
    const unitPrice = safeNumber(editData.newUnitPrice);
    const totalPrice = quantity * unitPrice;

    try {
      await Axios.patch(`${API_URL}/items/update-item`, {
        itemId: editTarget,
        newName: editData.newName.trim(),
        newQuantity: quantity,
        newUnitPrice: unitPrice,
        newPrice: quantity * unitPrice,
        newInvoiceNumber: editData.newInvoiceNumber,
        newMessage: editData.newMessage,
        newIsAvailable: quantity > 0,
      });

      setItems((prev) =>
        prev.map((it) => (it._id === editTarget ? { ...it, name: editData.newName.trim(), quantity, unitPrice, totalPrice, invoiceNumber: editData.newInvoiceNumber, message: editData.newMessage, isAvailable: quantity > 0 } : it))
      );
      setEditTarget(null);
      setEditData({});
      setEditErrors({});
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const confirmDelete = (entry, isForm = false) => {
    setDeleteTarget({ ...entry, isForm, restore: false });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const { _id, isForm, restore } = deleteTarget;

    try {
      if (!isForm) {
        await Axios.delete(`${API_URL}/items/delete-item`, { data: { itemId: _id } });
        setItems((p) => p.filter((it) => it._id !== _id));
      } else {
        const form = forms.find((f) => f._id === _id);
        if (!form) return;

        if (restore) {
          const matchedItem = items.find((it) => it.name.toLowerCase() === form.item.toLowerCase());
          if (matchedItem) {
            const newQty = matchedItem.quantity + form.quantity;
            const newTotal = newQty * matchedItem.unitPrice;
            setItems((p) => p.map((it) => (it._id === matchedItem._id ? { ...it, quantity: newQty, totalPrice: newTotal, isAvailable: newQty > 0 } : it)));
            await Axios.patch(`${API_URL}/items/update-item`, {
              itemId: matchedItem._id,
              newQuantity: newQty,
              newTotalPrice: newTotal,
              newIsAvailable: newQty > 0,
            });
          } else {
            const tmpId = `tmp_${Date.now()}`;
            const newItem = {
              _id: tmpId,
              name: form.item,
              quantity: form.quantity,
              unitPrice: form.unitPrice,
              totalPrice: form.quantity * form.unitPrice,
              message: `Restored from form ${form._id}`,
              isAvailable: form.quantity > 0,
              createdAt: new Date().toISOString(),
            };
            setItems((p) => [newItem, ...p]);
            try {
              await Axios.post(`${API_URL}/items/add-item`, {
                name: newItem.name,
                quantity: newItem.quantity,
                price: newItem.totalPrice,
                message: newItem.message,
                isAvailable: newItem.isAvailable,
              });
            } catch (err) {
              console.error(err);
              setItems((p) => p.filter((it) => it._id !== tmpId));
            }
          }
        }

        await Axios.delete(`${API_URL}/forms/delete-form`, { data: { formId: _id } });
        setForms((p) => p.filter((f) => f._id !== _id));
      }

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      fetchData();
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-green-400 rounded-xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => setTab("items")} className={`px-6 py-2 rounded-l-lg cursor-pointer font-semibold ${tab === "items" ? "bg-white text-green-600" : "bg-green-600"}`}>Items</button>
          <button onClick={() => setTab("forms")} className={`px-6 py-2 rounded-r-lg cursor-pointer font-semibold ${tab === "forms" ? "bg-white text-green-600" : "bg-green-600"}`}>Forms</button>
        </div>
        {loading && <div className="animate-spin border-4 border-green-600 border-dashed w-12 h-12 rounded-full"></div>}
      </div>

      <ul className="space-y-4">
  {loading ? (
    <li className="bg-white text-green-700 rounded-xl p-4 flex justify-center shadow-md">
      <div className="text-center">
        <div className="text-lg font-semibold">Loading...</div>
        <div className="text-sm text-gray-500">Fetching data, please wait.</div>
      </div>
    </li>
  ) : (tab === "items" ? items : forms).length === 0 ? (
    <li className="bg-white text-green-700 rounded-xl p-4 flex justify-center shadow-md">
      <div className="text-center">
        <div className="text-lg font-semibold">
          {tab === "items" ? "No items available" : "No forms available"}
        </div>
        <div className="text-sm text-gray-500">
          {tab === "items"
            ? "Please add a new item to get started."
            : "Forms will appear here once they are created."}
        </div>
      </div>
    </li>
  ) : (
    (tab === "items" ? items : forms).map((entry) => {
      const isFormTab = tab === "forms";
      return (
        <li
          key={entry._id}
          className="bg-white text-green-700 rounded-xl p-4 flex justify-between shadow-md"
        >
          <div>
            <div className="text-lg font-semibold">
            {isFormTab ? entry.shop || "-" : ""}
            </div>
            <div> {isFormTab ? entry.item || "Untitled Form" : entry.name}</div>
            <div>Quantity: {entry.quantity}</div>
            <div>Price/Item: ₹{entry.unitPrice?.toFixed(2) || 0}</div>
            <div>Total: ₹{entry.totalPrice?.toFixed(2) || 0}</div>
            <div>Invoice No: {entry.invoiceNumber || 0}</div>
            <div className="text-sm text-gray-500">
              Date: {formatDateTime(entry.createdAt)}
            </div>
            <div className="text-sm mt-1">{entry.message || "-"}</div>
          </div>

          <div className="flex flex-col gap-2">
            {!isFormTab && (
              <button
                onClick={() => toggleAvailable(entry._id)}
                className={`px-3 py-1 cursor-pointer rounded-full font-semibold shadow-sm ${
                  entry.isAvailable
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {entry.isAvailable ? "Available" : "Unavailable"}
              </button>
            )}
            {!isFormTab && (
              <button
                onClick={() => openEdit(entry)}
                className="flex items-center cursor-pointer gap-2 px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <FaEdit /> Edit
              </button>
            )}
            <button
              onClick={() => confirmDelete(entry, isFormTab)}
              className="flex items-center cursor-pointer gap-2 px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </li>
      );
    })
  )}
</ul>


      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0  bg-green-300 bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-xl mt-10 p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">Edit Item</h3>
            <div className="flex flex-col gap-3">
              <label htmlFor="Name" className="text-black">Name : </label>
              <input type="text" id="Name" value={editData.newName} onChange={(e) => setEditData({ ...editData, newName: e.target.value })} className="p-2 border rounded-lg text-black" />
              {editErrors.newName && <span className="text-red-600 text-sm">{editErrors.newName}</span>}
              <label htmlFor="Quantity" className="text-black">Quantity : </label>
              <input type="number" id="Quantity" value={editData.newQuantity} onChange={(e) => setEditData({ ...editData, newQuantity: e.target.value })} className="p-2 border rounded-lg text-black" />
              {editErrors.newQuantity && <span className="text-red-600 text-sm">{editErrors.newQuantity}</span>}
              <label htmlFor="UnitPrice" className="text-black">Unit Price : </label>
              <input type="number" id="UnitPrice" value={editData.newUnitPrice} onChange={(e) => setEditData({ ...editData, newUnitPrice: e.target.value })} className="p-2 border rounded-lg text-black" />
              {editErrors.newUnitPrice && <span className="text-red-600 text-sm">{editErrors.newUnitPrice}</span>}
              <label htmlFor="Invoicenumber" className="text-black">Invoice Number : </label>
              <input type="text" id="Invoicenumber" value={editData.newInvoiceNumber} onChange={(e) => setEditData({ ...editData, newInvoiceNumber: e.target.value })} className="p-2 border rounded-lg text-black" />
              <label htmlFor="Comment" className="text-black">Comment : </label>
              <textarea value={editData.newMessage} id="Comment" onChange={(e) => setEditData({ ...editData, newMessage: e.target.value })} className="p-2 border rounded-lg text-black" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 bg-gray-300 cursor-pointer text-gray-700 rounded-lg">Cancel</button>
              <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Restore Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-30 flex items-center justify-center">
          <div className="bg-white roundedcd-xl p-6 max-w-sm w-full shadow-lg rounded-2xl">
            <h3 className="text-red-600 font-semibold mb-2">Confirm Delete</h3>
            <p className="text-black">Are you sure you want to Delete !</p>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default List;
