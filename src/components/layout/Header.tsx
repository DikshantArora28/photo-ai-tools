"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Scissors, Eraser, Sparkles, Palette, ImageIcon } from "lucide-react";

const tools = [
  { href: "/background-remover", label: "BG Remover", icon: Scissors },
  { href: "/object-remover", label: "Object Remover", icon: Eraser },
  { href: "/image-cleanup", label: "Cleanup", icon: Sparkles },
  { href: "/colorize", label: "Colorize", icon: Palette },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
            <ImageIcon className="w-6 h-6 text-violet-600" />
            <span className="hidden sm:inline">PhotoAI Tools</span>
          </Link>

          <nav className="flex items-center gap-1">
            {tools.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
