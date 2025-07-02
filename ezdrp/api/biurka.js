import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__biurka_pobierz');

export class _EzdRpApiBiurka extends EzdRpApi {

    pobierz(param) {
        let params = this.getParams();
        let reqParam = {
            'status': 1,
            'zakres': 1,
            'pageInfo': {
                'pageNumber': 0,
                'pageSize': 20 
            },
            'sort': [],
            'terminSprawy': 0
        };
        if (param) {
            if (param.zakres && param.zakres > 0) {
                reqParam.zakres = param.zakres;
            }
            if (param.pageNumber && param.pageNumber >= 0) {
                reqParam.pageInfo.pageNumber = param.pageNumber;
            }
            if (param.sort) {
                reqParam.sort = param.sort;
            }
        }
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/proxy/biurka/pobierz', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}