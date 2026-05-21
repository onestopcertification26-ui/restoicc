"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { placeOrderAction } from "@/app/actions";

export const CartSidebar: React.FC = () => {
  const {
    tableId,
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setCartOpen,
    subtotal,
    tax,
    serviceCharge,
    total,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!tableId) {
      setErrorMessage("Table number is not detected. Please select a table first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Structure the order data
      const orderData = {
        tableId,
        items: cartItems,
        subtotal,
        tax,
        serviceCharge,
        total,
      };

      // Call the server action to save the order in MongoDB
      const response = await placeOrderAction(orderData);

      if (response.success && response.orderId) {
        // Clear global cart state
        clearCart();
        setCartOpen(false);
        // Redirect to success and tracking screen
        router.push(`/order-success?orderId=${response.orderId}`);
      } else {
        setErrorMessage(response.error || "Failed to place order. Please try again.");
      }
    } catch (e) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Background Dimmed Overlay */}
      <div
        className={`sidebar-overlay ${isCartOpen ? "visible" : ""}`}
        onClick={() => setCartOpen(false)}
      ></div>

      {/* Sliding Sidebar Drawer */}
      <aside className={`cart-sidebar glass-panel ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <div>
            <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              My Cart
              {tableId && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "rgba(255, 90, 31, 0.1)",
                    color: "var(--accent-orange)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  Table {tableId}
                </span>
              )}
            </h2>
          </div>
          <div className="cart-header-actions" style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={clearCart}
              className="clear-cart-btn"
              disabled={cartItems.length === 0}
              aria-label="Clear cart"
              style={{
                background: "var(--accent-red)",
                color: "white",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Clear Cart
            </button>
            <button
              onClick={() => setCartOpen(false)}
              className="cart-close-btn"
              aria-label="Close cart"
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Selected Food Items Scroll list */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🛒</div>
              <h3 style={{ fontSize: "1rem", marginBottom: "6px" }}>Your cart is empty</h3>
              <p style={{ fontSize: "0.85rem" }}>Scan items from our menu to satisfy your cravings.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.menuItemId} className="cart-item">
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatPrice(item.price)}</div>
                </div>

                <div className="qty-controller">
                  <button
                    onClick={() => removeFromCart(item.menuItemId)}
                    className="qty-btn"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    onClick={() =>
                      addToCart({
                        _id: item.menuItemId,
                        name: item.name,
                        price: item.price,
                      } as any)
                    }
                    className="qty-btn"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary Block */}
        {cartItems.length > 0 && (
          <div className="cart-summary glass-panel">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="summary-row">
              <span>Service Charge (5%)</span>
              <span>{formatPrice(serviceCharge)}</span>
            </div>

            <div className="summary-row total">
              <span>Total Price</span>
              <span>{formatPrice(total)}</span>
            </div>

            {errorMessage && (
              <div
                style={{
                  color: "var(--accent-orange)",
                  fontSize: "0.8rem",
                  marginTop: "12px",
                  textAlign: "center",
                  background: "rgba(255, 90, 31, 0.08)",
                  border: "1px solid rgba(255, 90, 31, 0.2)",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="checkout-btn"
            >
              {isSubmitting ? "Placing Order..." : "Confirm & Send to Kitchen"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
export default CartSidebar;
