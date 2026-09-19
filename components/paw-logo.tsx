export function PawLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[11px] text-white shadow-md shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(160deg,#2f7d4f,#1f4d38)" }}
    >
      <svg viewBox="0 0 24 24" fill="#fff" style={{ width: size * 0.58, height: size * 0.58 }}>
        <ellipse cx="12" cy="15" rx="6.3" ry="5.3" />
        <circle cx="5" cy="9" r="2.3" />
        <circle cx="10" cy="5" r="2.1" />
        <circle cx="14" cy="5" r="2.1" />
        <circle cx="19" cy="9" r="2.3" />
      </svg>
    </div>
  );
}
