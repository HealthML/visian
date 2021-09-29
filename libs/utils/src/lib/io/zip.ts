import JSZip from "jszip";

/** A Zip file. */
export class Zip {
  /** Creates a new Zip file object from a given `.zip` file. */
  public static async fromZipFile(file: File) {
    return new this(await new JSZip().loadAsync(file));
  }

  /** Creates a new Zip file containing the given files. */
  public static async fromFiles(files: File[]) {
    const zip = new this();
    files.forEach((file) => {
      zip.addFile(file);
    });
    return zip;
  }

  constructor(protected zip = new JSZip()) {}

  /** A list of all files contained in the zip file. */
  public get files(): string[] {
    return Object.keys(this.zip.files);
  }

  /** Decompresses and returns the specified file. */
  public async getFile(fileName: string) {
    const blob = await this.zip.file(fileName)?.async("blob");
    if (!blob) return;
    return new File([blob], fileName.split("/").slice(-1)[0]);
  }

  public setFile(fileName: string, contents: string | ArrayBuffer | Blob) {
    this.zip.file(fileName, contents);
  }

  public addFile(file: File) {
    this.setFile(file.name, file);
  }

  /** Decompresses and returns all files contained in the zip file. */
  public getAllFiles() {
    return Promise.all(
      this.files.map((fileName) => this.getFile(fileName) as Promise<File>),
    );
  }

  public toBlob() {
    return this.zip.generateAsync({ type: "blob" });
  }
}
