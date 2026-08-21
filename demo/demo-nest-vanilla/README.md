# demo-nest-vanilla

> **Note:** This README doesn't cover how the project was set up, only how to run it. Wiring J2OCL into a NestJS app touches files scattered across the project (build config, module system, and more), so there's no way to explain the setup both accurately and briefly and the integration isn't fully polished yet. Once it's smoother, a proper setup guide belongs here.

## How to Run

Requirement: **Node.js 24.13.0**

```bash
node -v
```

You should get `v24.13.0` (or any `v24.13.x`). If not, switch to Node 24.13 or install it before continuing.

```bash
npm install
npx j2ocl build --project tsconfig.build.json
npm run build
npm run start:prod
```

In another terminal:

```bash
curl http://localhost:8080/matmul
```

Warning: If your 8080 port is already in use. you may get an error when starting the server. Make sure to stop the other process and try again.
Help : You can also change the port in `src/main.ts` and re-run the server. (remember to re-build the project after changing the port)

Expected output:

```json
[[80,70,60,50],[240,214,188,162],[400,358,316,274],[560,502,444,386]]
```

Requires an OpenCL device (GPU or CPU) with its driver installed on the machine, since the running server actually executes the kernel via `@node-3d/opencl` when `/matmul` is called.
