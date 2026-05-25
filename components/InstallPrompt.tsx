"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem("cc_install_shown");
    if (shown) return;

    const visits = parseInt(localStorage.getItem("cc_visits") || "0", 10) + 1;
    localStorage.setItem("cc_visits", visits.toString());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const installEvent = event as BeforeInstallPromptEvent;
      setPrompt(installEvent);
      if (visits >= 2) setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("cc_install_shown", "true");
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "16px",
        right: "16px",
        background: "#12121F",
        border: "1px solid rgba(255,107,53,0.3)",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 1000,
        boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}
    >
      <span style={{ fontSize: 32 }}>📱</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
          Install CareerCompass
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          Access offline, faster loading
        </p>
      </div>
      <button
        onClick={() => void install()}
        style={{
          background: "#FF6B35",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        Install
      </button>
      <button
        onClick={() => {
          setShow(false);
          localStorage.setItem("cc_install_shown", "true");
        }}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          fontSize: 20,
          padding: "0 4px",
        }}
      >
        ×
      </button>
    </div>
  );
}
