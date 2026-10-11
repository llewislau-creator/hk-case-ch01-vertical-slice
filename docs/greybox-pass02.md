# 《箱中無聲》Environment Production Pass 02 — Integration & Validation

## Integration scope
- **New independent entrance:** `/district.html` (Vite multi-page output). Existing `/index.html` remains unmodified.
- **Rendering:** React 18, React Three Fiber and Three.js.
- **Physics proxies:** @react-three/rapier fixed CuboidCollider walls / floors / guards, kinematic capsule for player.
- **Gameplay collision:** conservative zone navigation with 0.18m movement sub-steps; this is *not* a baked NavMesh or fully dynamic rigidbody controller.
- **Stairs:** visibly animated five-floor guided path from Y=0 to Y=16; no jumping across rooftops.
- **District:** B01–B05, alleys A01/A02, stairs ST-W/ST-E, roofs R01–R03, two bridges, E01 evidence and seven lightweight NPC paths.
- **UI:** desktop WASD, Shift, E, R, M; touch movement/rotation buttons, minimap and editable case barrier.
- **Design source:** World Layout Blueprint V1.0; coordinates are fictional game units, not historical surveying.

## Automatic verification
Run `node --test app/tests/district.test.mjs` and `npm run build` from repository root.
GitHub Actions reports builds of both entry points and the original texture atlas paths.

## Manual acceptance still required
1. Run a desktop WebGL playthrough P0 -> A01 -> ST-W -> R01 -> BR01 -> R02 -> BR02 -> R03 -> ST-E -> A02 -> main street.
2. Try entering all 4 shops from front doors and walking into non-door walls.
3. Confirm roof guards / traffic exclusion, no camera clipping through stair shell at each landing.
4. Open existing `index.html` and verify original casebook, paper box, texture atlas with Network 404 check.
5. Repeat on an actual mobile Safari/Chrome device with touch and note FPS p5/median, memory and load time.
6. Verify no white blank page and no WebGL/context errors.

## Limitations
No proof of device FPS, real browser visuals, accessibility, NPC NavMesh or collision stability until manual browser/device QA. Do not merge to main or claim deployment success based solely on static tests.

## Design responsibility
The narrative is fictional. Player observations do not select a canonical murderer.
