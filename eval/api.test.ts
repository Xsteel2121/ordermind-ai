import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../app/api/parse/route";
const request = (body: string, origin = "http://localhost:3010") =>
  new Request("http://localhost:3010/api/parse/", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body,
  });
test("API parses an exact catalog phrase and uses source IDs", async () => {
  const response = await POST(
    request(JSON.stringify({ text: "бір капучино single" })),
  );
  assert.equal(response.status, 200);
  const r = await response.json();
  assert.equal(r.engine, "catalog");
  assert.equal(r.items[0].menu_id, "cb021");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("API rejects invalid, empty, oversized and cross-origin input", async () => {
  assert.equal((await POST(request("not json"))).status, 400);
  assert.equal((await POST(request(JSON.stringify({ text: "" })))).status, 400);
  assert.equal(
    (await POST(request(JSON.stringify({ text: "x".repeat(1600) })))).status,
    400,
  );
  assert.equal((await POST(request("x".repeat(9000)))).status, 413);
  assert.equal(
    (await POST(request('{"text":"кофе"}', "https://evil.invalid"))).status,
    403,
  );
  assert.equal((await POST(request('{"text":"кофе"}', "null"))).status, 403);
});
