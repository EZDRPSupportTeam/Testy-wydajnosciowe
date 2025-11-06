import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__common_struktura_organizacyjna_as_pobierz_drzewo_struktur_query');
const apiMetricWaitingTime2 = new Trend('ezdrp__common_struktura_organizacyjna_as_wyszukaj_uzytkownikow_struktury_query');

export class _EzdRpApiStruktura extends EzdRpApi {

    pobierzDrzewo(param) {
        let params = this.getParams();
        let reqDataRaw = {};
        if (param && param.id && param.id != '') {
            reqDataRaw.id = param.id;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/struktura-organizacyjna/jednostki/cala-struktura', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    szukaj(param) {
        let params = this.getParams();
        let reqData = param ? this.toJson({
            "searchValue": param.search
        }) : null;
        let res = this.post('/common-struktura-organizacyjna-as-wyszukaj-uzytkownikow-struktury-query', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
}