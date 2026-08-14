"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Page() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
      <div className="w-full max-w-md px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-5xl font-bold mb-3" style={{ color: "var(--color-primary)" }}>
              ConnectOS
            </h1>
            <p className="text-lg" style={{ color: "var(--color-muted-foreground)" }}>
              Networking Memory & Relationship System
            </p>
          </div>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Capture, organize, and follow up with your professional network
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div
                className="h-8 w-8 border-4 border-transparent rounded-full"
                style={{
                  borderTopColor: "var(--color-primary)",
                  borderRightColor: "var(--color-accent)"
                }}
              />
            </div>
          </div>
        ) : (
          <LoginForm />
        )}

        {/* Features */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p className="text-xs text-center" style={{ color: "var(--color-muted-foreground)" }}>
            ✓ Scan business cards  ✓ Manage contacts  ✓ Track relationships
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-on-primary)",
        outlineColor: "var(--color-ring)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.95";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
