const bcrypt = require('bcryptjs');
const { db, init } = require('./db');

const REGIONS = ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord'];

const CROPS = [
  { type: 'Maïs', unit: 't/ha', base: 3.6, group: 'Céréales' },
  { type: 'Riz', unit: 't/ha', base: 4.2, group: 'Céréales' },
  { type: 'Sorgho', unit: 't/ha', base: 1.8, group: 'Céréales' },
  { type: 'Mil', unit: 't/ha', base: 1.2, group: 'Céréales' },
  { type: 'Manioc', unit: 't/ha', base: 12.0, group: 'Tubercules' },
  { type: 'Igname', unit: 't/ha', base: 8.0, group: 'Tubercules' },
  { type: 'Patate douce', unit: 't/ha', base: 6.5, group: 'Tubercules' },
  { type: 'Arachide', unit: 't/ha', base: 1.5, group: 'Légumineuses' },
  { type: 'Haricot', unit: 't/ha', base: 1.2, group: 'Légumineuses' },
  { type: 'Niébé', unit: 't/ha', base: 0.9, group: 'Légumineuses' },
  { type: 'Cacao', unit: 't/ha', base: 0.7, group: 'Cultures de rente' },
  { type: 'Café', unit: 't/ha', base: 0.8, group: 'Cultures de rente' },
  { type: 'Coton', unit: 't/ha', base: 1.1, group: 'Cultures de rente' },
  { type: 'Tomate', unit: 't/ha', base: 22.0, group: 'Maraîchage' },
  { type: 'Oignon', unit: 't/ha', base: 26.0, group: 'Maraîchage' },
  { type: 'Poivron', unit: 't/ha', base: 18.0, group: 'Maraîchage' }
];

