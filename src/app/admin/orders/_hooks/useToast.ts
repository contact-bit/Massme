"use client";
import { useRef, useState } from "react";

export function useToast(timeoutMs = 1500) {
  const [toast, setToast] = useState("");
  const tRef = useRef<number | null>(null);

  const toastIt = (msg: string) => {
    setToast(msg);
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setToast(""), timeoutMs);
  };

  return { toast, toastIt };
}
