export function VetMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const pad = 0.012;
  const bbox = [lng - pad, lat - pad, lng + pad, lat + pad].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="overflow-hidden rounded-[24px] border bg-card">
      <iframe title={title} src={src} className="h-72 w-full" loading="lazy" />
      <a href={link} target="_blank" rel="noreferrer" className="block px-4 py-3 text-sm font-semibold text-primary">
        باز کردن موقعیت روی نقشه
      </a>
    </div>
  );
}
