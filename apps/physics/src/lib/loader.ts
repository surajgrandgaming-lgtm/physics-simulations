import { cache } from "react";
import physicsData from "@/data/physics.json";
import { ChallengeConfigSchema, type ChallengeConfig } from "@topcoaching/sim-core/schemas/challenge.schema";

export function findTopic(subject: string, moduleSlug: string, topicSlug: string) {
  if (subject !== "physics") return null;

  const normalizedModule = moduleSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const mod = physicsData.modules.find(
    (m) => {
      const modSlug = m.moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return (
        modSlug === normalizedModule ||
        m.moduleId.toLowerCase() === normalizedModule ||
        (normalizedModule.includes("dynamics") && m.moduleId === "M2") ||
        (normalizedModule.includes("kinematics") && m.moduleId === "M1")
      );
    }
  );

  if (!mod) return null;

  const canonicalTopic = topicSlug === "uniform-motion" ? "1d-motion-deceleration" : topicSlug;

  const topic = mod.topics.find((t) => {
    const slug = t.topicName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (slug === canonicalTopic) return true;
    if (canonicalTopic === "1d-motion-deceleration" && slug.includes("1d-motion")) return true;
    if (canonicalTopic === "relative-motion" && slug.includes("relative-motion")) return true;
    if (canonicalTopic === "vectors-river-rain" && (slug.includes("vectors") || slug.includes("rain"))) return true;
    if ((canonicalTopic === "2d-projectiles" || canonicalTopic === "projectiles") && (slug.includes("projectile") || slug.includes("2d-projectile"))) return true;
    if ((canonicalTopic === "inclined-projectiles" || canonicalTopic === "inclined") && (slug.includes("inclined") || t.topicId === "5")) return true;
    if ((canonicalTopic === "inertia-nlm-1" || canonicalTopic === "inertia" || canonicalTopic === "asteroid-deflection") && (slug.includes("inertia") || t.topicId === "6")) return true;
    if ((canonicalTopic === "atwood-machines-nlm-2" || canonicalTopic === "atwood-machines" || canonicalTopic.includes("atwood")) && (slug.includes("atwood") || t.topicId === "8")) return true;
    if ((canonicalTopic === "friction-and-banking" || canonicalTopic === "friction-banking" || canonicalTopic.includes("banking") || canonicalTopic.includes("friction")) && (slug.includes("friction") || slug.includes("banking") || t.topicId === "9")) return true;
    if ((canonicalTopic === "work-energy-theorem" || canonicalTopic === "work-energy" || canonicalTopic.includes("energy")) && (slug.includes("energy") || slug.includes("work") || t.topicId === "10")) return true;
    if ((canonicalTopic === "center-of-mass-shift" || canonicalTopic === "center-of-mass" || canonicalTopic.includes("center-of-mass") || canonicalTopic.includes("seesaw")) && (slug.includes("center-of-mass") || slug.includes("mass") || t.topicId === "11")) return true;
    if ((canonicalTopic === "1d-2d-collisions" || canonicalTopic === "collisions" || canonicalTopic.includes("collision") || canonicalTopic.includes("rail")) && (slug.includes("collision") || t.topicId === "12")) return true;
    if ((canonicalTopic === "rotational-equilibrium" || canonicalTopic === "equilibrium" || canonicalTopic.includes("crane") || canonicalTopic.includes("rotational")) && (slug.includes("equilibrium") || slug.includes("rotational") || t.topicId === "13")) return true;
    return false;
  });

  return { mod, foundTopic: topic };
}

