import { _EzdRpApiBiurka } from '../api/biurka.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'

class _EzdRpBiurka extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiBiurka(ezdrpc));
    }
    
    _pobierzBiurka(param) {
        return this.checkBody(this.ezdRpApi.pobierz(param));
    }
    pobierzBiurka(param) {

        let obj = this._pobierzBiurka(param);

        return obj;
    }
}

export { _EzdRpBiurka as EzdRpBiurka }