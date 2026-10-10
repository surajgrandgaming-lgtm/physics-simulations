export interface ElementData {
  color: string;   // hex, CPK standard
  radius: number;  // van der Waals radius in Angstroms, normalized for Three.js
}

export const ELEMENTS: Record<string, ElementData> = {
  H:  { color: "#FFFFFF", radius: 0.25 },
  C:  { color: "#404040", radius: 0.35 },
  N:  { color: "#3050F8", radius: 0.32 },
  O:  { color: "#FF0D0D", radius: 0.30 },
  F:  { color: "#90E050", radius: 0.28 },
  P:  { color: "#FF8000", radius: 0.38 },
  S:  { color: "#FFFF30", radius: 0.37 },
  Cl: { color: "#1FF01F", radius: 0.35 },
  // TODO: extend for remaining JEE-relevant elements
};
