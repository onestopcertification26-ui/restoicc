"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrderAction, payOrderAction } from "@/app/actions";
import { Order } from "@/types";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load order details on start
  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }
    
    async function loadOrder() {
      const orderData = await getOrderAction(orderId!);
      if (orderData) {
        setOrder(orderData);
        if (orderData.paymentStatus === "paid") {
          setPaymentSuccess(true);
        }
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId, router]);

  // Formatter for Indonesian Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleSimulatePayment = async () => {
    if (!orderId || !selectedMethod) return;

    setPaymentLoading(true);

    try {
      // Simulate network processing latency of 1.5 seconds
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await payOrderAction(orderId, selectedMethod);

      if (response.success) {
        setPaymentSuccess(true);
        // Refresh order status in UI
        const updatedOrder = await getOrderAction(orderId);
        if (updatedOrder) setOrder(updatedOrder);
      } else {
        alert(response.error || "Mock payment simulation failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Payment simulation encountered an error.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(244, 196, 48, 0.1)",
              borderTopColor: "var(--accent-gold)",
              borderRadius: "50%",
              margin: "0 auto 16px auto",
              animation: "pulse-glow-gold 1s infinite linear",
            }}
          ></div>
          <p style={{ color: "var(--text-secondary)" }}>Fetching order receipt...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>Order Not Found</h2>
        <p style={{ margin: "12px 0 24px 0" }}>We couldn't retrieve details for Order ID: {orderId}</p>
        <button onClick={() => router.push("/")} className="enter-btn">
          Back to Home
        </button>
      </div>
    );
  }

  // Calculate live tracking timeline step indices
  const isPaid = order.paymentStatus === "paid";
  const isCooking = order.status === "cooking" || order.status === "served" || order.status === "completed";
  const isServed = order.status === "served" || order.status === "completed";

  return (
    <div className="success-layout">
      {/* Receipt Success Hero Badge */}
      <div className="success-card glass-panel" style={{ border: "1px solid var(--border-color)" }}>
        <div className="success-icon-container">✓</div>
        <h1 className="success-title">Order Placed!</h1>
        <span className="success-table-ref">Linked to Table {order.tableId}</span>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Order ID: {order._id}
        </p>
      </div>

      {/* Live Multi-Step Status Tracker */}
      <div className="tracker-container">
        <div className="tracker-title">Live Tracking Tracker</div>
        <div className="tracker-steps">
          {/* Height fill calculation depending on state */}
          <div
            className="tracker-line-fill"
            style={{
              height: isServed ? "100%" : isCooking ? "66%" : isPaid ? "33%" : "0%",
            }}
          ></div>

          <div className="tracker-step completed">
            <span className="tracker-dot"></span>
            <span className="tracker-step-title">Order Received</span>
            <span className="tracker-step-desc">Order successfully logged in RESTOICC database.</span>
          </div>

          <div className={`tracker-step ${isPaid ? "completed" : "active"}`}>
            <span className="tracker-dot"></span>
            <span className="tracker-step-title">Payment Settlement</span>
            <span className="tracker-step-desc">
              {isPaid ? `Settled via ${order.paymentMethod}` : "Waiting for transaction validation."}
            </span>
          </div>

          <div className={`tracker-step ${isServed ? "completed" : isCooking ? "active" : ""}`}>
            <span className="tracker-dot"></span>
            <span className="tracker-step-title">Preparation in Kitchen</span>
            <span className="tracker-step-desc">
              {isCooking ? "Chef is handcrafting your gourmet dishes." : "Queued behind prior bookings."}
            </span>
          </div>

          <div className={`tracker-step ${isServed ? "active" : ""}`}>
            <span className="tracker-dot"></span>
            <span className="tracker-step-title">Served at Table</span>
            <span className="tracker-step-desc">Gourmet selection delivered fresh and hot.</span>
          </div>
        </div>
      </div>

      {/* Dynamic Digital Invoice Receipt */}
      <div className="glass-panel" style={{ borderRadius: "20px", padding: "24px", marginBottom: "24px", border: "1px solid var(--border-color)" }}>
        <h2 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
          Invoice Details
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {order.items.map((item) => (
            <div key={item.menuItemId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {formatPrice(item.price)} &times; {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--accent-gold)" }}>
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="receipt-container">
          <div className="receipt-item">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="receipt-item">
            <span>Tax (10%)</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="receipt-item">
            <span>Service Charge (5%)</span>
            <span>{formatPrice(order.serviceCharge)}</span>
          </div>
          <div className="receipt-total">
            <span>Grand Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Mock Payment Simulation Console */}
      <div className="payment-console glass-panel">
        <h2 className="payment-title">Simulate Order Payment</h2>
        
        {paymentSuccess ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                background: "rgba(244, 196, 48, 0.1)",
                border: "1px solid rgba(244, 196, 48, 0.3)",
                borderRadius: "50%",
                color: "var(--accent-gold)",
                fontSize: "1.8rem",
                marginBottom: "12px",
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Payment Settled</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Transaction approved via <strong>{order.paymentMethod}</strong>. Kitchen staff are preparing your items!
            </p>
            
            <button
              onClick={() => router.push(`/table/${order.tableId}`)}
              className="enter-btn"
              style={{ marginTop: "20px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            >
              Order More Items
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Select a mock payment method below to complete payment and send your order to the kitchen.
            </p>

            <div className="payment-methods-grid">
              {[
                { id: "Gopay", name: "Gopay", icon: "📱" },
                { id: "OVO", name: "OVO", icon: "💎" },
                { id: "Visa/Mastercard", name: "Credit Card", icon: "💳" },
                { id: "Cashier", name: "Pay Cashier", icon: "💵" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`payment-method-card ${selectedMethod === method.id ? "active" : ""}`}
                >
                  <span className="payment-method-icon">{method.icon}</span>
                  <span className="payment-method-label">{method.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={!selectedMethod || paymentLoading}
              className="pay-now-btn"
            >
              {paymentLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #09090b",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "pulse-glow 0.8s infinite linear",
                    }}
                  ></span>
                  Processing Transaction...
                </span>
              ) : (
                `Pay ${formatPrice(order.total)}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="main-content" style={{ paddingBottom: "100px" }}>
      <Suspense
        fallback={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid rgba(244, 196, 48, 0.1)",
                  borderTopColor: "var(--accent-gold)",
                  borderRadius: "50%",
                  margin: "0 auto 16px auto",
                  animation: "pulse-glow-gold 1s infinite linear",
                }}
              ></div>
              <p style={{ color: "var(--text-secondary)" }}>Loading order details...</p>
            </div>
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </main>
  );
}
