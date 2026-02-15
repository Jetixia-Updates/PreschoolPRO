import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  isValidEmail,
  isStrongPassword,
  maskSensitiveData,
} from "../lib/security";

describe("Security Utilities", () => {
  describe("sanitizeInput", () => {
    it("escapes HTML tags", () => {
      expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
      );
    });

    it("escapes ampersands", () => {
      expect(sanitizeInput("foo & bar")).toBe("foo &amp; bar");
    });

    it("preserves normal text", () => {
      expect(sanitizeInput("Hello World 123")).toBe("Hello World 123");
    });
  });

  describe("isValidEmail", () => {
    it("accepts valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("rejects invalid emails", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("accepts strong passwords", () => {
      const result = isStrongPassword("StrongP4ss");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects short passwords", () => {
      const result = isStrongPassword("Sh0rt");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 8 characters"
      );
    });

    it("requires uppercase", () => {
      const result = isStrongPassword("nouppercase1");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
    });

    it("requires numbers", () => {
      const result = isStrongPassword("NoNumbers");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
    });
  });

  describe("maskSensitiveData", () => {
    it("masks data correctly", () => {
      expect(maskSensitiveData("1234567890")).toBe("1234****");
    });

    it("handles short data", () => {
      expect(maskSensitiveData("12")).toBe("****");
    });

    it("respects custom visible chars", () => {
      expect(maskSensitiveData("1234567890", 6)).toBe("123456****");
    });
  });
});
