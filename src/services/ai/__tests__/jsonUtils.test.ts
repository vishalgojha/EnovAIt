import { describe, expect, it } from "vitest";

import { parseJsonFromText } from "../jsonUtils.js";

describe("parseJsonFromText", () => {
  it("correctly extracts valid JSON from a plain string", () => {
    const parsed = parseJsonFromText('{"name":"EnovAIt","ok":true}');
    expect(parsed).toEqual({ name: "EnovAIt", ok: true });
  });

  it("correctly extracts JSON wrapped in ```json fences", () => {
    const parsed = parseJsonFromText("```json\n{\"count\":2,\"items\":[1,2]}\n```");
    expect(parsed).toEqual({ count: 2, items: [1, 2] });
  });

  it("returns null for malformed input without throwing", () => {
    expect(parseJsonFromText("{invalid-json")).toBeNull();
  });
});

