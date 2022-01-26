export class ImageMismatchError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "ImageMismatchError";
  }
}
