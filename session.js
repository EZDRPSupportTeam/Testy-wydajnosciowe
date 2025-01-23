import { log } from './utils/log.js'
import { randomIntInclusive } from './utils/random.js'
import { ParamsUsers } from './params/users.js'
import { sleep as k6sleep } from 'k6';

const SLEEP_FACTORY = __ENV['SLEEP_FACTORY'] === undefined || __ENV['SLEEP_FACTORY'] === 'undefined' || __ENV['SLEEP_FACTORY'] === '' ? 5 : parseFloat(__ENV['SLEEP_FACTORY']);
const SLEEP_MIN = Math.floor(2 * SLEEP_FACTORY);
const SLEEP_MAX = Math.ceil(5 * SLEEP_FACTORY);
const SLEEP_QUICK_MIN = Math.floor(1 * SLEEP_FACTORY);
const SLEEP_QUICK_MAX = Math.ceil(2 * SLEEP_FACTORY);

class _Data {
    constructor(data, subSection) {
        this._dataSet = data;
        this._subSection = subSection;
    }
    getData(key, section) {
        let dataObj = this._dataSet;
        if (this._subSection && this._subSection != '') {
            dataObj = dataObj[this._subSection];
        }

        if (section && section != '') {
            if (dataObj) {
                dataObj = dataObj[section];
            } else {
                return null;
            }
        }
        return dataObj ? dataObj[key] : null;
    }
    setData(key, value, section) {

        if (section && section != '') {
            if (this._subSection && this._subSection != '') {
                if (this._dataSet[this._subSection] === undefined || this._dataSet[this._subSection] == null) {
                    let tempDataObj = {};
                    tempDataObj[section] = {};
                    tempDataObj[section][key] = value;
                    this._dataSet[this._subSection] = tempDataObj;
                } else {
                    if (this._dataSet[this._subSection][section] === undefined || this._dataSet[this._subSection][section] == null) {
                        let tempDataObj = {};
                        tempDataObj[key] = value;
                        this._dataSet[this._subSection][section] = tempDataObj;
                    } else {
                        this._dataSet[this._subSection][section][key] = value;
                    }
                }
            } else {
                if (this._dataSet[section] === undefined || this._dataSet[section] == null) {
                    let tempDataObj = {};
                    tempDataObj[key] = value;
                    this._dataSet[section] = tempDataObj;
                } else {
                    this._dataSet[section][key] = value;
                }
            }
        } else {
            if (this._subSection && this._subSection != '') {
                if (this._dataSet[this._subSection] === undefined || this._dataSet[this._subSection] == null) {
                    let tempDataObj = {};
                    tempDataObj[key] = value;
                    this._dataSet[this._subSection] = tempDataObj;
                } else {
                    this._dataSet[this._subSection][key] = value;
                }
            } else {
                this._dataSet[key] = value;
            }
        }
    }
    get dataSet() {
        return this._dataSet;
    }
}
class _Config extends _Data {
    constructor(config, subSection) {
        super(config, subSection);
    }
    getConfig(key, section) {
        return this.getData(key, section);
    }
    setConfig(key, value, section) {
        return this.setData(key, value, section);
    }
    get configSet() {
        return this._dataSet;
    }
}
class _Params extends _Data {
    constructor(params, subSection) {
        super(params, subSection);
    }
    getParam(key, section) {
        return this.getData(key, section);
    }
    setParam(key, value, section) {
        this.setData(key, value, section);
    }
    get paramSet() {
        return this._dataSet;
    }
}
const DATAKEY_TOKEN_DATE = 'token_date';
const DATAKEY_SSO_REFRESH_TOKEN = 'expires_in';
const DATAKEY_SSO_EXPIRES_IN = 'refresh_token';
const DATAKEY_SSO_TOKEN = 'token';
const DATAKEY_SSO_IDTOKEN = 'id_token';
const DATAKEY_LOGIN = 'login';
const DATAKEY_SID = 'sid';
const DATAKEY_USER_ROLES = 'user_roles';
const DATAKEY_SSO_USER = 'userid';
const DATAKEY_USER_ORG = 'user_org';
const DATAKEY_TEST_VU = 'vu';
const DATAKEY_TEST_ITER = 'iter'
const DATAKEY_CLEAR_COOKIE = 'clear_cookie'
class _Session {
    constructor(testInputData, globalCache, envKey) {
        this._config = new _Config(testInputData && testInputData.config ? testInputData.config : {}, envKey);
        this._data = new _Data(testInputData && testInputData.data ? testInputData.data : {}, envKey);
        this._params = new _Params(testInputData && testInputData.params ? testInputData.params : {}, envKey);
        this.envKey = envKey;
        this.onChangedCallbacks = new Array();
        this.setTestUserEngineId(0);
        this.setTestIterationEngineId(0);

        this._globalCache = globalCache;
    }
    get config() {
        return this._config;
    }
    get data() {
        return this._data;
    }
    get params() {
        return this._params;
    }
    getKey(key) {
        if (this.envKey && this.envKey != '') {
            return this.envKey + key;
        } else {
            return key;
        }
    }
    export() {
        return {
            config: this._config.configSet,
            data: this._data.dataSet,
            params: this._params.paramSet,
        };
    }
    getClearCookie() {
        let cc = this.getData(DATAKEY_CLEAR_COOKIE);
        if (cc) {
            this.setClearCookie(false);
        }
        return cc;
    }
    setClearCookie(clear) {
        this.setData(DATAKEY_CLEAR_COOKIE, clear);
    }
    setSsoContext(context) {
        this._setLogin(context.login);
        this._setSsoToken(context.accessToken);
        this._setSsoIdToken(context.id_token);
        if (context.refresh_token !== undefined && context.refresh_token !== '') {
            this._setSsoRefreshToken(context.refresh_token);
        }
        if (context.expires_in !== undefined && context.expires_in > 0) {
            this._setSsoExpiresIn(context.expires_in);
            var t = new Date();
            t.setSeconds(t.getSeconds() + context.expires_in);
            this._setSsoTokenDate(t.getTime());
        }
        this._setSsoUserId(context.sub);
    }
    getSsoContext() {
        let userLogin = this.getLogin();
        let userAccessToken = this.getSsoToken();
        let userIdToken = this.getSsoIdToken();
        let userSub = this.getSsoUserId();
        let expires_in = this.getSsoExpiresIn();
        let refresh_token = this.getSsoRefreshToken();
        let token_date = this.getSsoTokenDate();
        if (userLogin && userAccessToken && userSub) {
            return { login: userLogin, accessToken: userAccessToken, sub: userSub, isSignedIn: true, id_token: userIdToken, refresh_token: refresh_token, expires_in: expires_in, token_date: token_date };
        } else {
            return { isSignedIn: false, login: '' };
        }
    }
    _setLogin(value) {
        this.setCache(DATAKEY_LOGIN, value);
    }
    getLogin() {
        return this.getCache(DATAKEY_LOGIN);
    }
    setSid(value) {
        this.setCache(DATAKEY_SID, value);
        this.notifyOnChange();
    }
    getSid() {
        return this.getCache(DATAKEY_SID);
    }
    _setSsoRefreshToken(value) {
        this.setCache(DATAKEY_SSO_REFRESH_TOKEN, value);
    }
    getSsoRefreshToken() {
        return this.getCache(DATAKEY_SSO_REFRESH_TOKEN);
    }
    _setSsoExpiresIn(value) {
        this.setCache(DATAKEY_SSO_EXPIRES_IN, value);
    }
    getSsoExpiresIn() {
        return this.getCache(DATAKEY_SSO_EXPIRES_IN);
    }
    _setSsoTokenDate(value) {
        this.setCache(DATAKEY_TOKEN_DATE, value);
    }
    getSsoTokenDate() {
        return this.getCache(DATAKEY_TOKEN_DATE);
    }
    _setSsoToken(value) {
        this.setCache(DATAKEY_SSO_TOKEN, value);
    }
    getSsoToken() {
        return this.getCache(DATAKEY_SSO_TOKEN);
    }
    _setSsoIdToken(value) {
        this.setCache(DATAKEY_SSO_IDTOKEN, value);
    }
    getSsoIdToken() {
        return this.getCache(DATAKEY_SSO_IDTOKEN);
    }
    _setSsoUserId(value) {
        this.setCache(DATAKEY_SSO_USER, value);
    }
    getSsoUserId() {
        return this.getCache(DATAKEY_SSO_USER);
    }
    _setUserOrganization(value) {
        this.setCache(DATAKEY_USER_ORG, value);
    }
    getUserOrganization() {
        return this.getCache(DATAKEY_USER_ORG);
    }
    setUserRoles(value) {
        this.setCache(DATAKEY_USER_ROLES, value);
    }
    getUserRoles() {
        return this.getCache(DATAKEY_USER_ROLES);
    }
    hasRole(rolesToCheck){
        const roles = this.getUserRoles().map(role => role.toLowerCase());
        return rolesToCheck.some(role => roles.includes(role.toLowerCase()));
    }
    setTestUserEngineId(value) {
        this.setData(DATAKEY_TEST_VU, value);
    }
    getTestUserEngineId() {
        return this.getData(DATAKEY_TEST_VU);
    }
    setTestIterationEngineId(value) {
        this.setData(DATAKEY_TEST_ITER, value);
    }
    getTestIterationEngineId() {
        return this.getData(DATAKEY_TEST_ITER);
    }

