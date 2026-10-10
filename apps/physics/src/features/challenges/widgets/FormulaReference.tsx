"use client";

interface FormulaItem {
  label: string;
  latex: string;
}

interface FormulaReferenceProps {
  formulas: FormulaItem[];
}

export function FormulaReference({ formulas }: FormulaReferenceProps) {
  if (!formulas || formulas.length === 0) return null;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-lg space-y-3">
      <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
        Formula Reference
      </div>
      <div className="space-y-2">
        {formulas.map((item, index) => (
          <div key={index} className="bg-slate-950/60 rounded-lg p-2.5 border border-white/5">
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className="font-mono text-cyan-300 text-sm font-semibold tracking-wide">
              {item.latex}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
