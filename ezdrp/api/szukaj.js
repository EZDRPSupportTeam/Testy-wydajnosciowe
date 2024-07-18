import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__sprawy_pobierz_po_atrybutach');

export class _EzdRpApiSzukaj extends EzdRpApi {

    szukajByZnakSprawy(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = param ? this.toJson({
            "pageInfo": { "pageNumber": 0, "pageSize": 5 },
            "znakSprawy": param.znak,
            "jrwa": "",
            "status": "",
            "prowadzacySprawe": "",
            "tytulSprawy": "",
            "dataWszczeciaOd": null,
            "dataWszczeciaDo": null,
            "dataZakonczeniaOd": null,
            "dataZakonczeniaDo": null,
            "terminRealizacjiOd": null,
            "terminRealizacjiDo": null
        }) : null;
        let res = this.post('/ezdrp/sprawy/sprawy/pobierz-po-atrybutach', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}