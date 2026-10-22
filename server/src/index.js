const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { db, init } = require('./db');
const { sign, authenticate, requireRole } = require('./auth');
const { predict, CROPS } = require('./prediction');
const { forecast } = require('./weather');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

init();

const ROLES = ['agriculteur', 'chef_cooperative', 'agent_terrain', 'analyste', 'admin_regional', 'super_admin'];
const REGIONS = ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord'];

// ---------- AUTH ----------
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role, region } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Nom, email et mot de passe requis.' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
  }
  const finalRole = (role && ROLES.includes(role) && role !== 'super_admin') ? role : 'agriculteur';
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    'INSERT INTO users (name, email, phone, password_hash, role, region) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, email, phone || null, hash, finalRole, region || null);
  const user = db.prepare('SELECT id, name, email, phone, role, region FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.json({ token: sign(user), user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email || '');
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }
  if (!user.active) return res.status(403).json({ error: 'Compte désactivé.' });
  const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, region: user.region, cooperative_id: user.cooperative_id };
  res.json({ token: sign(safe), user: safe });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ---------- USERS / ADMIN ----------
app.get('/api/users', authenticate, requireRole('analyste'), (req, res) => {
  const users = db.prepare('SELECT id, name, email, phone, role, region, active, created_at FROM users ORDER BY id').all();
  res.json(users);
});

app.patch('/api/users/:id', authenticate, requireRole('admin_regional'), (req, res) => {
  const { role, active, region } = req.body || {};
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  if (target.role === 'super_admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Impossible de modifier un Super Administrateur.' });
  }
  const newRole = role && ROLES.includes(role) ? role : target.role;
  const newActive = active === undefined ? target.active : (active ? 1 : 0);
  const newRegion = region !== undefined ? region : target.region;
  db.prepare('UPDATE users SET role = ?, active = ?, region = ? WHERE id = ?').run(newRole, newActive, newRegion, target.id);
  res.json({ ok: true });
});

// ---------- PARCELLES ----------
function visibleParcels(user) {
  if (['analyste', 'admin_regional', 'super_admin'].includes(user.role)) {
    return db.prepare('SELECT * FROM parcels').all();
  }
  if (user.role === 'chef_cooperative' && user.cooperative_id) {
    return db.prepare(
      `SELECT p.* FROM parcels p JOIN users u ON u.id = p.user_id WHERE u.cooperative_id = ?`,
    ).all(user.cooperative_id);
  }
  return db.prepare('SELECT * FROM parcels WHERE user_id = ?').all(user.id);
}

app.get('/api/parcels', authenticate, (req, res) => {
  const parcels = visibleParcels(req.user).map(withCropSummary);
  res.json(parcels);
});

function withCropSummary(p) {
  const crops = db.prepare('SELECT * FROM crops WHERE parcel_id = ?').all(p.id);
  return { ...p, crops };
}

app.get('/api/parcels/:id', authenticate, (req, res) => {
  const p = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Parcelle introuvable.' });
  const owner = db.prepare('SELECT * FROM users WHERE id = ?').get(p.user_id);
  res.json({ ...withCropSummary(p), owner_name: owner ? owner.name : null });
});

