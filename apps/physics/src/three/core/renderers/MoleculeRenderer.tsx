"use client";

/**
 * MoleculeRenderer — Data-driven Molecule Renderer
 *
 * Accepts a molecule JSON object ({ atoms: [{element, position}], bonds: [{from, to, order}] })
 * and renders using kit/chemistry/Atom + Bond.
 * One component drives ALL chemistry molecule topics — molecules are data, not separate 3D files.
 */

import * as THREE from "three";
import { Atom } from "@/three/kit/chemistry/Atom";
import { Bond } from "@/three/kit/chemistry/Bond";

export interface MoleculeData {
  atoms: Array<{
    id?: string;
    element: string;
    position: [number, number, number] | THREE.Vector3;
  }>;
  bonds: Array<{
    from: [number, number, number] | THREE.Vector3;
    to: [number, number, number] | THREE.Vector3;
    order?: 1 | 2 | 3;
  }>;
}

export interface MoleculeRendererProps {
  data: MoleculeData;
  scale?: number;
  position?: THREE.Vector3 | [number, number, number];
}

export function MoleculeRenderer({
  data,
  scale = 1,
  position = [0, 0, 0],
}: MoleculeRendererProps) {
  return (
    <group position={position as [number, number, number]} scale={scale}>
      {data.atoms.map((atom, idx) => (
        <Atom key={atom.id ?? idx} element={atom.element} position={atom.position} />
      ))}
      {data.bonds.map((bond, idx) => (
        <Bond key={idx} from={bond.from} to={bond.to} order={bond.order} />
      ))}
    </group>
  );
}
