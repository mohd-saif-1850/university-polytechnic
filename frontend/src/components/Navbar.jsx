import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-green-500 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <img
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              src="https://image-static.collegedunia.com/public/college_data/images/logos/15965437441271595710960668237721566660475989776934913o.jpg"
              alt="Logo of JMI"
            />
            <span className="font-bold text-white text-lg hidden sm:block">
              Polytechnic Shop
            </span>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-white font-medium hover:text-green-900 transition">
              Home
            </Link>
            <Link to="/add-items" className="text-white font-medium hover:text-green-900 transition">
              Add Items
            </Link>
            <Link to="/form" className="text-white font-medium hover:text-green-900 transition">
              Form
            </Link>
            <Link to="/list" className="text-white font-medium hover:text-green-900 transition">
              List
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="text-white w-6 h-6" /> : <Menu className="text-white w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-green-500 px-4 pb-4 space-y-2">
          <hr className="w-60 border-t-2 border-white mx-auto" />
          <Link onClick={() => setIsOpen(false)} to="/" className="block text-white font-medium hover:text-green-900 transition">
            Home
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/add-items" className="block text-white font-medium hover:text-green-900 transition">
            Add Items
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/form" className="block text-white font-medium hover:text-green-900 transition">
            Form
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/list" className="block text-white font-medium hover:text-green-900 transition">
            List
          </Link>
        </div>
      )}
    </nav>
  );
}
