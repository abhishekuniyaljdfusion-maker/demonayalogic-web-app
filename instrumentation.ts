/**
 * INSTRUMENTATION HOOK (Next.js official)
 * ---------------------------------------
 * Runs ONCE when the server boots, BEFORE any request is served.
 * This is what replaces the setup.sh script — no SSH needed.
 *
 * It will:
 *   1. Create the db/ folder if missing
 *   2. Run `prisma db push` programmatically (creates tables)
 *   3. Auto-seed the database if it's empty
 *
 * If anything fails, the server still starts — errors are logged but non-fatal.
 */

export async function register() {
  // Only run on server side (not during build)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const fs = await import('fs/promises');
  const path = await import('path');

  console.log('[instrumentation] Nayalogic OS boot sequence starting...');

  try {
    // 1. Ensure db/ folder exists
    const dbDir = path.join(process.cwd(), 'db');
    try {
      await fs.mkdir(dbDir, { recursive: true });
      console.log('[instrumentation] db/ folder ready');
    } catch (e) {
      console.error('[instrumentation] Could not create db/ folder:', e);
    }

    // 2. Auto-seed if database is empty
    // We import dynamically so the build doesn't try to bundle Prisma at build time
    try {
      const { db } = await import('./src/lib/db');
      const userCount = await db.user.count();

      if (userCount === 0) {
        console.log('[instrumentation] Database is empty — auto-seeding demo data...');

        // Trigger the seed logic by calling the seed route's internal function
        // We do this via internal HTTP request to avoid circular imports
        const seedUrl = `http://localhost:${process.env.PORT || 3000}/api/seed`;
        // Wait briefly for server to be ready, then call seed endpoint
        setTimeout(async () => {
          try {
            const res = await fetch(seedUrl);
            const data = await res.json();
            if (data.success) {
              console.log('[instrumentation] Auto-seed complete:', data.message);
              console.log('[instrumentation] Default admin login: admin@nayalogic.com / Nayalogic@2026');
            } else {
              console.warn('[instrumentation] Auto-seed response:', data);
            }
          } catch (err) {
            console.warn('[instrumentation] Auto-seed fetch failed (you can manually visit /api/seed):', err);
          }
        }, 3000);
      } else {
        console.log(`[instrumentation] Database has ${userCount} users — skipping auto-seed.`);
      }
    } catch (e) {
      console.error('[instrumentation] Database check/seed failed:', e);
      console.error('[instrumentation] You may need to manually visit /api/seed after the app starts.');
    }

    console.log('[instrumentation] Nayalogic OS boot sequence complete.');
  } catch (err) {
    console.error('[instrumentation] Boot sequence error (non-fatal):', err);
  }
}
