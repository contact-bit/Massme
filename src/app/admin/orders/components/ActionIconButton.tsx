"use client";
import React from "react";

type ActionVariant = "neutral" | "primary" | "success" | "danger";

const variantMap: Record<ActionVariant, string> = {
  neutral: "btn-secondary",
  primary: "btn-primary",
  success: "btn-success",
  danger: "btn-danger",
};

export function ActionIconButton({
  title,
  onClick,
  icon,
  variant = "neutral",
  disabled = false,
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
      className={`admin-icon-btn ${variantMap[variant]}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}