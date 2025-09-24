import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaEnvelope, FaPhone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-green-900 text-white mt-10">
      <div className="max-w-6xl mx-auto py-6 px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src="https://image-static.collegedunia.com/public/college_data/images/logos/15965437441271595710960668237721566660475989776934913o.jpg"
            alt="Polytechnic Logo"
            className="w-24 h-24 object-contain mb-2"
          />
          <p className="text-sm max-w-xs">
            Polytechnic Inventory is a simple, interactive tool to track and manage items and forms efficiently for workshops.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-bold mb-2">Quick Links</h3>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => navigate("/")}
              className="bg-green-700 cursor-pointer hover:bg-green-800 px-3 py-1 rounded text-white font-medium transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/add-items")}
              className="bg-green-700 cursor-pointer hover:bg-green-800 px-3 py-1 rounded text-white font-medium transition"
            >
              Items
            </button>
            <button
              onClick={() => navigate("/form")}
              className="bg-green-700 cursor-pointer hover:bg-green-800 px-3 py-1 rounded text-white font-medium transition"
            >
              Forms
            </button>
            <button
              onClick={() => navigate("/list")}
              className="bg-green-700 cursor-pointer hover:bg-green-800 px-3 py-1 rounded text-white font-medium transition"
            >
              List
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-bold mb-2">Contact</h3>
          <a href="mailto:mohdsaif18500@gmail.com" className="flex items-center gap-2 text-sm hover:text-green-300 transition">
            <FaEnvelope /> mohdsaif18500@gmail.com
          </a>
          <a href="tel:8218532681" className="flex items-center gap-2 text-sm mt-1 hover:text-green-300 transition">
            <FaPhone /> +91 82185 32681
          </a>

          <div className="flex gap-3 mt-3">
            <a href="https://x.com/Mohdsaif1850" target="_blank" className="hover:text-green-300 transition"><FaTwitter /></a>
            <a href="https://www.linkedin.com/in/mohd-saif-1850-web-developer" target="_blank" className="hover:text-green-300 transition"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-green-700 mt-6 text-center py-3 text-sm">
        &copy; {new Date().getFullYear()} Polytechnic Inventory. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
