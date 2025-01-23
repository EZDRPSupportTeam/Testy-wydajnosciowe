import { _EzdRpApiIce } from '../api/ice.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'

class _EzdRpIce {
    constructor(ezdrpc) {
        this._ezdRPClient = ezdrpc;
        this._session = ezdrpc.session;
        this._ezdRPApiIce = new _EzdRpApiIce(this._ezdRPClient);
    }
    getTest(methodName, sleep) {
        let apiRes = this._ezdRPApiIce.getTest(methodName, sleep);
        if (apiRes.status !== 200) {
            log(apiRes.status);
        }
        return null;
    }
}

export { _EzdRpIce as EzdRpIce }