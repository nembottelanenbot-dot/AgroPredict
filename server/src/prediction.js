// Moteur de prévision de rendement (simulation déterministe basée sur le contexte agronomique)
// Reproduit le comportement d'un modèle ML hybride (XGBoost / Random Forest / LSTM).

const CROPS = {
  'Maïs': { unit: 't/ha', base: 3.6, group: 'Céréales' },
  'Riz': { unit: 't/ha', base: 4.2, group: 'Céréales' },
  'Sorgho': { unit: 't/ha', base: 1.8, group: 'Céréales' },
  'Mil': { unit: 't/ha', base: 1.2, group: 'Céréales' },
  'Manioc': { unit: 't/ha', base: 12.0, group: 'Tubercules' },
  'Igname': { unit: 't/ha', base: 8.0, group: 'Tubercules' },
  'Patate douce': { unit: 't/ha', base: 6.5, group: 'Tubercules' },
  'Arachide': { unit: 't/ha', base: 1.5, group: 'Légumineuses' },
  'Haricot': { unit: 't/ha', base: 1.2, group: 'Légumineuses' },
  'Niébé': { unit: 't/ha', base: 0.9, group: 'Légumineuses' },
  'Cacao': { unit: 't/ha', base: 0.7, group: 'Cultures de rente' },
  'Café': { unit: 't/ha', base: 0.8, group: 'Cultures de rente' },
  'Coton': { unit: 't/ha', base: 1.1, group: 'Cultures de rente' },
  'Tomate': { unit: 't/ha', base: 22.0, group: 'Maraîchage' },
  'Oignon': { unit: 't/ha', base: 26.0, group: 'Maraîchage' },
  'Poivron': { unit: 't/ha', base: 18.0, group: 'Maraîchage' }
};

// Climat de référence par région (temp moyenne annuelle °C, pluviométrie annuelle mm)
const CLIMATE = {
  'Centre': { t: 24, rain: 1500 },
  'Littoral': { t: 26, rain: 3200 },
  'Ouest': { t: 21, rain: 1800 },
  'Nord': { t: 28, rain: 900 },
  'Extrême-Nord': { t: 29, rain: 700 }
};

// Sols : multiplicateur de fertilité
const SOILS = {
  'Ferrallitique': 1.0,
  'Volcanique': 1.18,
  'Vertisol': 1.08,
  'Sableux': 0.82,
  'Hydromorphe': 0.95,
  'Argileux': 1.05
};

// Hash déterministe simple pour des valeurs stables entre appels
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

function seededNoise(seed) {
  // bruit pseudo-aléatoire centré réduit via transformée de Box-Muller
  const u1 = hash(seed + 'a');
  const u2 = hash(seed + 'b');
  const z = Math.sqrt(-2 * Math.log(u1 || 1e-9)) * Math.cos(2 * Math.PI * u2);
  return z;
}

function stageFactor(stage) {
  const map = { semis: 0.3, levée: 0.5, floraison: 0.8, maturation: 1.0, récolte: 1.0 };
  return map[stage] || 0.7;
}

