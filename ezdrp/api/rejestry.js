import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__rejestry_lista');
const apiMetricWaitingTime2 = new Trend('ezdrp__pisma_szczegoly_rpw');
const apiMetricWaitingTime3 = new Trend('ezdrp__metadane_obiekt_pobierz_konfiguracje');
const apiMetricWaitingTime4 = new Trend('ezdrp__wyszukaj_adresatow');
const apiMetricWaitingTime5 = new Trend('ezdrp__dodaj_nowego_adresata');
const apiMetricWaitingTime6 = new Trend('ezdrp__zarejestruj_zalaczniki_w_skladzie');
const apiMetricWaitingTime7 = new Trend('ezdrp__rejestry_inne');

export class _EzdRpApiRejestry extends EzdRpApi {

    listaByJrwaId(jrwaId) {
        let params = this.getParams();
        let reqData = jrwaId ? this.toJson({
            'idJrwaSchematWykaz': jrwaId,
        }) : null;
        let res = this.post('/ezdrp/rejestry/rejestry/lista', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    szczegolyRpwByPismo(idPisma) {
        let params = this.getParams();
        let reqData = idPisma ? this.toJson({
            'idPismo': idPisma,
        }) : null;
        let res = this.post('/ezdrp/pisma/szczegoly-rpw', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
    getKonfiguracjaMetadanych(param) {
        let params = this.getParams();
        let reqDataRaw = { "idObiekt": param.idObiekt, "klucz": param.klucz };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/metadane-obiekt-pobierz-konfiguracje', reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        return res;
    }
    dodajMetadane(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/metadane-dodaj-metadane', reqData, params);
        apiMetricWaitingTime7.add(res.timings.waiting);
        return res;
    }
    
    getAdresatow(param) {
        let params = this.getParams();
        let reqDataRaw = { "searchValue": param.search };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/adresaci/adresaci/wyszukaj', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    wyszukajAdresataProponowanego(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "searchValue": param.search,
            "typAdresata": 1,
            "czyZbiorczy": false,
            "czyZPodadresatami": false,
            "czyTylkoZEpuap": false,
            "czyWyswietlicSkrytkiEpuap": false,
            "czyTylkoZAdresem": false
        };
        if (param.czyWyswietlicSkrytkiEpuap) {
            reqDataRaw.czyWyswietlicSkrytkiEpuap = param.czyWyswietlicSkrytkiEpuap;
        }
        if (param.czyTylkoZAdresem) {
            reqDataRaw.czyTylkoZAdresem = param.czyTylkoZAdresem;
        }
        if (param.czyZPodadresatami) {
            reqDataRaw.czyZPodadresatami = param.czyZPodadresatami;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/adresaci/adresaci/wyszukaj-proponowanego', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    dodajNowegoAdresata(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/adresaci/adresat/dodaj', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        return res;
    }
    zarejestrujZalacznikiWSkladzie(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            "ListaDokumentowDoSkladu": param
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/zarejestruj-zalaczniki-w-skladzie', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    dodajRejestr(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/rejestry/rejestr/zapisz', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    
    pobierzRejestry(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/rejestry/rejestry/lista-stronicowana', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    

}