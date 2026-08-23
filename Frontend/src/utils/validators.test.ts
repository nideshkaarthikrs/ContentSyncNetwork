import { isEmailFormat, isMobileFormat } from "./validators";

describe("isEmailFormat", () => {
  it("accepts a standard email", () => {
    expect(isEmailFormat("user@example.com")).toBe(true);
  });

  it("accepts a multi-level domain", () => {
    expect(isEmailFormat("user@sub.example.co.in")).toBe(true);
  });

  it("rejects a non-email string", () => {
    expect(isEmailFormat("not-an-email")).toBe(false);
  });

  it("rejects an email with no dot in the domain", () => {
    expect(isEmailFormat("missing@domain")).toBe(false);
  });

  it("trims leading/trailing whitespace before validating", () => {
    expect(isEmailFormat("  padded@example.com  ")).toBe(true);
  });

  it("rejects an email with no local part", () => {
    expect(isEmailFormat("@example.com")).toBe(false);
  });
});

describe("isMobileFormat", () => {
  it("accepts a 10-digit number", () => {
    expect(isMobileFormat("9876543210")).toBe(true);
  });

  it("accepts a number with a country code", () => {
    expect(isMobileFormat("+919876543210")).toBe(true);
  });

  it("accepts a number with dashes", () => {
    expect(isMobileFormat("987-654-3210")).toBe(true);
  });

  it("rejects a too-short number", () => {
    expect(isMobileFormat("123")).toBe(false);
  });

  it("rejects a too-long number", () => {
    expect(isMobileFormat("12345678901234567")).toBe(false);
  });

  it("rejects a number with non-digit characters", () => {
    expect(isMobileFormat("98765abcde")).toBe(false);
  });
});
