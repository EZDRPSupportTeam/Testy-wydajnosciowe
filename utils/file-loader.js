import http from "k6/http";
import { FormData } from "../libs/k6-formdata/index.js";
import { log } from "./log.js";
import { randomIntMax } from "./random.js";

const MAX_FILES_PER_USER = 2;

const FILES = [
  "test mail.msg",
  "s190k sign.pdf",
];
const filesRead = new Array(0);
const fileNames = new Array(0);
class _FileLoader {
  static readAndAddFile() {
    for (let i = 0; i < FILES.length; i++) {
      let index = i; // randomIntMax(FILES.length);
      let key = FILES[index];
      let fileName = FILES[index];
      let filePath = this._getPath(fileName);
      let fd = new FormData();
      let fileContent = this._readFile(filePath);
      let fileContentType = key.endsWith("msg")
        ? "application/vnd.ms-outlook"
        : key.endsWith("pdf")
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      fd.append("files", http.file(fileContent, key, fileContentType));
      filesRead.push({ body: fd.body(), boundary: fd.boundary, name: key });
      fileNames.push(key);
    }
  }
  static init(vuid) {
    this.readAndAddFile();
  }
  static _logAvailableFileNames() {
    for (let i = 0; i < filesRead.length; i++) {
      log(`af: ${filesRead[i].name}`);
    }
  }
  static getAvailableFileNames() {
    return fileNames;
  }
  static _readFile(path) {
    return open(path, "b");
  }
  static _getPath(fileName) {
    return `./params/input/${fileName}`;
  }
  static loadFile(input) {
    let fileNameToFind = input.name;

    for (let i = 0; i < filesRead.length; i++) {
      let cf = filesRead[i];
      let isSame = cf.name === fileNameToFind; //cf.name.startsWith(input);
      if (isSame) {
        return cf;
      }
    }
  }
}

export { _FileLoader as FileLoader };
