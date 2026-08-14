"use client";

import { useAuth } from "@/lib/auth-context";

export default function Settings() {
  const { signOut } = useAuth();

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
          <h2 className="font-semibold mb-4">Account</h2>
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
