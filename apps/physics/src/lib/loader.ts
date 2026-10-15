import { cache } from "react";
import physicsData from "@/data/physics.json";
import { ChallengeConfigSchema, type ChallengeConfig } from "@topcoaching/sim-core/schemas/challenge.schema";

export function findTopic(subject: string, moduleSlug: string, topicSlug: string) {
  if (subject !== "physics") return null;

  const normalizedModule = moduleSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const mod = physicsData.modules.find(
    (m) =>
      m.moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedModule ||
      m.moduleId.toLowerCase() === normalizedModule
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
    } else if (isProjectiles) {
      sceneType = "castle-siege";
      parameters = {
        mountainDistance: 100,
        mountainPeakHeight: 36,
        targetDistance: 190,
        gravity: 9.8,
        rounds: 3,
      };
    } else if (canonicalTopic === "tablecloth-pull") {
      sceneType = "tablecloth-pull";
      parameters = { pullSpeed: difficulty === "easy" ? 25 : difficulty === "medium" ? 35 : 45, clothFriction: 0.1 };
    }

    const title =
      challengeData?.title ||
      (isProjectiles ? "Castle Siege" : canonicalTopic === "tablecloth-pull"
        ? "Inertia Tablecloth Challenge"
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
    else if (rawSlug.includes("tablecloth-pull")) slug = "tablecloth-pull";

    const has3D = slug === "1d-motion-deceleration" || slug === "relative-motion" || slug === "vectors-river-rain" || slug === "tablecloth-pull";
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
          ? "Stopping distance s = u² / (2μg) across Dry, Wet, and Icy surfaces before the 60m barrier."
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
          : canonicalTopic === "relative-motion"
          ? "The Last Gap (River Crossing)"
          : canonicalTopic === "tablecloth-pull"
          ? "Tablecloth Pull (Loaded Stack)"
          : (foundTopic as any)?.challenges?.medium?.title || "Medium Challenge",
      description:
        canonicalTopic === "1d-motion-deceleration"
          ? "Minimum acceleration a = v² / (2s) to launch a fighter jet from an aircraft carrier deck without stalling."
          : canonicalTopic === "relative-motion"
          ? "Compensate for river current by aiming upstream to land directly on the opposite slipway."
          : canonicalTopic === "tablecloth-pull"
          ? "Manage heavier ceramic stacks and reduced surface contact area."
          : (foundTopic as any)?.challenges?.medium?.description || "Intermediate challenge with multi-variable physics.",
      sceneType:
        canonicalTopic === "1d-motion-deceleration"
          ? "last-hundred-meters"
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
