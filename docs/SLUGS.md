# Physics Topic Slugs Inventory

This document lists every slug found in the `topcoaching` repository and snapshot for physics simulations, and establishes their canonical status.

## 1. Topic Slugs Inventory

| Module Slug | Topic Slug | Topic Title (from `physics.json`) | Status | Notes |
|---|---|---|---|---|
| `kinematics` | `1d-motion-deceleration` | 1D Motion & Deceleration | **CANONICAL** | Primary topic slug for Module 1, Topic 1. Hosts Emergency Stop (Easy), Carrier Catapult (Medium), Decelerating Bullet (Advanced). |
| `kinematics` | `uniform-motion` | Uniform Motion | **FLAGGED / DEPRECATED** | Early legacy slug present in commit history (`82893fe`). Deleted in commit `9e815c9` and superseded by `1d-motion-deceleration`. Per architecture rules: **Do not alias or rename**. Requests for `uniform-motion` return 404 unless explicitly created as its own topic. |
| `kinematics` | `relative-motion` | Relative Motion (River Heist) | **CANONICAL** | Primary topic slug for Module 1, Topic 2. Hosts Ghost Driver (Easy), The Last Gap (Medium), Air Drop Interception (Advanced). Also contains orphan scene Escape Artist. |
| `kinematics` | `tablecloth-pull` | Tablecloth Pull | **CANONICAL (LEGACY CONFIG)** | Reference topic from initial scaffold (`44dfb22`). Uses legacy config format. One scene maps across 3 difficulties. |

## 2. Difficulty Slugs
Across all topics, the canonical difficulty enum is:
1. `easy`
2. `medium`
3. `advanced`

## 3. URL Format Parity
- Standalone challenge routes:
  `/[subject]/[module]/[topic]/challenge/[difficulty]`
  Example: `/physics/kinematics/1d-motion-deceleration/challenge/easy`
- Embed challenge routes:
  `/embed/challenge/[subject]/[module]/[topic]/[difficulty]`
  Example: `/embed/challenge/physics/kinematics/1d-motion-deceleration/easy`
