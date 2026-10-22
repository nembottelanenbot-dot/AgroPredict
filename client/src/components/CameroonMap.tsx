// Carte schématique du Cameroun (5 régions pilotes) — SVG interactif sans dépendance externe.

export interface RegionValue {
  region: string;
  value: number;
  label?: string;
}

const REGIONS_GEO: Record<string, { points: string; label: [number, number] }> = {
  'Extrême-Nord': { points: '60,10 240,16 230,60 150,64 70,52', label: [150, 38] },
  'Nord': { points: '70,52 150,64 230,60 222,120 150,126 82,112', label: [150, 90] },
  'Ouest': { points: '55,160 110,160 105,215 58,205', label: [82, 186] },
  'Centre': { points: '110,160 205,165 218,235 150,250 105,215', label: [158, 206] },
  'Littoral': { points: '58,205 105,215 150,250 130,315 80,300 55,262', label: [100, 262] }
};

const REGION_COLORS = ['#2E7D32', '#66BB6A', '#FFB74D', '#FF8F00', '#C62828'];

function centroid(points: string): [number, number] {
  const arr = points.split(' ').map((p) => p.split(',').map(Number));
  const x = arr.reduce((s, p) => s + p[0], 0) / arr.length;
  const y = arr.reduce((s, p) => s + p[1], 0) / arr.length;
  return [x, y];
}

export default function CameroonMap({
  data,
  onSelect,
  selected
}: {
  data: RegionValue[];
  onSelect?: (region: string) => void;
  selected?: string | null;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  const colorFor = (region: string, value: number) => {
    const t = Math.min(1, value / max);
    if (t < 0.25) return REGION_COLORS[0];
    if (t < 0.5) return REGION_COLORS[1];
    if (t < 0.75) return REGION_COLORS[2];
    if (t < 0.95) return REGION_COLORS[3];
    return REGION_COLORS[4];
  };

  return (
    <svg viewBox="0 0 300 340" className="h-auto w-full">
      {/* fond océan / cadre */}
      <rect x="4" y="4" width="292" height="332" rx="16" fill="#F1F8E9" />

      {/* régions */}
      {Object.entries(REGIONS_GEO).map(([region, geo]) => {
        const d = data.find((x) => x.region === region);
        const value = d ? d.value : 0;
        const fill = d ? colorFor(region, value) : '#E5E7EB';
        const [cx, cy] = centroid(geo.points);
        const isSel = selected === region;
        return (
          <g
            key={region}
            onClick={() => onSelect?.(region)}
            className="cursor-pointer"
            opacity={d ? 1 : 0.35}
          >
            <polygon
              points={geo.points}
              fill={fill}
              stroke={isSel ? '#1B5E20' : '#fff'}
              strokeWidth={isSel ? 2.5 : 1.5}
              style={{ transition: 'opacity .15s' }}
              className="hover:opacity-80"
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#fff"
              style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 2 }}
            >
              {region}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="rgba(255,255,255,0.95)">
              {d ? d.label ?? Math.round(d.value).toLocaleString('fr-FR') : '—'}
            </text>
          </g>
        );
      })}

      {/* échelle */}
      <g transform="translate(16, 322)">
        {REGION_COLORS.map((c, i) => (
          <rect key={c} x={i * 36} y={0} width={34} height={8} rx={3} fill={c} />
        ))}
        <text x={0} y={20} fontSize="8" fill="#9ca3af">Faible</text>
        <text x={150} y={20} fontSize="8" fill="#9ca3af" textAnchor="middle">Production estimée</text>
        <text x={176} y={20} fontSize="8" fill="#9ca3af" textAnchor="end">Élevée</text>
      </g>
    </svg>
  );
}
