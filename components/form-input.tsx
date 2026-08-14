"use client";

import React from "react";

interface FormInputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

export default function FormInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  required,
  multiline,
  rows = 4,
  disabled
}: FormInputProps) {
  const Component = multiline ? "textarea" : "input";

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          className="text-sm font-medium"
          style={{ color: "var(--color-foreground)" }}
        >
          {label}
          {required && <span style={{ color: "var(--color-destructive)" }}>*</span>}
        </label>
      )}
      {/* @ts-ignore */}
      <Component
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        className="rounded-md border p-3 font-body text-base transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: "var(--color-input-bg)",
          borderColor: error ? "var(--color-destructive)" : "var(--color-input-border)",
          color: "var(--color-input-foreground)",
          outlineColor: "var(--color-ring)"
        }}
      />
      {error && (
        <p className="text-xs" style={{ color: "var(--color-destructive)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
