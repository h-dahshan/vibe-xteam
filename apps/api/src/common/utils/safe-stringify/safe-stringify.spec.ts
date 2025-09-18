import { describe, it, expect } from "vitest";
import { safeStringify } from "./safe-stringify";

describe("safeStringify", () => {
  it("should stringify simple objects", () => {
    const obj = { name: "test", value: 123 };
    const result = safeStringify(obj);
    expect(result).toBe('{"name":"test","value":123}');
  });

  it("should handle circular references", () => {
    const obj: any = { name: "test" };
    obj.self = obj; // Create circular reference

    const result = safeStringify(obj);
    expect(result).toContain('"name":"test"');
    expect(result).toContain('"self":"[Circular]"');
  });

  it("should handle nested circular references", () => {
    const parent: any = { type: "parent" };
    const child: any = { type: "child", parent };
    parent.child = child;

    const result = safeStringify(parent);
    expect(result).toContain('"type":"parent"');
    expect(result).toContain('"type":"child"');
    expect(result).toContain("[Circular]");
  });

  it("should apply custom replacer function", () => {
    const obj = {
      name: "test",
      password: "secret123",
      value: 42,
    };

    const replacer = (key: string, value: unknown) => {
      if (key === "password") return "[REDACTED]";
      return value;
    };

    const result = safeStringify(obj, replacer);
    expect(result).toContain('"password":"[REDACTED]"');
    expect(result).toContain('"name":"test"');
    expect(result).toContain('"value":42');
  });

  it("should handle space parameter for formatting", () => {
    const obj = { name: "test", value: 123 };
    const result = safeStringify(obj, undefined, 2);

    expect(result).toBe('{\n  "name": "test",\n  "value": 123\n}');
  });

  it("should handle null and undefined values", () => {
    expect(safeStringify(null)).toBe("null");
    expect(safeStringify(undefined)).toBe(undefined);
  });

  it("should handle arrays", () => {
    const arr = [1, 2, { name: "test" }];
    const result = safeStringify(arr);
    expect(result).toBe('[1,2,{"name":"test"}]');
  });

  it("should handle arrays with circular references", () => {
    const arr: any[] = [1, 2];
    arr.push(arr); // Add circular reference

    const result = safeStringify(arr);
    expect(result).toBe('[1,2,"[Circular]"]');
  });

  it("should handle BigInt values", () => {
    const obj = { big: BigInt(9007199254740991) };

    // BigInt needs special handling
    const replacer = (_key: string, value: unknown) => {
      if (typeof value === "bigint") return value.toString();
      return value;
    };

    const result = safeStringify(obj, replacer);
    expect(result).toBe('{"big":"9007199254740991"}');
  });

  it("should handle Date objects", () => {
    const date = new Date("2024-01-01T00:00:00.000Z");
    const obj = { createdAt: date };

    const result = safeStringify(obj);
    expect(result).toBe('{"createdAt":"2024-01-01T00:00:00.000Z"}');
  });

  it("should handle error objects gracefully", () => {
    const error = new Error("Test error");
    const obj = { error };

    const result = safeStringify(obj);
    expect(result).toBeDefined();
    expect(result).toContain("error");
  });

  it("should handle deeply nested objects", () => {
    const deep = {
      level1: {
        level2: {
          level3: {
            level4: {
              value: "deep",
            },
          },
        },
      },
    };

    const result = safeStringify(deep);
    expect(result).toContain('"value":"deep"');
  });

  it("should handle WeakSet and WeakMap in objects", () => {
    const obj = {
      weakSet: new WeakSet(),
      weakMap: new WeakMap(),
      normal: "value",
    };

    const result = safeStringify(obj);
    expect(result).toContain('"normal":"value"');
    // WeakSet and WeakMap are not enumerable, so they won't appear
  });

  it("should handle symbols as keys", () => {
    const sym = Symbol("test");
    const obj = {
      [sym]: "symbol value",
      normal: "normal value",
    };

    const result = safeStringify(obj);
    // Symbols are not enumerable in JSON
    expect(result).toBe('{"normal":"normal value"}');
  });
});
