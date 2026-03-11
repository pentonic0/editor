/**
 * Main page - renders the full Koenig-style editor
 * Uses 'use client' to enable React hooks and browser APIs
 */
"use client";
import dynamic from "next/dynamic";

// Dynamically import editor to avoid SSR issues with browser-only APIs
const KoenigEditor = dynamic(() => import("./components/editor/KoenigEditor"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#faf8f3", color: "#8d816e",
      fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem", letterSpacing: "0.05em"
    }}>
      Loading editor...
    </div>
  ),
});

export default function Home() {
  return <KoenigEditor />;
}
