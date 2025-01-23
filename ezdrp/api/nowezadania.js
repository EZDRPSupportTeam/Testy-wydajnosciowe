import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'


export class _EzdRpApiNoweZadania extends EzdRpApi {

    pobierzDoObsluzenia(param) {
        let params = this.getParams();
        let reqParam = {            
            "pageInfo": {
                "pageNumber":0,
                "pageSize":10
            },
            "sort":[]
        };
        if (param) {
            if (param.pageNumber && param.pageNumber >= 0) {
                reqParam.pageInfo.pageNumber = param.pageNumber;
            }
            if (param.sort) {
                reqParam.sort = param.sort;
            }
        }
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/do-obsluzenia/lista-stronnicowana', reqData, params);
        return res;
    }
    pobierzMonitorowanie(param) {
        let params = this.getParams();
        let reqParam = {            
            "pageInfo": {
                "pageNumber":0,
                "pageSize":10
            },
            "sort":[]
        };
        if (param) {
            if (param.pageNumber && param.pageNumber >= 0) {
                reqParam.pageInfo.pageNumber = param.pageNumber;
            }
            if (param.sort) {
                reqParam.sort = param.sort;
            }
        }
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/monitoring/lista-stronnicowana', reqData, params);
        return res;
    }
    pobierzFiltr(param) {
        let params = this.getParams();
        let reqParam = { "idWidok" : param.widok };
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/filtry/pobierz', reqData, params);
        return res;
    }
    dodajObieg(param) {
        let params = this.getParams();
        let reqParam = param ? {
            "nazwyPlikow": [
                param.nazwaPliku ],
                "zarejestrujRpw" : param.isRpw
            } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/obieg/dodaj', reqData, params);
        return res;
    }
    pobierzAkta(param) {
        let params = this.getParams();
        let reqParam = param ? {
            "pageInfo": {
                "pageNumber":0,
                "pageSize":20
            },
            "searchValue":"",
            "sort":[],
            "filtersConjunction":[],
            "idZadanie": param.idZadanie
        } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/akta/pobierz', reqData, params);
        return res;
    }
    pobierzSekcje(param) {
        let params = this.getParams();
        let reqParam = param ? { "idPrzestrzenRobocza" : param.idPrzestrzenRobocza } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/przestrzenie/sekcje/pobierz', reqData, params);
        return res;
    }
    
    pobierzObieg(param) {
        let params = this.getParams();
        let reqParam = param ? {
            "pageInfo": {
                "pageNumber":0,
                "pageSize":20
            },
            "searchValue":"",
            "sort":[],
            "filtersConjunction":[],
            "idObieg":param.idObieg
        } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/zadanie/szczegoly/obieg', reqData, params);
        return res;
    }
    
    szczegolyPrzestrzeni(param) {
        let params = this.getParams();
        let reqParam = { "idZadanie" : param.idZadanie };
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/zadanie/szczegoly', reqData, params);
        return res;
    }
    zmienNazweDokumentu(param) {
        let params = this.getParams();
        let reqParam = param ? {"idDokumentPrzestrzeni":param.idDokumentPrzestrzeni,"nazwa":param.nazwa} : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/zmien-nazwe-dokumentu', reqData, params);
        return res;
    }
    zmienNazweDokumentuRpw(param) {
        let params = this.getParams();
        let reqParam = param ? {"idDokumentPrzestrzeni":param.idDokumentPrzestrzeni,"nazwa":param.nazwa} : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/dokumenty/dokumenty/zmien-nazwe-dokumentu-pisma', reqData, params);
        return res;
    }
    historiaPrzestrzeni(param) {
        let params = this.getParams();
        let reqParam = param ? {
            "pageInfo": {
                "pageNumber":0,
                "pageSize":20
            },
            "sort": [ {"propertyColumn":"dataZdarzenia","propertySortType":"desc"}],
            "idObiekt" : param.idObieg
        } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/zdarzenia/obiekt/pobierz-liste', reqData, params);
        return res;
    }
    przekaz(param) {
        let params = this.getParams();
        let reqParam = param ? {
            "idObieg":param.idObieg,
            "krokiObiegu":[{
                "idObiekt":param.idObiekt,
                "typObiektu":1,
                "uwagi":param.uwagi,
                "numerKroku":1
            }],
            "dekretacja":false,
            "terminZalatwienia":"",
            "uwagiDoWiadomosci":"",
            "terminZalatwieniaDoWiadomosci":""
        } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/zadanie/przekaz', reqData, params);
        return res;
    }
    przyjmijZadanie(param) {
        let params = this.getParams();
        let reqParam = param ? { "idZadanie" : param.idZadanie } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/nowe-zadania/zadanie/przyjmij', reqData, params);
        return res;
    }
}