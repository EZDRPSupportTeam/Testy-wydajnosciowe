import { SysConfig } from '../utils/sys-config.js'
import { SharedArray } from "k6/data";
import { randomIntMax } from '../utils/random.js'

const data = function () {
    let noJrwa = __ENV['NO_JRWAB64'];
    if (noJrwa && noJrwa != '') { return null; }
    return open('./input/jrwab64.txt');
}();

class _ParamsJrwaB64 {
    constructor() {
    }
    static init() {

    }
    static getJrwaB64Params() {
        return data;
    }
}

export { _ParamsJrwaB64 as ParamsJrwaB64 }