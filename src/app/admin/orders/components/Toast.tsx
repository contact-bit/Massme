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

    // Le même composant affiche des messages successifs : la visibilité doit
    // être réinitialisée lorsque son message change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
