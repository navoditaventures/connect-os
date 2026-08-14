"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import TemplateManager from "@/components/template-manager";

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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 mt-6">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="font-semibold mb-4">Digital Profile</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your portfolio or profile URL that will be included in WhatsApp messages
          </p>
          <input
            type="url"
            value={settings.digital_profile_url}
            onChange={(e) => setSettings({ ...settings, digital_profile_url: e.target.value })}
            placeholder="https://yourportfolio.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile URL"}
            </button>
            {saveMessage && (
              <span className="text-sm text-green-600 font-medium flex items-center">{saveMessage}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <TemplateManager />
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="font-semibold mb-4">Account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Signed in as <strong>{user?.email}</strong>
          </p>
          <button
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
