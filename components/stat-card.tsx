"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
}

export default function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-6)",
        borderRadius: "var(--radius-lg)",
        transition: "all var(--transition-base)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {icon && (
            <div
              className="text-2xl"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {icon}
            </div>
          )}
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
            {label}
          </p>
        </div>
        {trend && (
          <span
            style={{
              fontSize: "0.75rem",
              padding: "0.25rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor:
                trend.direction === "up"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              color: trend.direction === "up" ? "#10B981" : "#EF4444"
            }}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.percentage}%
          </span>
        )}
      </div>
      <div>
        <p
          className="font-bold"
          style={{ fontSize: "2rem", color: "var(--color-foreground)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
