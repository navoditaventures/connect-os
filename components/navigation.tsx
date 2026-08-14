"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/contacts", label: "Contacts", icon: "👥" },
  { href: "/events", label: "Events", icon: "📅" },
  { href: "/followups", label: "Follow-ups", icon: "✓" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:static">
      <div className="flex justify-around md:justify-start md:gap-0">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-3 px-2 text-center md:py-4 md:px-6 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "text-black border-b-2 md:border-b-0 md:border-l-4 border-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <span className="block md:hidden text-lg">{item.icon}</span>
            <span className="hidden md:block">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
