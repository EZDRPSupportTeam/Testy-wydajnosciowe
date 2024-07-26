import http from 'k6/http';
import { EzdRpApi } from './_api-base.js'

export class _EzdRpApiIce extends EzdRpApi {

    getTest(methodName, sleep) {
        let params = this.getParams();
        let reqParam = null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.get(`/test/${methodName}-${sleep}`, reqData, params);
        return res;
    }
}