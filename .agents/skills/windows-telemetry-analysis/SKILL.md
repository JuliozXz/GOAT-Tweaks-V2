---
name: windows-telemetry-analysis
description: Plan or review Windows hardware monitoring and gaming telemetry using Rust, native APIs and PresentMon. Use for CPU/GPU/RAM/VRAM sensors, temperatures, clocks, power, FPS, frametime, stuttering, profiling or measurement validity.
license: MIT
metadata:
  version: "1.0.0-local"
  source: "Local workflow grounded in official references; see PROVENANCE.md"
---

# Windows telemetry analysis

This is an instruction-only research and analysis workflow. It installs no collector and does not itself read sensors. Start from the requested measurement, its owner (process/adapter/system), unit, sampling interval and decision it is intended to support.

- For selecting a collector or defining safe Rust/Windows boundaries, read [collection and integration](references/collection.md).
- For FPS, frametime, stuttering or bottleneck conclusions, read [measurement validity](references/measurement.md).

Record source and collector version, OS/driver/device, timestamp basis, capture settings, permission level, missing values and dropped data. Missing or unsupported sensors remain unavailable, never zero or estimated as measured values. Check current official interfaces before choosing dependencies.

Keep native collection out of the frontend. Expose bounded typed IPC, cancellation, sampling limits, backpressure and explicit errors. Protect Windows handles and FFI lifetimes with small audited Rust wrappers. Read-only monitoring does not authorize tuning, process injection, driver installation, service changes or elevated capture. Inspect the specific collector and obtain any execution approval required by the environment at the point of use.
