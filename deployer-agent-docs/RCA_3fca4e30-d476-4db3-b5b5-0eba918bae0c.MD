# RCA — Cloud Build QUEUED-phase timeout (tengoku-launcher)

## Summary
Redeploy of `tengoku-launcher` (deployment `68e169df-2a52-4b17-9e51-ecbc0dab6b9d`) cannot complete. The `build_image` step fails before any build runs: Cloud Build jobs are timing out while still in the **QUEUED** phase, i.e. no worker ever picks up the build.

## Evidence
- Failing step: `build_image` on every attempt.
- Error (identical across all runs): `ended in FAILED (last phase context: QUEUED/Build has timed out in the queued phase)` — `type: TerminalCloudBuildFailure`.
- `get_build_logs` for run `3fca4e30-d476-4db3-b5b5-0eba918bae0c` → `build_logs_unavailable`. No build steps executed → confirms the build never left the queue.
- Affected runs (all same signature):
  - `213013ad-d2ca-4016-ad76-1866f9bb285e`
  - `72d2fb74-08be-4e05-8b1e-f49a58c15f60`
  - `31c235f6-0b23-44f8-8b02-5f75a6154548` (reported)
  - `3fca4e30-d476-4db3-b5b5-0eba918bae0c` (deployer retry — same result)
- Last SUCCESSFUL run `4345dd42-78b3-4d1f-9b1c-7a221e4d44bc` built the SAME source/template (`fastapi_react_mongo_shadcn_base_image`, arm64, tier_0) at 2026-11-06T21:39Z.

## Root Cause
Cloud Build builds are not being scheduled onto a worker and time out in the QUEUED phase. This is a build-infrastructure/capacity problem on the Emergent platform side — not the app's source code, Dockerfile/manifest set, secrets, or tier. The same source built fine ~1.5h earlier, and zero build steps ran on the failing attempts.

## Not the cause (ruled out)
- Source/code: no build step executed; prior identical source built successfully.
- Manifest: a manifest edit cannot affect a build that never leaves the queue.
- Secrets / Tier: failure is pre-build; unrelated.

## Recommended Action
Platform/infra escalation. The Emergent team must check Cloud Build worker-pool availability / queue capacity for the build project (`prod-deployer-app-builder`, region/pool serving arm64 builds). Once queue scheduling is restored, re-fire the deploy — no source or manifest change is required.
