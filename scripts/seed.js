// Seed a few projects via the public API so data flows through auth and validations
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

let API_BASE = process.env.API_BASE || 'http://localhost:' + (process.env.PORT || 3000) + '/api';
console.log('Seeder API_BASE =', API_BASE);

const SEED_USER = {
  name: process.env.SEED_NAME || 'Seed User',
  email: process.env.SEED_EMAIL || 'seed@example.com',
  password: process.env.SEED_PASSWORD || 'SeedPass123!'
};

async function ensureHealthyApi() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check status ${res.status}`);
    return true;
  } catch (e) {
    // Fallback to 127.0.0.1 if using localhost
    if (API_BASE.includes('localhost')) {
      const alt = API_BASE.replace('localhost', '127.0.0.1');
      console.warn('Health check failed on localhost, retrying with', alt, '-', e.message);
      try {
        const res2 = await fetch(`${alt}/health`);
        if (res2.ok) {
          API_BASE = alt;
          console.log('Using fallback API_BASE =', API_BASE);
          return true;
        }
      } catch (e2) {
        throw new Error(`Health check failed on both localhost and 127.0.0.1: ${e2.message}`);
      }
    }
    throw e;
  }
}

async function ensureUserAndLogin() {
  // Try login first
  let token = null;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: SEED_USER.email, password: SEED_USER.password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      console.log('Logged in as existing seed user');
      return token;
    }
  } catch (err) {
    console.warn('Login attempt failed (may be first run):', err.message);
  }

  // If login failed, register
  const reg = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(SEED_USER)
  });
  const regData = await reg.json();
  if (!reg.ok) {
    throw new Error(`Register failed: ${reg.status} ${regData.error || ''}`);
  }
  console.log('Registered new seed user');
  return regData.token;
}

async function postProject(token, project) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Project failed: ${res.status} ${data.error || JSON.stringify(data)}`);
  }
  return data;
}

(async () => {
  try {
    const file = path.join(__dirname, '..', 'data', 'projects.seed.json');
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));

    console.log(`Loaded ${payload.length} seed projects.`);
    await ensureHealthyApi();
    const token = await ensureUserAndLogin();

    for (const p of payload) {
      try {
        const created = await postProject(token, p);
        console.log('Created:', created.title, created._id || created.id);
      } catch (err) {
        console.error('Failed to create project', p.title, '-', err.message);
        if (err.stack) console.error(err.stack);
      }
    }

    console.log('Seeding complete. Check /api/projects');
  } catch (err) {
    console.error('Seed error:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
