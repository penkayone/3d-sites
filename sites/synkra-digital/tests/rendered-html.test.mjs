import assert from "node:assert/strict";
import test from "node:test";

// Smoke test for the production build: renders the SYNKRA Digital landing
// through the built worker and checks the real page, not the starter skeleton.
async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${process.hrtime.bigint()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the SYNKRA Digital landing", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="en"/i);
  assert.match(html, /<title>SYNKRA — Digital experiences that move people<\/title>/i);
  assert.match(html, /Digital experiences/i);
  assert.match(html, /move people/i);
  assert.match(html, /SYNKRA/);
  // Should no longer contain the vinext starter skeleton.
  assert.doesNotMatch(html, /Your site is taking shape/i);
});
