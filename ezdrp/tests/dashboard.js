import { check } from 'k6';
import { _EzdRpApiDashboard } from '../api/dashboard.js'
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'

class _EzdRpDashboard extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiDashboard(ezdrpc));
    }
    
    pobierzZastepstwaDashboard(pageParams) {
        return this.checkBody(this.ezdRpApi.pobierzZastepstwaDashboard(pageParams));
    }
    pobierzStatystykeSpraw() {
        return this.checkBody(this.ezdRpApi.pobierzStatystykeSpraw());
    }
    pobierzPrzydatneLinki() {
        return this.checkBody(this.ezdRpApi.pobierzPrzydatneLinki());
    }
    wersja() {
        return this.ezdRpApi.wersja();
    }
    statystykaZadan() {
        return this.checkBody(this.ezdRpApi.statystykaZadan());
    }
    pobierzElementyDashboard() {
        return this.checkBody(this.ezdRpApi.pobierzElementyDashboard());
    }
    pobierzLicznikMenu() {
        let objApiRes = this.checkBody(this.ezdRpApi.pobierzLicznikMenu());
        return objApiRes ? objApiRes.lista : null;
    }
    pobierzMenu() {
        return this.checkBody(this.ezdRpApi.pobierzMenu());
    }
    pobierzPraweMenu(idWidoku, idObiekt, idSekcja) {
        return this.checkBody(this.ezdRpApi.pobierzPraweMenu(idWidoku, idObiekt, idSekcja));
    }
    pobierzLicznikByTyp(liczniki, typ) {
        let lstLiczniki = liczniki;// && liczniki.lista ? liczniki.lista : null;
        if (lstLiczniki) {
            for (let i = 0; i < lstLiczniki.length; i++) {
                let licznik = lstLiczniki[i];
                if (licznik.id && licznik.id === typ) {
                    if (licznik.values && licznik.values.length > 0) {
                        return licznik.values[0];
                    } else {
                        return null;
                    }
                }
            }
        }
        return null;
    }
}

export { _EzdRpDashboard as EzdRpDashboard }