"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { MenuItem } from "@/types";
import { getMenuItemsAction } from "@/app/actions";
import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";
import CartSidebar from "@/components/CartSidebar";

export default function TableMenuPage() {
  const params = useParams();
  const router = useRouter();
  const { tableId, setTableId, cartItems, toggleCart, itemCount, total } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const rawTableId = params.tableId as string;

  // Sync route tableId with local storage and cart context
  useEffect(() => {
    if (rawTableId) {
      setTableId(rawTableId);
    }
  }, [rawTableId, setTableId]);

  // Fetch Menu from Server Action (MongoDB or Mock seeder fallback)
  useEffect(() => {
    async function loadMenu() {
      try {
        const items = await getMenuItemsAction();
        setMenuItems(items);
      } catch (e) {
        console.error("Failed to load menu items:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Filter logic
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "all", name: "Full Menu" },
    { id: "appetizers", name: "Appetizers" },
    { id: "mains", name: "Main Course" },
    { id: "drinks", name: "Drinks" },
    { id: "desserts", name: "Desserts" },
  ];

  // Formatter for Indonesian Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Sticky Fixed Header Component */}
      <Header />

      {/* Main Container */}
      <main className="main-content">
        
        {/* Search Bar Input */}
        <div className="search-wrapper">
          <div className="search-input-container">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search dishes, drinks, or desserts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Sticky Categories Navigation List */}
        <nav className="categories-container">
          <div className="categories-list">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Loader Screen */}
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "40vh",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid rgba(255, 90, 31, 0.1)",
                borderTopColor: "var(--accent-orange)",
                borderRadius: "50%",
                animation: "pulse-glow 1s infinite linear",
              }}
            ></div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading gourmet menu...</p>
          </div>
        ) : (
          <>
            {/* Menu Grid Items List */}
            {filteredItems.length > 0 ? (
              <div className="menu-grid">
                {filteredItems.map((item) => (
                  <MenuCard key={item._id} item={item} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🍽️</div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>No items found</h3>
                <p style={{ fontSize: "0.85rem" }}>Try searching for a different dish name or category.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Slide-out Desktop & Client Cart Sidebar drawer */}
      <CartSidebar />

      {/* Floating Bottom Cart trigger for mobile screens */}
      {itemCount > 0 && (
        <div className="mobile-cart-bar glass-panel" onClick={toggleCart}>
          <div className="mobile-cart-left">
            <div className="mobile-cart-icon-wrapper">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="mobile-cart-count">{itemCount}</span>
            </div>
            <div className="mobile-cart-info">
              <span className="mobile-cart-label">Estimated Total</span>
              <span className="mobile-cart-total">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mobile-cart-right">
            View Cart
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
