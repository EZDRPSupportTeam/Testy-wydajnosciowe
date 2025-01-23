import { _EzdRpApiJrwa } from '../api/jrwa.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'

class _EzdRpJrwa extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiJrwa(ezdrpc));
    }
    _wyszukajWykaz(param) {
        return this.checkBody(this.ezdRpApi.wyszukajWykaz(param));
    }
    wyszukajWykaz(param) {

        let jrwaWykaz = this._wyszukajWykaz(param);

        return jrwaWykaz ? jrwaWykaz.lista : null;
    }
    zmienTypProwadzenia(param) {
        return this.checkBody(this.ezdRpApi.zmienTypProwadzenia(param));
    }
    ustawNAS(param) {
        return this.checkBody(this.ezdRpApi.ustawNAS(param));
    }
    dodajPodteczke(param) {
        return this.checkBody(this.ezdRpApi.dodajPodteczke(param));
    }
}

export { _EzdRpJrwa as EzdRpJrwa }