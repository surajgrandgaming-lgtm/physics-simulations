# Physics Core Models

Shared physics kit models. Each .glb file here should be under 500 triangles,
real-world scale (1 unit = 1 metre), Draco-compressed on export from Blender.
After adding a .glb, run:
`npx gltfjsx public/models/physics/core/<file>.glb -o src/three/kit/physics/<ComponentName>.tsx --types`

Models: crate.glb, incline.glb, cart.glb, pulley.glb, table.glb, car.glb
