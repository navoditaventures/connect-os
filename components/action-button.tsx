"use client";

import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export default function ActionButton({
  icon,
  label,
  description,
  onClick,
  variant = "secondary"
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 w-full text-left"
      style={{
        backgroundColor: variant === "primary" ? "var(--color-primary)" : "var(--color-card)",
        color: variant === "primary" ? "var(--color-on-primary)" : "var(--color-foreground)",
        border: `1px solid ${variant === "primary" ? "var(--color-primary)" : "var(--color-border)"}`,
        outlineColor: "var(--color-ring)"
      }}
      onMouseEnter={(e) => {
        if (variant !== "primary") {
          e.currentTarget.style.borderColor = "var(--color-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant !== "primary") {
          e.currentTarget.style.borderColor = "var(--color-border)";
        }
      }}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p
          className="text-xs"
          style={{ color: variant === "primary" ? "rgba(255,255,255,0.9)" : "var(--color-muted-foreground)" }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}
