import { expect, test } from "@playwright/test";

test("deployment health endpoint reports the DTFSeeds Node application ready", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");

  const body = await response.json();
  expect(body).toMatchObject({
    status: "ok",
    service: "dtfseeds-web",
    canonicalOrigin: "https://dtfseeds.com",
    runtime: "nodejs",
    environment: "production",
  });
  expect(body.node).toMatch(/^v22\./);
});
