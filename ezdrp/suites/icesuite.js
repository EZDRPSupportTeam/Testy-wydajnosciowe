import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive } from '../../utils/random.js'
import { Trend } from 'k6/metrics';
import { log } from '../../utils/log.js'
import { EzdRpIce } from '../tests/ice.js'

const SLEEP_FACTORY = __ENV['SLEEP_FACTORY'] === undefined || __ENV['SLEEP_FACTORY'] === 'undefined' || __ENV['SLEEP_FACTORY'] === '' ? 1 : parseFloat(__ENV['SLEEP_FACTORY']);
const SLEEP_MIN = Math.floor(2 * SLEEP_FACTORY);
const SLEEP_MAX = Math.ceil(5 * SLEEP_FACTORY);
const SLEEP_QUICK_MIN = Math.floor(1 * SLEEP_FACTORY);
const SLEEP_QUICK_MAX = Math.ceil(2 * SLEEP_FACTORY);

export function ice(data, globalCache) {
    let session = new Session(data, globalCache);
    session.setTestUserEngineId(__VU);
    session.setTestIterationEngineId(__ITER);

    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let iceSuite = suitesFactory.getIce();
    
    iceSuite.test();

    session.sleepMinMax(SLEEP_QUICK_MIN, SLEEP_QUICK_MAX);
}