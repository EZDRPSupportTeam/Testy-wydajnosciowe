import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__dodaj_pismo');
const apiMetricWaitingTime2 = new Trend('ezdrp__pobierz_liste_pism');
const apiMetricWaitingTime3 = new Trend('ezdrp__wyszukaj_pisma');
const apiMetricWaitingTime4 = new Trend('ezdrp__zapisz_pisma');
const apiMetricWaitingTime5 = new Trend('ezdrp__wczytaj_dokument');
const apiMetricWaitingTime6 = new Trend('ezdrp__pobierz_pisma');

export class _EzdRpApiPisma extends EzdRpApi {

    dodajPismo(dokumenty, isRpw) {
        let params = this.getParams();
        let reqData = this.toJson({
            'listaDokumentow': dokumenty,
            'rpw': isRpw ? isRpw : false
        });
        let res = this.post('/dodaj-pismo', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzListePism(param) {
        let params = this.getParams();
        let reqData = this.toJson({
            "pageInfo": { "pageNumber": 0, "pageSize": 20 },
            "sort": [],
            "mojePisma": param.mojePisma,
            "brakMetadanych": param.brakMetadanych
        });
        let res = this.post('/pobierz-liste-pism', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
    wyszukajPisma(param) {
        let params = this.getParams();
        let reqData = this.toJson({
            "searchValue": param.searchValue
        });
        let res = this.post('/wyszukaj-pisma', reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        return res;
    }
    zapiszPismo(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = this.toJson(param);
        let res = this.post('/zapisz-pismo', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    wczytajDokumentUtworzZadanie(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = this.toJson({
            "wczytajDokument":
            {
                "idPlikStorage": param.idPlikStorage,
                "checksum": param.checksum,
                "tytulDokumentu": param.tytulDokumentu,
                "isFileSignatureValid": true,
                "idDokument": param.idDokument
            },
            "idPismo": param.idPismo
        });
        let res = this.post('/wczytaj-dokument-rejestruj-zadanie', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        return res;
    }
    pobierzPisma(param) {
        let params = this.getParams();
        let reqData = this.toJson({
            "idPismo": param.idPismo
        });
        let res = this.post('/pobierz-pisma', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        return res;
    }
    pobierzDokumenty(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = this.toJson({
            "ListaIdDokumentPrzestrzeni": [param.idPrzestrzen]
        });
        let res = this.post('/pobierz-dokumenty', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        return res;
    }
}