"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center" }}>
      <img src="file:///C:/Users/DELL/.gemini/antigravity-ide/brain/80f2eee6-cdb6-42c7-9687-0bcfd8890355/404_illustration_1779351691247.png" alt="404 illustration" style={{ maxWidth: "100%", height: "auto", marginBottom: "1rem" }} />
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--accent-gold)" }}>404 – Tidak Ditemukan</h1>
      <p style={{ marginBottom: "2rem", color: "var(--text-secondary)" }}>
        Ups! Halaman yang Anda cari tidak ada.
      </p>
      <Link href="/" className="enter-btn" style={{ padding: "0.75rem 1.5rem", background: "var(--accent-gold)", color: "var(--text-primary)", borderRadius: "8px" }}>
        Kembali ke Beranda
      </Link>
    </main>
  );
}
