// @vitest-environment node
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { afterEach, describe, expect, it } from "vitest";
import {
  isCrownFrontSourcePath,
  writeCrownFrontSource,
} from "../../src/server/CrownFrontSource";

let root: string;
afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
});

describe("CrownFront corresponding source", () => {
  it("includes code, build inputs, open assets and licenses but never secrets or restricted assets", () => {
    for (const name of [
      "src/client/Main.ts",
      "resources/maps/world/map.bin",
      "zbin/bytes.ts",
      "LICENSE",
      "LICENSE-ASSETS",
      "package-lock.json",
      "__mocks__/mock.ts",
    ]) {
      expect(isCrownFrontSourcePath(name), name).toBe(true);
    }
    for (const name of [
      ".env",
      ".env.local",
      ".git/config",
      "proprietary/images/logo.svg",
      "src/../../.env",
      "src/.env",
      "node_modules/a/index.js",
      "static/index.html",
    ]) {
      expect(isCrownFrontSourcePath(name), name).toBe(false);
    }
  });

  it("packages the current modified files rather than pretending upstream contains the changes", async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "crownfront-source-"));
    await mkdir(path.join(root, "src"));
    await mkdir(path.join(root, "proprietary"));
    await writeFile(path.join(root, "src", "CrownFront.ts"), "modified source");
    await writeFile(path.join(root, "LICENSE"), "AGPL");
    await writeFile(path.join(root, ".env"), "PRIVATE");
    await writeFile(path.join(root, "proprietary", "logo.svg"), "RESTRICTED");
    const output = path.join(root, "archive.tar.gz");
    await writeCrownFrontSource(root, output);
    const tar = gunzipSync(await readFile(output));
    const files = new Map<string, string>();
    for (let offset = 0; tar[offset] !== 0; ) {
      const name = tar
        .subarray(offset, offset + 100)
        .toString()
        .split("\0")[0];
      const size = parseInt(
        tar.subarray(offset + 124, offset + 136).toString(),
        8,
      );
      files.set(
        name,
        tar.subarray(offset + 512, offset + 512 + size).toString(),
      );
      offset += 512 + Math.ceil(size / 512) * 512;
    }
    expect(Object.fromEntries(files)).toEqual({
      LICENSE: "AGPL",
      "src/CrownFront.ts": "modified source",
    });
  });
});
