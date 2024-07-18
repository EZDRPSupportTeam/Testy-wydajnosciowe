import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__lista_moich_zadan');
const apiMetricWaitingTime2 = new Trend('ezdrp__licznik_zadan');
const apiMetricWaitingTime3 = new Trend('ezdrp__szczegoly_zadania');
const apiMetricWaitingTime4 = new Trend('ezdrp__przyjmij_zadanie');
const apiMetricWaitingTime5 = new Trend('ezdrp__akceptacja_dokumentow_as_dodaj_dokument_do_akceptacji_zaakceptuj');
const apiMetricWaitingTime6 = new Trend('ezdrp__lista_szablonow_obiegu');
const apiMetricWaitingTime7 = new Trend('ezdrp__lista_szablonow_dekretacji');
const apiMetricWaitingTime8 = new Trend('ezdrp__dokument_sprawdz_nowsza_wersje');

const apiMetricWaitingTime9 = new Trend('ezdrp__cofnij_zadanie');
export class _EzdRpApiZadania extends EzdRpApi {

    pobierzZadania(param) {
        let params = this.getParams();
        let reqDataRaw = param ? {
            "pageInfo": { "pageNumber": 0, "pageSize": 20 },
            "filtersConjunction": [],
            "sort": [],
            "listaTypOdczytu": [param.typ],
            "terminRealizacji": 0,
            "searchValue": ""
        } : null;
        if (param.typZadania) {
            reqDataRaw.filtersConjunction = [{
                "propertyColumn": "typ",
                "propertyFilterType": "EQ",
                "propertyValue": param.typZadania
            }
            ];
        }
        let reqData = reqDataRaw ? this.toJson(reqDataRaw) : null;
        let res = this.post('/lista-moich-zadan', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }

    licznikZadan() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = null;
        let res = this.post('/licznik-zadan', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }

    pobierzSzczegolyZadania(param) {
        let params = this.getParams();
        let reqDataRaw = {
            'idZadanie': param.idZadania
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/szczegoly-zadania', reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        return res;
    }
    przyjmijZadanie(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            'idZadan': [param.idZadania]
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/przyjmij-zadanie', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    cofnijZadanie(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            'opis': param.opis,
            'idZadan': [param.idZadania]
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/cofnij-zadanie', reqData, params);
        apiMetricWaitingTime9.add(res.timings.waiting);
        return res;
    }
    akceptujZadanie(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            'listaDokumentow': [
                {
                    'idDokumentWersja': param.idDokumentWersja,
                    'idPrzestrzenRobocza': param.idPrzestrzen,
                    'idDokument': param.idDokument
                }
            ],
            'idZadanie': param.idZadania
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/akceptacja-dokumentow-as-dodaj-dokument-do-akceptacji-zaakceptuj', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    dokumentSprawdzCzyIstniejeNowszaWersja(param) {
        let params = this.getParams();
        let reqDataRaw = { "listaIdDokumentWersja": [param.idDokumentWersja] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dokument-sprawdz-czy-istnieje-nowsza-wersja', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
    pobierzZadaniaPowiazane(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            "pageInfo": { "pageNumber": 0, "pageSize": 20, "totalItems": 10 },
            "searchValue": "",
            "sort": [],
            "filtersConjunction": [],
            "idSprawa": param.idSprawa,
            "status": null,
            "typ": null
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/zadania/zadania/powiazane/lista', reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        return res;
    }
    pobierzSzablonyObiegu(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = { "pageInfo": { "pageNumber": 0, "pageSize": 1000 } };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/lista-szablonow-obiegu', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        return res;
    }
    pobierzSzablonyDekretacji(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let res = this.post('/ezdrp/administracja/dekretacje/szablony/pobierz', null, params);
        apiMetricWaitingTime7.add(res.timings.waiting);
        return res;
    }
}