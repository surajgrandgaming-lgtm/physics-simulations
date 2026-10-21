"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useMountainTruckStore,
  MOUNTAIN_STAGES,
  buildMountainSpline,
  ROAD_PAD_LENGTH,
  TOTAL_ROAD_LENGTH,
} from "./MountainTruckStore";

// Physics Ticker
function SimulationTicker() {
  const status = useMountainTruckStore((s) => s.status);
  const tick = useMountainTruckStore((s) => s.tick);

  useFrame((_, delta) => {
    if (status === "driving" || status === "idle") {
      tick(delta);
    }
  });

  return null;
}


// Helper to calculate smooth banked road basis for any point u in [0, 1]
function getBankedRoadBasis(spline: THREE.CatmullRomCurve3, u: number) {
  const pt = spline.getPointAt(u);
  const tangent = spline.getTangentAt(u).normalize();
  const up0 = new THREE.Vector3(0, 1, 0);
  const roadRight0 = new THREE.Vector3().crossVectors(up0, tangent).normalize();
  const roadUp0 = new THREE.Vector3().crossVectors(tangent, roadRight0).normalize();

  // Curvature ahead for banking
  const uAhead = Math.min(1, u + 0.012);
  const tangentAhead = spline.getTangentAt(uAhead).normalize();
  const deltaT = new THREE.Vector3().subVectors(tangentAhead, tangent);
  const turnDirection = deltaT.dot(roadRight0);

  // Fade banking at start and finish
  const totalSplineLen = spline.getLength();
  const dist = u * totalSplineLen - ROAD_PAD_LENGTH;
  const isFlat = dist <= 16 || dist >= 425;
  const bankAngle = isFlat ? 0 : Math.max(-0.11, Math.min(0.11, turnDirection * 0.40));

  const cosB = Math.cos(bankAngle);
  const sinB = Math.sin(bankAngle);

  // When road turns right (turnDirection > 0, bankAngle > 0):
  // Right side dips down (-roadUp0 * sinB), left side rises (+roadUp0 * sinB)
  const roadRight = new THREE.Vector3()
    .addScaledVector(roadRight0, cosB)
    .addScaledVector(roadUp0, -sinB)
    .normalize();
  const roadUp = new THREE.Vector3()
    .addScaledVector(roadRight0, sinB)
    .addScaledVector(roadUp0, cosB)
    .normalize();

  return { pt, tangent, roadRight, roadUp, bankAngle, turnDirection };
}

