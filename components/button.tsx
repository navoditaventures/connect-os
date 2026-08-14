"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  fullWidth,
  type = "button",
  className
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variantStyles = {
    primary: {
      bg: "var(--color-primary)",
      text: "var(--color-on-primary)",
      hover: "#1d4ed8",
      ring: "var(--color-ring)"
    },
    secondary: {
      bg: "var(--color-muted)",
      text: "var(--color-muted-foreground)",
      hover: "var(--color-border)",
      ring: "var(--color-ring)"
    },
    destructive: {
      bg: "var(--color-destructive)",
      text: "var(--color-on-destructive)",
      hover: "#991b1b",
      ring: "var(--color-ring)"
    }
  };

  const style = variantStyles[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-md font-semibold transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center justify-center gap-2 ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className || ""}`}
      style={{
        background: style.bg,
        color: style.text,
        outlineColor: style.ring,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer"
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = style.hover;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = style.bg;
      }}
    >
      {loading ? (
        <>
          <div
            className="h-4 w-4 border-2 border-transparent rounded-full animate-spin"
            style={{
              borderTopColor: "currentColor",
              borderRightColor: "currentColor"
            }}
          />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
