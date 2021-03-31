import { isPromise, handleMaybePromise } from "./utils";

describe("isPromise", () => {
  it("should return true for a Promise", () => {
    expect(isPromise(Promise.resolve())).toBe(true);
  });

  it("should return false for everything else", () => {
    expect(isPromise("not a Promise")).toBe(false);
  });
});

describe("handleMaybePromise", () => {
  const id = jest.fn(<T>(value: T) => {
    return value;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true for a Promise", async () => {
    await expect(handleMaybePromise("test", id)).resolves.toBe("test");
    expect(id).toHaveBeenCalledWith("test");
  });

  it("should return false for everything else", async () => {
    await expect(handleMaybePromise(Promise.resolve("test"), id)).resolves.toBe(
      "test",
    );
    expect(id).toHaveBeenCalledWith("test");
  });
});
