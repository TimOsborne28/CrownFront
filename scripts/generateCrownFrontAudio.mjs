// Original synthesized CrownFront audio, CC BY-SA 4.0. No sampled recordings.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rate = 22050;
let seed = 418;
function noise() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
}
function wav(name, seconds, sample) {
  const count = Math.round(seconds * rate);
  const bytes = Buffer.alloc(44 + count * 2);
  bytes.write("RIFF");
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(rate, 24);
  bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) {
    bytes.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, sample(i / rate))) * 32767),
      44 + i * 2,
    );
  }
  const target = path.join(
    root,
    "resources",
    "sounds",
    "crownfront",
    `${name}.wav`,
  );
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
}
const sine = (frequency, t) => Math.sin(2 * Math.PI * frequency * t);
const melody = [
  62, 69, 65, 67, 64, 62, 57, 60, 62, 65, 69, 72, 71, 67, 65, 64, 62, 57, 60,
  64, 65, 69, 67, 64, 62, 65, 64, 60, 57, 60, 64, 62,
];
const beat = 0.5;
const duration = melody.length * beat;
wav("lute", duration, (t) => {
  let value = 0;
  // Wrap note tails at the loop boundary.
  for (let n = 0; n < melody.length; n++) {
    const age = (t - n * beat + duration) % duration;
    if (age > 2.5) continue;
    const hz = 440 * 2 ** ((melody[n] - 69) / 12);
    const attack = Math.min(1, age * 100);
    value +=
      attack *
      Math.exp(-age * 3) *
      (0.14 * sine(hz, age) +
        0.05 * sine(hz * 2, age) +
        0.025 * sine(hz * 3, age));
    if (n % 4 === 0)
      value += attack * Math.exp(-age * 2) * 0.12 * sine(146.832 / 2, age);
  }
  return value;
});
wav(
  "bell",
  1.4,
  (t) =>
    Math.min(1, t * 200) *
    Math.exp(-t * 4) *
    (sine(660, t) * 0.28 + sine(1043, t) * 0.12 + sine(1762, t) * 0.06),
);
wav(
  "siege",
  1.3,
  (t) =>
    Math.min(1, t * 200) *
    Math.exp(-t * 5) *
    (noise() * 0.34 + sine(90 - t * 30, t) * 0.3 + sine(180, t) * 0.12),
);
wav(
  "fire",
  2.8,
  (t) =>
    Math.min(1, t * 80) *
    Math.exp(-t * 1.9) *
    (noise() * 0.46 + sine(53, t) * 0.3),
);
wav("horn", 2.1, (t) => {
  const envelope = Math.min(1, t * 8) * Math.max(0, Math.min(1, (2.1 - t) * 4));
  return (
    envelope *
    (sine(146.832, t) * 0.22 +
      sine(293.664, t) * 0.08 +
      sine(440.496, t) * 0.035)
  );
});
wav("forge", 4, (t) => {
  const age = t % 1;
  return (
    Math.min(1, age * 200) *
    Math.exp(-age * 10) *
    (sine(433, age) * 0.25 + sine(713, age) * 0.18 + noise() * 0.1)
  );
});
console.log("Generated six original CrownFront audio assets.");