    getConfig(key, section) {
        return this._config.getConfig(key, section);
    }
    setConfig(key, value, section) {
        this._config.setConfig(key, value, section)
    }

    getData(key, section) {
        return this._data.getData(key, section);
    }
    setData(key, value, section) {
        this._data.setData(key, value, section);
    }
    getParam(key, section) {
        return this._params.getParam(key, section);
    }
    setParam(key, value, section) {
        this._params.setParam(key, value, section);
    }
    logData(prefix) {
        let logPrefix = prefix ? prefix : '';
        log(`data ${logPrefix}: ${JSON.stringify(this._data.dataSet)}`);
    }
    logAll() {
        log(`config: ${JSON.stringify(this._config.configSet)}`);
        log(`data: ${JSON.stringify(this._data.dataSet)}`);
        log(`params: ${JSON.stringify(this._params)}`);
    }
    getCache(key, section) {
        return this._globalCache.getData(key, section, this.envKey);
    }
    setCache(key, value, section) {
        this._globalCache.setData(key, value, section, this.envKey);
    }
    dispose() {
        this._globalCache = null;
    }
    sleep(value) {
        k6sleep(value);
    }
    sleepMinMax(min, max) {
        this.sleep(randomIntInclusive(min, max));
    }
    sleepQuick(factory) {
        let localFactory = factory ? factory : 1;
        this.sleepMinMax(SLEEP_QUICK_MIN * localFactory, SLEEP_QUICK_MAX * localFactory);
    }
    sleepLong(factory) {
        let localFactory = factory ? factory : 1;
        this.sleepMinMax(SLEEP_MIN * localFactory, SLEEP_MAX * localFactory);
    }
    setChangeCallback(callback) {
        this.onChangedCallbacks.push(callback);
    }
    notifyOnChange() {
        let sessionChanged = this;
        this.onChangedCallbacks.forEach(function (c) {
            c(sessionChanged);
        });
    }
    setStanowiskoByKey(key) {
        let danePracownika = this.getUserOrganization();
        if (danePracownika && danePracownika.uzytkownik.listaStanowisk && danePracownika.uzytkownik.listaStanowisk.length > 1) {
            let userParamsData = ParamsUsers.getUserByLogin(this.getLogin());
            if (userParamsData && userParamsData.stanowiska_map) {
                let stanowiskoToSet = null;
                for (let stanowisko of danePracownika.uzytkownik.listaStanowisk) {
                    let symbolToSearch = stanowisko.komorkaOrganizacyjnaSymbol;
                    let uSM = userParamsData.stanowiska_map[symbolToSearch];
                    if (uSM) {
                        if (uSM.includes(key)) {
                            stanowiskoToSet = stanowisko;
                            break;
                        }
                    }
                    symbolToSearch = stanowisko.stanowisko;
                    uSM = userParamsData.stanowiska_map[symbolToSearch];
                    if (uSM) {
                        if (uSM.includes(key)) {
                            stanowiskoToSet = stanowisko;
                            break;
                        }
                    }
                }
                if (stanowiskoToSet) {
                    this.setSid(stanowiskoToSet.idStanowisko);
                } else {
                    log(`nie wybrano stanowiska ${key} ${this.getLogin()} ${JSON.stringify(userParamsData.stanowiska_map)}`);
                }
            } else {
            }
        }
    }
}

export { _Session as Session };