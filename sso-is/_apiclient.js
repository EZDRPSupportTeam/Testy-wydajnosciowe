import http from "k6/http";
import { log } from "../utils/log.js";
import { b64_sha256 } from '../utils/crypto.js';
import { randomStringNumber, randomStringNumberCase } from '../utils/random.js';
import { OidcConfig } from './oidc-config.js';
import { Counter, Trend } from "k6/metrics";
const timeouts = new Counter("http_error_timeouts_sso");

const ssoMetricWaitingTime = new Trend('ezdrp_waiting_sso');
class _OidClient {
    constructor(session) {
        this.oidcConfig = new OidcConfig();
        this.oidcConfig.load(session);
    }
    checkRes(res) {
        if ('error' in res && res.error.toLowerCase().indexOf('timeout') !== -1) {
            timeouts.add(1);
        }
        return res;
    }

    getLoginPasswordUrl() {
        return this.oidcConfig.getLoginPasswordUrl();
    }
    getRedirectUrl(path) {
        return this.oidcConfig.getRedirectUrl(path);
    }
    checkAuthStatus(redirectPath, state, idTokenHint) {

        let pkceCode = randomStringNumber(96);
        let pkceChallenge = b64_sha256(pkceCode).replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');
        this.oidcConfig.setPKCECode(pkceCode);
        this.oidcConfig.setPKCEChallenge(pkceChallenge);
        const signInParams = new URLSearchParams([
            ['client_id', `${this.oidcConfig.getClientId()}`],
            ['redirect_uri', this.oidcConfig.getRedirectUrl(redirectPath)],
            ['response_type', 'code'],
            ['scope', 'openid api.ezdrp.gov.pl'],
            ['state', state],
            ['code_challenge', pkceChallenge],
            ['code_challenge_method', 'S256'],
            ['prompt', 'none'],
            ['response_mode', 'query']
        ]);
        if (idTokenHint !== undefined && idTokenHint !== null && idTokenHint !== '') {
            signInParams.append('id_token_hint', idTokenHint);
        }
        let authorizeUrl = this.oidcConfig.getAuthUrl(signInParams.toString());
        let params = {
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
            },
            tags: {
                group: 'sso'
            }
        };
        let authorizeUrlObj = new URL(authorizeUrl);
        params.tags = { name: `${authorizeUrlObj.origin}${authorizeUrlObj.pathname}` }
        if (this.oidcConfig.getClearCookie()) {
            params.jar = null;
        } else {
        }
        let res = http.get(authorizeUrl, params);
        this.checkRes(res);
        ssoMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getLoginPage(redirectPath, state) {
        let pkceChallenge = this.oidcConfig.getPKCEChallenge();

        const signInParams = new URLSearchParams([
            ['client_id', this.oidcConfig.getClientId()],
            ['redirect_uri', this.oidcConfig.getRedirectUrl(redirectPath)],
            ['response_type', 'code'],
            ['scope', 'openid api.ezdrp.gov.pl'],
            ['state', state],
            ['code_challenge', pkceChallenge],
            ['code_challenge_method', 'S256'],
            ['response_mode', 'query']
        ]);
        let authorizeUrl = this.oidcConfig.getAuthUrl(signInParams.toString().replace(/\+/g, '%20'));
        let params = {
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
            },
            tags: {
                group: 'sso'
            }
        };
        let authorizeUrlObj = new URL(authorizeUrl);
        params.tags = { name: `${authorizeUrlObj.origin}${authorizeUrlObj.pathname}` }
        let res = http.get(authorizeUrl, params);
        this.checkRes(res);
        this.oidcConfig.setLoginPasswordUrl(res.url);
        if (res.cookies && res.cookies['AntiForgeryCookie'] && res.cookies['AntiForgeryCookie'].length > 0) {
            this.oidcConfig.setAntiForgeryCookie(res.cookies['AntiForgeryCookie'][0].value);
        }
        ssoMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    sendLoginPassword(user) {
        let authorizeUrl = this.oidcConfig.getLoginPasswordUrl();
        if (!authorizeUrl) {
            throw 'no login & password page url exists';
        }
        let params = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'gzip, deflate, br',
            },
            redirects: 2,
            tags: {
                group: 'sso'
            }
        };
        let formParams = {
            username: user.login,
            password: user.password,
            AntiForgeryToken: this.oidcConfig.getAntiForgeryCookie()
        };
        let authorizeUrlObj = new URL(authorizeUrl);
        params.tags = { name: `${authorizeUrlObj.origin}${authorizeUrlObj.pathname}` }
        let res = http.post(authorizeUrl, formParams, params);
        this.checkRes(res);
        ssoMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getToken(codeValue, redirectPath) {
        let authorizeUrl = this.oidcConfig.getTokenUrl();
        let params = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'gzip, deflate, br',
            },
            redirects: 0,
            tags: {
                group: 'sso'
            }
        };
        let pkceCode = this.oidcConfig.getPKCECode();
        let formParams = {
            client_id: `${this.oidcConfig.getClientId()}`,
            code: codeValue,
            redirect_uri: this.oidcConfig.getRedirectUrl(redirectPath),
            code_verifier: pkceCode,
            grant_type: 'authorization_code',
        };
        let authorizeUrlObj = new URL(authorizeUrl);
        params.tags = { name: `${authorizeUrlObj.origin}${authorizeUrlObj.pathname}` }
        let res = http.post(authorizeUrl, formParams, params);
        this.checkRes(res);
        ssoMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getUserInfo(accessToken) {
        let authorizeUrl = this.oidcConfig.getUserUrl();
        let params = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Accept-Encoding': 'gzip, deflate, br',
            },
            redirects: 0,
            tags: {
                group: 'sso'
            }
        };
        let authorizeUrlObj = new URL(authorizeUrl);
        params.tags = { name: `${authorizeUrlObj.origin}${authorizeUrlObj.pathname}` }
        let res = http.get(authorizeUrl, params);
        this.checkRes(res);
        ssoMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    checkSession() {
        let authorizeUrl = this.oidcConfig.getCheckSessionUrl();
        let params = {
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
            },
            responseType: 'none',
            redirects: 0
        };
        let authorizeUrlObj = new URL(authorizeUrl);
        params.tags = { name: `${authorizeUrlObj.origin}${authorizeUrlObj.pathname}` }
        let res = http.get(authorizeUrl, params);
        this.checkRes(res);
        return res;
    }
    endSession(redirectPath, idToken) {
        const endSessionParams = new URLSearchParams([
            ['post_logout_redirect_uri', this.oidcConfig.getRedirectUrl(redirectPath)],
            ['id_token_hint', `${idToken}`]
        ]);
        let endUrl = this.oidcConfig.getEndSessionUrl(endSessionParams.toString());
        let params = {
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
            },
            redirects: 1,
            tags: {
                group: 'sso'
            }
        };
        let authorizeUrlObj = new URL(endUrl);
        params.tags = { name: `${authorizeUrlObj.origin}${authorizeUrlObj.pathname}` }
        let res = http.get(endUrl, params);
        this.checkRes(res);
        ssoMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}

export { _OidClient as OidClient }
