import { _EzdRpApiKancelaria } from '../api/kancelaria.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'
import { Counter } from "k6/metrics";

const ezdrp_metric_kw = new Counter("ezdrp_metrics_kw");
const ezdrp_metric_kw_oznaczenie = new Counter("ezdrp_metrics_kw_oznaczenie");

class _EzdRpKancelaria extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiKancelaria(ezdrpc));
    }
    rejestrujPrzesylke(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.rejestrujPrzesylkeHurtowa(param));
        return objApiRes;
    }
    pobierzPismaDoRejestracjiWSkladzie(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.pobierzPismaDoRejestracjiWSkladzie(param));
        return objApiRes;
    }
    rejestrujKorespondencjeWychodzaca(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.rejestrujKorespondencjeWychodzaca(param), null, null, null, ezdrp_metric_kw);
        return objApiRes;
    }
    pobierzSzablonyWydrukowKW(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.pobierzSzablonyWydrukowKW(param));
        return objApiRes;
    }
    wybierzRodzajWydruku(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.wybierzRodzajWydruku(param));
        return objApiRes;
    }
    otworzKarton(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.otworzKarton(param));
        return objApiRes;
    }
    zestawienieKorespondencjiWychodzacej(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.zestawienieKorespondencjiWychodzacej(param));//, null, null, null, ezdrp_metric_kw_oznaczenie);
        return objApiRes;
    }
    wczytanieKW(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.wczytanieKW(param));//, null, null, null, ezdrp_metric_kw_oznaczenie);
        return objApiRes;
    }
    pobierzCenyPrzesylki(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.pobierzCenyPrzesylki(param));
        return objApiRes;
    }
    wyslijKoperte(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.wyslijKoperte(param), null, null, null, ezdrp_metric_kw_oznaczenie);
        return objApiRes;
    }
}

export { _EzdRpKancelaria as EzdRpKancelaria }