app.post('/api/parcels', authenticate, (req, res) => {
  const { name, lat, lon, area_ha, soil_type, irrigation, region } = req.body || {};
  if (!name || !lat || !lon || !area_ha) return res.status(400).json({ error: 'Nom, coordonnées et superficie requis.' });
  const info = db.prepare(
    'INSERT INTO parcels (user_id, name, lat, lon, area_ha, soil_type, irrigation, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, name, lat, lon, area_ha, soil_type || 'Ferrallitique', irrigation || 'pluvial', region || req.user.region || 'Centre');
  res.json(db.prepare('SELECT * FROM parcels WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/parcels/:id', authenticate, (req, res) => {
  const p = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Parcelle introuvable.' });
  if (p.user_id !== req.user.id && !['analyste', 'admin_regional', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé.' });
  }
  const { name, lat, lon, area_ha, soil_type, irrigation, region } = req.body || {};
  db.prepare(
    'UPDATE parcels SET name = ?, lat = ?, lon = ?, area_ha = ?, soil_type = ?, irrigation = ?, region = ? WHERE id = ?'
  ).run(name ?? p.name, lat ?? p.lat, lon ?? p.lon, area_ha ?? p.area_ha, soil_type ?? p.soil_type, irrigation ?? p.irrigation, region ?? p.region, p.id);
  res.json(db.prepare('SELECT * FROM parcels WHERE id = ?').get(p.id));
});

app.delete('/api/parcels/:id', authenticate, (req, res) => {
  const p = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Parcelle introuvable.' });
  if (p.user_id !== req.user.id && req.user.role !== 'super_admin') return res.status(403).json({ error: 'Accès refusé.' });
  db.prepare('DELETE FROM crops WHERE parcel_id = ?').run(p.id);
  db.prepare('DELETE FROM parcels WHERE id = ?').run(p.id);
  res.json({ ok: true });
});

// ---------- CULTURES ----------
app.post('/api/parcels/:id/crops', authenticate, (req, res) => {
  const p = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Parcelle introuvable.' });
  if (p.user_id !== req.user.id && !['analyste', 'admin_regional', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé.' });
  }
  const { crop_type, variety, sowing_date, stage } = req.body || {};
  if (!crop_type) return res.status(400).json({ error: 'Type de culture requis.' });
  const info = db.prepare(
    'INSERT INTO crops (parcel_id, crop_type, variety, sowing_date, stage, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(p.id, crop_type, variety || '', sowing_date || null, stage || 'semis', 'en_cours');
  res.json(db.prepare('SELECT * FROM crops WHERE id = ?').get(info.lastInsertRowid));
});

// ---------- PREVISIONS ----------
app.get('/api/predictions/:cropId', authenticate, (req, res) => {
  const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(req.params.cropId);
  if (!crop) return res.status(404).json({ error: 'Culture introuvable.' });
  const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(crop.parcel_id);
  const result = predict(crop, parcel, parcel.region || 'Centre');
  res.json(result);
});

app.get('/api/predictions', authenticate, (req, res) => {
  const parcels = visibleParcels(req.user);
  const results = [];
  for (const p of parcels) {
    const crops = db.prepare('SELECT * FROM crops WHERE parcel_id = ?').all(p.id);
    for (const c of crops) {
      results.push({ parcel: p, ...predict(c, p, p.region || 'Centre') });
    }
  }
  res.json(results);
});

// ---------- METEO ----------
app.get('/api/weather/:region', authenticate, (req, res) => {
  const region = REGIONS.includes(req.params.region) ? req.params.region : 'Centre';
  res.json({ region, forecast: forecast(region, 10) });
});

// ---------- ALERTES ----------
app.get('/api/alerts', authenticate, (req, res) => {
  let alerts;
  if (['analyste', 'admin_regional', 'super_admin'].includes(req.user.role)) {
    alerts = db.prepare('SELECT a.*, p.name as parcel_name FROM alerts a LEFT JOIN parcels p ON p.id = a.parcel_id ORDER BY a.id DESC').all();
  } else {
    alerts = db.prepare('SELECT a.*, p.name as parcel_name FROM alerts a LEFT JOIN parcels p ON p.id = a.parcel_id WHERE a.user_id = ? ORDER BY a.id DESC').all(req.user.id);
  }
  res.json(alerts);
});

app.post('/api/alerts/:id/ack', authenticate, (req, res) => {
  const a = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Alerte introuvable.' });
  db.prepare('UPDATE alerts SET status = ? WHERE id = ?').run('acknowledged', a.id);
  res.json({ ok: true });
});

// ---------- RAPPORTS ----------
app.get('/api/reports', authenticate, (req, res) => {
  const reports = db.prepare('SELECT * FROM reports WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json(reports);
});

app.post('/api/reports/generate', authenticate, (req, res) => {
  const { type } = req.body || {};
  const info = db.prepare('INSERT INTO reports (user_id, type, format) VALUES (?, ?, ?)').run(
    req.user.id, type || 'Rapport individuel de campagne', 'PDF'
  );
  res.json(db.prepare('SELECT * FROM reports WHERE id = ?').get(info.lastInsertRowid));
});

// ---------- MODÈLES ML ----------
app.get('/api/models', authenticate, requireRole('analyste'), (req, res) => {
  res.json(db.prepare('SELECT * FROM ml_models ORDER BY crop_type').all());
});

// ---------- STATISTIQUES / TABLEAU DE BORD ----------
app.get('/api/stats/dashboard', authenticate, (req, res) => {
  const parcels = visibleParcels(req.user);
  const crops = [];
  for (const p of parcels) {
    for (const c of db.prepare('SELECT * FROM crops WHERE parcel_id = ?').all(p.id)) {
      crops.push({ parcel: p, crop: c });
    }
  }
  const activeAlerts = db.prepare('SELECT COUNT(*) AS c FROM alerts WHERE status = ? AND user_id = ?').get('active', req.user.id).c;
  const totalArea = parcels.reduce((s, p) => s + (p.area_ha || 0), 0);
  const totalProd = crops.reduce((s, x) => {
    const r = predict(x.crop, x.parcel, x.parcel.region || 'Centre');
    return s + r.yield_med * (x.parcel.area_ha || 0);
  }, 0);
  res.json({
    parcels_count: parcels.length,
    crops_count: crops.length,
    total_area: Math.round(totalArea * 10) / 10,
    active_alerts: activeAlerts,
    estimated_production: Math.round(totalProd),
    crops: crops.map((x) => ({
      parcel_name: x.parcel.name,
      region: x.parcel.region,
      crop_type: x.crop.crop_type,
      stage: x.crop.stage,
      area_ha: x.parcel.area_ha,
      ...predict(x.crop, x.parcel, x.parcel.region || 'Centre')
    }))
  });
});

app.get('/api/stats/national', authenticate, requireRole('analyste'), (req, res) => {
  const parcels = db.prepare('SELECT * FROM parcels').all();
  const byRegion = {};
  for (const r of REGIONS) {
    byRegion[r] = { region: r, parcels: 0, area: 0, crops: {}, production: 0, risk: 'faible' };
  }
  for (const p of parcels) {
    const r = p.region || 'Centre';
    if (!byRegion[r]) byRegion[r] = { region: r, parcels: 0, area: 0, crops: {}, production: 0, risk: 'faible' };
    byRegion[r].parcels += 1;
    byRegion[r].area += p.area_ha || 0;
    const crops = db.prepare('SELECT * FROM crops WHERE parcel_id = ?').all(p.id);
    for (const c of crops) {
      const pr = predict(c, p, r);
      byRegion[r].crops[c.crop_type] = (byRegion[r].crops[c.crop_type] || 0) + pr.yield_med * (p.area_ha || 0);
      byRegion[r].production += pr.yield_med * (p.area_ha || 0);
    }
  }
  res.json(Object.values(byRegion));
});

app.get('/api/meta', (req, res) => {
  res.json({ crops: Object.keys(CROPS), regions: REGIONS, roles: ROLES });
});

// ---------- STATIC (frontend build) ----------
const dist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AgroPredict API démarrée sur http://0.0.0.0:${PORT}`);
});
