"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { tableId, setTableId } = useCart();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const router = useRouter();

  // Redirect automatically if a table is already registered in local storage
  useEffect(() => {
    if (tableId) {
      router.push(`/table/${tableId}`);
    }
  }, [tableId, router]);

  const handleEnter = () => {
    if (!selectedTable) return;
    setTableId(selectedTable);
    router.push(`/table/${selectedTable}`);
  };

  const tables = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
      <div className="welcome-hero">
        <h1 className="welcome-title" style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "8px" }}>
          RESTOICC
        </h1>
        <p className="welcome-subtitle" style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.95rem" }}>
          Welcome to RESTOICC. To begin your culinary experience, please scan the QR code located on your table, or choose your table number manually below to browse our gourmet selection.
        </p>

        <div className="selector-card glass-panel" style={{ border: "1px solid var(--border-color)", width: "100%", maxWidth: "420px" }}>
          <span className="selector-label">Select Table Number</span>
          
          <div className="table-input-grid">
            {tables.map((num) => (
              <button
                key={num}
                onClick={() => setSelectedTable(num)}
                className={`table-select-btn ${selectedTable === num ? "selected" : ""}`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={handleEnter}
            disabled={!selectedTable}
            className="enter-btn"
            style={{ marginTop: "8px" }}
          >
            {selectedTable ? `Enter Menu at Table ${selectedTable}` : "Select a Table"}
          </button>
        </div>

        <div style={{ marginTop: "40px", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", background: "var(--accent-gold)", borderRadius: "50%" }}></span>
          Gourmet QR Order System — Phase 1
        </div>
      </div>
    </main>
  );
}
