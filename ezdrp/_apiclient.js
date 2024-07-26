import { Httpx } from 'https://jslib.k6.io/httpx/0.0.6/index.js';
import { log } from "../utils/log.js";
import { EzdRpConfig } from './ezdrp-config.js';
import { _EzdRpProfile } from './api/profile.js'
import { _EzdRpApiDashboard } from './api/dashboard.js'

class _EzdRpClient {
    constructor(session) {
        this._ezdRPConfig = new EzdRpConfig();
        this._ezdRPConfig.load(session);
        this._session = session;
        let authToken = this._session.getSsoToken();
        this._apiHttpClient = new Httpx(
            {
                baseURL: `${this._ezdRPConfig.getApiUrl()}`,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                timeout: 20000 // 20s timeout.
            });
        let sidc = this._session.getSid();
        if (sidc && sidc !== '') {
            this._apiHttpClient.addHeader('sid', sidc);
        }
        let localHttpClient = this._apiHttpClient;
        this._session.setChangeCallback(function (sessionChanged) {
            let sid = sessionChanged.getSid();
            if (sid !== null && sid !== '') {
                localHttpClient.addHeader('sid', sid);
            }
        });
    }
    get apiHttpClient() {
        return this._apiHttpClient;
    }
    get ezdRPConfig() {
        return this._ezdRPConfig;
    }
    get session() {
        return this._session;
    }
}

export { _EzdRpClient as EzdRpClient }