const jwt = require('jsonwebtoken');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'agropredict-dev-secret-change-me';

const ROLES = ['agriculteur', 'chef_cooperative', 'agent_terrain', 'analyste', 'admin_regional', 'super_admin'];

const ROLE_RANK = {
  agriculteur: 1,
  chef_cooperative: 2,
  agent_terrain: 2,
  analyste: 3,
  admin_regional: 4,
  super_admin: 5
};

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentification requise.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, phone, role, region, cooperative_id, active FROM users WHERE id = ?').get(payload.id);
    if (!user || !user.active) return res.status(401).json({ error: 'Compte introuvable ou désactivé.' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expirée ou invalide.' });
  }
}

function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentification requise.' });
    if (ROLE_RANK[req.user.role] < ROLE_RANK[minRole]) {
      return res.status(403).json({ error: 'Accès refusé : permissions insuffisantes.' });
    }
    next();
  };
}

module.exports = { sign, authenticate, requireRole, ROLES, ROLE_RANK, JWT_SECRET };
