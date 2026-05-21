"use client";

import React from "react";
import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { cartItems, addToCart, removeFromCart } = useCart();

  const cartItem = cartItems.find((i) => i.menuItemId === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Formatter for Indonesian Rupiah (IDR)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="menu-card glass-panel" style={{ border: "1px solid var(--border-color)" }}>
      {/* Dynamic Aesthetic Visual Block */}
      <div
        className="menu-card-visual"
        style={{
          background: item.visualGradient,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          fontWeight: 700,
          fontSize: "1.2rem",
          letterSpacing: "0.05em",
        }}
      >
        <span>{item.name.split(" ").slice(-1)[0].toUpperCase()}</span>
        {item.badge && <span className="menu-card-tag">{item.badge}</span>}
      </div>

      <div className="menu-card-body">
        <h3 className="menu-card-title">{item.name}</h3>
        <p className="menu-card-desc">{item.description}</p>

        <div className="menu-card-footer">
          <span className="menu-card-price">{formatPrice(item.price)}</span>

          {quantity > 0 ? (
            <div className="qty-controller">
              <button
                onClick={() => item._id && removeFromCart(item._id)}
                className="qty-btn"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                onClick={() => addToCart(item)}
                className="qty-btn"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item)}
              className="qty-btn-add-initial"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default MenuCard;
