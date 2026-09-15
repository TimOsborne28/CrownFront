import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBase } from "../../src/client/ApiBase";
import { getPlayToken, userAuth } from "../../src/client/Auth";
import { isCrownFrontLocal } from "../../src/client/CrownFront";
import { serverListSite } from "../../src/client/ServerList";

afterEach(() => {
  delete window.CROWNFRONT_LOCAL;
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("CrownFront local service isolation", () => {
  it("ignores saved production API overrides and server discovery", async () => {
    window.CROWNFRONT_LOCAL = true;
    localStorage.setItem("apiHost", "https://api.openfront.io");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(isCrownFrontLocal()).toBe(true);
    expect(getApiBase()).toBe(`${location.origin}/local-api`);
    expect(serverListSite()).toBeUndefined();
    expect(await userAuth()).toBe(false);
    expect(await getPlayToken()).toMatch(/^[0-9a-f-]{36}$/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("is an explicit presentation bootstrap mode, not a change to simulation identifiers", () => {
    expect(isCrownFrontLocal()).toBe(false);
  });
});
