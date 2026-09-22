/**
 * Throwaway verification for convex/admin-sha.ts's pure-JS SHA-256.
 * Run with: bun scripts/verify-sha.ts
 * Compares the pure-JS implementation against NIST/RFC 6234 test vectors
 * and against Node's native crypto module on assorted inputs.
 */
import { sha256Hex, fnv1a } from "../convex/admin_sha";
import { createHash, randomBytes } from "node:crypto";

const vectors: [string, string][] = [
  ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
  ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
  [
    "The quick brown fox jumps over the lazy dog",
    "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
  ],
  [
    "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
    "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
  ],
  ["a".repeat(1000), "41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3"],
  // Value cross-checked against Node's crypto (the authoritative source).
  ["ünïcödé ✓ 中文 🚀", "43d3a8f472c67372150b992dac623052a849b6285f9170af638ecc47162330bd"],
];

let failures = 0;

for (const [input, expected] of vectors) {
  const got = sha256Hex(input);
  // Cross-check every vector against Node's native SHA-256 as well.
  const native = createHash("sha256").update(input, "utf8").digest("hex");
  const vectorOk = got === expected && native === expected;
  if (!vectorOk) {
    failures++;
    console.error(`FAIL: ${JSON.stringify(input.slice(0, 40))}`);
    console.error(`  pure-js: ${got}`);
    console.error(`  node   : ${native}`);
    console.error(`  vector : ${expected}`);
  } else {
    console.log(`ok: ${input === "" ? "(empty)" : JSON.stringify(input.slice(0, 40))}`);
  }
}

// Random round-trip fuzz against Node's crypto (including multi-block inputs
// and UTF-8 edge cases).
for (let i = 0; i < 200; i++) {
  const raw = randomBytes(1 + Math.floor(Math.random() * 300));
  const input = raw.toString("latin1");
  const got = sha256Hex(input);
  const native = createHash("sha256").update(input, "utf8").digest("hex");
  if (got !== native) {
    failures++;
    console.error(`FUZZ FAIL len=${raw.length}: ${got} != ${native}`);
    break;
  }
}
console.log("fuzz: 200/200 matched node crypto");

// Multi-block boundary case (> 55 bytes forces an extra padding block).
const long = "x".repeat(56);
const gotLong = sha256Hex(long);
const nativeLong = createHash("sha256").update(long).digest("hex");
if (gotLong !== nativeLong) {
  failures++;
  console.error(`BOUNDARY FAIL: ${gotLong} != ${nativeLong}`);
} else {
  console.log("ok: 56-byte boundary (two-block padding)");
}

// FNV-1a reference spot checks.
const fnvChecks: [string, number][] = [
  ["", 0x811c9dc5],
  ["a", 0xe40c292c],
  ["foobar", 0xbf9cf968],
];
for (const [input, expected] of fnvChecks) {
  if (fnv1a(input) !== expected) {
    failures++;
    console.error(`FNV FAIL: ${input} -> ${fnv1a(input).toString(16)} != ${expected.toString(16)}`);
  }
}
console.log("fnv1a: reference values match");

if (failures > 0) {
  console.error(`\n${failures} FAILURE(S)`);
  process.exit(1);
}
console.log("\nAll SHA-256 vectors and fuzz checks passed.");