export const getChallenge = cache(
  async (
    subject: string,
    module: string,
    topic: string,
    difficulty: "easy" | "medium" | "advanced"
  ): Promise<ChallengeConfig> => {
    if (subject !== "physics") {
      throw new Error(`Subject "${subject}" is not supported.`);
    }

    const canonicalTopic = topic === "uniform-motion" ? "1d-motion-deceleration" : topic;
    const result = findTopic(subject, module, canonicalTopic);
    const foundTopic = result?.foundTopic;

    if (!foundTopic && canonicalTopic !== "tablecloth-pull") {
      throw new Error(`Topic "${topic}" not found in module "${module}".`);
    }

    const challengeData = (foundTopic as any)?.challenges?.[difficulty];
    const is1DMotion = canonicalTopic === "1d-motion-deceleration" || canonicalTopic === "uniform-motion" || foundTopic?.topicId === "1";
    const isRelativeMotion = canonicalTopic === "relative-motion" || foundTopic?.topicId === "2";
    const isVectors = canonicalTopic === "vectors-river-rain" || foundTopic?.topicId === "3";
    const isProjectiles = canonicalTopic === "2d-projectiles" || canonicalTopic === "projectiles" || foundTopic?.topicId === "4";
    const isInclinedProjectiles = canonicalTopic === "inclined-projectiles" || canonicalTopic === "inclined" || foundTopic?.topicId === "5";
    const isInertia = canonicalTopic === "inertia-nlm-1" || canonicalTopic === "inertia" || canonicalTopic === "asteroid-deflection" || foundTopic?.topicId === "6";
    const isAtwood = canonicalTopic === "atwood-machines-nlm-2" || canonicalTopic === "atwood-machines" || canonicalTopic.includes("atwood") || foundTopic?.topicId === "8";
    const isFrictionBanking = canonicalTopic === "friction-and-banking" || canonicalTopic === "friction-banking" || canonicalTopic.includes("banking") || foundTopic?.topicId === "9";
    const isStaticBreakaway = canonicalTopic === "static-breakaway-nlm-1" || canonicalTopic === "static-breakaway" || canonicalTopic === "tablecloth-pull" || foundTopic?.topicId === "7";
    const isWorkEnergy = canonicalTopic === "work-energy-theorem" || canonicalTopic === "work-energy" || canonicalTopic.includes("energy") || canonicalTopic.includes("bungee") || foundTopic?.topicId === "10";
    const isCenterOfMass = canonicalTopic === "center-of-mass-shift" || canonicalTopic === "center-of-mass" || canonicalTopic.includes("center-of-mass") || canonicalTopic.includes("seesaw") || foundTopic?.topicId === "11";
    const isCollisions = canonicalTopic === "1d-2d-collisions" || canonicalTopic === "collisions" || canonicalTopic.includes("collision") || canonicalTopic.includes("rail") || foundTopic?.topicId === "12";
    const isRotationalEquilibrium = canonicalTopic === "rotational-equilibrium" || canonicalTopic.includes("equilibrium") || canonicalTopic.includes("rotational") || foundTopic?.topicId === "13";

    let sceneType = "physics-simulation";
    let parameters: Record<string, any> = { difficulty };

    if (is1DMotion) {
      if (difficulty === "easy") {
        sceneType = "emergency-stop";
        parameters = { initialSpeed: 15, safeDistance: 40, roadType: "dry", rounds: 3 };
      } else if (difficulty === "medium") {
        sceneType = "last-hundred-meters";
        parameters = { initialSpeed: 0, targetTakeoffSpeed: 36, deckLength: 250, minAcceleration: 2.6, maxSafeAcceleration: 5.5, rounds: 3 };
      } else if (difficulty === "advanced") {
        sceneType = "decelerating-bullet";
        parameters = { initialVelocity: 400, block1Thickness: 8, block2Thickness: 6, rounds: 3 };
      }
    } else if (isRelativeMotion) {
      if (difficulty === "easy") {
        sceneType = "ghost-driver";
        parameters = { tankerSpeed: 200, initialDistance: 50, requiredHoldTime: 5.0, rounds: 3 };
      } else if (difficulty === "medium") {
        sceneType = "the-last-gap";
        parameters = { riverWidth: 300, riverSpeed: 3, boatSpeed: 5, targetY: 0, rounds: 3 };
      } else if (difficulty === "advanced") {
        sceneType = "air-drop-interception";
        parameters = { altitude: 125, heliVelocityX: 40, heliVelocityY: 0, boatMotorVelocityX: 15, boatMotorVelocityY: 0, riverVelocityX: 5, riverVelocityY: 0, crosswindVelocityX: 0, crosswindVelocityY: -3, gravity: 9.8 };
      }
    } else if (isVectors) {
      if (difficulty === "medium") {
        sceneType = "umbrella-tilt";
        parameters = { rainSpeedY: 10, windSpeedX: 0, trackDistance: 40, rounds: 3 };
      } else if (difficulty === "easy") {
        sceneType = "umbrella-tilt";
        parameters = { rainSpeedY: 10, windSpeedX: 0, trackDistance: 35, rounds: 3 };
      } else {
        sceneType = "umbrella-tilt";
        parameters = { rainSpeedY: 14, windSpeedX: 5, trackDistance: 60, rounds: 3 };
      }
    } else if (isInertia) {
      sceneType = "asteroid-deflection";
      parameters = {
        asteroidMass: 1200,
        initialSpeed: 30,
        maxDeltaV: 20,
        rounds: 3,
      };
    } else if (isInclinedProjectiles) {
      sceneType = "mountain-summit-siege";
      parameters = {
        summitElevation: 55,
        slopeAngleDeg: 18,
        targetDistance: 195,
        gravity: 9.8,
        rounds: 3,
      };
    } else if (isProjectiles) {
      sceneType = "castle-siege";
      parameters = {
        mountainDistance: 100,
        mountainPeakHeight: 36,
        targetDistance: 190,
        gravity: 9.8,
        rounds: 3,
      };
    } else if (isFrictionBanking) {
      sceneType = "mountain-truck";
      parameters = {
        truckMass: 4000,
        gravity: 9.8,
        rounds: 3,
      };
    } else if (isAtwood) {
      sceneType = "atwood-elevator";
      parameters = {
        cabinMass: 500,
        targetAccel: 2.0,
        gravity: 9.8,
        shaftHeight: 20,
        rounds: 3,
      };
    } else if (isStaticBreakaway) {
      sceneType = "static-breakaway";
      parameters = {
        pullAcceleration: 6.5,
        mass: 1.2,
        muStatic: 0.42,
        muKinetic: 0.28,
        clothLength: 1.4,
        tableEdgeX: 3.5,
      };
    } else if (isCollisions) {
      sceneType = "quantum-rail";
      parameters = {
        rounds: 3,
        trackLength: 40.0,
      };
    } else if (isRotationalEquilibrium) {
      sceneType = "crane-boom";
      parameters = {
        rounds: 3,
        boomLength: 8.0,
      };
    } else if (isCenterOfMass) {
      sceneType = "cyber-seesaw";
      parameters = {
        rounds: 3,
        beamLength: 16.0,
      };
    } else if (isWorkEnergy) {
      sceneType = "bungee-drop";
      parameters = {
        mass: 80,
        height: 60.0,
        cordLength: 25.0,
        rounds: 3,
      };
    }

    const title =
      challengeData?.title ||
      (isCollisions
        ? "Quantum Rail: Collision & Impulse Dynamics"
        : isRotationalEquilibrium
        ? "Crane Boom: Rotational Equilibrium"
        : isCenterOfMass
        ? "Cyber-Seesaw: System Equilibrium"
        : isWorkEnergy
        ? "Canyon Bungee Jump"
        : isFrictionBanking
        ? "Cliffside Hauler: Mountain Ridge"
        : isAtwood
        ? "Futuristic Elevator Descent"
        : isInertia
        ? "Asteroid Deflection"
        : isInclinedProjectiles
        ? "Mountain Summit Siege"
        : isProjectiles
        ? "Castle Siege"
        : isStaticBreakaway
        ? "The Grand Banquet Tablecloth Snatch"
        : difficulty === "easy"
        ? "Operation Falcon Refuel (Mid-Air Rendezvous)"
        : difficulty === "medium"
        ? "Precision Landing (Boss Fight)"
        : "The Air-Drop Interception");

    const description = challengeData?.description || `Interact with 3D parameters to solve the ${difficulty} challenge.`;

    return ChallengeConfigSchema.parse({
      topicId: canonicalTopic,
      difficulty,
      title,
      description,
      sceneType,
      ageTarget: "Class 9-12 / JEE",
      parameters,
      hudWidgets: ["speed-gauge", "live-vt-graph", "status-badge"],
      formulaReferences: ((foundTopic as any)?.keyFormulas || []).map((kf: any) => ({
        label: kf.label,
        latex: kf.formula,
      })),
      objectives: [description],
      successCriteria: { completed: true },
      hints: ["Adjust sliders and observe the real-time velocity and deceleration."],
    });
  }
);

