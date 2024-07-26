import { Counter, Trend } from "k6/metrics";
import { check } from 'k6';
import { uuidv4 } from "../../utils/k6utils.js";

const apiMetricWaitingTimeOperacje = new Trend('ezdrp_ometrics_operacje');
const timeouts = new Counter("http_error_timeouts");
const apiError400 = new Counter('http_400');
const apiError401_403 = new Counter('http_401_403');
const apiError404 = new Counter('http_404');
const apiError4XX = new Counter('http_error_4XX');
const apiError500 = new Counter('http_error_5xx');
const apiError0 = new Counter('http_error_0');


export class EzdRpApi {
    constructor(ezdRPApiClient) {
        this._apiHttpClient = ezdRPApiClient.apiHttpClient;
        this._ezdRpClient = ezdRPApiClient;
    }

    get apiHttpClient() {
        return this._apiHttpClient;
    }
    get ezdRpClient() {
        return this._ezdRpClient;
    }

    get metricsOperacje() {
        return apiMetricWaitingTimeOperacje;
    }

    toJson(input) {
        return JSON.stringify(input);
    }

    getParams() {
        let params = {
            headers: {
            },
        };
        return params;
    }

    checkRes(res, url) {
        if ('error' in res && res.error.toLowerCase().indexOf('timeout') !== -1) {
            timeouts.add(1);
        } else if (res.status) {

            if (res.status == 400) {
                apiError400.add(1);
            } else if (res.status >= 401 && res.status <= 403) {
                apiError401_403.add(1);
            } else if (res.status == 404 ) {
                apiError404.add(1);
            } else if (res.status >= 405 && res.status < 500) {
                apiError4XX.add(1);
            }            else if (res.status >= 500 && res.status < 600) {
                apiError500.add(1);
            } else if (res.status == 0) {
                apiError0.add(1);
            }
        }
        return res;
    }
    /**
     * zwraca url z parametrem drid. Zakłada że url nie posiada znaku ?
     */
    drid(url){
        return url;
    }

    uuidv4() {
        return uuidv4();
    }

    post(url, body, params) {
        return this.checkRes(this._apiHttpClient.post(url, body, params), url);
    }

    get(url, body, params) {
        return this.checkRes(this._apiHttpClient.get(url, body, params), url);
    }
}
