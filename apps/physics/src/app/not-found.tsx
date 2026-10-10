import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">404 - Simulation Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The requested simulation slug or parameters do not exist in the TopCoaching registry.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/25">
        <ArrowLeft className="w-4 h-4" />
        Return to Simulations Catalog
      </Link>
    </div>
  );
}
