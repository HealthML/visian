import ITKPixelTypes from "itk/PixelTypes";

/**
 * The itk/PixelTypes enum.
 * @see https://github.com/InsightSoftwareConsortium/itk-js/tree/master/src/PixelTypes.js
 */
const PixelTypes = ITKPixelTypes as Record<
  | "Unknown"
  | "Scalar"
  | "RGB"
  | "RGBA"
  | "Offset"
  | "Vector"
  | "Point"
  | "CovariantVector"
  | "SymmetricSecondRankTensor"
  | "DiffusionTensor3D"
  | "Complex"
  | "FixedArray"
  | "Array"
  | "Matrix"
  | "VariableLengthVector"
  | "VariableSizeMatrix",
  number
>;
export { PixelTypes };

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export interface ITKMatrix<T = number> {
  rows: number;
  columns: number;

  /** Data array of lenth rows * columns. */
  data: T[];
}

/**
 * The itk/ImageType describes the type of an Image.
 *
 * @see https://insightsoftwareconsortium.github.io/itk-js/api/ImageType.html
 */
export interface ITKImageType {
  /** An integer that describes the dimension for the image, typically 2 or 3. */
  dimension: number;

  /** The PixelType. For example, PixelTypes.Scalar or PixelTypes.Vector. */
  pixelType: number;

  /**
   * The type of the components in a pixel. This is one of the IntTypes or
   * FloatTypes.
   */
  componentType: string;

  /** The number of components in a pixel. For a Scalar pixelType, this will be 1. */
  components: number;
}

/**
 * An itk/Image is the N-dimensional image data structure for itk.js.
 *
 * @see https://insightsoftwareconsortium.github.io/itk-js/api/Image.html
 */
export interface ITKImage<T extends TypedArray = TypedArray> {
  /** The ImageType for this image. */
  imageType: ITKImageType;

  /** An optional name that describes this imag */
  name?: string;

  /**
   * An Array with length dimension that describes the location of the center
   * of the lower left pixel in physical units.
   */
  origin: number[];

  /**
   * An Array with length dimension that describes the spacing between pixel
   * in physical units.
   */
  spacing: number[];

  /**
   * A dimension by dimension Matrix that describes the orientation of the
   * image at its origin. The orientation of each axis are the orthonormal
   * columns.
   */
  direction: ITKMatrix;

  /**
   * An Array with length dimension that contains the number of pixels along
   * dimension.
   */
  size: number[];

  /** A TypedArray containing the pixel buffer data. */
  data: T;
}
