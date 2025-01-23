
import { setup as setupShared } from './_setup.js'
import { log } from './utils/log.js'
import { zakladaniestruktury1, KUIP_ENV_PREFIX } from './ezdrp/suites/kuip.js'
import { Cache } from './utils/cache.js'

export let options = {
    maxRedirects: 10,
    scenarios: {
        ezdrptest1: {
            executor: 'per-vu-iterations',
            exec: 'run',
            vus: 1,
            iterations: 1,
            maxDuration: '24h'
        }
    },
};

const globalCache = new Cache();

export function setup() {
    let session = setupShared([KUIP_ENV_PREFIX]);
    return session;
}

export function run(data) {
    zakladaniestruktury1(data, globalCache);
}