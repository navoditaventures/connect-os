"use client";

interface DashboardHeaderProps {
  userName?: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-foreground)" }}>
        Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}!
      </h1>
      <p style={{ color: "var(--color-muted-foreground)" }}>
        Manage your professional network and follow-ups
      </p>
    </div>
  );
}
