import { randomIntInclusive, randomBool, randomFromArray, randomInt } from '../../utils/random.js'
import { log } from '../../utils/log.js'
import { Counter } from 'k6/metrics';

export class EzdRpTest {
    constructor(ezdrpc, ezdrpapi) {
        this._ezdRpClient = ezdrpc;
        this._session = ezdrpc.session;
        this._ezdRPApi = ezdrpapi;
    }

    get session() {
        return this._session;
    }
    get ezdRpClient() {
        return this._ezdRpClient;
    }

    get ezdRpApi() {
        return this._ezdRPApi;
    }

    setApi(ezdRpApi) {
        this._ezdRPApi = ezdRpApi;
    }

    setSession(session) {
        this._session = session;
    }

    setEzdRpClient(ezdRpClient) {
        this._ezdRpClient = ezdRpClient;
    }

    setSuitesFactory(sf) {
        this._suitesFactory = sf;
    }

    sleep(max) {
        if (!max) {
            max = 2;
        }
        this._session.sleep(randomIntInclusive(0, max));
    }

    checkBody(apiRes, metricCounter, beforeCallback, onlyBody, metric200Counter) {
        if (beforeCallback) { beforeCallback(apiRes); }
        if (metricCounter) { metricCounter.add(1); }
        if (apiRes === undefined || apiRes === null) { return null; }
        if (apiRes.status === 200 && metric200Counter) {
            metric200Counter.add(1);
        }
        if ((apiRes.status === 200 || apiRes.status === 400) && apiRes.body !== null && apiRes.body !== '') {
            let objApiRes = onlyBody ? apiRes.body : apiRes.body.length > 0 ? apiRes.json() : null;
            return objApiRes;
        }
        return null;
    }
}