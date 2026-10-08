export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="mapp-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--teal)" />
          <stop offset="1" stopColor="var(--navy)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#mapp-g)" />
      <path
        d="M10 27V13l6 9 6-9v14"
        stroke="white" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" fill="none"
      />
      <circle cx="29" cy="14" r="3" fill="var(--peach)" />
    </svg>
  );
}
