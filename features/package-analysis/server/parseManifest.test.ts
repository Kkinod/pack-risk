import { describe, expect, it } from "vitest";
import { parseManifest } from "./parseManifest";

describe("parseManifest", () => {
  it("parses a valid package.json with production dependencies", () => {
    const content = JSON.stringify({
      name: "my-app",
      dependencies: { lodash: "4.17.21", express: "4.18.0" },
    });
    const { name, deps } = parseManifest(content);
    expect(name).toBe("my-app");
    expect(deps).toHaveLength(2);
    expect(deps[0]).toEqual({
      name: "lodash",
      version: "4.17.21",
      type: "prod",
    });
    expect(deps[1]).toEqual({
      name: "express",
      version: "4.18.0",
      type: "prod",
    });
  });

  it("extracts dependencies from all supported sections", () => {
    const content = JSON.stringify({
      dependencies: { a: "1.0.0" },
      devDependencies: { b: "2.0.0" },
      peerDependencies: { c: "3.0.0" },
      optionalDependencies: { d: "4.0.0" },
    });
    const { deps } = parseManifest(content);
    expect(deps).toHaveLength(4);
    expect(deps.find((d) => d.name === "a")?.type).toBe("prod");
    expect(deps.find((d) => d.name === "b")?.type).toBe("dev");
    expect(deps.find((d) => d.name === "c")?.type).toBe("peer");
    expect(deps.find((d) => d.name === "d")?.type).toBe("optional");
  });

  it("strips semver range operators from version strings", () => {
    const content = JSON.stringify({
      dependencies: {
        a: "^1.2.3",
        b: "~2.0.0",
        c: ">=3.0.0",
        d: "4.0.0",
      },
    });
    const { deps } = parseManifest(content);
    expect(deps.find((d) => d.name === "a")?.version).toBe("1.2.3");
    expect(deps.find((d) => d.name === "b")?.version).toBe("2.0.0");
    expect(deps.find((d) => d.name === "c")?.version).toBe("3.0.0");
    expect(deps.find((d) => d.name === "d")?.version).toBe("4.0.0");
  });

  it("uses 'unknown' as project name when name field is missing", () => {
    const content = JSON.stringify({ dependencies: { a: "1.0.0" } });
    const { name } = parseManifest(content);
    expect(name).toBe("unknown");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseManifest("not json")).toThrow("Invalid JSON");
  });

  it("throws when root is not an object", () => {
    expect(() => parseManifest(JSON.stringify([1, 2]))).toThrow(
      "Invalid package.json: root must be an object"
    );
  });

  it("throws when no dependencies are found", () => {
    expect(() => parseManifest(JSON.stringify({ name: "empty-app" }))).toThrow(
      "No dependencies found in package.json"
    );
  });

  it("throws when all dependency sections are empty objects", () => {
    const content = JSON.stringify({
      dependencies: {},
      devDependencies: {},
    });
    expect(() => parseManifest(content)).toThrow(
      "No dependencies found in package.json"
    );
  });
});
