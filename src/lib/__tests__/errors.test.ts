import { describe, expect, it } from "vitest";

import { AppError } from "../errors.js";

describe("AppError", () => {
  it("constructs with correct message, statusCode, code, details", () => {
    const details = { reason: "validation" };
    const error = new AppError("Bad request", 400, "BAD_REQUEST", details);

    expect(error.message).toBe("Bad request");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.details).toEqual(details);
  });

  it("is an instance of Error", () => {
    const error = new AppError("Oops");
    expect(error).toBeInstanceOf(Error);
  });
});

