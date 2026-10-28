"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Play,
  Sliders,
  CheckCircle2,
  Gauge,
  Zap,
  Activity,
  Layers,
  Compass,
  Check,
  AlertTriangle,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useSatelliteSpinStore,
  SATELLITE_STAGES,
} from "@/three/challenges/physics/angular-momentum/SatelliteSpinStore";

export function SatelliteSpinControls({ config }: { config?: any }) {
  const currentStage = useSatelliteSpinStore((s) => s.currentStage);
  const status = useSatelliteSpinStore((s) => s.status);
  const sliderValue = useSatelliteSpinStore((s) => s.sliderValue);

  const currentRadius = useSatelliteSpinStore((s) => s.currentRadius);
  const currentInertia = useSatelliteSpinStore((s) => s.currentInertia);
  const currentOmega = useSatelliteSpinStore((s) => s.currentOmega);
  const angularMomentum = useSatelliteSpinStore((s) => s.angularMomentum);
  const currentKineticEnergy = useSatelliteSpinStore((s) => s.currentKineticEnergy);
  const internalWork = useSatelliteSpinStore((s) => s.internalWork);
  const omegaError = useSatelliteSpinStore((s) => s.omegaError);

  const stars = useSatelliteSpinStore((s) => s.stars);
  const score = useSatelliteSpinStore((s) => s.score);
  const failureReason = useSatelliteSpinStore((s) => s.failureReason);
  const showResultModal = useSatelliteSpinStore((s) => s.showResultModal);

  const setSliderValue = useSatelliteSpinStore((s) => s.setSliderValue);
  const adjustSliderValue = useSatelliteSpinStore((s) => s.adjustSliderValue);
  const launchSimulation = useSatelliteSpinStore((s) => s.launchSimulation);
  const startMission = useSatelliteSpinStore((s) => s.startMission);
  const resetSimulation = useSatelliteSpinStore((s) => s.resetSimulation);
  const nextStage = useSatelliteSpinStore((s) => s.nextStage);
  const setStage = useSatelliteSpinStore((s) => s.setStage);

  const stage = SATELLITE_STAGES[currentStage - 1];
  const isRunning = status === "docking";
  const isWon = status === "success";
  const isGameOver = status === "fail";

  const stepSmall = stage.stepSmall;
  const stepLarge = stage.stepLarge;

  const isMatched = omegaError <= 0.05 || Math.abs(sliderValue - stage.targetRadius) <= stage.tolerance;

  const displayParamValue = useMemo(() => {
    return "r = " + sliderValue.toFixed(2) + " m";
  }, [sliderValue]);

  // Step-by-step mathematical derivation & conceptual breakdown for the Explanation Dialog
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Stage 1: Outward Deployment to Decelerate Spin Rate",
        concept:
          "Why does extending masses slow you down? This is the classic 'Figure Skater Effect' in orbital mechanics! In the frictionless vacuum of space, there is zero external torque acting on the spacecraft (\Sigma\tau_{\\text{ext}} = 0). Under Newton's rotational laws, the spacecraft's total angular momentum is strictly conserved: L = I(r) \cdot \omega = \text{constant}.\n\nWhen the motorized rails deploy the two heavy counterweights outward, they move mass further away from the central axis. Because moment of inertia depends on the square of distance (I \propto r^2), the spacecraft's resistance to rotation increases dramatically. To keep angular momentum constant, the spin rate (\omega) must drop in exact inverse proportion. Your mission is to find the exact radial distance r where the satellite's spin rate matches the station collar at exactly 1.40 rad/s.",
        formula: "I(r) = I_{\\text{hub}} + 2 m r^2, \\quad \\omega_f = \\omega_i \\frac{I(r_i)}{I(r_f)}",
        formulas: [
          {
            label: "1. Conservation of Angular Momentum",
            formula: "L = I_i \\omega_i = I_f \\omega_f = \\text{constant} \\quad (\\Sigma \\tau_{\\text{ext}} = 0)",
            explanation:
              "Because no thrusters, friction, or external forces exert a twisting torque on the platform, total angular momentum (L) is perfectly conserved from start to finish.",
          },
          {
            label: "2. Variable Moment of Inertia (Hub + 2 Moving Masses)",
            formula: "I(r) = I_{\\text{hub}} + 2 m r^2",
            explanation:
              "Total rotational inertia combines the solid central hub (I_hub = 180.0 kg·m²) and two deployable point-mass pods (m = 25.0 kg each at radius r). Notice that doubling the distance quadruples the pods' inertia!",
          },
          {
            label: "3. Required Final Inertia for Docking Spin",
            formula: "I_f = \\frac{L}{\\omega^*} = \\frac{I_i \\omega_i}{\\omega^*}",
            explanation:
              "To achieve the target docking spin rate \omega^* = 1.40 rad/s without external thrusters, we divide the conserved momentum L by the target angular velocity \omega^*.",
          },
          {
            label: "4. Solving for the Deployment Radius (r_f)",
            formula: "r_f = \\sqrt{\\frac{I_f - I_{\\text{hub}}}{2m}}",
            explanation:
              "Subtract the central hub's contribution from required inertia I_f, then divide by the combined pod mass (2m = 50.0 kg) and take the square root.",
          },
          {
            label: "5. Internal Mechanical Brake Work & Rotational Kinetic Energy",
            formula: "W_{\\text{internal}} = \\Delta K_{\\text{rot}} = \\frac{1}{2} I_f (\\omega^*)^2 - \\frac{1}{2} I_i \\omega_i^2",
            explanation:
              "Even though angular momentum is conserved, kinetic energy is NOT conserved! As the weights move outward along the centrifugal field, onboard friction brakes absorb kinetic energy into heat and electrical regen (W_internal < 0).",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Compute Initial Inertia (I_i) and Conserved Momentum (L)",
            math: "I_i = 180.0 + 2(25.0)(0.60)^2 = 198.0\\text{ kg}\\cdot\\text{m}^2, \\quad L = 198.0 \\times 3.50 = 693.0\\text{ kg}\\cdot\\text{m}^2/\\text{s}",
            explanation:
              "At initial radius r_i = 0.60 m, the two 25 kg pods contribute 2 × 25 × (0.60)² = 18.0 kg·m². Adding the 180.0 kg·m² core hub gives an initial inertia of 198.0 kg·m². Spinning at \omega_i = 3.50 rad/s, the satellite carries 693.0 units of conserved angular momentum.",
          },
          {
            step: 2,
            title: "2. Determine Required Final Moment of Inertia (I_f)",
            math: "I_f = \\frac{L}{\\omega^*} = \\frac{693.0\\text{ kg}\\cdot\\text{m}^2/\\text{s}}{1.40\\text{ rad/s}} = 495.0\\text{ kg}\\cdot\\text{m}^2",
            explanation:
              "To decelerate rotation from 3.50 rad/s to the station's 1.40 rad/s collar speed, the satellite must become 2.5 times harder to rotate! The total required moment of inertia is exactly 495.0 kg·m².",
          },
          {
            step: 3,
            title: "3. Isolate the Masses' Contribution to Inertia",
            math: "2m \\cdot r_f^2 = I_f - I_{\\text{hub}} = 495.0 - 180.0 = 315.0\\text{ kg}\\cdot\\text{m}^2 \\implies r_f^2 = \\frac{315.0}{50.0} = 6.30\\text{ m}^2",
            explanation:
              "The central hub accounts for 180.0 kg·m², meaning the two movable counterweights must supply the remaining 315.0 kg·m². With combined mass 2m = 50.0 kg, dividing 315.0 by 50.0 yields r_f² = 6.30 m².",
          },
          {
            step: 4,
            title: "4. Calculate the Exact Target Deployment Radius (r_f)",
            math: "r_f = \\sqrt{6.30} \\approx 2.51\\text{ m}",
            explanation:
              "Taking the square root gives r_f = 2.51 m. By sliding the counterweights out to 2.51 m, the satellite's spin rate naturally glides down from 3.50 rad/s to exactly 1.40 rad/s, perfectly matching the station collar for zero-shear docking!",
          },
          {
            step: 5,
            title: "5. Energy Audit & Regenerative Brake Work (ΔK)",
            math: "K_i = \\frac{1}{2}(198.0)(3.50)^2 = 1212.75\\text{ J}, \\quad K_f = \\frac{1}{2}(495.0)(1.40)^2 = 485.10\\text{ J} \\implies W_{\\text{internal}} = -727.65\\text{ J}",
            explanation:
              "Notice that kinetic energy dropped by 727.65 Joules! Where did it go? Centrifugal force naturally pushes the masses outward; internal electromagnetic dampers on the rails resist this outward push, doing negative work to safely arrest the masses and dissipate 727.65 J.",
          },
        ],
        conclusion:
          "Extending masses outward increases rotational inertia (I ∝ r²), forcing angular velocity (\omega) to decrease so L = I\omega stays constant. Kinetic energy decreases because internal rail brakes do negative work absorbing the outward centrifugal motion.",
      };
    } else if (stage.stage === 2) {
      return {
        title: "Stage 2: Winch Retraction to Accelerate Spin Rate",
        concept:
          "How do you speed up a spinning satellite without rocket fuel? Retract the masses inward! This is the reverse figure skater maneuver. The space station centrifuge is rotating at a fast 2.50 rad/s, while our platform is idling at 0.90 rad/s with weights extended at 3.20 m.\n\nBy reeling the masses closer to the spin axis, rotational inertia drops significantly. Because total angular momentum L = I·\omega cannot change without external torque, the spin rate accelerates. However, because the masses are spinning, centrifugal reaction pulls strongly outward. Onboard electric winch motors must do POSITIVE mechanical work (W_motor > 0) to haul the masses inward against centrifugal tension, directly pumping energy into rotational kinetic energy!",
        formula: "r_f = \\sqrt{\\frac{\\frac{L}{\\omega^*} - I_{\\text{hub}}}{2m}}",
        formulas: [
          {
            label: "1. Conservation of Angular Momentum",
            formula: "L = I_i \\omega_i = I_f \\omega^* = \\text{constant} \\quad (\\Sigma \\tau_{\\text{ext}} = 0)",
            explanation:
              "Because all forces during retraction are internal to the platform, total angular momentum L remains perfectly constant throughout winching.",
          },
          {
            label: "2. Variable Moment of Inertia (Hub + Retracted Masses)",
            formula: "I(r) = I_{\\text{hub}} + 2 m r^2",
            explanation:
              "With core hub I_hub = 140.0 kg·m² and two 20.0 kg pods, reeling the masses inward rapidly reduces the rotational resistance of the spacecraft.",
          },
          {
            label: "3. Required Contracted Inertia for Accelerated Spin",
            formula: "I_f = \\frac{L}{\\omega^*} = \\frac{I_i \\omega_i}{\\omega^*}",
            explanation:
              "To spin up to the target rate of 2.50 rad/s, we divide conserved momentum L by target spin \omega^* to determine the required compacted inertia.",
          },
          {
            label: "4. Solving for Retraction Radius (r_f)",
            formula: "r_f = \\sqrt{\\frac{I_f - I_{\\text{hub}}}{2m}}",
            explanation:
              "Subtract the hub inertia from required inertia I_f and divide by the 40.0 kg mass of the two pods to find the required radial position.",
          },
          {
            label: "5. Positive Motor Work Against Centrifugal Force",
            formula: "W_{\\text{motor}} = \\int_{r_i}^{r_f} (-2 m \\omega^2 r)\\,dr = \\Delta K_{\\text{rot}} = \\frac{1}{2} I_f (\\omega^*)^2 - \\frac{1}{2} I_i \\omega_i^2 > 0",
            explanation:
              "Centrifugal reaction pushes outward with force F = m·\omega²·r. Hauling the masses inward requires positive mechanical work from the winch motors, raising rotational kinetic energy!",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Compute Initial Inertia (I_i) and Conserved Momentum (L)",
            math: "I_i = 140.0 + 2(20.0)(3.20)^2 = 549.60\\text{ kg}\\cdot\\text{m}^2, \\quad L = 549.60 \\times 0.90 = 494.64\\text{ kg}\\cdot\\text{m}^2/\\text{s}",
            explanation:
              "With the counterweights deployed far out at 3.20 m, the two 20 kg pods provide 409.60 kg·m² of inertia. Adding the 140.0 kg·m² hub gives a large initial inertia of 549.60 kg·m², yielding conserved angular momentum L = 494.64 kg·m²/s.",
          },
          {
            step: 2,
            title: "2. Determine Required Moment of Inertia (I_f) for 2.50 rad/s",
            math: "I_f = \\frac{L}{\\omega^*} = \\frac{494.64\\text{ kg}\\cdot\\text{m}^2/\\text{s}}{2.50\\text{ rad/s}} = 197.856\\text{ kg}\\cdot\\text{m}^2",
            explanation:
              "To accelerate the spin rate nearly threefold from 0.90 rad/s up to 2.50 rad/s, total inertia must contract by 64%, down to 197.86 kg·m².",
          },
          {
            step: 3,
            title: "3. Isolate the Masses' Contribution to Inertia",
            math: "2m \\cdot r_f^2 = I_f - I_{\\text{hub}} = 197.856 - 140.0 = 57.856\\text{ kg}\\cdot\\text{m}^2 \\implies r_f^2 = \\frac{57.856}{40.0} = 1.4464\\text{ m}^2",
            explanation:
              "Subtracting the 140.0 kg·m² core hub leaves 57.856 kg·m² for the two pods. Dividing by the combined pod mass 2m = 40.0 kg gives r_f² = 1.4464 m².",
          },
          {
            step: 4,
            title: "4. Compute the Target Retraction Radius (r_f)",
            math: "r_f = \\sqrt{1.4464} \\approx 1.20\\text{ m}",
            explanation:
              "Taking the square root gives r_f = 1.20 m. Winching the masses inward from 3.20 m to 1.20 m accelerates the platform spin from 0.90 rad/s to exactly 2.50 rad/s.",
          },
          {
            step: 5,
            title: "5. Electric Winch Motor Work Input (W_motor > 0)",
            math: "K_i = \\frac{1}{2}(549.60)(0.90)^2 = 222.59\\text{ J}, \\quad K_f = \\frac{1}{2}(197.856)(2.50)^2 = 618.30\\text{ J} \\implies W_{\\text{motor}} = +395.71\\text{ J}",
            explanation:
              "Rotational kinetic energy increased by +395.71 Joules! This energy was supplied directly by the satellite's onboard winch motors, which had to fight the outward centrifugal pull all the way from 3.20 m down to 1.20 m.",
          },
        ],
        conclusion:
          "Pulling rotating masses inward reduces moment of inertia and speeds up rotation rate (\omega = L / I). The increase in rotational kinetic energy (+395.7 J) comes directly from positive mechanical work performed by the winch motors overcoming centrifugal force.",
      };
    } else {
      return {
        title: "Stage 3: Quad Cross-Rail Configuration (4 Sliding Pods)",
        concept:
          "How does multi-axis geometry alter angular momentum control? In this advanced observatory platform, 4 identical 15 kg sensor pods slide along dual perpendicular cross rails. The moment of inertia now scales with 4 masses: I(r) = I_hub + 4·m·r².\n\nBecause there are 4 pods instead of 2, every millimeter of radial adjustment produces twice as much inertia change! The platform starts spinning fast at 4.00 rad/s at r = 1.00 m and must be stabilized to exactly 2.00 rad/s. Notice that halving the angular velocity requires the total moment of inertia to exactly double: I_f = 2 · I_i. Let's see how the quadratic scaling of radius allows precise tuning.",
        formula: "I(r) = I_{\\text{hub}} + 4 m r^2, \\quad r_f = \\sqrt{\\frac{\\frac{L}{\\omega^*} - I_{\\text{hub}}}{4m}}",
        formulas: [
          {
            label: "1. Quad-Mass Moment of Inertia Equation",
            formula: "I(r) = I_{\\text{hub}} + 4 m r^2",
            explanation:
              "With 4 symmetric pods of mass m = 15.0 kg each, the total deployable mass is 4m = 60.0 kg, contributing 60·r² to the platform's rotational inertia.",
          },
          {
            label: "2. Halving Angular Velocity via Inertia Doubling",
            formula: "L = I_i \\omega_i = I_f \\omega^* \\implies I_f = I_i \\frac{\\omega_i}{\\omega^*} = I_i \\frac{4.00}{2.00} = 2 I_i",
            explanation:
              "Because target speed is exactly half of the initial speed, conservation of angular momentum requires the total inertia to double from 180 kg·m² to 360 kg·m².",
          },
          {
            label: "3. Solving for the 4-Pod Radial Distance",
            formula: "r_f = \\sqrt{\\frac{I_f - I_{\\text{hub}}}{4m}}",
            explanation:
              "Subtract the hub inertia from required inertia I_f and divide by the 4-pod total mass (60.0 kg) to find the radial position.",
          },
          {
            label: "4. Kinetic Energy Cut Exactly in Half",
            formula: "K = \\frac{L^2}{2I} \\implies \\frac{K_f}{K_i} = \\frac{I_i}{I_f} = \\frac{1}{2} \\implies W_{\\text{internal}} = -\\frac{1}{2} K_i",
            explanation:
              "When angular momentum L is held constant, rotational kinetic energy is inversely proportional to inertia (K = L² / 2I). Doubling inertia cuts the platform's rotational kinetic energy exactly in half!",
          },
        ],
        steps: [
          {
            step: 1,
            title: "1. Compute Initial Quad Inertia (I_i) and Conserved Momentum (L)",
            math: "I_i = 120.0 + 4(15.0)(1.00)^2 = 180.0\\text{ kg}\\cdot\\text{m}^2, \\quad L = 180.0 \\times 4.00 = 720.0\\text{ kg}\\cdot\\text{m}^2/\\text{s}",
            explanation:
              "At r_i = 1.00 m, the 4 pods contribute 4 × 15 × (1.00)² = 60.0 kg·m². With the 120.0 kg·m² central hub, the spacecraft starts with I_i = 180.0 kg·m² and conserved angular momentum L = 720.0 kg·m²/s.",
          },
          {
            step: 2,
            title: "2. Determine Required Final Inertia (I_f)",
            math: "I_f = \\frac{L}{\\omega^*} = \\frac{720.0\\text{ kg}\\cdot\\text{m}^2/\\text{s}}{2.00\\text{ rad/s}} = 360.0\\text{ kg}\\cdot\\text{m}^2",
            explanation:
              "Halving the spin rate from 4.00 rad/s to 2.00 rad/s requires the platform's moment of inertia to exactly double from 180.0 kg·m² to 360.0 kg·m².",
          },
          {
            step: 3,
            title: "3. Isolate the 4-Pod Mass Contribution",
            math: "4m \\cdot r_f^2 = I_f - I_{\\text{hub}} = 360.0 - 120.0 = 240.0\\text{ kg}\\cdot\\text{m}^2 \\implies r_f^2 = \\frac{240.0}{60.0} = 4.00\\text{ m}^2",
            explanation:
              "The core hub supplies 120.0 kg·m², leaving 240.0 kg·m² to be delivered by the 4 pods. With total mass 4m = 60.0 kg, dividing 240.0 by 60.0 gives r_f² = 4.00 m².",
          },
          {
            step: 4,
            title: "4. Compute Target Radial Slider Position (r_f)",
            math: "r_f = \\sqrt{4.00} = 2.00\\text{ m}",
            explanation:
              "Taking the square root gives an exact integer: r_f = 2.00 m! Sliding all 4 pods out from 1.00 m to 2.00 m doubles the distance, which quadruples the pods' inertia (from 60 to 240 kg·m²), locking the spacecraft spin at exactly 2.00 rad/s.",
          },
          {
            step: 5,
            title: "5. Rotational Energy Halved (ΔK = -720.0 J)",
            math: "K_i = \\frac{1}{2}(180.0)(4.00)^2 = 1440.0\\text{ J}, \\quad K_f = \\frac{1}{2}(360.0)(2.00)^2 = 720.0\\text{ J} \\implies W_{\\text{internal}} = -720.0\\text{ J}",
            explanation:
              "Because K = L² / (2I), doubling the moment of inertia at constant momentum cuts rotational kinetic energy from 1440.0 J down to 720.0 J. Rail dampers absorb exactly 720.0 J of mechanical energy.",
          },
        ],
        conclusion:
          "With 4 symmetric masses, rotational inertia scales as I = I_hub + 4mr². To halve the spin rate (4.00 → 2.00 rad/s), total inertia must double (180 → 360 kg·m²), which cuts kinetic energy exactly in half (1440 → 720 J) while angular momentum L remains perfectly conserved.",
      };
    }
  }, [stage]);

  return (
    <GameHUDContainer
      title="Angular Momentum: Orbital Satellite Docking"
      topicName="Conservation of Angular Momentum & Variable Moment of Inertia (L = I·ω)"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      onMissionStart={startMission}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: stage.missionObjective,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%205/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Observe Station Collar Rotation",
            description:
              "The overhead Space Station collar rotates at an exact target spin rate ω* = " + stage.targetOmega.toFixed(2) + " rad/s.",
          },
          {
            step: 2,
            title: "Tune Mass Radius to Match Spins",
            description:
              "Adjust the counterweight slider. Watch your satellite spin faster (retract) or slower (extend) in real time!",
          },
          {
            step: 3,
            title: "Lock & Dock to Merge",
            description:
              "Once your spin rate matches the station collar, click LOCK & DOCK to ascend and merge together!",
          },
        ],
        formulas: [
          {
            label: "1. Conservation of Angular Momentum",
            formula: "L = I(r) \\cdot \\omega = \\text{constant} \\implies I_1 \\omega_1 = I_2 \\omega_2",
            explanation:
              "With zero net external torque, angular momentum cannot change.",
          },
          {
            label: "2. Variable Moment of Inertia",
            formula: "I(r) = I_{\\text{hub}} + N \\cdot m \\cdot r^2",
            explanation:
              "Moving masses along radial rails changes rotational inertia quadratically with radius r.",
          },
          {
            label: "3. Internal Mechanical Work & Energy",
            formula: "W_{\\text{internal}} = \\Delta K_{\\text{rot}} = \\frac{1}{2} I_f \\omega_f^2 - \\frac{1}{2} I_i \\omega_i^2",
            explanation:
              "Internal motors do work against centrifugal forces (or absorb energy when masses deploy outward).",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY: SYNCHRONIZED ORBITAL DOCKING",
        instructions: [
          {
            title: "1. Calculate Required Radius",
            description: "Use conservation of angular momentum (L = I·ω) to find r.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%205/medium/1.png",
          },
          {
            title: "2. Adjust Counterweight Slider",
            description: "Adjust the slider until your spin matches the station collar.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%203/medium/2.png",
          },
          {
            title: "3. Click LOCK & DOCK to Merge",
            description: "Click LOCK & DOCK to ascend and merge with the station collar.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%205/medium/3.png",
          },
        ],
        tip: stage.explanationTrap,
      }}
      result={
        showResultModal && (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentStage < 3 ? nextStage : undefined,
              nextTierLabel:
                currentStage < 3
                  ? "PROCEED TO STAGE " + (currentStage + 1)
                  : "REPLAY CHALLENGE",
              failureReason: isGameOver ? failureReason || "Angular velocity mismatch prevented collar lock." : undefined,
              tip: stage.explanationTrap,
              calculation: calculationDerivation,
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentStage === 3
                      ? "Master of Angular Momentum Achieved!"
                      : "Stage " + currentStage + " Synchronized & Merged!"
                    : "Centrifuge Shear Mismatch",
                },
                {
                  label: "Configured Radius (r)",
                  value: displayParamValue + " (Target: " + stage.targetRadius.toFixed(2) + " m)",
                },
                {
                  label: "Final Spin Rate (ω)",
                  value: currentOmega.toFixed(2) + " rad/s (Target: " + stage.targetOmega.toFixed(2) + " rad/s)",
                },
                {
                  label: "Moment of Inertia (I)",
                  value: currentInertia.toFixed(1) + " kg·m²",
                },
                {
                  label: "Conserved Momentum (L)",
                  value: angularMomentum.toFixed(1) + " kg·m²/s",
                },
                {
                  label: "Internal Motor Work (ΔK)",
                  value: (internalWork >= 0 ? "+" : "") + internalWork.toFixed(1) + " Joules",
                },
              ],
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-2 sm:pb-3.5 max-w-xl max-lg:landscape:max-w-xl mx-auto">
          {/* Main Controls Capsule - Clean Light Theme */}
          <div className="w-full py-1.5 px-4 sm:py-2 sm:px-5 max-lg:landscape:py-1.5 max-lg:landscape:px-4 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300 shadow-[0_4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3 sm:gap-5">
            {/* Left Column: Parameter Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              {/* Header Badge above Slider */}
              <div className="flex items-center gap-2 mb-1 px-0.5">
                <Sliders className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3 text-cyan-600 shrink-0" />
                <span className="text-[11px] sm:text-xs max-lg:landscape:text-[10.5px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  MASS RADIUS (r):
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-black text-xs sm:text-sm max-lg:landscape:text-xs shadow-xs shrink-0">
                  {displayParamValue}
                </span>

                {/* Match indicator pill */}
                {isMatched ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono font-bold text-[10px] flex items-center gap-1 shadow-2xs shrink-0 animate-pulse">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span>SPIN MATCHED</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-mono font-semibold text-[10px] flex items-center gap-1 shadow-2xs shrink-0">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Δω: {omegaError.toFixed(2)} rad/s</span>
                  </span>
                )}
              </div>

              {/* Stepper Buttons & Slider Bar */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(-stepLarge)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Decrease " + stepLarge}
                >
                  {"-" + stepLarge}
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(-stepSmall)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Decrease " + stepSmall}
                >
                  {"-" + stepSmall}
                </button>

                {/* Range Slider */}
                <input
                  type="range"
                  disabled={isRunning}
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={stage.sliderStep}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-600 h-1.5 sm:h-2 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
                />

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(stepSmall)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase " + stepSmall}
                >
                  {"+" + stepSmall}
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => adjustSliderValue(stepLarge)}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-7 max-lg:landscape:h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs max-lg:landscape:text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title={"Increase " + stepLarge}
                >
                  {"+" + stepLarge}
                </button>
              </div>
            </div>

            {/* Right Column: Big Launch / Lock Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              {isRunning ? (
                <div className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-full bg-cyan-600 text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg animate-pulse">
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>MERGING WITH STATION...</span>
                </div>
              ) : isWon ? (
                <button
                  type="button"
                  onClick={currentStage < 3 ? nextStage : resetSimulation}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentStage < 3 ? "NEXT STAGE" : "REPLAY"}</span>
                </button>
              ) : isGameOver ? (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-full bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RETRY DOCK</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={launchSimulation}
                  className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-full text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ${
                    isMatched
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30 animate-pulse"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/25"
                  }`}
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>LOCK & DOCK</span>
                </button>
              )}
            </div>
          </div>

        </div>
      }
    />
  );
}