export const getChallengeConfig = getChallenge;

// ---------------------------------------------------------------------------
// Hierarchical Navigation Helpers
// ---------------------------------------------------------------------------

export interface ModuleItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  topicsCount: number;
  interactiveSimsCount: number;
}

export function getModulesList(): ModuleItem[] {
  return physicsData.modules.map((m) => {
    const slug = m.moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const isKinematics = slug === "kinematics";
    return {
      id: m.moduleId,
      name: m.moduleName,
      slug,
      description: isKinematics
        ? "Explore 1D motion, braking kinematics, relative reference frames, and inertia with real-time 3D simulation engines."
        : `Comprehensive simulations and interactive challenges for ${m.moduleName}.`,
      topicsCount: m.topics.length,
      interactiveSimsCount: isKinematics ? 7 : 0,
    };
  });
}

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
  concept: string;
  has3DSimulation: boolean;
  challengesCount: number;
  keyFormulas: Array<{ formula: string; label: string }>;
}

export function getModuleData(subject: string, moduleSlug: string) {
  if (subject !== "physics") return null;
  const normalizedModule = moduleSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const mod = physicsData.modules.find(
    (m) =>
      m.moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedModule ||
      m.moduleId.toLowerCase() === normalizedModule
  );
  if (!mod) return null;

  const topics: TopicItem[] = mod.topics.map((t) => {
    const rawSlug = t.topicName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let slug = rawSlug;
    if (rawSlug.includes("1d-motion") || t.topicId === "1") slug = "1d-motion-deceleration";
    else if (rawSlug.includes("relative-motion") || t.topicId === "2") slug = "relative-motion";
    else if (rawSlug.includes("vectors") || t.topicId === "3") slug = "vectors-river-rain";
    else if (rawSlug.includes("projectile") || t.topicId === "4") slug = "2d-projectiles";
    else if (rawSlug.includes("inclined") || t.topicId === "5") slug = "inclined-projectiles";
    else if (rawSlug.includes("inertia") || t.topicId === "6") slug = "inertia-nlm-1";
    else if (rawSlug.includes("atwood") || t.topicId === "8") slug = "atwood-machines-nlm-2";
    else if (rawSlug.includes("friction") || rawSlug.includes("banking") || t.topicId === "9") slug = "friction-and-banking";
    else if (rawSlug.includes("static-breakaway") || rawSlug.includes("breakaway") || t.topicId === "7") slug = "static-breakaway-nlm-1";
    else if (rawSlug.includes("tablecloth-pull")) slug = "tablecloth-pull";
    else if (rawSlug.includes("work-energy") || rawSlug.includes("energy") || t.topicId === "10") slug = "work-energy-theorem";
    else if (rawSlug.includes("center-of-mass") || rawSlug.includes("mass") || t.topicId === "11") slug = "center-of-mass-shift";
    else if (rawSlug.includes("collision") || t.topicId === "12") slug = "1d-2d-collisions";

    const has3D =
      slug === "1d-motion-deceleration" ||
      slug === "relative-motion" ||
      slug === "vectors-river-rain" ||
      slug === "2d-projectiles" ||
      slug === "inclined-projectiles" ||
      slug === "inertia-nlm-1" ||
      slug === "atwood-machines-nlm-2" ||
      slug === "friction-and-banking" ||
      slug === "static-breakaway-nlm-1" ||
      slug === "static-breakaway" ||
      slug === "tablecloth-pull" || slug === "work-energy-theorem" || slug === "center-of-mass-shift" || slug === "center-of-mass" || slug === "1d-2d-collisions" || slug === "collisions";

    return {
      id: t.topicId,
      name: t.topicName,
      slug,
      concept: t.coreConcept || "Interactive physics concepts and numerical challenges.",
      has3DSimulation: has3D,
      challengesCount: Object.keys(t.challenges || {}).length || (has3D ? 3 : 0),
      keyFormulas: (t as any).keyFormulas || [],
    };
  });

  if (normalizedModule === "kinematics" && !topics.some((t) => t.slug === "tablecloth-pull")) {
    topics.push({
      id: "tp-1",
      name: "Inertia: Tablecloth Pull",
      slug: "tablecloth-pull",
      concept: "Newton's 1st Law, sudden acceleration & dynamic friction breakaway with Rapier rigidbodies.",
      has3DSimulation: true,
      challengesCount: 3,
      keyFormulas: [{ formula: "F_{static} \\le \\mu_s N", label: "Breakaway Threshold" }],
    });
  }

  return {
    id: mod.moduleId,
    name: mod.moduleName,
    slug: normalizedModule,
    topics,
  };
}