function predict(crop, parcel, region, now = new Date()) {
  const spec = CROPS[crop.crop_type] || CROPS['Maïs'];
  const climate = CLIMATE[region] || CLIMATE['Centre'];
  const soilMult = SOILS[parcel.soil_type] || 1.0;

  const seed = `${crop.crop_type}-${crop.variety}-${region}-${parcel.soil_type}`;
  const noise = seededNoise(seed) * 0.14; // incertitude intrinsèque

  // Facteurs explicatifs
  const fWeather = 1 + seededNoise(seed + 'w') * 0.08; // contribution météo
  const fSoil = soilMult;
  const fNdvi = 1 + seededNoise(seed + 'n') * 0.05; // santé végétation (NDVI)
  const fPractice = crop.status === 'en_cours' ? 1 + seededNoise(seed + 'p') * 0.04 : 0.95;

  const baseYield = spec.base;
  const med = baseYield * fWeather * fSoil * fNdvi * fPractice * (1 + noise);

  // Scénarios (déciles) et intervalles de confiance
  const cv = 0.12; // coefficient de variation
  const opt = med * (1 + 0.42 * cv);
  const pes = med * (1 - 0.42 * cv);
  const ci80 = 0.84 * cv; // ~1.28 sigma -> 80%
  const ci95 = 1.96 * cv;

  const round2 = (n) => Math.round(n * 100) / 100;

  const horizons = [30, 60, 90];
  const predictions = horizons.map((h, idx) => {
    const certainty = 1 - (h / 100) * 0.5 - idx * 0.05; // plus on prédit loin, plus c'est incertain
    const hcv = cv * (1 + h / 60);
    return {
      horizon_days: h,
      horizon_label: `J+${h}`,
      yield_med: round2(med * certainty),
      yield_min: round2(med * certainty * (1 - hcv)),
      yield_max: round2(med * certainty * (1 + hcv)),
      confidence_80_low: round2(med * certainty * (1 - ci80 * (1 + h / 80))),
      confidence_80_high: round2(med * certainty * (1 + ci80 * (1 + h / 80))),
      confidence_95_low: round2(med * certainty * (1 - ci95 * (1 + h / 80))),
      confidence_95_high: round2(med * certainty * (1 + ci95 * (1 + h / 80))),
      scenario_opt: round2(opt * certainty),
      scenario_med: round2(med * certainty),
      scenario_pes: round2(pes * certainty)
    };
  });

  const factors = {};
  factors['Météo (précipitations & températures)'] = Math.round((fWeather - 1) * 100);
  factors['Qualité du sol (' + (parcel.soil_type || 'standard') + ')'] = Math.round((fSoil - 1) * 100);
  factors['Santé de la végétation (NDVI)'] = Math.round((fNdvi - 1) * 100);
  factors['Pratiques culturales'] = Math.round((fPractice - 1) * 100);

  const best = Object.entries(factors).sort((a, b) => a[1] - b[1])[0];
  const recommendations = buildRecommendations(best[0], region, crop.crop_type, parcel.irrigation);

  return {
    crop_id: crop.id,
    crop_type: crop.crop_type,
    unit: spec.unit,
    group: spec.group,
    stage: crop.stage,
    predicted_at: now.toISOString(),
    yield_med: round2(med),
    confidence_80: { low: round2(med * (1 - ci80)), high: round2(med * (1 + ci80)) },
    confidence_95: { low: round2(med * (1 - ci95)), high: round2(med * (1 + ci95)) },
    scenarios: { optimiste: round2(opt), median: round2(med), pessimiste: round2(pes) },
    predictions,
    factors,
    recommendation: recommendations,
    historical: historicalComparison(crop.crop_type, region),
    mape: 9 + Math.abs(seededNoise(seed + 'm')) * 5
  };
}

function buildRecommendations(weakestFactor, region, cropType, irrigation) {
  const list = [];
  if (weakestFactor.includes('Météo')) {
    list.push('Sécuriser l\'accès à l\'eau : prévoir une irrigation d\'appoint pendant les périodes critiques (floraison).');
  }
  if (weakestFactor.includes('sol')) {
    list.push('Amender le sol : apport de matière organique (compost, fumure) et correction du pH si nécessaire.');
  }
  if (weakestFactor.includes('NDVI') || weakestFactor.includes('végétation')) {
    list.push('Inspecter la parcelle pour détecter un stress hydrique, une carence ou une attaque de ravageurs.');
  }
  if (weakestFactor.includes('pratiques')) {
    list.push('Optimiser les pratiques : respecter les dates de semis recommandées et la densité de plantation.');
  }
  if (irrigation === 'pluvial') {
    list.push('Envisager une micro-irrigation (goutte-à-goutte) pour réduire la dépendance aux pluies.');
  }
  return list;
}

function historicalComparison(cropType, region) {
  const spec = CROPS[cropType] || CROPS['Maïs'];
  const r = hash(cropType + region);
  return {
    local_avg: Math.round(spec.base * (0.85 + r * 0.3) * 100) / 100,
    national_ref: spec.base,
    last_campaign: Math.round(spec.base * (0.8 + r * 0.4) * 100) / 100
  };
}

module.exports = { predict, CROPS, CLIMATE, SOILS, historicalComparison };
