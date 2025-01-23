import { Session } from '../../session.js'
import { EzdRpTestSuite } from './_suite-base.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive } from '../../utils/random.js'
import { Trend } from 'k6/metrics';
import { log } from '../../utils/log.js'
import { EzdRpIce } from '../tests/ice.js'

const METHOD_NAME = __ENV['MN'];
const METHOD_SLEEP = __ENV['MS'] ? parseInt(__ENV['MS']) : 0;

export class EzdRpTestSuiteIce extends EzdRpTestSuite {
    test() {
        let ezdRpIce = new EzdRpIce(this.ezdRpClient);
        ezdRpIce.getTest(METHOD_NAME, METHOD_SLEEP);
    }
}