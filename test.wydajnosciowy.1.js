
import { setup as setupShared, runtimeParams as setupParams, summaryExport } from './_setup.js'
import { log } from './utils/log.js'
import { pracownik4 } from './ezdrp/suites/pracownik.js'
import { Cache } from './utils/cache.js'

let runtimeParams = setupParams();

export let options = {
    maxRedirects: 10,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'p(99.99)', 'count'],
    summaryTimeUnit: 'ms',//s lub us
    NoCookiesReset: true,
    scenarios: {
        ezdrptest1: {
            executor: 'ramping-vus',
            exec: 'run',
            startVUs: 1,
            stages: runtimeParams.duration_stages,
            gracefulRampDown: '10s',
            gracefulStop: '10s',
        }
    }
};

const globalCache = new Cache();

export function setup() {
    let session = setupShared();
    return session;
}

export function run(data) {
    pracownik4(data, globalCache);
}

export function handleSummary(data) {   
    return summaryExport(data, globalCache);
}