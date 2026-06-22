"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const navigationSections = [
    {
      title: "Operations",
      items: [
        { name: "Overview Dashboard", path: "/", icon: "dashboard" },
        { name: "Incident Cases", path: "/cases", icon: "cases" },
        { name: "Virtual Entity Demux", path: "/entities", icon: "entities" }
      ]
    },
    {
      title: "Lakehouse",
      items: [
        { name: "Core API Integrations", path: "/integrations", icon: "integrations" },
        { name: "Unified Lakehouse", path: "/lakehouse", icon: "lakehouse" },
        { name: "Asset Inventory", path: "/inventory", icon: "inventory" }
      ]
    },
    {
      title: "Appliance & Strategy",
      items: [
        { name: "Business Simulation", path: "/simulation", icon: "simulation" },
        { name: "OTA Upgrade Server", path: "/upgrades", icon: "upgrades" },
        { name: "Self-Auditing Log", path: "/audit", icon: "audit" },
        { name: "Appliance Settings", path: "/settings", icon: "settings" }
      ]
    }
  ];

  const renderIcon = (iconType, isActive) => {
    const colorClass = isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600";
    
    switch (iconType) {
      case "dashboard":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case "cases":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "entities":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case "integrations":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case "lakehouse":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case "upgrades":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        );
      case "audit":
      case "inventory":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "simulation":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "settings":
        return (
          <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    alert(`Google SecOps Index Query: Searching all telemetry and entities for "${searchQuery}"...`);
    setSearchQuery("");
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <title>uSecOps - Enterprise Security Console</title>
        <meta name="description" content="Sentinel-Chronicle Hybrid Air-Gapped SecOps Console" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[#f4f6f9] text-[#0f172a] font-sans antialiased overflow-hidden flex">
        {/* Microsoft Sentinel Style Sidebar in Light Theme */}
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col h-screen shrink-0 z-30 select-none">
          {/* Brand header */}
          <div className="py-6 border-b border-slate-200 flex items-center justify-between" style={{ paddingLeft: "32px", paddingRight: "24px" }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  uSecOps
                </span>
                <span className="text-[9px] font-mono border border-sky-500/30 text-sky-600 px-1.5 py-0.2 rounded uppercase bg-sky-50 font-bold">
                  V2 CORE
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider font-bold">
                Unified Decisions Platform
              </p>
            </div>
          </div>

          {/* Grouped Sidebar Navigation */}
          <nav className="flex-1 py-4 space-y-6 overflow-y-auto" style={{ paddingLeft: "32px", paddingRight: "16px" }}>
            {navigationSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-sky-50 text-sky-600 border-l-2 border-sky-500"
                            : "text-slate-600 hover:text-black hover:bg-slate-50"
                        }`}
                      >
                        {renderIcon(item.icon, isActive)}
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Appliance Status */}
          <div className="py-4 border-t border-slate-200 bg-slate-50 space-y-2 font-mono text-[10px]" style={{ paddingLeft: "32px", paddingRight: "16px" }}>
            <div className="flex justify-between items-center text-slate-500">
              <span>Security State:</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wider">AIR-GAPPED</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Dynamic Tenancy:</span>
              <span className="text-sky-600 font-bold">MULTI-SUBDOMAIN</span>
            </div>
          </div>
        </aside>

        {/* Right Workspace Shell */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header - Google Chronicle style Search Bar */}
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between z-20" style={{ paddingLeft: "48px", paddingRight: "24px" }}>
            {/* Center: Global Google Chronicle search bar */}
            <form onSubmit={handleSearchSubmit} className="chronicle-search-container">
              <span className="absolute left-4 top-2.5 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search raw logs, assets, IP addresses, domains, or virtual entity UUIDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="chronicle-search-input"
              />
            </form>

            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>ROLE: SUPER_ADMIN</span>
              </div>
            </div>
          </header>

          {/* Page Viewport */}
          <main className="flex-1 overflow-y-auto py-8 relative bg-[#f4f6f9]" style={{ paddingLeft: "48px", paddingRight: "24px" }}>
            <div className="w-full" style={{ maxWidth: "1600px" }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
