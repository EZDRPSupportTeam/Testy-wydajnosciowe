import { log } from '../utils/log.js';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { Httpx } from 'https://jslib.k6.io/httpx/0.0.6/index.js';

const SESSIONKEY_CONFIG = 'ezdrp';
const CONFIGKEY_URL_EZDRP = 'URL_EZDRP';
const CONFIGKEY_URL_EZDRPCONFIG = 'EZDRP_URLCONFIG';
const CONFIGKEY_URL_SSO = 'AUTHORITY_URL';
const CONFIGKEY_URL_API = 'API_URL';
const CONFIGKEY_VERSION_API = 'API_VERSION';
const CONFIGKEY_URL_FILE = 'FILE_REPOSITORY';
const CONFIGKEY_VERSION = 'VERSION';
const CONFIGKEY_APP_CONFIG = 'APP_CONFIG';


export function ezdRpSessionConfigSection() {
    return SESSIONKEY_CONFIG;
}
class _SysConfigLoader {
    constructor(envKey) {
        this.envPrefix = envKey;
    }
    getKey(key) {
        if (this.envPrefix && this.envPrefix != '') {
            return this.envPrefix + key;
        } else {
            return key;
        }
    }
    loadConfig(sysConfigSource, ezdRpConfigSet) {
        let cKey = this.getKey(CONFIGKEY_URL_EZDRP);
        let ezdRpUrlConfig = sysConfigSource.getConfig(cKey);
        let ezdRpUrl = new URL(ezdRpUrlConfig);
        ezdRpConfigSet[CONFIGKEY_URL_EZDRP] = ezdRpUrl.origin;

        cKey = this.getKey(CONFIGKEY_URL_EZDRPCONFIG);
        let ezdRpConfigFileUrl = sysConfigSource.getConfig(cKey);
        if (ezdRpConfigFileUrl === 'undefined' || ezdRpConfigFileUrl === undefined) {
            ezdRpConfigFileUrl = 'dd48835e20bf710777d49935290f6374.js';
        }
        ezdRpConfigSet[CONFIGKEY_URL_EZDRPCONFIG] = ezdRpConfigFileUrl;
    }
}
class _WebConfigParser {
    constructor(configJS) {
        this.bodyLines = configJS ? configJS.split(/[\r\n]+/) : [];
        this.cs = {};
        for (let n = 0; n < this.bodyLines.length; n++) {
            let nsplit = this.bodyLines[n].split('=');
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
    constructor() {
    }
    loadConfig(sysConfigSource, ezdRpConfigSet) {
        let baseUrl = `${ezdRpConfigSet[CONFIGKEY_URL_EZDRP]}`;
        let httpEzdRp = new Httpx(
            {
                baseURL: baseUrl,
                headers: {
                },
                timeout: 20000 // 20s timeout.

            });
        let baseConfigUrl = `/${ezdRpConfigSet[CONFIGKEY_URL_EZDRPCONFIG]}`;
        let ezdRpConfigRes = httpEzdRp.get(baseConfigUrl);
        if(ezdRpConfigRes && (ezdRpConfigRes.status == undefined || ezdRpConfigRes.status !== 200)) {
            log(`get config failed: ${baseUrl}${baseConfigUrl}  RES: ${JSON.stringify(ezdRpConfigRes)}`);
        }
        let ezdRpConfigParser = ezdRpConfigRes && ezdRpConfigRes.body ? new _WebConfigParser(ezdRpConfigRes.body) : null;
        if (ezdRpConfigParser) {
            ezdRpConfigSet[CONFIGKEY_URL_SSO] = ezdRpConfigParser.getConfig(CONFIGKEY_URL_SSO);
            ezdRpConfigSet[CONFIGKEY_VERSION] = ezdRpConfigParser.getConfig(CONFIGKEY_VERSION);
            ezdRpConfigSet[CONFIGKEY_APP_CONFIG] = ezdRpConfigParser.getConfig(CONFIGKEY_APP_CONFIG);
            ezdRpConfigSet[CONFIGKEY_URL_SSO] = ezdRpConfigParser.getConfig(CONFIGKEY_URL_SSO);
            ezdRpConfigSet[CONFIGKEY_URL_API] = ezdRpConfigParser.getConfig(CONFIGKEY_URL_API);
            ezdRpConfigSet[CONFIGKEY_URL_FILE] = ezdRpConfigParser.getConfig(CONFIGKEY_URL_FILE);
        }
    }
}
class _Config {
    constructor() {
        this._session = {};
    }
    getKey(key) {
        return key;
    }
    static init(sysConfigProvider, sessionConfig) {
        let ezdRpConfig = {};
        let sysConfigLoader = new _SysConfigLoader(sessionConfig.getKey(''));
        sysConfigLoader.loadConfig(sysConfigProvider, ezdRpConfig);

        let webConfigLoader = new _WebConfigLoader();
        webConfigLoader.loadConfig(sysConfigProvider, ezdRpConfig);

        sessionConfig.setConfig(SESSIONKEY_CONFIG, ezdRpConfig);
    }
    load(session) {
        this._session = session;
    }
    getAppId() {
        return this._session.getConfig(this.getKey(CONFIGKEY_APP_CONFIG), ezdRpSessionConfigSection());
    }
    getEzdRpUrl(urlParams) {
        let ezdRpUrl = this._session.getConfig(this.getKey(CONFIGKEY_URL_EZDRP), ezdRpSessionConfigSection());
        return urlParams ? `${ezdRpUrl}?${urlParams}` : ezdRpUrl;
    }
    getAuthUrl(urlParams) {
        let authUrl = this._session.getConfig(this.getKey(CONFIGKEY_URL_SSO), ezdRpSessionConfigSection());
        return urlParams ? `${authUrl}?${urlParams}` : authUrl;
    }
    getFileUrl(urlParams) {
        let authUrl = this._session.getConfig(this.getKey(CONFIGKEY_URL_FILE), ezdRpSessionConfigSection());
        return urlParams ? `${authUrl}?${urlParams}` : authUrl;
    }
    getApiUrl(urlParams) {
        let apiUrl = this._session.getConfig(this.getKey(CONFIGKEY_URL_API), ezdRpSessionConfigSection());
        return urlParams ? `${apiUrl}?${urlParams}` : apiUrl;
    }
    getApiVersion() {
        return this._session.getConfig(this.getKey(CONFIGKEY_VERSION_API), ezdRpSessionConfigSection());
    }
    setApiVersion(ver) {
        this._session.setConfig(this.getKey(CONFIGKEY_VERSION_API), ver, ezdRpSessionConfigSection());
    }
}

export { _Config as EzdRpConfig }