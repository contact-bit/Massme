"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ToggleActivation({
  id,
  isActive,
  onChange,
}: {
  id: string;
  isActive: boolean;
  onChange: () => void;
}) {
  const toggle = async () => {
    await updateDoc(doc(db, "shipping_methods", id), {
      isActive: !isActive,
    });
    onChange();
  };

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1 rounded text-white text-sm ${
        isActive ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {isActive ? "Désactiver" : "Activer"}
    </button>
  );
}
