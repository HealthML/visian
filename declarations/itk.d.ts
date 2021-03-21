declare module "itk/Image" {
  import ImageType from "itk/ImageType";
  import Matrix from "itk/Matrix";

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

  /**
   * An itk/Image is the N-dimensional image data structure for itk.js.
   *
   * @see https://insightsoftwareconsortium.github.io/itk-js/api/Image.html
   */
  class Image<T extends TypedArray = TypedArray> {
    /** The ImageType for this image. */
    public imageType: ImageType;

    /**
     * An optional name that describes this image.
     *
     * Defaults to `"Image"`.
     */
    public name?: string;

    /**
     * An Array with length dimension that describes the location of the center
     * of the lower left pixel in physical units.
     *
     * Defaults to the zero vector.
     */
    public origin: number[];

    /**
     * An Array with length dimension that describes the spacing between pixel
     * in physical units.
     *
     * Defaults to a vector of all ones.
     */
    public spacing: number[];

    /**
     * A dimension by dimension Matrix that describes the orientation of the
     * image at its origin. The orientation of each axis are the orthonormal
     * columns.
     *
     * Defaults to the identity matrix.
     */
    public direction: Matrix;

    /**
     * An Array with length dimension that contains the number of pixels along
     * each dimension.
     */
    public size: number[];

    /** A TypedArray containing the pixel buffer data. */
    public data: T;
  }

  export = Image;
}

declare module "itk/ImageType" {
  /**
   * The itk/ImageType describes the type of an Image.
   *
   * @see https://insightsoftwareconsortium.github.io/itk-js/api/ImageType.html
   */
  class ImageType {
    /** An integer that describes the dimension for the image, typically 2 or 3. */
    public dimension: number;

    /**
     * The type of the components in a pixel. This is one of the IntTypes or
     * FloatTypes.
     */
    public componentType: string;

    /** The PixelType. For example, PixelTypes.Scalar or PixelTypes.Vector. */
    public pixelType: number;

    /** The number of components in a pixel. For a Scalar pixelType, this will be 1. */
    public components: number;
  }

  export = ImageType;
}

declare module "itk/Matrix" {
  class Matrix<T = number> {
    /** Data array of length rows * columns. */
    public data: T[];

    constructor(
      public readonly rows: number,
      public readonly columns: number,
    ) {}

    public setIdentity(): void;
    public setElement(row: number, column: number, value: T): void;
    public getElement(row: number, column: number): T;
  }

  export = Matrix;
}

declare module "itk/PixelTypes" {
  /**
   * The itk/PixelTypes enum.
   * @see https://github.com/InsightSoftwareConsortium/itk-js/tree/master/src/PixelTypes.js
   */
  const PixelTypes: Record<
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
  export default PixelTypes;
}

declare module "itk/WorkerPool" {
  export default class WorkerPool {
    terminateWorkers(): void;
  }
}

declare module "itk/readImageDICOMFileSeries" {
  import Image from "itk/Image";
  import WorkerPool from "itk/WorkerPool";

  const readImageDICOMFileSeries: (
    fileList: FileList | File[],
    singleSortedSeries?: boolean,
  ) => Promise<{ image?: Image; webWorkerPool: WorkerPool }>;
  export default readImageDICOMFileSeries;
}

declare module "itk/readImageFile" {
  import Image from "itk/Image";

  const readImageFile: (
    webWorker: Worker | null,
    file: File,
  ) => Promise<{ image?: Image; webWorker: Worker }>;
  export default readImageFile;
}
