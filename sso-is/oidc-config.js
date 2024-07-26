import { log } from '../utils/log.js';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { EzdRpConfig } from '../ezdrp/ezdrp-config.js'
import { Httpx } from 'https://jslib.k6.io/httpx/0.0.6/index.js';
import { b64_sha256 } from '../utils/crypto.js';

const SESSIONKEY_CONFIG = 'sso';
const CONFIGKEY_BASE = 'SSO_BASE';
const CONFIGKEY_AUTH = 'SSO_AUTH';
const CONFIGKEY_END = 'SSO_END';
const CONFIGKEY_TOKEN = 'SSO_TOKEN';
const CONFIGKEY_USER = 'SSO_USER';
const CONFIGKEY_SESSION = 'SSO_SESSION';
const CONFIGKEY_CLIENTDOMAINHASH = 'SSO_CLIENTDHASH';
const CONFIGKEY_CLIENTID = 'SSO_CLIENTID';
const CONFIGKEY_REDIRECTURL = 'SSO_REDIRECTURL';
const CONFIGKEY_LOGINPASS = 'SSO_LOGINPASS';
const CONFIGKEY_ANTIFC = 'SSO_ANTIFC';
const CONFIGKEY_PKCE_CODE = 'SSO_PKCE_CO';
const CONFIGKEY_PKCE_CHALLENGE = 'SSO_PKCE_CH';

export function oidcSessionConfigSection() {
    return SESSIONKEY_CONFIG;
}
class _WebConfigParser {
    constructor(configJS) {
        this.bodyLines = configJS ? configJS.split(/[\r\n]+/) : [];
        this.cs = {};
        for (let n = 0; n < bodyLines.length; n++) {
            let nsplit = bodyLines[n].split('=');
            if (nsplit && nsplit.length == 2) {
                let keyLine = nsplit[0].trim();
                let valueLine = nsplit[1].trim();
                let keySplit = keyLine.split(' ');
                let key = '';
                let value = '';
                if (keySplit.length == 2) {
                    key = keySplit[1];
                }
                value = valueLine.replace(/\"/g, '').replace(/;/g, '');
                this.cs[key] = value;
            }
        }
    }
    getConfig(key) {
        return this.cs[key];
    }
}
class _WebConfigLoader {
    loadConfig(sysConfigProvider, sessionConfig, ssoConfig) {

        let ezdRpConfig = new EzdRpConfig();
        ezdRpConfig.load(sessionConfig);
        let ssoBaseUrl = ezdRpConfig.getAuthUrl();

        if(ssoBaseUrl === undefined || ssoBaseUrl === 'undefined') {
            throw 'empty SSO URL';
        }

        ssoConfig[CONFIGKEY_BASE] = ssoBaseUrl;

        let httpSso = new Httpx(
            {
                baseURL: `${ssoBaseUrl}`,
                headers: {
                },
                timeout: 20000 // 20s timeout.
            });

        let res = httpSso.get("/.well-known/openid-configuration");
        let resJson = null;
        try {
            resJson = res.json();
        } catch (e) {
            log(`error parsing sso .well-known: ${e}`);
            log(JSON.stringify(res));
        }
        if (resJson) {
            let oidcAuthEndpoint = resJson.authorization_endpoint;
            let oidcTokenEndpoint = resJson.token_endpoint;
            let isS256supported =
                resJson.code_challenge_methods_supported.includes("S256");
            let oidcUserInfo = resJson.userinfo_endpoint;
            let oidcCheckSessionEndpoint = resJson.check_session_iframe;
            let oidcEndEndpoint = resJson.end_session_endpoint;
            if (
                oidcAuthEndpoint &&
                oidcTokenEndpoint &&
                oidcUserInfo &&
                isS256supported
            ) {
                ssoConfig[CONFIGKEY_AUTH] = oidcAuthEndpoint;
                ssoConfig[CONFIGKEY_TOKEN] = oidcTokenEndpoint;
                ssoConfig[CONFIGKEY_USER] = oidcUserInfo;
                ssoConfig[CONFIGKEY_SESSION] = oidcCheckSessionEndpoint;
                ssoConfig[CONFIGKEY_END] = oidcEndEndpoint;
            } else {
                throw "sso config invalid";
            }
        } else {
            throw "no sso .well-known metadata";
        }

        let ezdUrlConfig = ezdRpConfig.getEzdRpUrl();
        let ezdUrl = new URL(ezdUrlConfig);
        ssoConfig[CONFIGKEY_CLIENTDOMAINHASH] = b64_sha256(ezdUrl.host);
        ssoConfig[CONFIGKEY_REDIRECTURL] = `${ezdUrl.origin}`;
        let appId = ezdRpConfig.getAppId();
        ssoConfig[CONFIGKEY_CLIENTID] = `${appId}_${ssoConfig[CONFIGKEY_CLIENTDOMAINHASH]}`;
    }
}
class _Config {
    constructor() {
        this._session = {};
    }

