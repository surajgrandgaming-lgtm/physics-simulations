// @topcoaching/sim-core main barrel export

// Bridge
export * from "./bridge/protocol";
export * from "./bridge/webBridge";

// Stores
export * from "./stores/factory";

// Hooks
export * from "./hooks/useTransientFrame";

// Audio
export * from "./audio/challengeAudio";

// Theme
export * from "./theme/theme";

// Canvas
export * from "./canvas/ChallengeCanvas";

// Embed
export * from "./embed/EmbedProvider";
export * from "./embed/useEmbedBridge";

// HUD
export * from "./hud";

// Three Core
export * from "./three-core/environment/CameraRig";
export * from "./three-core/environment/GroundPlane";
export * from "./three-core/environment/SceneLighting";
export * from "./three-core/environment/StudioEnvironment";
export * from "./three-core/physics/PhysicsWorldProvider";
export * from "./three-core/physics/usePhysicsWorld";
export * from "./three-core/primitives/AxisGrid3D";
export * from "./three-core/primitives/PhysicsBlock";
export * from "./three-core/primitives/Spring";
export * from "./three-core/primitives/Vector3DArrow";

// Schemas
export * from "./schemas/challenge.schema";

export interface DishConfig {
  id: string;
  mass: number;
  radius: number;
  height: number;
  startPosition: [number, number, number];
  frictionWithTable: number;
  tippingMoment?: number;
  fragile?: boolean;
  isCurved?: boolean;
  stackHeight?: number;
}
