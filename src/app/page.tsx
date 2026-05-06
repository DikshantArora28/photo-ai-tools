"use client";

import Link from "next/link";
import { Scissors, Eraser, Sparkles, Palette, ArrowRight, Shield, Zap, Globe } from "lucide-react";

const tools = [
  {
    href: "/background-remover",
    title: "BG Remover",
    description: "Remove backgrounds with AI. Handles hair & complex edges.",
    icon: Scissors,
    color: "violet",
  },
  {
    href: "/object-remover",
    title: "Object Remover",
    description: "Erase unwanted objects or people. AI fills naturally.",
    icon: Eraser,
    color: "blue",
  },
  {
    href: "/image-cleanup",
    title: "Photo Enhancer",
    description: "AI upscale & sharpen photos to HD quality.",
    icon: Sparkles,
    color: "emerald",
  },
  {
    href: "/colorize",
    title: "Colorize B&W",
    description: "Transform black & white photos into vibrant color.",
    icon: Palette,
    color: "amber",
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
  violet: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-200", hover: "hover:border-violet-400 hover:shadow-violet-100" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200", hover: "hover:border-blue-400 hover:shadow-blue-100" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-400 hover:shadow-emerald-100" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200", hover: "hover:border-amber-400 hover:shadow-amber-100" },
};

const features = [
  { icon: Shield, title: "100% Private", description: "Images never leave your device." },
  { icon: Zap, title: "AI-Powered", description: "WebAssembly models for pro results." },
  { icon: Globe, title: "No Upload", description: "Works offline after first load." },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-6 pb-4 text-center shrink-0">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 mb-3">
          <Zap className="w-3 h-3" />
          AI runs in your browser
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
          Ganga Studio
          <span className="text-violet-600"> BG Remover & Tools</span>
        </h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
          Remove backgrounds, erase objects, clean up old photos, and colorize
          B&W images. All processing runs locally in your browser.
        </p>
      </section>

      {/* Tools Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-4 flex-1 flex flex-col justify-center w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tools.map(({ href, title, description, icon: Icon, color }) => {
            const c = colorMap[color];
            return (
              <Link
                key={href}
                href={href}
                className={`group flex flex-col p-4 rounded-xl border ${c.border} ${c.hover} bg-white shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{title}</h3>
                <p className="text-xs text-gray-500 flex-1 leading-relaxed">{description}</p>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-violet-600 group-hover:gap-1.5 transition-all">
                  Try it now
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50/50 shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-1.5">
                  <Icon className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-xs font-semibold text-gray-900">{title}</h3>
                <p className="text-[11px] text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
