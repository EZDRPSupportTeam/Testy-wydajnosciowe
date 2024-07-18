
import { SsoSignIn } from './sso-is/signin.js'
import { ParamsLoader } from './params/_params-loader.js'
import { Session } from './session.js'
import { logInit, log } from './utils/log.js'
import { Cache } from './utils/cache.js'
import { SysConfig } from './utils/sys-config.js';
import { EzdRpConfig } from './ezdrp/ezdrp-config.js';
import { OidcConfig } from './sso-is/oidc-config.js';
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from './utils/bundle.js';
import { EzdRpTestSuiteFactory } from './ezdrp/suites/_suite-factory.js'

ParamsLoader.init();

export function runtimeParams(defaultTimeout) {
    let runParams = { usersCount: 0, duration: 0, duration_stages: [] };
    let systemConfigSource = SysConfig;
    let usersCount = systemConfigSource.getConfig('USERS_COUNT');
    if (usersCount !== 'undefined' && usersCount !== undefined && usersCount !== '') {
        runParams.usersCount = parseInt(usersCount);
    }
    let duration = systemConfigSource.getConfig('DURATION_TIME');
    if (duration !== 'undefined' && duration !== undefined && duration !== '') {
        runParams.duration = parseInt(duration);
    }
    if (runParams.duration <= 0) {
        if (defaultTimeout === undefined || defaultTimeout === 'undefined' || defaultTimeout <= 0) {
            runParams.duration = 5;
        } else {
            runParams.duration = defaultTimeout;
        }
    }
    if (runParams.duration > 2) {        
        let warmEnv = systemConfigSource.getConfig('WARM');
        let warmDuration = 5;
        if (warmEnv !== 'undefined' && warmEnv !== undefined && warmEnv !== '') {
            warmDuration = parseInt(warmEnv);//nie trzeba parsowac ale potencjalna kontrola wartosci
        }
        runParams.duration_stages.push({ duration: `${warmDuration}m`, target: runParams.usersCount });
    }
    runParams.duration_stages.push({ duration: `${runParams.duration}m`, target: runParams.usersCount });

    return runParams;
}

export function summaryExport(data, globalCache) {
    log('Preparing the end-of-test summary...');

    try {
        if (data.setup_data && data.setup_data.config && data.setup_data.config.ezdrp) {
            let globalCache = new Cache();
            let sessionData = setup();
            let session = new Session(sessionData, globalCache);
            session.setTestUserEngineId(1);
            session.setTestIterationEngineId(1);
            let ssoSignIn = new SsoSignIn(session);
            ssoSignIn.signIn();
            let suitesFactory = new EzdRpTestSuiteFactory(session);
            let dashboardSuite = suitesFactory.getDashboard();
            data.setup_data.config.ezdrp.API_VERSION = dashboardSuite.wersja().body.replace(/\"/g, '');
        }
    } catch (e) { log(`api version error ${e}`); }

    let systemConfigSource = SysConfig;
    let outputFileName = systemConfigSource.getConfig('OUTPUT_FILENAME');
    if (outputFileName === undefined || outputFileName === 'undefined' || outputFileName === '') {
        let d = new Date();
        var cd = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
            d.getFullYear() + "_" + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2);
        outputFileName = `summary_${cd}`;
    } else {
    }
    let summaryValue = textSummary(data, { indent: ' ', enableColors: true });
    let summaryKey = 'stdout';
    let returnObj = {};
    returnObj[summaryKey] = summaryValue;

    summaryKey = `${outputFileName}.json`;
    summaryValue = JSON.stringify(data);
    returnObj[summaryKey] = summaryValue;

    summaryKey = `${outputFileName}.html`;
    summaryValue = htmlReport(data);
    returnObj[summaryKey] = summaryValue;

    return returnObj;
}

export function setup(envKeys) {
    let session = new Session({});
    let systemConfigSource = SysConfig;
    logInit(systemConfigSource, session);
    EzdRpConfig.init(systemConfigSource, session);
    let sessionData = session.export();
    OidcConfig.init(systemConfigSource, session);
    if (envKeys && envKeys.length > 0) {
        for (let i = 0; i < envKeys.length; i++) {
            let envKey = envKeys[i];
            log(`processing key: ${envKey}`);
            let sessionData = session.export();
            session = new Session(sessionData, null, envKey);
            EzdRpConfig.init(systemConfigSource, session);
            sessionData = session.export();
            OidcConfig.init(systemConfigSource, session);
        }
    } else {
    }
    let envKey = 'SLEEP_FACTORY';
    let envValue = systemConfigSource.getConfig(envKey);
    session.setParam(envKey, envValue, 'envs');

    envKey = 'USERS_COUNT';
    envValue = systemConfigSource.getConfig(envKey);
    session.setParam(envKey, envValue, 'envs');

    envKey = 'DURATION_TIME';
    envValue = systemConfigSource.getConfig(envKey);
    session.setParam(envKey, envValue, 'envs');

    sessionData = session.export();
    return sessionData;
}
