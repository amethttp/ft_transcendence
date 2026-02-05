import { describe, it, expect } from "vitest";
import PathHelper from "../Path/helpers/PathHelper";

describe("PathHelper", () => {
  it("handles root path correctly", () => {
    expect(PathHelper.getParts("/")).toEqual([""]);
    expect(PathHelper.getParts("")).toEqual([""]);
  });

  it("splits normal paths without empty segments", () => {
    expect(PathHelper.getParts("/login")).toEqual(["login"]);
    expect(PathHelper.getParts("/user/profile")).toEqual(["user", "profile"]);
  });

  it("normalizes multiple slashes", () => {
    expect(PathHelper.normalize("/////login///")).toBe("/login/");
    expect(PathHelper.normalize("/user///profile")).toBe("/user/profile");
  });
});
