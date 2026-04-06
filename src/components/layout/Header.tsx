"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Scissors, Eraser, Sparkles, Palette } from "lucide-react";

const tools = [
  { href: "/background-remover", label: "BG Remover", icon: Scissors },
  { href: "/object-remover", label: "Object Remover", icon: Eraser },
  { href: "/image-cleanup", label: "Cleanup", icon: Sparkles },
  { href: "/colorize", label: "Colorize", icon: Palette },
];

function GangaLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="8" fill="#7C3AED" />
      <text
        x="18"
        y="14"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        GANGA
      </text>
      <text
        x="18"
        y="24"
        textAnchor="middle"
        fill="white"
        fontSize="7"
        fontWeight="500"
        fontFamily="Arial, sans-serif"
      >
        STUDIO
      </text>
      <rect x="6" y="28" width="24" height="2" rx="1" fill="#DDD6FE" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-gray-900">
            <GangaLogo className="w-8 h-8" />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight">Ganga Studio</span>
              <span className="text-[10px] font-medium text-violet-600 -mt-0.5">BG Remover & Tools</span>
            </div>
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
