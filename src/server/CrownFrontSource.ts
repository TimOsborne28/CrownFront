import { createReadStream, createWriteStream } from "node:fs";
import { lstat, readdir } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

const SOURCE_DIRECTORIES = new Set([
  "src",
  "resources",
  "zbin",
  "scripts",
  "tests",
  "docs",
  "map-generator",
  "__mocks__",
]);
const SOURCE_FILES = new Set([
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "eslint.config.js",
  ".oxlintrc.json",
  ".prettierrc",
  ".swcrc",
  ".gitignore",
  ".dockerignore",
  "index.html",
  "client-api.json",
  "Dockerfile",
  "nginx.conf",
  "supervisord.conf",
  "generate-nginx-upstream.sh",
  "example.env",
  "LICENSE",
  "LICENSE-ASSETS",
  "LICENSING.md",
  "README.md",
  "CREDITS.md",
  "CONTRIBUTING.md",
  "CLAUDE.md",
]);

export function isCrownFrontSourcePath(relativePath: string): boolean {
  const parts = relativePath.replace(/\\/g, "/").split("/");
  if (parts.some((part) => part === ".." || part === "")) return false;
  if (parts.length === 1) return SOURCE_FILES.has(parts[0]);
  return (
    SOURCE_DIRECTORIES.has(parts[0]) &&
    parts.every(
      (part) =>
        !part.startsWith(".") &&
        !["node_modules", "static", "out", "proprietary"].includes(part),
    )
  );
}

async function* sourceFiles(
  root: string,
  relative = "",
): AsyncGenerator<string> {
  const entries = await readdir(path.join(root, relative), {
    withFileTypes: true,
  });
  entries.sort((a, b) => a.name.localeCompare(b.name, "en"));
  for (const entry of entries) {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const allowed =
        relative === ""
          ? SOURCE_DIRECTORIES.has(entry.name)
          : isCrownFrontSourcePath(`${name}/_`);
      if (allowed) yield* sourceFiles(root, name);
    } else if (entry.isFile() && isCrownFrontSourcePath(name)) {
      yield name;
    }
  }
}

function tarHeader(name: string, size: number, modified: number): Buffer {
  const header = Buffer.alloc(512);
  if (Buffer.byteLength(name) > 100) {
    const split = name.lastIndexOf("/");
    const prefix = name.slice(0, split);
    name = name.slice(split + 1);
    if (Buffer.byteLength(prefix) > 155 || Buffer.byteLength(name) > 100) {
      throw new Error(`Source archive path is too long: ${prefix}/${name}`);
    }
    header.write(prefix, 345, 155);
  }
  header.write(name, 0, 100);
  header.write("0000644\0", 100, 8);
  header.write("0000000\0", 108, 8);
  header.write("0000000\0", 116, 8);
  header.write(`${size.toString(8).padStart(11, "0")}\0`, 124, 12);
  header.write(`${modified.toString(8).padStart(11, "0")}\0`, 136, 12);
  header.fill(32, 148, 156);
  header.write("0", 156);
  header.write("ustar\0", 257, 6);
  header.write("00", 263, 2);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(`${checksum.toString(8).padStart(6, "0")}\0 `, 148, 8);
  return header;
}

async function* sourceTar(root: string): AsyncGenerator<Buffer> {
  for await (const name of sourceFiles(root)) {
    const file = path.join(root, name);
    const stat = await lstat(file);
    if (!stat.isFile()) throw new Error(`Source file changed type: ${name}`);
    yield tarHeader(name, stat.size, Math.floor(stat.mtimeMs / 1000));
    let read = 0;
    for await (const chunk of createReadStream(file)) {
      read += chunk.length;
      yield chunk;
    }
    if (read !== stat.size)
      throw new Error(`Source changed while archiving: ${name}`);
    const padding = (512 - (read % 512)) % 512;
    if (padding) yield Buffer.alloc(padding);
  }
  yield Buffer.alloc(1024);
}

export async function writeCrownFrontSource(root: string, output: string) {
  await pipeline(
    Readable.from(sourceTar(root)),
    createGzip(),
    createWriteStream(output),
  );
}

export async function serveCrownFrontSource(root: string, res: ServerResponse) {
  res.setHeader("Content-Type", "application/gzip");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="crownfront-source.tar.gz"',
  );
  res.setHeader("Cache-Control", "no-store");
  await pipeline(Readable.from(sourceTar(root)), createGzip(), res);
}
