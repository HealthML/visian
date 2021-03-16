import JSZip from "jszip";

const jszip = new JSZip();

/** A Zip file. */
export class Zip {
  /** Creates a new Zip file object from a given `.zip` file. */
  public static async fromFile(file: File) {
    return new Zip(await jszip.loadAsync(file));
  }

  /** A list of all files contained in the zip file. */
  public readonly files: string[];

  constructor(protected zip: JSZip) {
    this.files = Object.keys(zip.files);
  }

  /** Decompresses and returns the specified file. */
  public async getFile(fileName: string) {
    const blob = await this.zip.file(fileName)?.async("blob");
    if (!blob) return;
    return new File([blob], fileName);
  }

  /** Decompresses and returns all files contained in the zip file. */
  public async getAllFiles() {
    return Promise.all(this.files.map((fileName) => this.getFile(fileName)));
  }
}
