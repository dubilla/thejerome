import { describe, it, expect } from "vitest";
import { isTournamentLocked, getTournamentStatus, validateBracketUrl } from "./tournament";

const past = new Date(Date.now() - 1000 * 60 * 60 * 24);    // 1 day ago
const future = new Date(Date.now() + 1000 * 60 * 60 * 24);  // 1 day from now
const farFuture = new Date(Date.now() + 1000 * 60 * 60 * 48); // 2 days from now

describe("validateBracketUrl", () => {
  it("accepts https URLs", () => {
    const result = validateBracketUrl("https://example.com/bracket");
    expect(result).toEqual({ ok: true, url: "https://example.com/bracket" });
  });

  it("accepts http URLs", () => {
    const result = validateBracketUrl("http://example.com/bracket");
    expect(result).toEqual({ ok: true, url: "http://example.com/bracket" });
  });

  it("rejects javascript: scheme", () => {
    const result = validateBracketUrl("javascript:alert(1)");
    expect(result).toMatchObject({ ok: false });
    expect((result as { ok: false; error: string }).error).toContain("http");
  });

  it("rejects data: scheme", () => {
    const result = validateBracketUrl("data:text/html,<h1>x</h1>");
    expect(result).toMatchObject({ ok: false });
  });

  it("rejects malformed URLs", () => {
    const result = validateBracketUrl("not a url");
    expect(result).toMatchObject({ ok: false });
    expect((result as { ok: false; error: string }).error).toContain("valid URL");
  });

  it("rejects empty-ish strings that look like paths", () => {
    const result = validateBracketUrl("/relative/path");
    expect(result).toMatchObject({ ok: false });
  });
});

describe("isTournamentLocked", () => {
  it("returns true when startsAt is in the past", () => {
    expect(isTournamentLocked(past)).toBe(true);
  });

  it("returns false when startsAt is in the future", () => {
    expect(isTournamentLocked(future)).toBe(false);
  });
});

describe("getTournamentStatus", () => {
  it("returns 'upcoming' when start is in the future", () => {
    expect(getTournamentStatus(future, farFuture)).toBe("upcoming");
  });

  it("returns 'in-progress' when started but not yet ended", () => {
    expect(getTournamentStatus(past, future)).toBe("in-progress");
  });

  it("returns 'completed' when both start and end are in the past", () => {
    const earlierPast = new Date(Date.now() - 1000 * 60 * 60 * 48);
    expect(getTournamentStatus(earlierPast, past)).toBe("completed");
  });
});
