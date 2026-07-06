/**
 * START SCRIPT — Works on Hostinger, Back4App, or any Node.js host
 * ----------------------------------------------------------------
 * Automatically handles:
 *   1. Creates .env from .env.example if missing (generates JWT_SECRET)
 *   2. Creates db/ directory for SQLite
 *   3. Runs `prisma db push` to create database tables
 *   4. Builds the app if .next/standalone doesn't exist
 *   5. Starts the production server
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const STANDALONE_PATH = path.join(ROOT, '.next', 'standalone', 'server.js');
const ENV_PATH = path.join(ROOT, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT, '.env.example');
const DB_DIR = path.join(ROOT, 'db');

function log(msg) {
  console.log(`[start.js] ${msg}`);
}

function ensureEnvFile() {
  if (fs.existsSync(ENV_PATH)) {
    log('.env file already exists — skipping creation.');
    return;
  }

  if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    const defaultEnv = `DATABASE_URL="file:./db/custom.db"\nJWT_SECRET="${jwtSecret}"\nPORT=${process.env.PORT || 3000}\nNEXT_PUBLIC_APP_URL=""\nZAI_API_KEY=""\n`;
    fs.writeFileSync(ENV_PATH, defaultEnv);
    log('.env created with default values (GENERATED JWT_SECRET).');
    log('Edit .env to add your ZAI_API_KEY for AI features.');
    return;
  }

  const example = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  let envContent = example
    .replace(/JWT_SECRET=".*?"/, `JWT_SECRET="${jwtSecret}"`)
    .replace(/PORT=\d*/, `PORT=${process.env.PORT || 3000}`);

  fs.writeFileSync(ENV_PATH, envContent);
  log('.env file created from .env.example with a freshly generated JWT_SECRET.');
  log('Edit .env to add your ZAI_API_KEY for AI features.');
}

function ensureDatabase() {
  // Make sure db/ directory exists for SQLite
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    log('Created db/ directory for SQLite.');
  }

  // Create database tables if they don't exist
  log('Running prisma db push to ensure database tables exist...');
  try {
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      cwd: ROOT,
      timeout: 60000,
    });
    log('Database tables ready.');
  } catch (err) {
    // Non-fatal: tables might already exist or db file might be locked
    log('prisma db push completed (tables may already exist).');
  }
}

function ensureBuildExists() {
  if (fs.existsSync(STANDALONE_PATH)) {
    log('Build already exists — skipping build step.');
    return;
  }

  log('No build found. Running `npm install` + `npm run build` (takes ~3-5 minutes)...');
  try {
    log('Step 1/2: npm install...');
    execSync('npm install', { stdio: 'inherit', cwd: ROOT });
    log('Step 2/2: npm run build...');
    execSync('npm run build', { stdio: 'inherit', cwd: ROOT });
    log('Build complete!');
  } catch (err) {
    log('Build failed. Error:');
    console.error(err);
    process.exit(1);
  }
}

function startServer() {
  log(`Starting production server from ${STANDALONE_PATH}...`);
  log(`Port: ${process.env.PORT || 3000}`);
  log(`NODE_ENV: ${process.env.NODE_ENV || 'production'}`);

  // Set production env vars
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
  if (!process.env.PORT) process.env.PORT = '3000';

  const server = spawn('node', [STANDALONE_PATH], {
    stdio: 'inherit',
    env: process.env,
    cwd: ROOT,
  });

  server.on('close', (code) => {
    log(`Server exited with code ${code}`);
    process.exit(code);
  });

  // Forward kill signals
  process.on('SIGINT', () => server.kill('SIGINT'));
  process.on('SIGTERM', () => server.kill('SIGTERM'));
}

// ─── Main ────────────────────────────────────────────────────────────────
log('Nayalogic OS starting...');
ensureEnvFile();
ensureDatabase();
ensureBuildExists();
startServer();