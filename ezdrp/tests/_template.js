import { _EzdRpApiTemplate } from '../api/_template.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'

class _EzdRpTemplate {
    constructor(ezdrpc) {
        this._ezdRPClient = ezdrpc;
        this._session = ezdrpc.session;
        this._ezdRPApiTemplate = new _EzdRpApiTemaplate(this._ezdRPClient);
    }
    _prepareOperation(param) {
        let apiRes = this._ezdRPApiTemplate.operacja(param);
        let objApiRes = apiRes.json();
        if (!objApiRes || objApiRes.length === undefined || objApiRes.length <= 0) {
            throw ``;
        }
        let objRes = objApiRes[0];
        if (!objRes || objRes === '') {
            throw '';
        }
        return objRes;
    }
    operation(param) {

        let obj = this._prepareOperation(param);

        return obj;
    }
}

export { _EzdRpTemplate as EzdRpTemplate }