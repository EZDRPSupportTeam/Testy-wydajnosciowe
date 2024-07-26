const KEY_TEST_DEBUG = 'TEST_DEBUG';
const Config = { isDebug: true };

export function logInit(sysConfigSource, sessionConfig) {
    let cv = sysConfigSource.getConfig(KEY_TEST_DEBUG);
    if (cv === 'undefined' || cv === undefined) {
        cv = 'true';
    }
    Config.isDebug = cv === 'true';
    sessionConfig.setConfig(KEY_TEST_DEBUG, Config.isDebug);
}

export function log(obj) {
    if (Config.isDebug == false) { return; }
    let prefix = __VU;
    if (typeof __ITER === 'undefined') {

    } else {
        prefix = `${prefix} ${__ITER} `;
    }        
    let now = new Date();
    if (typeof obj === 'string') {
        console.log(`${now.toISOString()} ${prefix} ${obj}`);
    } else {
        console.log(`${now.toISOString()} ${prefix} ${JSON.stringify(obj)}`);
    }
}