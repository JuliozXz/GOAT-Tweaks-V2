# Collection and integration

Source selection is per metric and supported hardware, not a universal collector.

| Need | Primary option | Boundary |
| --- | --- | --- |
| Process CPU, RAM, system information | Win32/PDH or sysinfo | Verify refresh semantics and units. CPU usage requires elapsed samples; process and system values differ. sysinfo does not guarantee Windows motherboard temperatures. |
| Windows native APIs from Rust | microsoft/windows-rs | Check installed crate version, feature gates, COM initialization, HRESULT, ownership and thread affinity. A binding is not a monitoring service. |
| VRAM | DXGI / vendor API | DXGI QueryVideoMemoryInfo CurrentUsage is the calling application's usage; do not label it total GPU usage or another game's VRAM. Budget differs from physical capacity. |
| NVIDIA utilization/clocks/power/temp | NVML or appropriate NVAPI query | Query capability/support and return errors. Driver, GPU and WDDM restrictions differ by metric. Never call management setters for monitoring. Check SDK/redistribution terms. |
| AMD metrics | ADLX performance monitoring interfaces | Check supported metrics and driver requirements. SDK has its own license agreement; do not assume MIT or redistribute SDK binaries without review. |
| Broad hardware sensors | LibreHardwareMonitorLib | .NET library, not a native Rust crate; a bounded sidecar may be appropriate. MPL-2.0 and third-party notices require review. Some sensors require elevated access/drivers; preserve partial results without disabling security. |
| Real presentation events | PresentMon | Choose CSV console, collection/analysis library or service API deliberately; see below. |
| CPU scheduling, GPU queues, I/O correlation | WPR/WPA/GPUView/PIX | Diagnostic tools, not skills. Capture can need privileges and contain private paths/process data. Start with existing sanitized traces. |

## PresentMon

Audited reference commit: `9db97248df5322a0aa1581d9141d1de6b058085b` (2026-10-23). Core license MIT; bundled components have separate terms in THIRD_PARTY.txt. This commit is a reference snapshot, not a recommended stable production dependency. Choose a reviewed release for integration.

- Console application exports CSV. Enumerate its actual --help; column names and meanings change across versions. Bound duration and target PID. Do not terminate other ETW sessions or use --restart_as_admin automatically.
- PresentData collection/analysis library consumes ETW. Direct native integration entails C++ build/ABI, trace lifecycle and event-loss handling.
- Service combines frame events with vendor telemetry and exposes the C PresentMon API. Since service 2.3.1, the documented route dynamically loads the service-installed PresentMonAPI2.dll using PresentMonAPI.h. The optional PresentMonAPI2Loader helps resolve endpoints. Shipping an unrelated API DLL does not guarantee binary compatibility with the service. Rust integration needs a checked C FFI boundary and supported architecture.
- Check PM_STATUS on each call. A service restart invalidates sessions; PM_STATUS_SESSION_NOT_OPEN requires opening a new session. Validate capability/version and support absence of service gracefully.
- ETW access, provider availability and permissions must be checked for the chosen route. A normal desktop UI need not run elevated merely because a collector sometimes requires elevated privileges. Do not install the service or a driver during design work.

## Primary sources

- https://github.com/GameTechDev/PresentMon/blob/9db97248df5322a0aa1581d9141d1de6b058085b/README-Service.md
- https://github.com/GameTechDev/PresentMon/blob/9db97248df5322a0aa1581d9141d1de6b058085b/README-ConsoleApplication.md
- https://github.com/GameTechDev/PresentMon/blob/9db97248df5322a0aa1581d9141d1de6b058085b/THIRD_PARTY.txt
- https://github.com/microsoft/windows-rs
- https://github.com/GuillaumeGomez/sysinfo
- https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/ns-dxgi1_4-dxgi_query_video_memory_info
- https://docs.nvidia.com/deploy/nvml-api/latest/index.html
- https://github.com/GPUOpen-LibrariesAndSDKs/ADLX
- https://github.com/LibreHardwareMonitor/LibreHardwareMonitor
- https://learn.microsoft.com/en-us/windows-hardware/test/wpt/windows-performance-analyzer

## Capture limitations from the audited README

ETW live capture requires applicable trace permissions; the README documents Performance Log Users membership. Without administrative access, process information for other accounts or short-lived processes may be incomplete, with unknown process names. Do not change group membership automatically. OpenGL/Vulkan paths reported as Runtime Other have reduced instrumentation and less accurate CPU frame-time/derived latency fields. GPU execution timing can be less accurate with Hardware-Accelerated GPU Scheduling. Confirm column names and limitations in the specific release; do not disable HAGS as an implicit workaround.
