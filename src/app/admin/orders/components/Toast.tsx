"use client";
import React, { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

export function Toast({
  message,
  type = "info",
  duration = 2500,
}: {
  message: string;
  type?: ToastType;
  duration?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;

    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(t);
  }, [message, duration]);

  if (!message && !visible) return null;

  return (
    <div className={`toast ${type} ${visible ? "show" : "hide"}`}>
      {message}
    </div>
  );
}