function seed() {
  init();
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) {
    console.log('Base déjà initialisée — seed ignoré.');
    return;
  }

  const hash = (pwd) => bcrypt.hashSync(pwd, 10);
  const DEMO = 'Demo@2026';

  // Coopératives
  const insertCoop = db.prepare('INSERT INTO cooperatives (name, region) VALUES (?, ?)');
  const coop1 = insertCoop.run('COOPROMA — Coopérative des producteurs de maïs du Centre', 'Centre').lastInsertRowid;
  const coop2 = insertCoop.run('Coopérative Cotonnière du Nord', 'Nord').lastInsertRowid;

  // Utilisateurs
  const insertUser = db.prepare(
    `INSERT INTO users (name, email, phone, password_hash, role, region, cooperative_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const users = [
    ['Jean-Paul Mbarga', 'admin@agropredict.cm', '+237 699 000 001', 'super_admin', null, null],
    ['Solange Nkeng', 'solange.nkeng@agropredict.cm', '+237 699 000 002', 'agriculteur', 'Centre', coop1],
    ['Pierre Wankam', 'pierre.wankam@agropredict.cm', '+237 699 000 003', 'agriculteur', 'Littoral', null],
    ['Aïcha Ousmanou', 'aicha.ousmanou@agropredict.cm', '+237 699 000 004', 'agriculteur', 'Nord', coop2],
    ['Maurice Tchoua', 'maurice.tchoua@agropredict.cm', '+237 699 000 005', 'chef_cooperative', 'Centre', coop1],
    ['Fatimatou Hamadou', 'fatimatou.hamadou@agropredict.cm', '+237 699 000 006', 'agent_terrain', 'Extrême-Nord', null],
    ['Cédric Nganou', 'cedric.nganou@agropredict.cm', '+237 699 000 007', 'analyste', null, null],
    ['Berthe Kamga', 'berthe.kamga@agropredict.cm', '+237 699 000 008', 'admin_regional', 'Centre', null]
  ];
  const userIds = {};
  users.forEach((u) => {
    const r = insertUser.run(u[0], u[1], u[2], hash(DEMO), u[3], u[4], u[5]);
    userIds[u[3]] = r.lastInsertRowid;
  });

  db.prepare('UPDATE cooperatives SET admin_user_id = ? WHERE id = ?').run(userIds['chef_cooperative'], coop1);

  // Parcelles (géolocalisation approximative des régions du Cameroun)
  const insertParcel = db.prepare(
    `INSERT INTO parcels (user_id, name, lat, lon, area_ha, soil_type, irrigation, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const parcels = [
    // Solange (Centre) — Maïs, Manioc, Cacao
    [userIds['agriculteur'], 'Champ de Nkolbisson', 3.86, 11.50, 2.5, 'Ferrallitique', 'pluvial', 'Centre'],
    [userIds['agriculteur'], 'Parcelle Cacao — Mbalmayo', 3.51, 11.50, 4.0, 'Ferrallitique', 'pluvial', 'Centre'],
    // Pierre (Littoral) — Manioc, Maïs
    [userIds['agriculteur'], 'Plantation de Bonabéri', 4.08, 9.68, 3.2, 'Volcanique', 'pluvial', 'Littoral'],
    // Aïcha (Nord) — Coton, Sorgho, Arachide
    [userIds['agriculteur'], 'Champ de coton — Garoua', 9.30, 13.39, 6.0, 'Vertisol', 'pluvial', 'Nord'],
    [userIds['agriculteur'], 'Sorgho — Pitoa', 9.38, 13.50, 3.5, 'Vertisol', 'irrigué', 'Nord'],
    // Coopérative Centre — membres supplémentaires (Maurice)
    [userIds['chef_cooperative'], 'Champ collectif — Soa', 3.98, 11.60, 5.0, 'Ferrallitique', 'pluvial', 'Centre'],
    [userIds['chef_cooperative'], 'Maïs — Obala', 4.17, 11.53, 2.8, 'Ferrallitique', 'pluvial', 'Centre'],
    // Agent terrain (Extrême-Nord) — Mil, Niébé
    [userIds['agent_terrain'], 'Mil — Maroua', 10.59, 14.32, 4.5, 'Sableux', 'pluvial', 'Extrême-Nord'],
    [userIds['agent_terrain'], 'Niébé — Mokolo', 10.74, 13.80, 2.0, 'Sableux', 'pluvial', 'Extrême-Nord'],
    // Ouest (admin régional) — Haricot, Café
    [userIds['admin_regional'], 'Haricot — Bafoussam', 5.48, 10.42, 1.8, 'Volcanique', 'pluvial', 'Ouest'],
    [userIds['admin_regional'], 'Café — Dschang', 5.45, 10.05, 3.0, 'Volcanique', 'pluvial', 'Ouest']
  ];
  const parcelIds = parcels.map((p) => insertParcel.run(...p).lastInsertRowid);

  // Cultures par parcelle
  const insertCrop = db.prepare(
    `INSERT INTO crops (parcel_id, crop_type, variety, sowing_date, stage, status) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const today = new Date();
  const daysAgo = (n) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);
  const cropSeeds = [
    [parcelIds[0], 'Maïs', 'CMS 9015', daysAgo(75), 'maturation', 'en_cours'],
    [parcelIds[0], 'Manioc', 'TMS 92/0326', daysAgo(160), 'maturation', 'en_cours'],
    [parcelIds[1], 'Cacao', 'Forastero', daysAgo(400), 'floraison', 'en_cours'],
    [parcelIds[2], 'Manioc', '8034', daysAgo(120), 'maturation', 'en_cours'],
    [parcelIds[3], 'Coton', 'IRMA L484', daysAgo(90), 'floraison', 'en_cours'],
    [parcelIds[4], 'Sorgho', 'S35', daysAgo(70), 'maturation', 'en_cours'],
    [parcelIds[5], 'Maïs', 'CMS 8704', daysAgo(65), 'floraison', 'en_cours'],
    [parcelIds[6], 'Maïs', 'ATP', daysAgo(80), 'maturation', 'en_cours'],
    [parcelIds[7], 'Mil', 'HKP', daysAgo(55), 'levée', 'en_cours'],
    [parcelIds[8], 'Niébé', 'IT89KD', daysAgo(60), 'floraison', 'en_cours'],
    [parcelIds[9], 'Haricot', 'MAC 55', daysAgo(50), 'floraison', 'en_cours'],
    [parcelIds[10], 'Café', 'Arabica', daysAgo(300), 'floraison', 'en_cours']
  ];
  const cropIds = cropSeeds.map((c) => insertCrop.run(...c).lastInsertRowid);

  // Alertes
  const insertAlert = db.prepare(
    `INSERT INTO alerts (user_id, parcel_id, type, severity, message, recommendation, status) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  insertAlert.run(userIds['agriculteur'], parcelIds[0], 'sécheresse', 'critique', 'Précipitations < 20 % de la normale sur 15 jours prévues sur votre région.', 'Irriguer de façon ciblée et pailler le sol pour limiter l\'évaporation.', 'active');
  insertAlert.run(userIds['agriculteur'], parcelIds[0], 'anomalie_ndvi', 'haute', 'Baisse du NDVI de 22 % détectée en 2 semaines sur la parcelle Champ de Nkolbisson.', 'Vérifier l\'état hydrique et détecter un éventuel stress ou une maladie.', 'active');
  insertAlert.run(userIds['agriculteur'], parcelIds[1], 'phytosanitaire', 'haute', 'Conditions favorables à la pourriture brune des cabosses de cacao.', 'Appliquer un traitement fongicide à base de cuivre dans les 48h.', 'active');
  insertAlert.run(userIds['agriculteur'], parcelIds[4], 'rappel', 'basse', 'Rappel : épandage d\'engrais NPK prévu sur Sorgho — Pitoa dans 2 jours.', 'Préparer les intrants et le matériel.', 'active');
  insertAlert.run(userIds['chef_cooperative'], parcelIds[5], 'maj_prevision', 'moyenne', 'Révision de +16 % du rendement prévu sur Champ collectif — Soa.', 'Consulter la prévision mise à jour.', 'active');
  insertAlert.run(userIds['agriculteur'], parcelIds[3], 'excès_pluvio', 'critique', 'Précipitations > 200 % de la normale sur 7 jours prévues à Bonabéri.', 'Prévoir le drainage des parcelles basses.', 'active');

  // Modèles ML
  const insertModel = db.prepare(
    `INSERT INTO ml_models (crop_type, algorithm, version, mape, rmse, r2, is_active, trained_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  [
    ['Maïs', 'XGBoost', 'v2.4.1', 9.8, 0.34, 0.84, 1],
    ['Riz', 'XGBoost', 'v2.3.0', 11.2, 0.41, 0.81, 1],
    ['Sorgho', 'Random Forest', 'v1.9.2', 10.5, 0.22, 0.79, 1],
    ['Mil', 'Random Forest', 'v1.8.0', 12.1, 0.18, 0.76, 1],
    ['Manioc', 'XGBoost', 'v2.2.1', 9.1, 1.10, 0.86, 1],
    ['Cacao', 'LSTM', 'v1.4.0', 8.7, 0.06, 0.88, 1],
    ['Coton', 'XGBoost', 'v2.1.0', 10.9, 0.13, 0.80, 1],
    ['Café', 'LSTM', 'v1.3.1', 9.4, 0.08, 0.83, 1],
    ['Haricot', 'Random Forest', 'v1.7.0', 11.8, 0.15, 0.77, 1]
  ].forEach((m) => insertModel.run(m[0], m[1], m[2], m[3], m[4], m[5], m[6], daysAgo(20)));

  // Événements culturaux
  const insertEvent = db.prepare(
    `INSERT INTO crop_events (crop_id, event_type, event_date, notes) VALUES (?, ?, ?, ?)`
  );
  insertEvent.run(cropIds[0], 'semis', daysAgo(75), 'Semis en ligne, densité 53 000 plants/ha');
  insertEvent.run(cropIds[0], 'fertilisation', daysAgo(45), 'NPK 15-15-15 (150 kg/ha)');
  insertEvent.run(cropIds[0], 'traitement', daysAgo(20), 'Traitement insecticide (chenille légionnaire)');
  insertEvent.run(cropIds[4], 'semis', daysAgo(70), 'Semis direct');
  insertEvent.run(cropIds[4], 'irrigation', daysAgo(10), 'Irrigation d\'appoint 30 mm');

  // Rapports de démo
  const insertReport = db.prepare(
    `INSERT INTO reports (user_id, type, format) VALUES (?, ?, ?)`
  );
  insertReport.run(userIds['agriculteur'], 'Rapport individuel de campagne', 'PDF');
  insertReport.run(userIds['chef_cooperative'], 'Rapport coopérative mensuel', 'PDF');
  insertReport.run(userIds['analyste'], 'Rapport national de suivi', 'PDF');

  console.log('Base initialisée avec données de démonstration.');
  console.log('Comptes de démo (mot de passe : Demo@2026) :');
  users.forEach((u) => console.log(`  - ${u[3]} : ${u[1]}`));
}

seed();
