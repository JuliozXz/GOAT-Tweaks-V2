const paths: Record<string, string> = {
  chip: "M7 7h10v10H7z M9 2v5m6-5v5M9 17v5m6-5v5M2 9h5m-5 6h5m10-6h5m-5 6h5 M10 10h4v4h-4z",
  memory: "M3 7h18v10H3z M7 10v4m5-4v4m5-4v4M6 17v3m4-3v3m4-3v3m4-3v3",
  gpu: "M3 6h18v12H3z M7 18v3m3-3v3M16 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M6 10h3m-3 4h3",
  drive: "M5 4h14l3 12v4H2v-4z M2 16h20m-5 2h2",
  mouse: "M7 7a5 5 0 0 1 10 0v10a5 5 0 0 1-10 0z M12 3v6",
  pulse: "M2 12h5l3-8 4 16 3-8h5",
  network: "M9 2h6v5H9z M2 17h6v5H2z M16 17h6v5h-6z M12 7v5m-7 5v-5h14v5",
  window: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  bolt: "M13 2 4 14h7l-1 8 10-13h-7z",
  layers: "m12 3 10 5-10 5L2 8z M2 12l10 5 10-5M2 16l10 5 10-5",
  activity: "M3 21V9h4v12m3 0V3h4v18m3 0V6h4v15",
  game: "M7 7h10c3 0 5 11 3 12-2 1-4-4-5-4H9c-1 0-3 5-5 4C2 18 4 7 7 7z M7 10v4m-2-2h4m6-1h1m1 2h1",
  plug: "M8 2v5m8-5v5M6 7h12v3a6 6 0 0 1-12 0z M12 16v6",
  audio: "M3 9h4l6-5v16l-6-5H3z M17 8a6 6 0 0 1 0 8m3-12a11 11 0 0 1 0 16",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6",
  tool: "M14 3a6 6 0 0 0-6 8L2 17l5 5 6-6a6 6 0 0 0 8-8l-4 4-5-5z",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  expand: "M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M18 6 6 18",
};
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.chip} />
    </svg>
  );
}