export interface DifficultyChallengeItem {
  difficulty: "easy" | "medium" | "advanced";
  title: string;
  description: string;
  sceneType: string;
  isAvailable: boolean;
}

export function getTopicData(subject: string, moduleSlug: string, topicSlug: string) {
  if (subject !== "physics") return null;
  const canonicalTopic = topicSlug === "uniform-motion" ? "1d-motion-deceleration" : topicSlug;
  const result = findTopic(subject, moduleSlug, canonicalTopic);
  const foundTopic = result?.foundTopic;
  const mod = result?.mod;

  if (!mod && canonicalTopic !== "tablecloth-pull") return null;

  const topicName =
    foundTopic?.topicName ||
    (canonicalTopic === "tablecloth-pull" ? "Inertia: Tablecloth Pull" : canonicalTopic);
  const concept =
    foundTopic?.coreConcept ||
    (canonicalTopic === "tablecloth-pull"
      ? "Newton's 1st Law, sudden acceleration & dynamic friction breakaway with Rapier rigidbodies."
      : "Interactive physics concepts and numerical challenges.");

  const keyFormulas = (foundTopic as any)?.keyFormulas || [];

  const difficulties: DifficultyChallengeItem[] = [
    {
      difficulty: "easy",
      title:
        canonicalTopic === "1d-motion-deceleration"
          ? "Emergency Stop & Road Grip"
          : canonicalTopic === "relative-motion"
          ? "Ghost Driver (Mid-Air Refuel)"
          : canonicalTopic === "tablecloth-pull"
          ? "Tablecloth Pull (Gentle Jerk)"
          : (foundTopic as any)?.challenges?.easy?.title || "Easy Challenge",
      description:
        canonicalTopic === "1d-motion-deceleration"
          ? "Stopping distance s = u² / (2µg) across Dry, Wet, and Icy surfaces before the 60m barrier."
          : canonicalTopic === "relative-motion"
          ? "Match velocity with the lead tanker aircraft (v_rel = 0 m/s) and lock onto the trailing drogue basket."
          : canonicalTopic === "tablecloth-pull"
          ? "Calculate minimum jerk speed so tablecloth slides out without overturning the dish stack."
          : (foundTopic as any)?.challenges?.easy?.description || "Basic introductory 3D challenge.",
      sceneType:
        canonicalTopic === "1d-motion-deceleration"
          ? "emergency-stop"
          : canonicalTopic === "relative-motion"
          ? "ghost-driver"
          : "tablecloth-pull",
      isAvailable: true,
    },
    {
      difficulty: "medium",
      title:
        canonicalTopic === "1d-motion-deceleration"
          ? "Carrier Catapult & Runway Kinematics"
          : canonicalTopic === "friction-and-banking" || canonicalTopic.includes("banking")
          ? "Cliffside Hauler: Mountain Ridge"
          : canonicalTopic === "atwood-machines-nlm-2" || canonicalTopic.includes("atwood")
          ? "Futuristic Elevator Descent"
          : canonicalTopic === "inertia-nlm-1" || canonicalTopic === "inertia"
          ? "Asteroid Deflection"
          : canonicalTopic === "inclined-projectiles"
          ? "Mountain Summit Siege"
          : canonicalTopic === "2d-projectiles"
          ? "Castle Siege"
          : canonicalTopic === "relative-motion"
          ? "The Last Gap (River Crossing)"
          : canonicalTopic === "tablecloth-pull"
          ? "Tablecloth Pull (Loaded Stack)"
          : (foundTopic as any)?.challenges?.medium?.title || "Medium Challenge",
      description:
        canonicalTopic === "1d-motion-deceleration"
          ? "Minimum acceleration a = v² / (2s) to launch a fighter jet from an aircraft carrier deck without stalling."
          : canonicalTopic === "inertia-nlm-1" || canonicalTopic === "inertia"
          ? "In deep space, an asteroid coasts with constant velocity. Use limited thruster impulse J = m*Δv to alter its straight-line trajectory, bypassing planetary collision hazard zones and reaching the safe warp gate."
          : canonicalTopic === "inclined-projectiles"
          ? "Downhill slope projectile kinematics from mountain summit. Optimize launch angle (45° - β/2) to obliterate the outpost."
          : canonicalTopic === "2d-projectiles"
          ? "High-arc rainbow lob over a mountain ridge to destroy the enemy target tower."
          : canonicalTopic === "relative-motion"
          ? "Compensate for river current by aiming upstream to land directly on the opposite slipway."
          : canonicalTopic === "tablecloth-pull"
          ? "Manage heavier ceramic stacks and reduced surface contact area."
          : (foundTopic as any)?.challenges?.medium?.description || "Intermediate challenge with multi-variable physics.",
      sceneType:
        canonicalTopic === "1d-motion-deceleration"
          ? "last-hundred-meters"
          : canonicalTopic === "friction-and-banking" || canonicalTopic.includes("banking")
          ? "mountain-truck"
          : canonicalTopic === "atwood-machines-nlm-2" || canonicalTopic.includes("atwood")
          ? "atwood-elevator"
          : canonicalTopic === "inertia-nlm-1" || canonicalTopic === "inertia"
          ? "asteroid-deflection"
          : canonicalTopic === "inclined-projectiles"
          ? "mountain-summit-siege"
          : canonicalTopic === "2d-projectiles"
          ? "castle-siege"
          : canonicalTopic === "vectors-river-rain"
          ? "umbrella-tilt"
          : canonicalTopic === "relative-motion"
          ? "the-last-gap"
          : "tablecloth-pull",
      isAvailable: true,
    },
    {
      difficulty: "advanced",
      title:
        canonicalTopic === "1d-motion-deceleration"
          ? "Hypervelocity Armor Penetration"
          : canonicalTopic === "relative-motion"
          ? "The Air-Drop Interception"
          : canonicalTopic === "tablecloth-pull"
          ? "Tablecloth Pull (Tower of Babel)"
          : (foundTopic as any)?.challenges?.advanced?.title || "Advanced Challenge",
      description:
        canonicalTopic === "1d-motion-deceleration"
          ? "Analyze non-linear drag deceleration F = -k·v² across layered ballistic media."
          : canonicalTopic === "relative-motion"
          ? "Rescue helicopter drops supply payload onto a moving river boat under crosswinds."
          : canonicalTopic === "tablecloth-pull"
          ? "Extreme multi-tier unstable dish tower with delicate tipping moments."
          : (foundTopic as any)?.challenges?.advanced?.description || "Challenging JEE Advanced-tier physics scenario.",
      sceneType:
        canonicalTopic === "1d-motion-deceleration"
          ? "decelerating-bullet"
          : canonicalTopic === "relative-motion"
          ? "air-drop-interception"
          : "tablecloth-pull",
      isAvailable: true,
    },
  ];

  return {
    moduleSlug,
    moduleName: mod?.moduleName || "Kinematics",
    topicSlug: canonicalTopic,
    topicName,
    concept,
    keyFormulas,
    difficulties,
  };
}