    static init(sysConfigProvider, config) {
        let ssoConfig = {};
        let webConfigLoader = new _WebConfigLoader();
        webConfigLoader.loadConfig(sysConfigProvider, config, ssoConfig);
        config.setConfig(SESSIONKEY_CONFIG, ssoConfig);
    }

    getClearCookie() {
        return this._session.getClearCookie();
    }

    load(config) {
        this._session = config;
    }

    getClientId() {
        return this._session.getConfig(CONFIGKEY_CLIENTID, oidcSessionConfigSection());
    }

    getRedirectUrl(urlPath) {
        let redirectUrl = this._session.getConfig(CONFIGKEY_REDIRECTURL, oidcSessionConfigSection());
        return redirectUrl ? `${redirectUrl}${urlPath}` : redirectUrl;
    }
    getAuthUrl(urlParams) {
        let authUrl = this._session.getConfig(CONFIGKEY_AUTH, oidcSessionConfigSection());
        return urlParams ? `${authUrl}?${urlParams}` : authUrl;
    }
    setLoginPasswordUrl(url) {
        this._session.setConfig(CONFIGKEY_LOGINPASS, url, oidcSessionConfigSection());
    }
    getLoginPasswordUrl() {
        return this._session.getConfig(CONFIGKEY_LOGINPASS, oidcSessionConfigSection());
    }
    setAntiForgeryCookie(value) {
        this._session.setData(CONFIGKEY_ANTIFC, value, oidcSessionConfigSection());
    }
    getAntiForgeryCookie() {
        return this._session.getData(CONFIGKEY_ANTIFC, oidcSessionConfigSection());
    }
    setPKCECode(value) {
        this._session.setData(CONFIGKEY_PKCE_CODE, value, oidcSessionConfigSection());
    }
    getPKCECode() {
        return this._session.getData(CONFIGKEY_PKCE_CODE, oidcSessionConfigSection());
    }
    setPKCEChallenge(value) {
        this._session.setData(CONFIGKEY_PKCE_CHALLENGE, value, oidcSessionConfigSection());
    }
    getPKCEChallenge() {
        return this._session.getData(CONFIGKEY_PKCE_CHALLENGE, oidcSessionConfigSection());
    }
    getTokenUrl() {
        return this._session.getConfig(CONFIGKEY_TOKEN, oidcSessionConfigSection());
    }
    getEndSessionUrl(urlParams) {
        let endUrl = this._session.getConfig(CONFIGKEY_END, oidcSessionConfigSection());
        return urlParams ? `${endUrl}?${urlParams}` : endUrl;
    }
    getUserUrl() {
        return this._session.getConfig(CONFIGKEY_USER, oidcSessionConfigSection());
    }
    getCheckSessionUrl() {
        return this._session.getConfig(CONFIGKEY_SESSION, oidcSessionConfigSection());
    }
}


export { _Config as OidcConfig }
