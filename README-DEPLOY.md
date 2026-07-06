# Nayalogic OS — Hostinger Deployment Guide

## What's This?

A ready-to-deploy Next.js app for Hostinger Node.js hosting. No SSH required — everything happens automatically when you start the app from hPanel.

---

## Quick Start (10 Steps, ~20 Minutes)

### Step 1: Create Subdomain in Hostinger
1. Log into hPanel → **Domains → Subdomains**
2. Subdomain: `app` (so URL becomes `app.nayalogic.com`)
3. Document Root: `app.nayalogic.com`
4. Click **Create**

### Step 2: Create Node.js App
1. hPanel → **Advanced → Node.js**
2. Click **Create Node.js App**
3. Configure:
   - **Domain**: `app.nayalogic.com`
   - **App Root**: `domains/app.nayalogic.com/public_html`
   - **Node.js version**: `20.x`
   - **App Mode**: `Production`
   - **Start Command**: `node start.js`
4. Click **Create**

### Step 3: Upload the Zip
1. hPanel → **Files → File Manager**
2. Navigate to `domains/app.nayalogic.com/public_html`
3. Delete all auto-generated sample files
4. Click **Upload** → select `nayalogic-hostinger.zip`
5. Right-click zip → **Extract** to current folder
6. Delete the zip file

### Step 4: Start the App
1. Back in hPanel → **Node.js** → your app
2. Click **Start** (or Restart)
3. Wait ~5 minutes (first start runs `npm install` + `next build` automatically)

### Step 5: Check Logs (if needed)
1. In Node.js panel → click **View Logs**
2. Wait until you see: `[start.js] Starting production server`
3. If errors, scroll up to find them

### Step 6: Get Your Z.AI API Key
1. Visit https://z.ai/ and sign up
2. Get your API key (needed for AI Assistant feature)
3. In File Manager → edit `.env` file in app root
4. Find `ZAI_API_KEY=""` → paste your key inside the quotes
5. Save the file
6. Restart the app in Node.js panel

### Step 7: Enable SSL (HTTPS)
1. hPanel → **Security → SSL**
2. Find `app.nayalogic.com`
3. Click **Install Free SSL** (Let's Encrypt)
4. Wait ~5 minutes
5. Enable **Force HTTPS** toggle

### Step 8: Open Your Site
Visit: `https://app.nayalogic.com`

You should see the login page.

### Step 9: Seed the Database (Only If Empty)
If you see the login page but can't log in, visit:
```
https://app.nayalogic.com/api/seed
```
This auto-seeds demo data (only works if DB is empty).

### Step 10: Login & Change Passwords

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nayalogic.com` | `Nayalogic@2026` |
| Employee | `rahul@nayalogic.com` | `Employee@2026` |
| Client | `techcorp@example.com` | `Client@2026` |

**Immediately after login:**
1. Go to Settings → Profile
2. Change password to something only you know
3. Do this for all 3 demo accounts

---

## Common Issues

### Issue: Site shows "502 Bad Gateway"
**Cause**: App is still building (first start takes ~5 min).
**Fix**: Wait 5 minutes, refresh. Check Node.js panel → Logs.

### Issue: Build failed in logs
**Cause**: Most likely missing files during upload.
**Fix**:
1. Stop the app in Node.js panel
2. Delete everything in `domains/app.nayalogic.com/public_html/`
3. Re-upload the zip, re-extract
4. Start the app again

### Issue: Login button doesn't work
**Cause**: Database might not be seeded.
**Fix**: Visit `https://app.nayalogic.com/api/seed` — should auto-create demo users.

### Issue: AI Assistant returns generic responses
**Cause**: Missing `ZAI_API_KEY` in `.env` file.
**Fix**: Edit `.env` file → add your key → restart app.

### Issue: Forgot admin password
**Fix**: Visit `https://app.nayalogic.com/api/seed` — will re-seed (only if DB is empty).
If DB has users, you'll need to manually edit DB or contact support.

---

## Where's My Data?

All your data lives in a single file:
```
/domains/app.nayalogic.com/public_html/db/custom.db
```

**To backup:**
1. File Manager → navigate to `db/` folder
2. Right-click `custom.db` → **Download**
3. Save it somewhere safe

**To restore:**
1. Stop the app
2. Upload your backup `custom.db` to `db/` folder (overwrite)
3. Start the app

---

## How Admin Panel Works

The app already includes 3 role-based dashboards:
- **Admin** — sees everything (employees, clients, projects, analytics, settings)
- **Employee** — sees only their tasks, attendance, messages
- **Client** — sees only their projects, invoices, messages

The app decides which dashboard to show based on the user's `role` field in the database.

**To add a new employee:**
1. Login as admin
2. Go to **Employees** in sidebar
3. Click **Add Employee**
4. Fill in name, email, password, designation
5. The new employee can now log in

**To add a new client:**
1. Login as admin
2. Go to **Clients** in sidebar
3. Click **Add Client**
4. Fill in name, email, password, company

**Or** clients can self-register via the Register page (they'll automatically get the CLIENT role).

---

## Security Notes

- ✅ Sessions use JWT tokens (survive server restarts)
- ✅ Passwords are hashed with SHA-256 + salt
- ✅ `/api/seed` POST requires admin authentication
- ✅ Sensitive files blocked via `.htaccess`
- ⚠️ Change default passwords immediately after first login
- ⚠️ Keep your `.env` file private — never share JWT_SECRET or ZAI_API_KEY

---

## Need Help?

If something breaks, check:
1. **Node.js panel → Logs** (most issues are visible here)
2. Compare error message against "Common Issues" above
3. Visit `/api/seed` to verify database is working
