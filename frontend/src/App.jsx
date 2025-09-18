import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AddItem from "./components/AddItem";
import Form from "./components/Form";
import List from "./components/List";

function App() {
  return (
    <div className="bg-green-300 min-h-screen">
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-items" element={<AddItem />} />
          <Route path="/form" element={<Form />} />
          <Route path="/list" element={<List />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
