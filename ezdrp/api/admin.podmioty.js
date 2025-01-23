import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__podmioty');

export class _EzdRpApiAdminPodmioty extends EzdRpApi {

    pobierzPodmiotyKUIP_notused(param) {
        let params = this.getParams();
        let reqDataRaw = {"sort":[],"pageInfo":{"pageSize":1000,"pageNumber":1},"filtersConjunction":[]};
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/szukaj-podmioty', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzPodmioty(param) {
        let params = this.getParams();
        let reqDataRaw = {"pageInfo":{"pageSize":10000,"pageNumber":1}};
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/kuip/podmioty/pobierz-wszystkie', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    inicjalizacjaPodmiotu(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "id": param.idPodmiotu,
            "numer": param.numer
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/podmiot/inicjalizacja', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    inicjalizacjaKreatoraPodmiotu() {
        let params = this.getParams();
        let reqData = '';
        let res = this.post('/ezdrp/administracja/podmiot/inicjalizacja/zapisz', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}