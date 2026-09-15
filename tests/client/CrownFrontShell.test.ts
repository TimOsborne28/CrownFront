import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const shell = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

describe("CrownFront local application shell", () => {
  it("enables local guards before the bootstrap object and client entrypoint", () => {
    const localFlag = shell.indexOf("window.CROWNFRONT_LOCAL = true;");
    expect(localFlag).toBeGreaterThan(-1);
    expect(localFlag).toBeLessThan(shell.indexOf("window.BOOTSTRAP_CONFIG"));
    expect(localFlag).toBeLessThan(shell.indexOf('src="/src/client/Main.ts"'));
  });

  it("limits network resources to the application's own origin", () => {
    const policy = shell.match(
      /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
    )?.[1];
    expect(policy).toBeDefined();
    const directives = new Map(
      policy!.split(";").map((part) => {
        const [name, ...values] = part.trim().split(/\s+/);
        return [name, values];
      }),
    );
    expect(directives.get("connect-src")).toEqual(["'self'"]);
    expect(directives.get("script-src")).toEqual(["'self'", "'unsafe-inline'"]);
    expect(directives.get("img-src")).toEqual(["'self'", "data:", "blob:"]);
    expect(directives.get("media-src")).toEqual(["'self'", "data:", "blob:"]);
    expect(directives.get("worker-src")).toEqual(["'self'", "blob:"]);
    expect(directives.get("object-src")).toEqual(["'none'"]);
  });

  it("contains no external script tags or live homepage promotional mounts", () => {
    expect(shell).not.toMatch(/<script[^>]+src=["']https?:/i);
    expect(shell).not.toMatch(
      /<(homepage-promos|featured-stream|purchase-nudge-modal|marketing-consent-toast)\b/,
    );
  });
});
