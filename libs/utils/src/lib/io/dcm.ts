import dicomParser, { DataSet } from "dicom-parser";

export const createDicomFile = (byteArray: Uint8Array | Buffer, name: string) =>
  new File([byteArray], name, { type: "application/dicom" });

export const readDicomValue = async (file: File, tag: string) => {
  const dataSet = dicomParser.parseDicom(
    new Uint8Array(await file.arrayBuffer()),
  );
  return dataSet.string(`x${tag.replace(",", "").toLowerCase()}`);
};

/**
 * @see http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 */
const makeRandomString = (length: number) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const pad = (value: number, size: number) => {
  let s = String(value);
  while (s.length < size) s = `0${s}`;
  return s;
};

const makeDeIdentifiedValue = (length: number, vr = "LO") => {
  if (vr === "LO" || vr === "SH" || vr === "ST" || vr === "PN" || vr === "LT") {
    return makeRandomString(length);
  }
  if (vr === "DA") {
    const now = new Date();
    return (
      now.getFullYear() + pad(now.getMonth() + 1, 2) + pad(now.getDate(), 2)
    );
  }
  if (vr === "TM") {
    const now = new Date();
    return (
      pad(now.getHours(), 2) +
      pad(now.getMinutes(), 2) +
      pad(now.getSeconds(), 2)
    );
  }
  throw new Error(`Unknown VR: ${vr}`);
};

const replaceElements = (dataSet: DataSet, elements: string[]) => {
  elements.forEach((element) => {
    const parserElement = dataSet.elements[element];
    if (!parserElement) return;
    const { length, dataOffset } = parserElement;
    const newValue = makeDeIdentifiedValue(length, parserElement.vr);
    for (let i = 0; i < length; i++) {
      const char = newValue.length > i ? newValue.charCodeAt(i) : 32;
      dataSet.byteArray[dataOffset + i] = char;
    }
  });
  return dataSet;
};

export const deidentifyDicom = async (file: File, elements: string[]) => {
  const dataSet = dicomParser.parseDicom(
    new Uint8Array(await file.arrayBuffer()),
  );
  return createDicomFile(
    replaceElements(dataSet, elements).byteArray,
    file.name,
  );
};
