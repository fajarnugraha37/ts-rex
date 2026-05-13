import { expect, test, describe } from "bun:test";
import { expectTypeOf } from "expect-type";
import { rx, RegexBuilder, entityKind, type DefaultFlags, type DefaultCaptures } from "../src/index";

describe("Phase 1: Core Architecture & Nominal Typing", () => {
  test("should create a builder instance with empty state", () => {
    const builder = rx();
    expect(builder).toBeInstanceOf(RegexBuilder);
    expect(builder.chunks).toEqual([]);
    expect(builder[entityKind]).toBe("RegexBuilder");
  });

  test("immutability is preserved via _chain()", () => {
    const b1 = rx();
    const b2 = b1._chain({ type: "literal", value: "a" });

    // Ensure it returns a completely new instance
    expect(b1).not.toBe(b2);

    // Verify chunks are copied, not mutated
    expect(b1.chunks).toEqual([]);
    expect(b2.chunks).toEqual([{ type: "literal", value: "a" }]);

    // Check types
    expectTypeOf(b1).toEqualTypeOf<
      RegexBuilder<Record<never, never>, DefaultFlags>
    >();
    expectTypeOf(b2).toEqualTypeOf<
      RegexBuilder<Record<never, never>, DefaultFlags>
    >();
  });

  test("phantom properties exist only at type level", () => {
    const builder = rx();
    // At runtime, the property should be undefined since it is only declared
    expect((builder as any)._).toBeUndefined();
  });

  test("type branding works", () => {
    const builder = rx();
    expectTypeOf(builder[entityKind]).toEqualTypeOf<"RegexBuilder">();
  });

  test("generic state accumulation: captures", () => {
    const b1 = rx(); // RegexBuilder<Record<never, never>, DefaultFlags>

    // Mensimulasikan penambahan capture group di level tipe
    // Misal kita punya internal method untuk menambah tipe capture
    const b2 = b1._test_addCapture<"userId">();

    // Pastikan tipe berubah menjadi { userId: string }
    expectTypeOf(b2).toEqualTypeOf<
      RegexBuilder<Record<never, never> & Record<"userId", string>, DefaultFlags>
    >();

    // Pastikan b1 tetap kosong (Immutability)
    expectTypeOf(b1).toEqualTypeOf<RegexBuilder<Record<never, never>, DefaultFlags>>();
  });

  test("generic state accumulation: flags", () => {
    const b1 = rx();
    const b2 = b1._test_setFlag<"global", true>("global", true);

    expectTypeOf(b2).toEqualTypeOf<
      RegexBuilder<Record<never, never>, Omit<DefaultFlags, "global"> & Record<"global", true>>
    >();
    expectTypeOf(b1).toEqualTypeOf<RegexBuilder<Record<never, never>, DefaultFlags>>();
  });

  test("AST chunks are deep copied", () => {
    const b1 = rx()._chain({ type: "literal", value: "a" });
    const b2 = b1._chain({ type: "literal", value: "b" });

    // Memastikan array chunks b2 bukan array yang sama dengan b1
    expect(b1.chunks).not.toBe(b2.chunks);
    expect(b1.chunks.length).toBe(1);
    expect(b2.chunks.length).toBe(2);
  });

  test("compilation contract: output shape", () => {
    const result = rx().compile();
    expect(typeof result.pattern).toBe("string");
    expect(result.toRegExp()).toBeInstanceOf(RegExp);
    expect(typeof result.exec).toBe("function");
  });
});
