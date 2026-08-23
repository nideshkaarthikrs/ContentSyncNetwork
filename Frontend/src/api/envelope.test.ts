import { CsnApiError, unwrap } from "./envelope";

describe("unwrap", () => {
  it("returns the data payload for a success envelope", () => {
    const result = unwrap({ status: "SUCCESS", data: { foo: "bar" } });

    expect(result).toEqual({ foo: "bar" });
  });

  it("throws CsnApiError with the envelope's message and errorCode for an error envelope", () => {
    expect(() =>
      unwrap({ status: "ERROR", message: "Something broke", errorCode: "CSN-1234" }),
    ).toThrow(CsnApiError);

    try {
      unwrap({ status: "ERROR", message: "Something broke", errorCode: "CSN-1234" });
      throw new Error("unwrap should have thrown");
    } catch (err) {
      const apiError = err as CsnApiError;
      expect(apiError.message).toBe("Something broke");
      expect(apiError.errorCode).toBe("CSN-1234");
    }
  });

  it('falls back to "Request failed" when the error envelope has no message', () => {
    try {
      unwrap({ status: "ERROR" });
      throw new Error("unwrap should have thrown");
    } catch (err) {
      const apiError = err as CsnApiError;
      expect(apiError.message).toBe("Request failed");
      expect(apiError.errorCode).toBeUndefined();
    }
  });

  it("throws a proper CsnApiError instance (name and instanceof Error)", () => {
    try {
      unwrap({ status: "ERROR", message: "boom" });
      throw new Error("unwrap should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CsnApiError);
      expect(err).toBeInstanceOf(Error);
      expect((err as CsnApiError).name).toBe("CsnApiError");
    }
  });
});
