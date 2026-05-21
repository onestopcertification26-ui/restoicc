"use client";

import React from "react";
import { useCart } from "@/context/CartContext";

export const Header: React.FC = () => {
  const { tableId, toggleCart, itemCount } = useCart();

  return (
    <header className="header glass-panel">
      <div className="header-brand">
        <div className="header-logo">RESTOICC</div>
        {tableId ? (
          <div className="table-badge">
            <span className="table-badge-dot"></span>
            Table {tableId}
          </div>
        ) : (
          <div className="table-badge" style={{ borderColor: "rgba(255, 255, 255, 0.1)", color: "var(--text-secondary)" }}>
            Select Table
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={toggleCart}
          className="qty-btn"
          style={{
            position: "relative",
            width: "44px",
            height: "44px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
          }}
          aria-label="Toggle Cart"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-primary)" }}
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {itemCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "var(--accent-orange)",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 700,
                minWidth: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--bg-secondary)",
                padding: "0 4px",
              }}
            >
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
export default Header;
