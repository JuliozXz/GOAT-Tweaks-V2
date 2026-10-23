# Measurement validity

Define the event before computing the metric. Application submission/presentation, GPU completion, displayed frames and generated frames are different populations. PresentMon observes presentation-related ETW events; it is not an instrument measuring photons, all input latency, every game-engine stage or universal hardware counters.

Keep raw captures. Record game/build, scene, resolution, quality, display mode, refresh rate, frame cap, vsync/VRR, frame generation, driver, OS, HAGS setting and thermal state without changing them as a side effect. Use the same reproducible workload and warm-up. Bound captures and measure collector overhead with repeated comparable runs.

Check timestamps, ordering, process lifetime/PID reuse, swapchain identity, event loss, dropped/not-displayed/generated frames, zeros and missing fields. Do not merge overlay or launcher swapchains into the game. A capture with data loss has limited evidentiary value. Synchronize sensor samples and frame events with a monotonic clock or explicit mapping; a 1 Hz temperature sample does not resolve a 10 ms stall.

For a valid sequence of frame intervals in milliseconds, throughput is `1000 * count / sum(intervals)`. Do not average instantaneous `1000 / interval` values as if they were aggregate FPS. Report duration and population. Define percentile interpolation, exclusions and sample counts. Explain the chosen 1%/0.1% low formula; inverse p99 frametime and average of the slowest 1% are different statistics. Show frametime distribution and timeline, not average FPS alone.

Choose a stutter definition tied to user impact (absolute duration and/or change relative to local pacing), disclose it, and inspect clusters and repeatability. Correlate CPU scheduling, GPU busy/queues, disk/page faults, memory pressure and synchronized thermal/power data. High aggregate CPU usage or GPU utilization alone cannot establish the cause. Separate observation, hypothesis and confirmed cause; a counterfactual controlled repeat provides stronger evidence than correlation.

Prefer offline sanitized CSV/ETL for initial analysis. Diagnostic artifacts can reveal process names and paths. Never change power plans, clocks, fan control, services, registry, security controls, game settings or anti-cheat behavior as an implicit optimization step.