// Procedural 3D Mountain Road Mesh along Spline
function MountainRoadMesh({ spline }: { spline: THREE.CatmullRomCurve3 }) {
  const {
    roadGeo,
    roadSlabGeo,
    embankmentLGeo,
    embankmentRGeo,
    centerDashesGeo,
    edgeLineLGeo,
    edgeLineRGeo,
    curbLGeo,
    curbRGeo,
    curbHairpinRedGeo,
    curbHairpinWhiteGeo,
    tunnelGeo,
    bridgeParapetGeo,
    bridgePillarsGeo,
    finishCheckeredGeo,
  } = useMemo(() => {
    const totalSplineLen = spline.getLength();
    const segments = 360;
    const roadWidth = 7.6; // Generous 2-lane mountain highway
    const halfW = roadWidth / 2;

    // 1. Asphalt Road Surface
    const roadPos: number[] = [];
    const roadNormals: number[] = [];
    const roadIndices: number[] = [];

    // 2. Concrete Roadbed Foundation Slab
    const slabPos: number[] = [];
    const slabIndices: number[] = [];

    // 3. Natural Stone Embankments (Left & Right)
    const embLPos: number[] = [];
    const embLIndices: number[] = [];
    const embRPos: number[] = [];
    const embRIndices: number[] = [];

    // 4. Solid White Fog Edge Lines
    const edgeLPos: number[] = [];
    const edgeRPos: number[] = [];
    const edgeIndices: number[] = [];

    // 5. Standard Concrete Curbs
    const curbLPos: number[] = [];
    const curbRPos: number[] = [];
    const curbIndices: number[] = [];

    // 6. Hairpin Red & White Rally Curb Blocks
    const curbRedPos: number[] = [];
    const curbRedIndices: number[] = [];
    const curbWhitePos: number[] = [];
    const curbWhiteIndices: number[] = [];

    // 7. Upper Viaduct Bridge Parapet Safety Walls (u ~ 0.70 to 0.76)
    const parapetPos: number[] = [];
    const parapetIndices: number[] = [];
    const pStartSeg = Math.floor(0.70 * segments);
    const pEndSeg = Math.ceil(0.76 * segments);

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const { pt, roadRight, roadUp } = getBankedRoadBasis(spline, u);

      // Driving deck surface points: Left Edge, Right Edge
      const pL = pt.clone().addScaledVector(roadRight, -halfW);
      const pR = pt.clone().addScaledVector(roadRight, halfW);

      // 1. Black Asphalt Road Deck: uniform roadUp normal across whole surface for clean lighting
      roadPos.push(pL.x, pL.y, pL.z);
      roadPos.push(pR.x, pR.y, pR.z);
      roadNormals.push(roadUp.x, roadUp.y, roadUp.z);
      roadNormals.push(roadUp.x, roadUp.y, roadUp.z);

      if (i < segments) {
        const v0 = i * 2;
        const v1 = (i + 1) * 2;
        // Front-facing quad (CCW normal pointing roadUp)
        roadIndices.push(v0, v1, v0 + 1);
        roadIndices.push(v0 + 1, v1, v1 + 1);
      }

      // 2. Concrete Roadbed Foundation Slab (0.40m vertical drop on edges)
      const pL_slab = pL.clone().addScaledVector(roadUp, -0.40);
      const pR_slab = pR.clone().addScaledVector(roadUp, -0.40);

      slabPos.push(pL.x, pL.y, pL.z, pL_slab.x, pL_slab.y, pL_slab.z);
      slabPos.push(pR.x, pR.y, pR.z, pR_slab.x, pR_slab.y, pR_slab.z);

      if (i < segments) {
        const s0 = i * 4;
        const s1 = (i + 1) * 4;
        // Left slab vertical face
        slabIndices.push(s0, s0 + 1, s1);
        slabIndices.push(s0 + 1, s1 + 1, s1);
        // Right slab vertical face
        slabIndices.push(s0 + 2, s1 + 2, s0 + 3);
        slabIndices.push(s1 + 2, s1 + 3, s0 + 3);
      }

      // 3. Natural Rock/Gravel Embankments (Omit on upper viaduct bridge)
      const isBridge = u >= 0.70 && u <= 0.76;
      const isTunnel = u >= 0.44 && u <= 0.56;
      if (!isBridge) {
        const embDrop = isTunnel ? 0.4 : 1.2;
        const embSpread = isTunnel ? 0.6 : 2.0;

        const pL_embFoot = pL_slab.clone().addScaledVector(roadRight, -embSpread).addScaledVector(roadUp, -embDrop);
        const pR_embFoot = pR_slab.clone().addScaledVector(roadRight, embSpread).addScaledVector(roadUp, -embDrop);

        embLPos.push(pL_slab.x, pL_slab.y, pL_slab.z, pL_embFoot.x, pL_embFoot.y, pL_embFoot.z);
        embRPos.push(pR_slab.x, pR_slab.y, pR_slab.z, pR_embFoot.x, pR_embFoot.y, pR_embFoot.z);

        if (i < segments && !((i + 1) / segments >= 0.70 && (i + 1) / segments <= 0.76)) {
          const e0 = embLPos.length / 3 - 2;
          embLIndices.push(e0 - 2, e0, e0 - 1);
          embLIndices.push(e0 - 1, e0, e0 + 1);
          const r0 = embRPos.length / 3 - 2;
          embRIndices.push(r0 - 2, r0 - 1, r0);
          embRIndices.push(r0 - 1, r0 + 1, r0);
        }
      }

      // 4. Solid White Fog Edge Lines (0.18m wide, placed 0.40m in from edge)
      const eLL = pL.clone().addScaledVector(roadRight, 0.32).addScaledVector(roadUp, 0.014);
      const eLR = pL.clone().addScaledVector(roadRight, 0.50).addScaledVector(roadUp, 0.014);
      edgeLPos.push(eLL.x, eLL.y, eLL.z, eLR.x, eLR.y, eLR.z);

      const eRL = pR.clone().addScaledVector(roadRight, -0.50).addScaledVector(roadUp, 0.014);
      const eRR = pR.clone().addScaledVector(roadRight, -0.32).addScaledVector(roadUp, 0.014);
      edgeRPos.push(eRL.x, eRL.y, eRL.z, eRR.x, eRR.y, eRR.z);

      if (i < segments) {
        const k0 = i * 2;
        const k1 = (i + 1) * 2;
        edgeIndices.push(k0, k1, k0 + 1);
        edgeIndices.push(k0 + 1, k1, k1 + 1);
      }

      // 5 & 6. Road Edge Curbs (Standard concrete vs Hairpin Rally Curbs)
      const isHairpin = u >= 0.58 && u <= 0.70;
      if (!isHairpin && !isBridge) {
        // Standard Concrete Curb (0.18m high, 0.35m wide)
        const curbLH = pL.clone().addScaledVector(roadUp, 0.18);
        const curbLO = pL.clone().addScaledVector(roadRight, -0.35).addScaledVector(roadUp, 0.18);
        curbLPos.push(curbLH.x, curbLH.y, curbLH.z, curbLO.x, curbLO.y, curbLO.z);

        const curbRH = pR.clone().addScaledVector(roadUp, 0.18);
        const curbRO = pR.clone().addScaledVector(roadRight, 0.35).addScaledVector(roadUp, 0.18);
        curbRPos.push(curbRH.x, curbRH.y, curbRH.z, curbRO.x, curbRO.y, curbRO.z);

        if (i < segments) {
          const c0 = curbLPos.length / 3 - 2;
          const nextU = (i + 1) / segments;
          if (!(nextU >= 0.58 && nextU <= 0.70) && !(nextU >= 0.70 && nextU <= 0.76)) {
            curbIndices.push(c0 - 2, c0, c0 - 1);
            curbIndices.push(c0 - 1, c0, c0 + 1);
          }
        }
      } else if (isHairpin) {
        // Red and White Rally Kerbing Blocks in Hairpin Turn!
        const blockIdx = Math.floor(u * 120);
        const isRed = blockIdx % 2 === 0;

        const kLH = pL.clone().addScaledVector(roadUp, 0.20);
        const kLO = pL.clone().addScaledVector(roadRight, -0.45).addScaledVector(roadUp, 0.16);
        const kRH = pR.clone().addScaledVector(roadUp, 0.20);
        const kRO = pR.clone().addScaledVector(roadRight, 0.45).addScaledVector(roadUp, 0.16);

        const targetPos = isRed ? curbRedPos : curbWhitePos;
        const targetInd = isRed ? curbRedIndices : curbWhiteIndices;
        const vStart = targetPos.length / 3;

        targetPos.push(kLH.x, kLH.y, kLH.z, kLO.x, kLO.y, kLO.z);
        targetPos.push(kRH.x, kRH.y, kRH.z, kRO.x, kRO.y, kRO.z);

        if (vStart >= 4) {
          targetInd.push(vStart - 4, vStart, vStart - 3);
          targetInd.push(vStart - 3, vStart, vStart + 1);
          targetInd.push(vStart - 2, vStart - 1, vStart + 2);
          targetInd.push(vStart + 2, vStart - 1, vStart + 3);
        }
      }

      // 7. Upper Viaduct Bridge Parapet Walls (u ~ 0.70 to 0.76)
      if (i >= pStartSeg && i <= pEndSeg) {
        const pL_bot = pL.clone().addScaledVector(roadRight, -0.22).addScaledVector(roadUp, 0.02);
        const pL_top = pL.clone().addScaledVector(roadRight, -0.22).addScaledVector(roadUp, 1.25);
        parapetPos.push(pL_bot.x, pL_bot.y, pL_bot.z, pL_top.x, pL_top.y, pL_top.z);

        const pR_bot = pR.clone().addScaledVector(roadRight, 0.22).addScaledVector(roadUp, 0.02);
        const pR_top = pR.clone().addScaledVector(roadRight, 0.22).addScaledVector(roadUp, 1.25);
        parapetPos.push(pR_bot.x, pR_bot.y, pR_bot.z, pR_top.x, pR_top.y, pR_top.z);

        if (i < pEndSeg) {
          const segIdx = i - pStartSeg;
          const l0 = segIdx * 4;
          const l1 = segIdx * 4 + 1;
          const l2 = (segIdx + 1) * 4;
          const l3 = (segIdx + 1) * 4 + 1;
          parapetIndices.push(l0, l1, l2, l1, l3, l2);
          parapetIndices.push(l2, l1, l0, l2, l3, l1);

          const r0 = segIdx * 4 + 2;
          const r1 = segIdx * 4 + 3;
          const r2 = (segIdx + 1) * 4 + 2;
          const r3 = (segIdx + 1) * 4 + 3;
          parapetIndices.push(r0, r1, r2, r1, r3, r2);
          parapetIndices.push(r2, r1, r0, r2, r3, r1);
        }
      }
    }

    // 8. CRISP DASHED WHITE CENTER LINE (3.5m stripe, 2.5m gap, 0.22m wide)
    const dashPos: number[] = [];
    const dashIndices: number[] = [];
    let dashCount = 0;

    for (let d = 4.0; d <= 440; d += 6.0) {
      const d0 = d;
      const d1 = Math.min(440, d + 3.5);
      const subSteps = 3;
      const baseV = dashCount * (subSteps + 1) * 2;

      for (let s = 0; s <= subSteps; s++) {
        const curD = d0 + (s / subSteps) * (d1 - d0);
        const u = curD / totalSplineLen;
        const { pt, roadRight, roadUp } = getBankedRoadBasis(spline, Math.min(1, u));

        const wHalf = 0.11; // 22cm wide stripe
        const pL = pt.clone().addScaledVector(roadRight, -wHalf).addScaledVector(roadUp, 0.016);
        const pR = pt.clone().addScaledVector(roadRight, wHalf).addScaledVector(roadUp, 0.016);

        dashPos.push(pL.x, pL.y, pL.z, pR.x, pR.y, pR.z);

        if (s < subSteps) {
          const v0 = baseV + s * 2;
          const v1 = baseV + (s + 1) * 2;
          dashIndices.push(v0, v1, v0 + 1);
          dashIndices.push(v0 + 1, v1, v1 + 1);
        }
      }
      dashCount++;
    }

    // 9. VAULTED GRANITE MOUNTAIN TUNNEL TUBE (u = 0.44 to 0.56, d ~ 210m to 270m)
    const tunnelPos: number[] = [];
    const tunnelIndices: number[] = [];
    const archSlices = 14;
    const tunnelHeight = 5.6;

    const tStartSeg = Math.floor(0.44 * segments);
    const tEndSeg = Math.ceil(0.56 * segments);

    for (let i = tStartSeg; i <= tEndSeg; i++) {
      const u = i / segments;
      const { pt, roadRight, roadUp } = getBankedRoadBasis(spline, u);

      for (let j = 0; j <= archSlices; j++) {
        const angle = (j / archSlices) * Math.PI; // 0 to PI
        const xOffset = Math.cos(angle) * (halfW + 0.65);
        const yOffset = Math.sin(angle) * tunnelHeight;
        const v = pt.clone().addScaledVector(roadRight, xOffset).addScaledVector(roadUp, yOffset);
        tunnelPos.push(v.x, v.y, v.z);
      }

      if (i < tEndSeg) {
        const segIdx = i - tStartSeg;
        for (let j = 0; j < archSlices; j++) {
          const v0 = segIdx * (archSlices + 1) + j;
          const v1 = segIdx * (archSlices + 1) + (j + 1);
          const v2 = (segIdx + 1) * (archSlices + 1) + j;
          const v3 = (segIdx + 1) * (archSlices + 1) + (j + 1);
          tunnelIndices.push(v0, v1, v2, v1, v3, v2);
          tunnelIndices.push(v2, v1, v0, v2, v3, v1);
        }
      }
    }

    // 10. MASSIVE CONCRETE VIADUCT BRIDGE PILLARS (Straddling Lower Underpass Road)
    // Overpass crosses at u ~ 0.730 (X ~ -21.3, Z ~ 284, Y_top ~ 26.8m)
    // Lower road underneath is at X ~ -21.2, Z ~ 284.5, Y ~ 17.65m (width 7.6m)
    // Pillars placed at lateral offsets +-5.2m flanking the lower road!
    const pillarPos: number[] = [];
    const pillarIndices: number[] = [];
    const pillarUList = [0.725, 0.740];
    const pillarRadius = 0.85;
    const pillarSlices = 10;

    pillarUList.forEach((uPil, pIdx) => {
      const { pt, roadRight } = getBankedRoadBasis(spline, uPil);
      const topY = pt.y - 0.40;
      const botY = -2.0; // Anchored deep into canyon rock

      [-halfW - 1.6, halfW + 1.6].forEach((sideOffset, colIdx) => {
        const colCenter = pt.clone().addScaledVector(roadRight, sideOffset);
        const baseV = pillarPos.length / 3;

        for (let s = 0; s <= pillarSlices; s++) {
          const ang = (s / pillarSlices) * Math.PI * 2;
          const px = colCenter.x + Math.cos(ang) * pillarRadius;
          const pz = colCenter.z + Math.sin(ang) * pillarRadius;
          pillarPos.push(px, topY, pz);
          pillarPos.push(px, botY, pz);
        }

        for (let s = 0; s < pillarSlices; s++) {
          const idx0 = baseV + s * 2;
          const idx1 = baseV + (s + 1) * 2;
          pillarIndices.push(idx0, idx0 + 1, idx1);
          pillarIndices.push(idx1, idx0 + 1, idx1 + 1);
        }
      });
    });

    // 11. CHECKERED FINISH LINE (at d = 440m)
    const checkPos: number[] = [];
    const checkIndices: number[] = [];
    const uFin = (TOTAL_ROAD_LENGTH + ROAD_PAD_LENGTH) / totalSplineLen;
    const finBasis = getBankedRoadBasis(spline, Math.min(0.995, uFin));
    const numChecks = 12;
    const checkW = (halfW * 2) / numChecks;

    for (let c = 0; c < numChecks; c += 2) {
      const x0 = -halfW + c * checkW;
      const x1 = x0 + checkW;

      const p0 = finBasis.pt.clone().addScaledVector(finBasis.roadRight, x0).addScaledVector(finBasis.roadUp, 0.018);
      const p1 = finBasis.pt.clone().addScaledVector(finBasis.roadRight, x1).addScaledVector(finBasis.roadUp, 0.018);
      const p2 = p0.clone().addScaledVector(finBasis.tangent, 0.8);
      const p3 = p1.clone().addScaledVector(finBasis.tangent, 0.8);

      const baseIdx = checkPos.length / 3;
      checkPos.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
      checkIndices.push(baseIdx, baseIdx + 2, baseIdx + 1);
      checkIndices.push(baseIdx + 1, baseIdx + 2, baseIdx + 3);
    }

    const build = (pos: number[], ind: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(ind);
      g.computeVertexNormals();
      return g;
    };

    const buildWithNormals = (pos: number[], normals: number[], ind: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
      g.setIndex(ind);
      return g;
    };

    return {
      roadGeo: buildWithNormals(roadPos, roadNormals, roadIndices),
      roadSlabGeo: build(slabPos, slabIndices),
      embankmentLGeo: build(embLPos, embLIndices),
      embankmentRGeo: build(embRPos, embRIndices),
      centerDashesGeo: build(dashPos, dashIndices),
      edgeLineLGeo: build(edgeLPos, edgeIndices),
      edgeLineRGeo: build(edgeRPos, edgeIndices),
      curbLGeo: build(curbLPos, curbIndices),
      curbRGeo: build(curbRPos, curbIndices),
      curbHairpinRedGeo: build(curbRedPos, curbRedIndices),
      curbHairpinWhiteGeo: build(curbWhitePos, curbWhiteIndices),
      tunnelGeo: build(tunnelPos, tunnelIndices),
      bridgeParapetGeo: build(parapetPos, parapetIndices),
      bridgePillarsGeo: build(pillarPos, pillarIndices),
      finishCheckeredGeo: build(checkPos, checkIndices),
    };
  }, [spline]);

  const totalSplineLen = spline.getLength();

  return (
    <group>
      {/* 1. DEEP BLACK ASPHALT HIGHWAY SURFACE */}
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial
          color="#141518"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* 2. CONCRETE ROADBED FOUNDATION SLAB */}
      <mesh geometry={roadSlabGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#27272a" roughness={0.92} />
      </mesh>

      {/* 3. NATURAL STONE EMBANKMENTS */}
      <mesh geometry={embankmentLGeo} receiveShadow>
        <meshStandardMaterial color="#334155" roughness={0.95} />
      </mesh>
      <mesh geometry={embankmentRGeo} receiveShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>

      {/* 4. CRISP BRIGHT WHITE DASHED CENTER STRIPES */}
      <mesh geometry={centerDashesGeo}>
        <meshBasicMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* 5. SOLID WHITE ROAD SHOULDER FOG LINES */}
      <mesh geometry={edgeLineLGeo}>
        <meshBasicMaterial
          color="#f8fafc"
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>
      <mesh geometry={edgeLineRGeo}>
        <meshBasicMaterial
          color="#f8fafc"
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* 6. STANDARD CONCRETE CURBS */}
      <mesh geometry={curbLGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#475569" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={curbRGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#475569" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* 7. HAIRPIN RALLY APEX KERBING (Alternating Red & White) */}
      <mesh geometry={curbHairpinRedGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#dc2626" roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={curbHairpinWhiteGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* 8. ARCHED GRANITE MOUNTAIN TUNNEL TUBE */}
      <mesh geometry={tunnelGeo} receiveShadow castShadow>
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.94}
          metalness={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 9. UPPER ROAD VIADUCT BRIDGE PARAPET BARRIER WALLS (u ~ 0.70 to 0.76) */}
      <mesh geometry={bridgeParapetGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#64748b" roughness={0.7} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* 10. STRUCTURAL CONCRETE BRIDGE SUPPORT PILLARS */}
      <mesh geometry={bridgePillarsGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#334155" roughness={0.88} metalness={0.1} />
      </mesh>

      {/* 11. CHECKERED FINISH LINE TILES */}
      <mesh geometry={finishCheckeredGeo}>
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* 12. STEEL W-BEAM GUARDRAILS ALONG CLIFF EDGES (Outside Tunnel & Bridge) */}
      {Array.from({ length: 44 }).map((_, idx) => {
        const u = 0.08 + (idx / 43) * 0.84;
        // Omit inside tunnel (u ~ 0.44 to 0.56) and on bridge overpass (u ~ 0.70 to 0.76)
        if ((u >= 0.43 && u <= 0.57) || (u >= 0.69 && u <= 0.77)) return null;

        const { pt, tangent, roadRight } = getBankedRoadBasis(spline, u);
        const postPos = pt.clone().addScaledVector(roadRight, 4.25);
        const isHairpin = u >= 0.58 && u <= 0.70;

        return (
          <group key={idx} position={[postPos.x, postPos.y, postPos.z]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.9, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[0.16, 0.14, 0.08]} />
              <meshBasicMaterial color={isHairpin ? "#ef4444" : "#f59e0b"} />
            </mesh>
            <mesh position={[0, 0.5, 0]} rotation={[0, Math.atan2(tangent.x, tangent.z), 0]}>
              <boxGeometry args={[0.08, 0.32, 3.4]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* 13. GRAND BANKED HORSESHOE CHEVRON ARROW SIGNS */}
      {[0.62, 0.65, 0.68].map((uVal, idx) => {
        const { pt, tangent, roadRight } = getBankedRoadBasis(spline, uVal);
        const signPos = pt.clone().addScaledVector(roadRight, 4.8);

        return (
          <group key={idx} position={[signPos.x, signPos.y, signPos.z]}>
            <mesh position={[0, 1.1, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 2.2, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.6} />
            </mesh>
            <mesh position={[0, 1.8, 0]} rotation={[0, Math.atan2(tangent.x, tangent.z), 0]}>
              <boxGeometry args={[0.1, 0.8, 1.3]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.4} />
            </mesh>
            <mesh position={[-0.06, 1.8, 0]} rotation={[0, Math.atan2(tangent.x, tangent.z), 0]}>
              <boxGeometry args={[0.02, 0.6, 1.0]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>
        );
      })}

      {/* 14. START LINE ARCHWAY CHECKPOINT & BOLD WHITE STOP LINE (d = 0) */}
      {(() => {
        const u0 = ROAD_PAD_LENGTH / totalSplineLen;
        const { pt, tangent } = getBankedRoadBasis(spline, u0);
        const archRot = Math.atan2(tangent.x, tangent.z);

        return (
          <group position={[pt.x, pt.y, pt.z]} rotation={[0, archRot, 0]}>
            <mesh position={[-4.3, 3.0, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.28, 6.0, 12]} />
              <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[4.3, 3.0, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.28, 6.0, 12]} />
              <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 5.8, 0]}>
              <boxGeometry args={[9.2, 1.0, 0.6]} />
              <meshStandardMaterial color="#0369a1" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 5.8, 0.32]}>
              <boxGeometry args={[8.0, 0.75, 0.05]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {/* Bold White Start Stop Line Across Road */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[7.2, 0.9]} />
              <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })()}

      {/* 15. MONUMENTAL MOUNTAIN TUNNEL ENTRANCE PORTAL (u = 0.44, d ~ 210m) */}
      {(() => {
        const { pt, tangent } = getBankedRoadBasis(spline, 0.44);
        const rot = Math.atan2(tangent.x, tangent.z);

        return (
          <group position={[pt.x, pt.y, pt.z]} rotation={[0, rot, 0]}>
            <mesh position={[-4.6, 3.0, 0]} castShadow>
              <boxGeometry args={[1.6, 6.0, 2.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[4.6, 3.0, 0]} castShadow>
              <boxGeometry args={[1.6, 6.0, 2.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[0, 6.2, 0]} castShadow>
              <boxGeometry args={[10.8, 2.0, 2.4]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 5.6, 1.25]}>
              <boxGeometry args={[8.2, 0.55, 0.06]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.2} roughness={0.5} />
            </mesh>
            <mesh position={[0, 7.3, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
            <pointLight position={[0, 7.3, 0.5]} color="#f59e0b" intensity={2.2} distance={14} />
          </group>
        );
      })()}

      {/* 16. MONUMENTAL MOUNTAIN TUNNEL EXIT PORTAL (u = 0.56, d ~ 270m) */}
      {(() => {
        const { pt, tangent } = getBankedRoadBasis(spline, 0.56);
        const rot = Math.atan2(tangent.x, tangent.z);

        return (
          <group position={[pt.x, pt.y, pt.z]} rotation={[0, rot, 0]}>
            <mesh position={[-4.6, 3.0, 0]} castShadow>
              <boxGeometry args={[1.6, 6.0, 2.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[4.6, 3.0, 0]} castShadow>
              <boxGeometry args={[1.6, 6.0, 2.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[0, 6.2, 0]} castShadow>
              <boxGeometry args={[10.8, 2.0, 2.4]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 7.3, 0]}>
              <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        );
      })()}

      {/* 17. INTERIOR OVERHEAD TUNNEL LAMPS (Warm Sodium-Vapor Amber Lighting) */}
      {[0.45, 0.475, 0.50, 0.525, 0.55].map((uVal, idx) => {
        const { pt, roadUp } = getBankedRoadBasis(spline, uVal);
        const lampPos = pt.clone().addScaledVector(roadUp, 5.1);

        return (
          <group key={idx} position={[lampPos.x, lampPos.y, lampPos.z]}>
            <mesh>
              <boxGeometry args={[0.6, 0.2, 1.2]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, -0.11, 0]}>
              <planeGeometry args={[0.5, 1.0]} />
              <meshBasicMaterial color="#fde047" side={THREE.DoubleSide} />
            </mesh>
            <pointLight position={[0, -0.4, 0]} color="#fbbf24" intensity={2.5} distance={16} decay={1.8} />
          </group>
        );
      })}

      {/* 18. SUMMIT FINISH OUTPOST GANTRY (d = 440m) */}
      {(() => {
        const uEnd = (TOTAL_ROAD_LENGTH + ROAD_PAD_LENGTH) / totalSplineLen;
        const { pt, tangent } = getBankedRoadBasis(spline, Math.min(0.995, uEnd));
        const archRot = Math.atan2(tangent.x, tangent.z);

        return (
          <group position={[pt.x, pt.y, pt.z]} rotation={[0, archRot, 0]}>
            <mesh position={[-4.4, 3.4, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.35, 6.8, 12]} />
              <meshStandardMaterial color="#10b981" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[4.4, 3.4, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.35, 6.8, 12]} />
              <meshStandardMaterial color="#10b981" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 6.5, 0]}>
              <boxGeometry args={[9.4, 1.2, 0.7]} />
              <meshStandardMaterial color="#047857" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[-3.6, 7.3, 0]}>
              <sphereGeometry args={[0.24, 12, 12]} />
              <meshBasicMaterial color="#34d399" />
            </mesh>
            <mesh position={[3.6, 7.3, 0]}>
              <sphereGeometry args={[0.24, 12, 12]} />
              <meshBasicMaterial color="#34d399" />
            </mesh>
          </group>
        );
      })()}
    </group>
  );
}

function AlpineMountainEnvironment() {
  const mountainPeaks = useMemo(() => {
    // Distant mountain peaks placed along the perimeter of the alpine valley (> 110m away from road)
    // Radius, Height, X, Z
    return [
      { x: -180, z: -40, r: 85, h: 130, color: "#334155" },
      { x: -220, z: 90, r: 100, h: 155, color: "#1e293b" },
      { x: -190, z: 220, r: 95, h: 145, color: "#475569" },
      { x: -140, z: 340, r: 105, h: 160, color: "#334155" },
      { x: -60, z: 420, r: 110, h: 170, color: "#1e293b" },
      { x: 80, z: 430, r: 115, h: 175, color: "#334155" },
      { x: 190, z: 320, r: 105, h: 160, color: "#475569" },
      { x: 210, z: 180, r: 110, h: 150, color: "#1e293b" },
      { x: 190, z: 40, r: 95, h: 135, color: "#334155" },
      { x: 160, z: -80, r: 90, h: 125, color: "#475569" },
      { x: 60, z: -140, r: 85, h: 115, color: "#1e293b" },
      { x: -80, z: -130, r: 90, h: 120, color: "#334155" },
    ];
  }, []);

  return (
    <group>
      {/* Surrounding Mountain Peaks rooted at canyon floor Y = -60 */}
      {mountainPeaks.map((peak, idx) => (
        <group key={idx} position={[peak.x, -60, peak.z]}>
          {/* Rocky Mountain Base Cone (28 radial segments for smooth, natural silhouette) */}
          <mesh position={[0, peak.h / 2, 0]} castShadow>
            <coneGeometry args={[peak.r, peak.h, 28]} />
            <meshStandardMaterial color={peak.color} roughness={0.92} />
          </mesh>
          {/* Snow-Covered Summit Cap */}
          <mesh position={[0, peak.h * 0.84, 0]}>
            <coneGeometry args={[peak.r * 0.22, peak.h * 0.35, 28]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Canyon Valley Ground Floor (Y = -60) */}
      <mesh position={[40, -60, 150]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1100, 1100]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} />
      </mesh>

      {/* Valley Mist / Cloud Layer in Canyon (Y = -35) */}
      <mesh position={[40, -35, 150]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[950, 950]} />
        <meshStandardMaterial
          color="#94a3b8"
          transparent
          opacity={0.25}
          roughness={1.0}
        />
      </mesh>

      {/* Alpine Pine Trees along Canyon Slopes */}
      {Array.from({ length: 32 }).map((_, idx) => {
        const x = -45 - (idx % 6) * 12;
        const z = -10 + idx * 12;
        const y = -18 + Math.sin(idx * 1.5) * 5;

        return (
          <group key={idx} position={[x, y, z]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.2, 0.35, 2.4, 8]} />
              <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>
            <mesh position={[0, 2.8, 0]}>
              <coneGeometry args={[1.6, 2.2, 8]} />
              <meshStandardMaterial color="#14532d" roughness={0.8} />
            </mesh>
            <mesh position={[0, 4.0, 0]}>
              <coneGeometry args={[1.2, 1.8, 8]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
            <mesh position={[0, 5.0, 0]}>
              <coneGeometry args={[0.8, 1.4, 8]} />
              <meshStandardMaterial color="#16a34a" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function TimberLog({
  position,
  radius,
  length,
  seed,
}: {
  position: [number, number, number];
  radius: number;
  length: number;
  seed: number;
}) {
  const barkColors = ["#3e2723", "#4e342e", "#4a2c11", "#382010", "#543825"];
  const barkColor = barkColors[seed % barkColors.length];

  return (
    <group position={position}>
      {/* Main Bark Cylinder (Rotated along Z length of truck) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.96, length, 16]} />
        <meshStandardMaterial
          color={barkColor}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>

      {/* Rear Cut Wood End Cap (facing rear chase camera) */}
      <group position={[0, 0, -length / 2 - 0.005]} rotation={[Math.PI, 0, 0]}>
        <mesh>
          <circleGeometry args={[radius * 0.95, 16]} />
          <meshStandardMaterial color="#d4a373" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <ringGeometry args={[radius * 0.35, radius * 0.48, 16]} />
          <meshBasicMaterial color="#a16207" />
        </mesh>
        <mesh position={[0, 0, 0.003]}>
          <circleGeometry args={[radius * 0.18, 12]} />
          <meshBasicMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[radius * 0.88, radius * 0.96, 16]} />
          <meshBasicMaterial color="#291609" />
        </mesh>
      </group>

      {/* Front Cut Wood End Cap (facing cab) */}
      <group position={[0, 0, length / 2 + 0.005]}>
        <mesh>
          <circleGeometry args={[radius * 0.98, 16]} />
          <meshStandardMaterial color="#d4a373" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <ringGeometry args={[radius * 0.38, radius * 0.50, 16]} />
          <meshBasicMaterial color="#a16207" />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[radius * 0.90, radius * 0.98, 16]} />
          <meshBasicMaterial color="#291609" />
        </mesh>
      </group>
    </group>
  );
}

const LOG_DATA = [
  // Layer 1 (bottom 4 logs, on the deck)
  { id: 0, x0: -0.75, y0: 0.42, z0: 0.0, vx: -2.2, vy: 0.8, vz: -5.5, rotX: 2.5, rotY: 1.2, rollZ: 6.0, length: 3.75, radius: 0.23 },
  { id: 1, x0: -0.25, y0: 0.42, z0: 0.0, vx: -0.8, vy: 0.5, vz: -6.5, rotX: 1.8, rotY: -0.8, rollZ: 4.5, length: 3.75, radius: 0.23 },
  { id: 2, x0:  0.25, y0: 0.42, z0: 0.0, vx:  0.8, vy: 0.6, vz: -6.2, rotX: 1.9, rotY: 0.6, rollZ: -5.0, length: 3.75, radius: 0.23 },
  { id: 3, x0:  0.75, y0: 0.42, z0: 0.0, vx:  2.4, vy: 0.9, vz: -5.2, rotX: 2.8, rotY: -1.5, rollZ: -6.5, length: 3.75, radius: 0.23 },
  // Layer 2 (middle 3 logs)
  { id: 4, x0: -0.50, y0: 0.82, z0: 0.0, vx: -2.8, vy: 1.6, vz: -7.2, rotX: 3.5, rotY: 2.0, rollZ: 7.5, length: 3.72, radius: 0.23 },
  { id: 5, x0:  0.00, y0: 0.82, z0: 0.0, vx:  0.2, vy: 1.4, vz: -7.8, rotX: 2.8, rotY: 0.4, rollZ: 5.5, length: 3.72, radius: 0.23 },
  { id: 6, x0:  0.50, y0: 0.82, z0: 0.0, vx:  2.7, vy: 1.7, vz: -7.0, rotX: 3.2, rotY: -1.8, rollZ: -7.0, length: 3.72, radius: 0.23 },
  // Layer 3 (upper 2 logs)
  { id: 7, x0: -0.25, y0: 1.22, z0: 0.0, vx: -1.8, vy: 2.3, vz: -8.6, rotX: 4.2, rotY: 2.6, rollZ: 8.5, length: 3.70, radius: 0.22 },
  { id: 8, x0:  0.25, y0: 1.22, z0: 0.0, vx:  1.9, vy: 2.5, vz: -8.9, rotX: 4.6, rotY: -2.4, rollZ: -9.0, length: 3.70, radius: 0.22 },
  // Layer 4 (top crown king log)
  { id: 9, x0:  0.00, y0: 1.60, z0: 0.0, vx:  0.5, vy: 3.0, vz: -10.2, rotX: 5.5, rotY: 1.5, rollZ: 11.0, length: 3.68, radius: 0.22 },
];

function calcDroppedLog(
  log: (typeof LOG_DATA)[0],
  dir: "none" | "left" | "right" | "rear",
  t: number,
  shiftX: number,
  shiftZ: number
) {
  const tDrop = Math.min(3.5, t);
  const floorY = -0.45; // Road level relative to flatbed deck

  let vx = 0;
  let vy = 1.2; // initial upward hop as log clears stake
  let vz = -4.5; // falls behind following forward momentum

  if (dir === "right") {
    // Truck turned left -> momentum flings logs to the RIGHT
    vx = 2.6 + Math.abs(log.x0) * 1.4;
  } else if (dir === "left") {
    // Truck turned right -> momentum flings logs to the LEFT
    vx = -2.6 - Math.abs(log.x0) * 1.4;
  } else {
    // Rear spill (steep uphill acceleration)
    vx = log.x0 * 0.4;
    vz = -6.5;
  }

  const x = log.x0 + shiftX + vx * tDrop;
  const z = log.z0 + shiftZ + vz * tDrop - 0.5 * 1.6 * tDrop * tDrop;

  // Parabolic drop with floor contact and damped asphalt bounce
  const yFree = log.y0 + vy * tDrop - 0.5 * 9.8 * tDrop * tDrop;
  let y = yFree;
  if (yFree <= floorY) {
    const tImpact =
      (vy +
        Math.sqrt(Math.max(0, vy * vy + 2 * 9.8 * (log.y0 - floorY)))) /
      9.8;
    const dt = Math.max(0, tDrop - tImpact);
    const bounce = Math.max(
      0,
      0.38 * Math.exp(-4.2 * dt) * Math.abs(Math.cos(8.0 * dt))
    );
    y = floorY + bounce;
  }

  // Tumbling rotations: rolls along Z and pitches
  const rollMult = dir === "right" ? 1.0 : dir === "left" ? -1.0 : 0.4;
  const rotX = tDrop * 1.8;
  const rotY = tDrop * 1.2 * rollMult;
  const rotZ = tDrop * 7.5 * rollMult;

  return { x, y, z, rotX, rotY, rotZ };
}
function HeavyMountainTruck({
  spline,
  totalLength,
}: {
  spline: THREE.CatmullRomCurve3;
  totalLength: number;
}) {
  const truckRef = useRef<THREE.Group>(null);
  const cabinRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const smokeParticlesRef = useRef<THREE.Group>(null);
  const logRefs = useRef<(THREE.Group | null)[]>([]);
  const dropTime = useRef(0);

  const distance = useMountainTruckStore((s) => s.distance);
  const velocity = useMountainTruckStore((s) => s.velocity);
  const throttle = useMountainTruckStore((s) => s.throttle);
  const brake = useMountainTruckStore((s) => s.brake);
  const status = useMountainTruckStore((s) => s.status);
  const lateralOffset = useMountainTruckStore((s) => s.lateralOffset);
  const lateralG = useMountainTruckStore((s) => s.lateralG);
  const isRollingBack = useMountainTruckStore((s) => s.isRollingBack);
  const isSliding = useMountainTruckStore((s) => s.isSliding);
  const isTireSpinning = useMountainTruckStore((s) => s.isTireSpinning);
  const cargoShiftZ = useMountainTruckStore((s) => s.cargoShiftZ);
  const cargoShiftX = useMountainTruckStore((s) => s.cargoShiftX);
  const isCargoLost = useMountainTruckStore((s) => s.isCargoLost);
  const cargoFallProgress = useMountainTruckStore((s) => s.cargoFallProgress);
  const cargoDropDirection = useMountainTruckStore((s) => s.cargoDropDirection);

  const wheelRot = useRef(0);

  useFrame((_, delta) => {
    if (!truckRef.current) return;

    const totalSplineLen = spline.getLength();
    const u = Math.max(0, Math.min(1, (distance + ROAD_PAD_LENGTH) / totalSplineLen));
    const { pt, tangent, roadRight, roadUp } = getBankedRoadBasis(spline, u);

    // Wheel radius = 0.50m. Origin at roadUp * 0.50m puts tires exactly on asphalt surface!
    const truckPos = pt.clone()
      .addScaledVector(roadRight, lateralOffset)
      .addScaledVector(roadUp, 0.50);

    truckRef.current.position.copy(truckPos);

    // Matrix basis: X = roadRight, Y = roadUp, Z = tangent (forward)
    const mat = new THREE.Matrix4().makeBasis(roadRight, roadUp, tangent);
    truckRef.current.rotation.setFromRotationMatrix(mat);

    // Dynamic Suspension Pitch & Roll
    const suspensionPitch = throttle * 0.04 - brake * 0.06;
    const bodyRoll = lateralG * 0.12;

    if (cabinRef.current) {
      cabinRef.current.rotation.x = THREE.MathUtils.lerp(
        cabinRef.current.rotation.x,
        suspensionPitch,
        0.18
      );
      cabinRef.current.rotation.z = THREE.MathUtils.lerp(
        cabinRef.current.rotation.z,
        -bodyRoll,
        0.18
      );
    }

    // Wheel Rotation
    if (!isSliding || brake <= 0.4) {
      const spinMult = isTireSpinning ? 2.5 : 1.0;
      wheelRot.current += ((velocity * delta) / 0.50) * spinMult;
      wheelsRef.current.forEach((w) => {
        if (w) w.rotation.x = wheelRot.current;
      });
    }

    // DYNAMIC TIMBER LOG DROP ANIMATION (Following Momentum)
    const isDropping =
      isCargoLost ||
      status === "cargo_lost" ||
      status === "cliff_skid" ||
      status === "runaway_crash" ||
      status === "rollback_crash";

    // Which logs drop depending on spill direction:
    // If turning left -> spill right: logs 9 (crown), 8 (upper right), 6 (mid right) tumble off to the right!
    // If turning right -> spill left: logs 9 (crown), 7 (upper left), 4 (mid left) tumble off to the left!
    // If rear: logs 9 (crown), 8, 7 tumble off the rear!
    const droppedLogIds =
      cargoDropDirection === "right"
        ? [9, 8, 6]
        : cargoDropDirection === "left"
        ? [9, 7, 4]
        : [9, 8, 7];

    if (isDropping) {
      dropTime.current = Math.min(3.5, dropTime.current + delta);
      LOG_DATA.forEach((log, idx) => {
        const el = logRefs.current[idx];
        if (el) {
          if (droppedLogIds.includes(log.id)) {
            // These top logs tumble off following momentum!
            const res = calcDroppedLog(
              log,
              cargoDropDirection,
              dropTime.current,
              cargoShiftX,
              cargoShiftZ
            );
            el.position.set(res.x, res.y, res.z);
            el.rotation.set(res.rotX, res.rotY, res.rotZ);
          } else {
            // Base logs stay secured in the bunks on the truck!
            el.position.set(log.x0 + cargoShiftX, log.y0, log.z0 + cargoShiftZ);
            el.rotation.set(0, 0, 0);
          }
        }
      });
    } else {
      dropTime.current = 0;
      LOG_DATA.forEach((log, idx) => {
        const el = logRefs.current[idx];
        if (el) {
          el.position.set(log.x0 + cargoShiftX, log.y0, log.z0 + cargoShiftZ);
          el.rotation.set(0, 0, 0);
        }
      });
    }

    // Crash Visual Transformations
    if (status === "cliff_skid") {
      truckRef.current.position.addScaledVector(roadRight, 3.8);
      truckRef.current.position.y -= 4.5;
      truckRef.current.rotateZ(0.55);
      truckRef.current.rotateX(0.25);
    } else if (status === "rollback_crash") {
      truckRef.current.position.y -= 3.5;
      truckRef.current.rotateX(-0.65);
      truckRef.current.rotateZ(-0.3);
    }
  });

  return (
    <group ref={truckRef}>
      <group ref={cabinRef}>
        {/* Heavy Truck Chassis Frame (Steel Rails) */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[2.2, 0.38, 6.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Heavy Duty Front Push Bumper / Bull Bar */}
        <mesh position={[0, 0.35, 3.3]} castShadow>
          <boxGeometry args={[2.5, 0.55, 0.35]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* DRIVER CABIN (Front) */}
        <group position={[0, 1.45, 1.9]}>
          {/* Main Cab Body (Vibrant Metallic Industrial Orange) */}
          <mesh castShadow>
            <boxGeometry args={[2.4, 1.75, 2.4]} />
            <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.3} />
          </mesh>

          {/* Black Cab Roof Cap */}
          <mesh position={[0, 0.92, 0]}>
            <boxGeometry args={[2.42, 0.12, 2.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Roof Sun Visor */}
          <mesh position={[0, 0.88, 1.25]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[2.4, 0.22, 0.35]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Roof Amber Clearance Lights (5 LEDs) */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, 0.95, 1.15]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          ))}

          {/* Wrap-Around Front Windshield */}
          <mesh position={[0, 0.35, 1.15]}>
            <boxGeometry args={[2.2, 0.85, 0.15]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Side Windows */}
          <mesh position={[1.21, 0.35, 0]}>
            <boxGeometry args={[0.05, 0.75, 1.2]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-1.21, 0.35, 0]}>
            <boxGeometry args={[0.05, 0.75, 1.2]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Chrome Radiator Grille */}
          <mesh position={[0, -0.4, 1.22]}>
            <boxGeometry args={[1.8, 0.75, 0.1]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Headlights */}
          <mesh position={[0.85, -0.38, 1.26]}>
            <boxGeometry args={[0.35, 0.25, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.85, -0.38, 1.26]}>
            <boxGeometry args={[0.35, 0.25, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Forward Projected Headlight Cones on Road */}
          <spotLight
            position={[0, 0, 1.5]}
            target-position={[0, -1.5, 30]}
            angle={0.65}
            penumbra={0.4}
            intensity={2.8}
            color="#ffffff"
            distance={50}
          />

          {/* Chrome Mirrors */}
          <mesh position={[1.35, 0.35, 0.8]}>
            <boxGeometry args={[0.15, 0.45, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          <mesh position={[-1.35, 0.35, 0.8]}>
            <boxGeometry args={[0.15, 0.45, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>

          {/* Dual Vertical Chrome Exhaust Stacks */}
          <mesh position={[1.05, 0.95, -1.25]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.9, 12]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[-1.05, 0.95, -1.25]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.9, 12]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* TIMBER LOG CARGO SYSTEM (Heavy Tree Trunks & Steel Logging Stanchions) */}
        <group position={[0, 0.95, -1.2]}>
          {/* Flatbed Heavy Steel Deck */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.25, 4.0]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Front Heavy Steel Headache Rack / Bulkhead Cab Protector */}
          <group position={[0, 1.05, 1.95]}>
            <mesh castShadow>
              <boxGeometry args={[2.35, 1.85, 0.12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <boxGeometry args={[2.1, 1.6, 0.02]} />
              <meshStandardMaterial color="#475569" wireframe />
            </mesh>
          </group>

          {/* 8 Heavy-Duty Vertical Logging Stanchions / Upright Stakes (4 Left, 4 Right) */}
          {[-1.16, 1.16].map((xSide) =>
            [1.3, 0.4, -0.5, -1.4].map((zPos, sIdx) => (
              <group key={`${xSide}-${sIdx}`} position={[xSide, 0.9, zPos]}>
                {/* Steel Stanchion Post (Safety Hazard Orange / Weathered Industrial Steel) */}
                <mesh castShadow>
                  <boxGeometry args={[0.12, 1.75, 0.12]} />
                  <meshStandardMaterial color="#ea580c" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Reinforced Base Gusset Bracket */}
                <mesh
                  position={[xSide > 0 ? -0.06 : 0.06, -0.75, 0]}
                  rotation={[0, 0, xSide > 0 ? -0.35 : 0.35]}
                >
                  <boxGeometry args={[0.08, 0.35, 0.22]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.8} />
                </mesh>
              </group>
            ))
          )}

          {/* Transverse Cross Bunks (Steel beams across the deck) */}
          {[1.3, 0.4, -0.5, -1.4].map((zPos, bIdx) => (
            <mesh key={bIdx} position={[0, 0.18, zPos]} castShadow>
              <boxGeometry args={[2.4, 0.14, 0.22]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* DYNAMIC TIMBER LOG BUNDLE (Animates & Drops when speed is too high or crash occurs) */}
          <group>
            {/* 10 Stacked Timber Tree Logs with Individual Drop Physics Refs */}
            {LOG_DATA.map((log, idx) => (
              <group
                key={log.id}
                ref={(el) => {
                  logRefs.current[idx] = el;
                }}
                position={[log.x0 + cargoShiftX, log.y0, log.z0 + cargoShiftZ]}
              >
                <TimberLog
                  position={[0, 0, 0]}
                  radius={log.radius}
                  length={log.length}
                  seed={idx}
                />
              </group>
            ))}

            {/* Tie-Down Straps (Visible and tensioned only while cargo is secured) */}
            {!(isCargoLost || status === "cargo_lost" || status === "cliff_skid" || status === "runaway_crash" || status === "rollback_crash") &&
              [-1.2, 0.0, 1.1].map((zStrap, idx) => (
                <group key={idx} position={[cargoShiftX, 0.9, zStrap + cargoShiftZ]}>
                  <mesh position={[0, 0.88, 0]}>
                    <boxGeometry args={[1.8, 0.08, 0.1]} />
                    <meshStandardMaterial color="#facc15" roughness={0.6} />
                  </mesh>
                  <mesh position={[-0.9, 0.45, 0]} rotation={[0, 0, -0.75]}>
                    <boxGeometry args={[0.06, 1.1, 0.1]} />
                    <meshStandardMaterial color="#facc15" roughness={0.6} />
                  </mesh>
                  <mesh position={[0.9, 0.45, 0]} rotation={[0, 0, 0.75]}>
                    <boxGeometry args={[0.06, 1.1, 0.1]} />
                    <meshStandardMaterial color="#facc15" roughness={0.6} />
                  </mesh>
                  <mesh position={[0.92, 0.15, 0]}>
                    <boxGeometry args={[0.14, 0.18, 0.14]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} />
                  </mesh>
                </group>
              ))}
          </group>

          {/* Rear Bed Mud Flaps */}
          <mesh position={[1.05, -0.3, -2.05]}>
            <boxGeometry args={[0.38, 0.55, 0.05]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          <mesh position={[-1.05, -0.3, -2.05]}>
            <boxGeometry args={[0.38, 0.55, 0.05]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        </group>

        {/* REAR TAIL LIGHTS & BRAKE LIGHTS */}
        <mesh position={[1.0, 0.45, -3.22]}>
          <boxGeometry args={[0.32, 0.22, 0.08]} />
          <meshBasicMaterial color={brake > 0.05 ? "#ef4444" : "#b91c1c"} />
        </mesh>
        <mesh position={[-1.0, 0.45, -3.22]}>
          <boxGeometry args={[0.32, 0.22, 0.08]} />
          <meshBasicMaterial color={brake > 0.05 ? "#ef4444" : "#b91c1c"} />
        </mesh>

        {/* Reverse Light (White when rolling backward!) */}
        <mesh position={[0, 0.45, -3.22]}>
          <boxGeometry args={[0.28, 0.16, 0.08]} />
          <meshBasicMaterial color={isRollingBack ? "#ffffff" : "#334155"} />
        </mesh>
      </group>

      {/* 6 HEAVY-DUTY MULTI-AXLE OFF-ROAD WHEELS */}
      {[
        [-1.22, 0, 2.1],   // Front Left
        [1.22, 0, 2.1],    // Front Right
        [-1.22, 0, -0.9],  // Mid Left
        [1.22, 0, -0.9],   // Mid Right
        [-1.22, 0, -2.3],  // Rear Left
        [1.22, 0, -2.3],   // Rear Right
      ].map((pos, idx) => (
        <group
          key={idx}
          position={pos as [number, number, number]}
          ref={(el) => {
            if (el) wheelsRef.current[idx] = el;
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.50, 0.50, 0.42, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.505, 0.505, 0.38, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.95} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.44, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.46, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Tire Smoke / Dust Clouds when Skidding or Spinning */}
      {(isSliding || isTireSpinning || (isRollingBack && Math.abs(velocity) > 2.0)) && (
        <group position={[0, -0.2, -1.6]} ref={smokeParticlesRef}>
          {[-0.9, 0.9].map((x, i) => (
            <mesh key={i} position={[x, 0.2, -0.5]}>
              <sphereGeometry args={[0.45, 8, 8]} />
              <meshStandardMaterial
                color="#e2e8f0"
                transparent
                opacity={0.65}
                roughness={1.0}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// Cinematic Dynamic Chase Camera with Perfect Road Vista Framing
function ChaseCamera({
  spline,
  totalLength,
}: {
  spline: THREE.CatmullRomCurve3;
  totalLength: number;
}) {
  const distance = useMountainTruckStore((s) => s.distance);
  const status = useMountainTruckStore((s) => s.status);
  const lateralOffset = useMountainTruckStore((s) => s.lateralOffset);
  const isRollingBack = useMountainTruckStore((s) => s.isRollingBack);

  useFrame((state) => {
    const totalSplineLen = spline.getLength();
    const u = Math.max(0, Math.min(1, (distance + ROAD_PAD_LENGTH) / totalSplineLen));
    const { pt, tangent, roadRight, roadUp } = getBankedRoadBasis(spline, u);

    // Lookahead target point: 13m ahead, elevated so truck is centered in lower-mid viewport!
    const targetPt = pt.clone()
      .addScaledVector(roadRight, lateralOffset * 0.4)
      .addScaledVector(tangent, 13.0)
      .addScaledVector(roadUp, 2.2);

    // Camera position: 12.0m behind truck, 5.4m above road for clear view of black tarmac & white stripes
    const camBackDist = isRollingBack ? -13.5 : -12.0;
    const camHeight = isRollingBack ? 6.2 : 5.4;

    const camPos = pt.clone()
      .addScaledVector(roadRight, lateralOffset * 0.5)
      .addScaledVector(tangent, camBackDist)
      .addScaledVector(roadUp, camHeight);

    if (
      status === "driving" ||
      status === "idle" ||
      status === "rollback_crash" ||
      status === "cliff_skid" ||
      status === "runaway_crash" ||
      status === "cargo_lost" ||
      status === "won"
    ) {
      state.camera.position.lerp(camPos, 0.14);
      state.camera.lookAt(targetPt);
    }
  });

  return null;
}

export function MountainTruckScene({ config }: { config?: any }) {
  const currentRound = useMountainTruckStore((s) => s.currentRound);
  const stage = MOUNTAIN_STAGES[currentRound - 1];
  const spline = useMemo(() => buildMountainSpline(stage), [stage]);

  return (
    <div className="w-full h-full relative select-none overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-slate-200">
      <Canvas
        shadows
        camera={{ position: [0, 6.5, -13], fov: 48, near: 0.5, far: 2000 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.95} />
        {/* Rear Chase Light illuminating truck tailgate, cargo, and cab */}
        <directionalLight position={[0, 22, -35]} intensity={1.1} />
        {/* Main Sun Light casting crisp alpine shadows */}
        <directionalLight
          position={[90, 140, 70]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={450}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={80}
          shadow-camera-bottom={-80}
          shadow-bias={-0.00015}
        />
        <hemisphereLight args={["#e0f2fe", "#475569", 0.75]} />

        {/* Procedural Alpine Mountain Range & Canyon Abyss */}
        <AlpineMountainEnvironment />

        {/* Procedural Mountain Ridge Road with Curbs, Lines, & Guardrails */}
        <MountainRoadMesh spline={spline} />

        {/* Heavy Loaded Multi-Axle Mountain Cargo Truck */}
        <HeavyMountainTruck spline={spline} totalLength={stage.totalLength} />

        {/* Physics Simulation Ticker & Dynamic Chase Camera */}
        <SimulationTicker />
        <ChaseCamera spline={spline} totalLength={stage.totalLength} />
      </Canvas>
    </div>
  );
}
