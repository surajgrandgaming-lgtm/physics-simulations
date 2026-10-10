"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Home,
  BookOpen,
  TrendingUp,
  Trophy,
  Users,
  Flame,
  User,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { useScrollVisibility } from "@/hooks/useScrollVisibility";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/", icon: Home, desc: "Explore modules & concepts" },
  { id: "courses", label: "Courses", href: "/courses", icon: BookOpen, desc: "JEE Physics, Chem & Math" },
  { id: "progress", label: "Progress", href: "/progress", icon: TrendingUp, desc: "Track mastery & stats" },
  { id: "leaderboard", label: "Leaderboard", href: "/leaderboard", icon: Trophy, desc: "Top learners rank" },
  { id: "community", label: "Community", href: "/community", icon: Users, desc: "Discussions & doubts" },
] as const;

function isActive(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  return Boolean(pathname?.startsWith(href));
}

export function Navbar() {
  const p = usePathname();
  if (p?.startsWith('/embed')) return null;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isScrollVisible = useScrollVisibility();
  const menuRef = useRef<HTMLDivElement>(null);
  const isChallenge = pathname?.includes("/challenge");

  const isVisible = open || isScrollVisible;

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <header
      ref={menuRef}
      className={`rounded-2xl px-3.5 sm:px-6 py-2 sm:py-3 max-lg:landscape:py-1.5 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.12)] border transition-all duration-300 ease-out relative z-50 backdrop-blur-3xl ${
        isVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-[140%] opacity-0 pointer-events-none"
      } ${
        open
          ? "bg-[#060b18]/98 border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.25)]"
          : "bg-[#070e22]/90 sm:bg-[#070e22]/85 border-white/12 hover:border-white/20"
      } ${isChallenge ? "max-lg:landscape:hidden md:max-lg:landscape:flex" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo - shrink-0 ensures TopCoaching never truncates */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all shrink-0">
            <div className="w-full h-full bg-[#070d1e] rounded-[11px] flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <div className="shrink-0 flex flex-col">
            <span className="text-base sm:text-xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
              TopCoaching
            </span>
            <span className="text-[9px] tracking-[0.22em] text-cyan-400/80 font-bold uppercase -mt-0.5 hidden xl:block">
              Learn, visualize, master.
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items (visible on lg: 1024px+ screens) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/50 p-1.5 rounded-full border border-white/10 shrink-0 backdrop-blur-md">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                  active
                    ? "font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                    : "font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-cyan-400" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center justify-center bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/40 w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.2)]" title="12 Day Streak">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 fill-orange-400/40" />
          </div>
          <div className="hidden xl:flex items-center justify-center bg-gradient-to-r from-yellow-500/15 to-amber-500/15 border border-yellow-500/40 w-9 h-9 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.2)]" title="2,540 XP">
            <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400/40" />
          </div>
          <button
            type="button"
            className="flex items-center justify-center bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/40 w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-cyan-500/25 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            title="Login / Profile"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            className={`lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all ${
              open
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {open && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 max-h-[75vh] overflow-y-auto">
          {/* Mobile Navigation Links */}
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white font-semibold border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        active
                          ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                          : "bg-slate-900 border-white/10 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-slate-100">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  </div>
                  {active ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Mobile Status & CTA Strip */}
          <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400/30" />
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-300/80 font-mono uppercase">Streak</span>
                <span className="text-xs font-bold text-orange-200">12 Days</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400/30" />
              <div className="flex flex-col">
                <span className="text-[10px] text-yellow-300/80 font-mono uppercase">XP Points</span>
                <span className="text-xs font-bold text-yellow-200">2,540 XP</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

