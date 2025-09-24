import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaWpforms } from "react-icons/fa";

function Home() {
  const [stats, setStats] = useState({ items: null, forms: null });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const itemsRes = await Axios.get(`${API_URL}/items/get-items`);
        const formsRes = await Axios.get(`${API_URL}/forms/get-forms`);
        setStats({
          items: itemsRes.data.items?.length || 0,
          forms: formsRes.data.forms?.length || 0,
        });
      } catch (err) {
        console.error(err);
        setStats({ items: 0, forms: 0 }); // fallback if API fails
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      id: 1,
      title: "Items",
      count: stats.items,
      link: "/list#items",
      icon: <FaBoxOpen className="text-5xl text-green-700 mb-2" />,
      color: "bg-green-100",
      desc: "Manage all items quickly",
    },
    {
      id: 2,
      title: "Forms",
      count: stats.forms,
      link: "/list#forms",
      icon: <FaWpforms className="text-5xl text-green-700 mb-2" />,
      color: "bg-green-100",
      desc: "Check submitted forms",
    },
  ];

  // Loader component (circle)
  const Loader = () => (
    <div className="w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-green-400 rounded-xl shadow-lg flex flex-col items-center py-8 mb-10">
        <img
          src="https://image-static.collegedunia.com/public/college_data/images/logos/15965437441271595710960668237721566660475989776934913o.jpg"
          alt="Polytechnic Logo"
          className="w-28 h-28 object-contain mb-4"
        />
        <h1 className="text-3xl font-bold text-white drop-shadow-md mb-2 text-center">
          Polytechnic Inventory
        </h1>
        <p className="text-white text-sm max-w-md text-center">
          Track and manage all items and forms efficiently. Quick, simple, and interactive for workshop use.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.link)}
            className={`relative rounded-xl shadow-md cursor-pointer flex flex-col justify-center items-center py-6 px-4 transition transform hover:scale-105 ${card.color}`}
          >
            {card.icon}
            <h2 className="text-2xl font-bold text-green-900">{card.title}</h2>

            {/* Count or loader */}
            <div className="my-1">
              {card.count === null ? <Loader /> : (
                <p className="text-xl font-extrabold text-green-900">{card.count}</p>
              )}
            </div>

            <p className="text-sm text-green-800">{card.desc}</p>

            <button className="mt-2 px-4 py-1 bg-green-900 text-white rounded-md font-semibold hover:bg-green-800 transition duration-200">
              Go to {card.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
