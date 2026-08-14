import { useAuth } from "../auth-context";

export function useExport() {
  const { user } = useAuth();

  const exportToCSV = async () => {
    if (!user) throw new Error("User not authenticated");

    try {
      const response = await fetch("/api/sheets/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, format: "csv" }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `connectos-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      throw error instanceof Error ? error : new Error("Export failed");
    }
  };

  const exportToJSON = async () => {
    if (!user) throw new Error("User not authenticated");

    try {
      const response = await fetch("/api/sheets/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, format: "json" }),
      });

      if (!response.ok) throw new Error("Export failed");

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `connectos-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      throw error instanceof Error ? error : new Error("Export failed");
    }
  };

  return {
    exportToCSV,
    exportToJSON,
  };
}
