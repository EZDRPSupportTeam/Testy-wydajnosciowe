import { Httpx } from "../libs/k6-httpx/index.js";
import { EzdRpConfig } from "./ezdrp-config.js";

class _EzdRpClient {
  constructor(session) {
    this._ezdRPConfig = new EzdRpConfig();
    this._ezdRPConfig.load(session);
    this._session = session;
    let authToken = this._session.getSsoToken();
    this._apiHttpClient = new Httpx({
      baseURL: `${this._ezdRPConfig.getApiUrl()}`,
      headers: {
        "User-Agent": "k6 api base" + Date.now(),
        Authorization: `Bearer ${authToken}`,
        "Accept-Encoding": "gzip, deflate, br",
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
      },
      timeout: 20000, // 20s timeout.
    });
    if (
      this._session.getLogin() === "administrator" ||
      this._session.getLogin() === "root"
    ) {
      this._session.setSid("roots");
    }
    let sidc = this._session.getSid();
    if (sidc && sidc !== "") {
      this._apiHttpClient.addHeader("sid", sidc);
    }
    let localHttpClient = this._apiHttpClient;
    this._session.setChangeCallback(function (sessionChanged) {
      let sid = sessionChanged.getSid();
      if (sid !== null && sid !== "") {
        localHttpClient.addHeader("sid", sid);
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

export { _EzdRpClient as EzdRpClient };
