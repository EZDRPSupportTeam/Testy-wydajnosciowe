import { SysConfig } from '../utils/sys-config.js'
import { SharedArray } from "k6/data";
import { randomIntMax } from '../utils/random.js'

const typJrwaPapierowa = 1
const typJrwaElektroniczna = 2;

const data = function () {
    
    return new SharedArray("jrwa.params", function () { return JSON.parse(open('./input/jrwa.json')); });
}();

class _ParamsJrwa {
    constructor() {
        
    }
    static typPapierowa() {
        return typJrwaPapierowa;
    }
    static typElektroniczna() {
        return typJrwaElektroniczna;
    }
    static init() {

    }
    static getJrwaAll() {
        return data;
    }
    static getJrwaParams(input) {
        let userId = input && input > 0 ? input.userId - 1 : 0;
        let iterationId = input && input.iterationId >= 0 ? input.iterationId : 0;

        if (!data || data.length <= 0) {
            throw 'no jrwa params data';
        }
        if (input.typ && input.typ > 0) {
            let jrwaFilteredByTyp = new Array();
            for (let j of data) {
                if (j.t && j.t === input.typ) {
                    jrwaFilteredByTyp.push(j);
                }
            }
            if (jrwaFilteredByTyp.length <= 0) {
                throw `no filtered jrwa params data by typ ${input.typ}`;
            }
            return jrwaFilteredByTyp[randomIntMax(jrwaFilteredByTyp.length)];
        }
        return data[randomIntMax(data.length)];
    }
}

export { _ParamsJrwa as ParamsJrwa }