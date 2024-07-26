import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { check } from 'k6';
import { sleep } from 'k6';
import http from "k6/http";
import { log } from '../utils/log.js';
import { randomStringNumber, randomStringNumberCase } from '../utils/random.js';
import { OidClient } from './_apiclient.js'
import { ParamsUsers } from '../params/users.js'
import { Counter } from 'k6/metrics';

const apiMetricCounter = new Counter('ezdrp_counter_sso_signin');
const apiMetricCounterSignout = new Counter('ezdrp_counter_sso_signout');
class _SsoSignIn {
    constructor(session) {
        this._session = session;
        this._oidc = new OidClient(this._session);
    }

    _checkAuthStatus(idTokenHint) {
        let authCheckRedirectPath = '/silent-renew';
        let authCheckState = randomStringNumber(32);
        let authCheckRes = this._oidc.checkAuthStatus(authCheckRedirectPath, authCheckState, idTokenHint);

        let authCheckResUrlVerify = new URL(authCheckRes.url);
        let authCheckResUrlSearchVerify = new URLSearchParams(authCheckResUrlVerify.search.slice(1));

        let ve = authCheckResUrlSearchVerify.get('error');
        let vs = authCheckResUrlSearchVerify.get('state');
        let vc = authCheckResUrlSearchVerify.get('code');
        return { error: ve, state: vs, code: vc, isSignedIn: ve == null && vc != null && vc != '' };
    }
    _getLoginPageSession() {
        let authLoginRedirectPath = '/signin-callback';
        let authLoginState = randomStringNumber(32);
        let authLoginRes = this._oidc.getLoginPage(authLoginRedirectPath, authLoginState);
        let authLoginResUrlVerify = new URL(authLoginRes.url);

        let vuJar = http.cookieJar();
        let cookiesForAuthLoginURL = vuJar.cookiesForURL(authLoginRes.url);

        let authLoginCookieUrl = new URL(`http://localhost${decodeURIComponent(cookiesForAuthLoginURL.login_sesion)}`);
        let authLoginCookieUrlSearchVerify = new URLSearchParams(authLoginCookieUrl.search.slice(1));


    }
    _endSession(token) {
        let redirectPath = '/index.html';
        let endSessionRes = this._oidc.endSession(redirectPath, token);
        let validStatus = endSessionRes.status == 302;

        return validStatus;
    }
    _sendLoginPassword(user) {
        let authLoginPassRes = this._oidc.sendLoginPassword(user);
        let authLoginPassResUrlVerify = new URL(authLoginPassRes.url);
        let authLoginPassResUrlSearchVerify = new URLSearchParams(authLoginPassResUrlVerify.search.slice(1));

        if (authLoginPassRes.status === 401) {
            throw `user ${user.login} failed the sign in`;
        }
        let validAuthLoginPassUrl = new URL(this._oidc.getLoginPasswordUrl());
        if (authLoginPassResUrlVerify.origin === validAuthLoginPassUrl.origin) {
            throw `login ${user.login} & pass invalid`;
        }
        if (!authLoginPassResUrlSearchVerify.get('code')) {
            throw 'no code after the sign in';
        }
        return authLoginPassResUrlSearchVerify.get('code');
    }
    _getUserToken(signInCode, isSignedIn) {
        let redirectPath = isSignedIn ? '/silent-renew' : '/signin-callback';
        let tokenRes = this._oidc.getToken(signInCode, redirectPath);

        if (tokenRes.status > 200) {
            throw `token failed for code: ${signInCode}`;
        }
        let token = tokenRes.json();
        let userToken = {
            id_token: token.id_token,
            access_token: token.access_token,
            refresh_token: token.refresh_token === undefined ? '' : token.refresh_token,
            expires_in: token.expires_in === undefined ? 0 : token.expires_in
        };
        return userToken;

    }
    _getUserInfo(accessToken) {
        let userRes = this._oidc.getUserInfo(accessToken);
        if (userRes.status > 200) {
            throw `user info failed for token: ${accessToken}`;
        }
        let userData = userRes.json();
        if (!userData) {
            throw 'no user info data';
        }
        return userData;
    }
    _checkSession() {
        let sessionRes = this._oidc.checkSession();


    }
    _selectLoginAndPass() {

        let userParamsInput = { userId: this._session.getTestUserEngineId(), iterationId: this._session.getTestIterationEngineId() };
        let userParamsRes = ParamsUsers.getUserParams(userParamsInput);
        if (!userParamsRes) {
            throw `login & pass was not drawn ${userParamsInput.userId} ${userParamsInput.iterationId}`;
        }
        let user = {
            login: userParamsRes.login,
            password: userParamsRes.password,
        };

        return user;
    }
    _setCurrentSsoContext(context) {
        this._session.setSsoContext(context);
    }
    _getCurrentSsoContext() {
        let context = this._session.getSsoContext();
        return context;
    }
    signIn(userOverride) {
        let currentContext = this._getCurrentSsoContext();
        let isSignedIn = currentContext.isSignedIn;
        if (isSignedIn) {
            let token_date = currentContext.token_date;
            let current_date = new Date();
            let current_time = current_date.getTime();
            let isExpired = current_time >= token_date;
            let time_diff = (token_date - current_time) / 1000;//seconds
            let expires_in = currentContext.expires_in;
            let expires_in_elapsed = 0;
            if (expires_in !== undefined && expires_in > 0) {
                expires_in_elapsed = expires_in * 0.75;//0.02;
            }
            let isTimeToRefresh = (expires_in - time_diff) > expires_in_elapsed;//sec
            if (isTimeToRefresh) {
                isSignedIn = false;
            }
        }
        if (!isSignedIn) {
            let checkIsUserSignedIn = false;
            let idTokenHint = currentContext.id_token;
            let authStatus = this._checkAuthStatus(idTokenHint);
            let signInCode = authStatus.code;
            let isSignedIn = authStatus.isSignedIn;
            if (isSignedIn) {
                checkIsUserSignedIn = true;
                let user = userOverride ? userOverride : currentContext.login === '' ? this._selectLoginAndPass() : { login: currentContext.login };
                let userToken = this._getUserToken(signInCode, checkIsUserSignedIn);
                let userData = this._getUserInfo(userToken.access_token);
                authStatus = this._checkAuthStatus(idTokenHint);
                signInCode = authStatus.code;
                userToken = this._getUserToken(signInCode, checkIsUserSignedIn);
                userData = this._getUserInfo(userToken.access_token);
                log(`relogin: ${currentContext.login} ${JSON.stringify(user)} ${JSON.stringify(userToken)} ${JSON.stringify(userData)}`);
                this._setCurrentSsoContext({
                    login: user.login,
                    accessToken: userToken.access_token,
                    id_token: userToken.id_token,
                    refresh_token: userToken.refresh_token,
                    expires_in: userToken.expires_in,
                    sub: userData.sub,
                });
            } else {
                checkIsUserSignedIn = false;
                authStatus = this._checkAuthStatus();
                this._getLoginPageSession();
                let user = userOverride ? userOverride : this._selectLoginAndPass();
                signInCode = this._sendLoginPassword(user);
                let userToken = this._getUserToken(signInCode, checkIsUserSignedIn);
                checkIsUserSignedIn = true;
                authStatus = this._checkAuthStatus();
                signInCode = authStatus.code;
                let userData = this._getUserInfo(userToken.access_token);
                this._checkSession();
                this._getUserToken(signInCode, checkIsUserSignedIn);

                this._setCurrentSsoContext({
                    login: user.login,
                    accessToken: userToken.access_token,
                    id_token: userToken.id_token,
                    refresh_token: userToken.refresh_token,
                    expires_in: userToken.expires_in,
                    sub: userData.sub,
                });
            }
            apiMetricCounter.add(1);
        }
    }
    signOut() {
        let userSession = this._getCurrentSsoContext();
        if (userSession.isSignedIn) {
            this._endSession(userSession.id_token);
            this._setCurrentSsoContext({
                login: null,
                accessToken: null,
                id_token: null,
                sub: null,
            });
        } else {
        }
        apiMetricCounterSignout.add(1);
    }
}

export { _SsoSignIn as SsoSignIn }

/*
{
    "authToken": "eyJhbGciOiJ....",
    "user": {
        "sub": "c105014c58a840bf8c85bf489c0415c6"
    }
}
*/
