import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__jrwa_as_wyszukaj_wykaz');
const apiMetricWaitingTime2 = new Trend('ezdrp__jrwa_zmien_typ');

export class _EzdRpApiJrwa extends EzdRpApi {

    wyszukajWykaz(param) {
        let params = this.getParams();
        let reqParam = param ? {
            'symbol': param.symbol
        } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/jrwa-as-wyszukaj-wykaz', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    zmienTypProwadzenia(param) {
        let params = this.getParams();
        let reqParam = { "idJRWASchematWykaz": param.jrwa, "typProwadzenia": `${param.typ}` };
        let reqData = this.toJson(reqParam);
        let res = this.post('/ezdrp/jrwa/wykaz/typ-prowadzenia/zmien', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
    ustawNAS(param) {
        let params = this.getParams();
        let reqParam = param;
        let reqData = this.toJson(reqParam);
        let res = this.post('/jrwa-nie-stanowi-akt-sprawy', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajPodteczke(param) {
        let params = this.getParams();
        let reqParam = param;
        let reqData = this.toJson(reqParam);
        let res = this.post('/jrwa-as-dodaj-podteczke', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}