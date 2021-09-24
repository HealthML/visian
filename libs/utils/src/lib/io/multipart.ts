/**
 * @file
 * @see https://gist.github.com/dcollien/76d17f69afe748afad7ff3a15ff9a08a
 */

// TODO: Extract sections type, complete refactoring

const buf2String = (buf: Uint8Array) => {
  let string = "";
  buf.forEach((byte) => {
    string += String.fromCharCode(byte);
  });
  return string;
};

export class Parser {
  public i = 0;
  protected current: string | null = null;

  constructor(
    public readonly array: Uint8Array,
    public readonly boundary: string,
  ) {}

  public next() {
    if (this.i >= this.array.byteLength) {
      this.current = null;
      return null;
    }

    this.current = String.fromCharCode(this.array[this.i]);
    this.i++;
    return this.current;
  }

  public skipPastNextBoundary() {
    let boundaryIndex = 0;
    let isBoundary = false;

    while (!isBoundary) {
      if (this.next() === null) {
        return false;
      }

      if (this.current === this.boundary[boundaryIndex]) {
        boundaryIndex++;
        if (boundaryIndex === this.boundary.length) {
          isBoundary = true;
        }
      } else {
        boundaryIndex = 0;
      }
    }

    return true;
  }

  public parseHeader() {
    let header = "";
    const skipUntilNextLine = () => {
      header += this.next();
      while (this.current !== "\n" && this.current !== null) {
        header += this.next();
      }
      if (this.current === null) {
        return null;
      }
    };

    let hasSkippedHeader = false;
    while (!hasSkippedHeader) {
      skipUntilNextLine();
      header += this.next();
      if (this.current === "\r") {
        header += this.next(); // skip
      }

      if (this.current === "\n") {
        hasSkippedHeader = true;
      } else if (this.current === null) {
        return null;
      }
    }

    return header;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processSections = (arraybuf: Uint8Array, sections: any[]) => {
  for (let i = 0; i !== sections.length; ++i) {
    const section = sections[i];
    if (section.header["content-type"] === "text/plain") {
      section.text = buf2String(arraybuf.slice(section.bodyStart, section.end));
    } else {
      const imgData = arraybuf.slice(section.bodyStart, section.end);
      section.file = new Blob([imgData], {
        type: section.header["content-type"],
      });
      const fileNameMatching =
        /\bfilename="([^"]*)"/g.exec(section.header["content-disposition"]) ||
        [];
      section.fileName = fileNameMatching[1] || "";
    }
    const matching =
      /\bname="([^"]*)"/g.exec(section.header["content-disposition"]) || [];
    section.name = matching[1] || "";

    delete section.headerStart;
    delete section.bodyStart;
    delete section.end;
  }

  return sections;
};

export const getMultiparts = (
  arraybuf: Uint8Array,
  boundaryContent: string,
) => {
  const boundary = `--${boundaryContent}`;
  const parser = new Parser(arraybuf, boundary);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sections: any[] = [];
  while (parser.skipPastNextBoundary()) {
    const header = parser.parseHeader();

    if (header !== null) {
      const headerLength = header.length;
      const headerParts = header.trim().split("\n");

      const headerObj: { [key: string]: string } = {};
      for (let i = 0; i !== headerParts.length; ++i) {
        const parts = headerParts[i].split(":");
        headerObj[parts[0].trim().toLowerCase()] = (parts[1] || "").trim();
      }

      sections.push({
        bodyStart: parser.i,
        header: headerObj,
        headerStart: parser.i - headerLength,
      });
    }
  }

  // add dummy section for end
  sections.push({
    headerStart: arraybuf.byteLength - boundary.length - 2, // 2 hyphens at end
  });
  for (let i = 0; i !== sections.length - 1; ++i) {
    sections[i].end = sections[i + 1].headerStart - boundary.length;

    // eslint-disable-next-line no-constant-condition
    if (String.fromCharCode(arraybuf[sections[i].end]) === "\r" || "\n") {
      sections[i].end -= 1;
    }
    // eslint-disable-next-line no-constant-condition
    if (String.fromCharCode(arraybuf[sections[i].end]) === "\r" || "\n") {
      sections[i].end -= 1;
    }
  }
  // remove dummy section
  sections.pop();

  sections = processSections(arraybuf, sections);

  return sections;
};
