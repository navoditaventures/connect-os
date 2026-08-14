"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import ExportManager from "@/components/export-manager";
import FormInput from "@/components/form-input";
import Button from "@/components/button";

interface UserSettings {
  digital_profile_url: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({ digital_profile_url: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from("users")
          .select("digital_profile_url")
          .eq("id", user.id)
          .single();

        if (data) {
          setSettings({ digital_profile_url: data.digital_profile_url || "" });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      const { error } = await supabase
        .from("users")
        .update({ digital_profile_url: settings.digital_profile_url })
        .eq("id", user.id);

      if (error) throw error;

      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Settings
          </h1>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>
            Manage your profile and preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Digital Profile Section */}
        <div
          className="card p-6 rounded-lg border"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)"
          }}
        >
          <h2 className="font-bold text-lg mb-2" style={{ color: "var(--color-foreground)" }}>
            🔗 Digital Profile
          </h2>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Your portfolio or profile URL that will be included in WhatsApp messages and contact sharing
          </p>

          <FormInput
            type="url"
            value={settings.digital_profile_url}
            onChange={(e) => setSettings({ ...settings, digital_profile_url: e.target.value })}
            placeholder="https://yourportfolio.com"
          />

          <div className="flex gap-3 mt-4 items-center">
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              loading={isSaving}
              variant="primary"
              size="md"
            >
              Save Profile URL
            </Button>
            {saveMessage && (
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    saveMessage.includes("success")
                      ? "var(--color-success)"
                      : "var(--color-destructive)"
                }}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div
          className="card p-6 rounded-lg border"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)"
          }}
        >
          <ExportManager />
        </div>

        {/* Account Section */}
        <div
          className="card p-6 rounded-lg border"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)"
          }}
        >
          <h2 className="font-bold text-lg mb-2" style={{ color: "var(--color-foreground)" }}>
            👤 Account
          </h2>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Signed in as <strong>{user?.email}</strong>
          </p>
          <Button
            onClick={handleSignOut}
            variant="destructive"
            size="md"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
