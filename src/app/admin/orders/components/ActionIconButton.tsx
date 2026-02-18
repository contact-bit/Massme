"use client";
import React from "react";

type ActionVariant = "neutral" | "primary" | "success" | "danger";

export function ActionIconButton({
  title,
  onClick,
  icon,
  variant = "neutral",
  disabled,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: ActionVariant;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`iconBtn iconBtn--${variant}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      style={disabled ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
    >
      {icon}
    </button>
  );
}
