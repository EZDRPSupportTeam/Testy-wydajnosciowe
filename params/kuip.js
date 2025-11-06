import { SysConfig } from '../utils/sys-config.js'
import { SharedArray } from "k6/data";
import { log } from "../utils/log.js";
import { randomIntMax } from '../utils/random.js'
const ENV_RAND = __ENV['PRAND'];
const ENV_RAND_FROM = __ENV['PRAND_FROM'];
const ENV_RAND_TO = __ENV['PRAND_TO'];
const data = function () {
    return new SharedArray("kuip.params", function () {
        let envUsersFile = __ENV['KUIP_FILENAME'];
        let filesPriority = new Array();
        if (envUsersFile === undefined || envUsersFile === 'undefined' || envUsersFile === '') {
            let url = __ENV['KUIP_URL_EZDRP'];
            if (url === undefined || url === 'undefined' || url === '') {
                url = __ENV['URL_EZDRP'];
            }
            let filenamePostfix = '';
            if (url !== '') {
                let urlObj = new URL(url);
                let urlDomain = urlObj.hostname;
                if (urlDomain !== undefined && urlDomain !== '') {
                    filesPriority.push(`./input/kuip-${urlDomain}.json`);
                    
                }
            }
        } else {
            filesPriority.push(envUsersFile);
        }
        let fileContent = '';
        filesPriority.push(`./input/kuip.json`);
        const debugParams = __ENV['DEBUG_PARAMS'];
        for (let i = 0; i < filesPriority.length; i++) {
            let fileToCheck = filesPriority[i];
            try {
                fileContent = open(`${fileToCheck}`);
                if (debugParams && debugParams !== '') {
                    log(`read kuip-template from ${fileToCheck}`);
                }
                break;
            } catch (e) {
                if (debugParams && debugParams !== '') {
                    log(`kuip-template file ${fileToCheck} skipped (not exists?)`);
                }
            }
        }
        return JSON.parse(fileContent);

    });
}();
class _ParamsKuipPodmioty {
    constructor() {
        this._podmioty = new Array();
    }
    get length() {
        return this._podmioty.length;
    }
    addPodmiot(podmiot) {
        this._podmioty.push(podmiot);
    }
    forEachPodmiot(callback) {
        if (!callback) { return; }
        for (let i = 0; i < this._podmioty.length; i++) {
            let podmiot = this._podmioty[i];
            callback(podmiot);
        }
    }
    get podmioty() { return this._podmioty; }
}
class _ParamsKuip {
    constructor() {
        
    }
    static init() {

    }
    static getKuipParams(input) {
        if (!data || data.length <= 0) {
            throw 'no kuip params data';
        }
        let dataTransformed = this.prepareData(data);
        return dataTransformed;
    }

