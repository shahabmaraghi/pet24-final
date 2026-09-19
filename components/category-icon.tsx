const ICONS: Record<string, string> = {
  dog: "M4 10c0-2 1.5-4 4-4l1 2h6l1-2c2.5 0 4 2 4 4v3c0 4-3.5 7-8 7s-8-3-8-7z",
  cat: "M6 4l1.5 4h9L18 4l1 6v6a6 6 0 01-6 6h0a6 6 0 01-6-6v-6z",
  birds: "M4 14c2-5 6-8 11-8 3 0 5 2 5 4-1 0-2-.3-3-1 0 3-2 5-4 6l2 4H12l-1-3c-3 1-5 0-7-2z",
  fish: "M3 12c3-4 8-6 12-4 2 1 4 3 5 4-1 1-3 3-5 4-4 2-9 0-12-4z",
  accessories: "M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20",
  health: "M12 21s-7-4.4-9.5-8.8C.7 8 2.4 4.5 6 4c2-.3 3.7.6 6 3 2.3-2.4 4-3.3 6-3 3.6.5 5.3 4 3.5 7.2C19 15.6 12 21 12 21z",
};

export function CategoryIcon({ id, size = 24 }: { id: string; size?: number }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "#fff", strokeWidth: 1.6, style: { width: size, height: size } };
  if (id === "dog")
    return (
      <svg {...common}>
        <path d={ICONS.dog} />
        <circle cx="9.5" cy="12" r="0.8" fill="#fff" />
        <circle cx="14.5" cy="12" r="0.8" fill="#fff" />
        <path d="M12 14v1.5" />
      </svg>
    );
  if (id === "cat")
    return (
      <svg {...common}>
        <path d={ICONS.cat} />
        <circle cx="9.5" cy="13" r="0.8" fill="#fff" />
        <circle cx="14.5" cy="13" r="0.8" fill="#fff" />
      </svg>
    );
  if (id === "rabbit")
    return (
      <svg {...common}>
        <path d="M9 9c-1-3-1-6 .5-7 1 1.5 1.2 4 1 6" />
        <path d="M15 9c1-3 1-6-.5-7-1 1.5-1.2 4-1 6" />
        <ellipse cx="12" cy="15" rx="6" ry="5.5" />
        <circle cx="10" cy="14" r="0.7" fill="#fff" />
        <circle cx="14" cy="14" r="0.7" fill="#fff" />
      </svg>
    );
  if (id === "birds")
    return (
      <svg {...common}>
        <path d={ICONS.birds} />
        <circle cx="14" cy="9" r="0.6" fill="#fff" />
      </svg>
    );
  if (id === "fish")
    return (
      <svg {...common}>
        <path d={ICONS.fish} />
        <path d="M17 10l3-2v8l-3-2" />
        <circle cx="8" cy="11" r="0.6" fill="#fff" />
      </svg>
    );
  if (id === "rodents")
    return (
      <svg {...common}>
        <ellipse cx="11" cy="14" rx="7" ry="5.5" />
        <path d="M17 12c1.5-1.5 3.5-1.5 4-.5s-.5 2.5-2.5 3" />
        <circle cx="8.5" cy="13" r="0.6" fill="#fff" />
        <path d="M6 10.5c-.8-1-1-2.3-.5-3" />
      </svg>
    );
  if (id === "accessories")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.6" />
        <path d={ICONS.accessories} />
      </svg>
    );
  return (
    <svg {...common}>
      <path d={ICONS.health} />
      <path d="M9 12h2l1-2 1 4 1-2h1.5" />
    </svg>
  );
}
