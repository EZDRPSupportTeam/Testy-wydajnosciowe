import Enum from '../utils/enum.js';
import { log } from '../utils/log.js';
import { FileLoader } from '../utils/file-loader.js'
import { randomIntMax } from '../utils/random.js'

class _ParamsFiles {
    static init(vuid) {
        FileLoader.init(vuid);
    }
    static _getAvailableFileName() {
        let availableFileNames = FileLoader.getAvailableFileNames();
        let fileName = availableFileNames[randomIntMax(availableFileNames.length)];
   
        return fileName;
    }
    static getFileParams(input) {
   
        return this._getAvailableFileName();
    }
}

export { _ParamsFiles as ParamsFiles }

