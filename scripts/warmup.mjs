/**
 * Warm-up script for Cabanatuan City Ordinance Portal.
 * Hits key static and dynamic routes once after server launch
 * so demo clicks are instantly cached and fast on low-spec hardware.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const ROUTES = [
  "/",
  "/ordinances",
  "/chatbot",
  "/report",
  "/login",
  "/news",
  "/admin/lgu",
  "/admin/barangay",
];

async function warmupRoute(route) {
  const url = `${BASE_URL}${route}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Cabanatuan-Portal-Warmup/1.0",
      },
    });
    const duration = Math.round(performance.now() - start);
    console.log(`  ✓ ${route.padEnd(20)} [${res.status}] in ${duration}ms`);
    return { route, status: res.status, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    console.log(`  ✗ ${route.padEnd(20)} [FAILED: ${err.message}] in ${duration}ms`);
    return { route, status: 0, duration, error: err.message };
  }
}

async function main() {
  console.log(`\n🔥 Warming up Cabanatuan City Ordinance Portal routes at ${BASE_URL}...\n`);
  
  for (const route of ROUTES) {
    await warmupRoute(route);
  }

  console.log("\n⚡ Warm-up complete! Server caches primed for smooth live presentation.\n");
}

main().catch((err) => {
  console.error("Warmup script error:", err);
  process.exit(1);
});
