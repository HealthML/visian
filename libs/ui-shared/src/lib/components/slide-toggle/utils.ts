export const setFullOpacity = (
  color: string | undefined,
): string | undefined => {
  if (!color) return undefined;
  if (color.startsWith("rgba")) {
    const rgbaValues = color.match(/(\d+(\.\d+)?)/g) as string[];
    rgbaValues[3] = "1";
    return `rgba(${rgbaValues.join(",")})`;
  }

  return color;
};