    static prepareData(params) {
        let podmioty = new _ParamsKuipPodmioty();
        let podmiotyToPrepare = new Array();
        if (ENV_RAND && ENV_RAND != '') {
            
            podmiotyToPrepare.push(ENV_RAND);
        }
        if (ENV_RAND_FROM && ENV_RAND_FROM != '' && ENV_RAND_TO && ENV_RAND_TO != '') {
            let fromInt = parseInt(ENV_RAND_FROM);
            let toInt = parseInt(ENV_RAND_TO);
            
            if (fromInt > 0 && toInt > 0 && fromInt < toInt) {
                for (let n = fromInt; n <= toInt; n++) {
                    podmiotyToPrepare.push(`${n}`);
                }
            }
        }
        

        if (params && params.length > 0) {
            let podmiotTemplate = params[0];
            for (let i = 0; i < podmiotyToPrepare.length; i++) {
                let podmiotParam = podmiotTemplate;
                let podmiotRandom = podmiotyToPrepare[i];                
                
                let podmiot = JSON.parse(JSON.stringify(podmiotParam));

                
                delete podmiot['sklady'];
                podmiot.typ = podmiot.podmiot_typ;
                podmiot.random = podmiotRandom;
                podmiot['sklady'] = new Array();
                
                
                
                
                
                
                
                
                
                podmiot.nazwa = podmiotParam.podmiot_nazwa_format.replace('#', podmiotRandom);
                podmiot.symbol = podmiotParam.podmiot_symbol_format.replace('#', podmiotRandom);
                podmiot.epuap = podmiotParam.podmiot_epuap_format.replace('#', podmiotRandom);
                podmiot.numer = podmiotParam.numer_format.replace('#', podmiotRandom);
                podmiot.czy_aktualizowac = podmiotParam.podmiot_czy_istniejacy_aktualizowac;
                podmiot.kluczAPI = podmiotParam.kluczAPI;
                let loginFormat = podmiotParam.uzytkownicy_login_format;
                let hasloFormat = podmiotParam.uzytkownicy_haslo_format;
                podmiot.struktura = this.prepareStruktura(podmiotParam.struktura, loginFormat, hasloFormat, podmiotRandom);
                
                if (podmiotParam.uzytkownicy && podmiotParam.uzytkownicy.length > 0) {
                    let newUzytkownicy = new Array();
                    for (let n = 0; n < podmiotParam.uzytkownicy.length; n++) {
                        let uzytkownikParam = podmiotParam.uzytkownicy[n];
                        let uzytkownik = { 
                            imie: uzytkownikParam.imie, 
                            nazwisko: uzytkownikParam.nazwisko, 
                            stanowisko: uzytkownikParam.stanowisko, 
                            random: uzytkownikParam.random, 
                            isadmin: uzytkownikParam.isadmin, 
                            kluczAPI: uzytkownikParam.kluczAPI
                        };
                        uzytkownik.login = loginFormat.replace('#', podmiotRandom).replace('%', uzytkownikParam.random);
                        uzytkownik.haslo = hasloFormat.replace('#', podmiotRandom).replace('%', uzytkownikParam.random);
                        newUzytkownicy.push(uzytkownik);
                        
                    }
                    podmiot.uzytkownicy = newUzytkownicy;
                }
                if (podmiotParam.sklady && podmiotParam.sklady.length > 0) {
                    for (let n = 0; n < podmiotParam.sklady.length; n++) {
                        let sklad = podmiotParam.sklady[n];
                        podmiot.sklady.push({
                            nazwa: sklad.nazwa,
                            symbol: sklad.symbol,
                            opis: sklad.opis,
                            rodzajSkladu: sklad.rodzajSkladu,
                            idLokalizacja: ""
                        });
                    }
                }
                podmioty.addPodmiot(podmiot);
                
            }
        }/*
        */
        return podmioty;
    }

    static prepareStruktura(struktura, loginFormat, hasloFormat, random) {
        if (!struktura || struktura.length <= 0) {
            return struktura;
        }
        let newStruktura = new Array();
        
        for (let i = 0; i < struktura.length; i++) {
            let dzial = struktura[i];
            let newDzial = { symbol: dzial.symbol, nazwa: dzial.nazwa, typ: dzial.typ };
            
            if (dzial.uzytkownicy && dzial.uzytkownicy.length > 0) {
                let newUzytkownicy = new Array();
                for (let n = 0; n < dzial.uzytkownicy.length; n++) {
                    let uzytkownikParam = dzial.uzytkownicy[n];
                    let uzytkownik = { imie: uzytkownikParam.imie, nazwisko: uzytkownikParam.nazwisko, stanowisko: uzytkownikParam.stanowisko, random: uzytkownikParam.random, isadmin: uzytkownikParam.isadmin, kluczAPI: uzytkownikParam.kluczAPI, epuap: uzytkownikParam.epuap };
                    uzytkownik.login = loginFormat.replace('#', random).replace('%', uzytkownikParam.random);
                    uzytkownik.haslo = hasloFormat.replace('#', random).replace('%', uzytkownikParam.random);
                    newUzytkownicy.push(uzytkownik);
                    
                }
                newDzial.uzytkownicy = newUzytkownicy;
            }
            if (dzial.struktura && dzial.struktura.length > 0) {
                newDzial.struktura = this.prepareStruktura(dzial.struktura, loginFormat, hasloFormat, random);
            }
            newStruktura.push(newDzial);
        }
        return newStruktura;
    }

}

export { _ParamsKuip as ParamsKuip }