"use client";

import Link from "next/link";
import { Scissors, Eraser, Sparkles, Palette, ArrowRight, Shield, Zap, Globe } from "lucide-react";

const tools = [
  {
    href: "/background-remover",
    title: "Background Remover",
    description: "Remove backgrounds from any image with AI. Handles hair, transparent objects, and complex edges.",
    icon: Scissors,
    color: "violet",
  },
  {
    href: "/object-remover",
    title: "Object Remover",
    description: "Erase unwanted objects or people from photos. AI fills the space naturally.",
    icon: Eraser,
    color: "blue",
  },
  {
    href: "/image-cleanup",
    title: "Image Cleanup",
    description: "Fix old photos by removing scratches, dust, and noise while preserving details.",
    icon: Sparkles,
    color: "emerald",
  },
  {
    href: "/colorize",
    title: "Colorize B&W",
    description: "Transform black & white photos into vibrant color with AI-powered colorization.",
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
  { icon: Shield, title: "100% Private", description: "All processing happens in your browser. Your images never leave your device." },
  { icon: Zap, title: "AI-Powered", description: "Advanced AI models running locally via WebAssembly for professional results." },
  { icon: Globe, title: "No Upload Required", description: "Works offline after first load. No server, no cloud, no waiting." },
];

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 mb-6">
          <Zap className="w-3.5 h-3.5" />
          AI runs in your browser
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          Professional Image Editing
          <br />
          <span className="text-violet-600">Powered by AI</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Remove backgrounds, erase objects, clean up old photos, and colorize
          black & white images. All processing runs locally in your browser.
        </p>
      </section>

      {/* Tools Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map(({ href, title, description, icon: Icon, color }) => {
            const c = colorMap[color];
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex flex-col p-6 rounded-2xl border ${c.border} ${c.hover} bg-white shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 flex-1">{description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
                  Try it now
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
