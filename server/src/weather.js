// Génération de données météo simulées (prévisions 10 jours) cohérentes par région
const { CLIMATE } = require('./prediction');

const REGIONS = {
  'Centre': { t: 24, rain: 1500 },
  'Littoral': { t: 26, rain: 3200 },
  'Ouest': { t: 21, rain: 1800 },
  'Nord': { t: 28, rain: 900 },
  'Extrême-Nord': { t: 29, rain: 700 }
};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function forecast(region, days = 10) {
  const base = REGIONS[region] || REGIONS['Centre'];
  const now = new Date();
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const r = hash(region + '-' + d.toISOString().slice(0, 10));
    const r2 = hash(region + '-' + d.toISOString().slice(0, 10) + 'x');
    const tMin = base.t - 6 + r * 8;
    const tMax = base.t + 3 + r2 * 8;
    const precip = Math.max(0, Math.round((base.rain / 365) * (0.3 + r * 6) * 10) / 10);
    out.push({
      date: d.toISOString().slice(0, 10),
      day: DAY_NAMES[d.getDay()],
      temp_min: Math.round(tMin * 10) / 10,
      temp_max: Math.round(tMax * 10) / 10,
      temp_avg: Math.round(((tMin + tMax) / 2) * 10) / 10,
      precipitation: precip,
      humidity: Math.round(50 + r2 * 45),
      wind: Math.round(3 + r * 12),
      uv: Math.round(3 + r2 * 7),
      risk_frost: tMin < 5 ? 'élevé' : 'faible',
      icon: precip > 8 ? 'pluie' : precip > 1 ? 'averse' : r2 > 0.7 ? 'nuageux' : 'ensoleillé'
    });
  }
  return out;
}

module.exports = { forecast };
