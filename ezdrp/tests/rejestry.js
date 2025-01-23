import { _EzdRpApiRejestry } from '../api/rejestry.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'
import { Counter } from "k6/metrics";

const ezdrp_metric_metadane = new Counter("ezdrp_metrics_uzupelnianie_metadanych");
const ezdrp_metric_rejestracja_w_skladzie = new Counter("ezdrp_metrics_rejestracja_w_skladzie");

class _EzdRpRejestry extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiRejestry(ezdrpc));
    }

    _listaByJrwaId(jrwaId) {
        let objApiRes = this.checkBody(this.ezdRpApi.listaByJrwaId(jrwaId));
        if (!objApiRes || objApiRes.rejestry === undefined) {
            throw `no rejestry`;
        }
        return objApiRes;
    }
    _szczegolyRpwByPismo(idPisma) {
        let objApiRes = this.checkBody(this.ezdRpApi.szczegolyRpwByPismo(idPisma));
        if (!objApiRes || objApiRes.idPismo === undefined) {
            throw `no rpw by pismo`;
        }
        return objApiRes;
    }
    listaByJrwa(jrwaId) {

        let obj = this._listaByJrwaId(jrwaId);

        return obj.rejestry;
    }
    szczegolyRpwByPismo(idPisma) {
        let obj = this._szczegolyRpwByPismo(idPisma);
        return obj;
    }
    getKonfiguracjaMetadanych(param) {
        return this.checkBody(this.ezdRpApi.getKonfiguracjaMetadanych(param));
    }
    getAdresatow(param) {
        return this.checkBody(this.ezdRpApi.getAdresatow(param));
    }
    dodajNowegoAdresata(param) {
        return this.checkBody(this.ezdRpApi.dodajNowegoAdresata(param));
    }
    wyszukajAdresataProponowanego(param) {
        return this.checkBody(this.ezdRpApi.wyszukajAdresataProponowanego(param));
    }
    zarejestrujZalacznikiWSkladzie(param) {
        return this.checkBody(this.ezdRpApi.zarejestrujZalacznikiWSkladzie(param), null, null, null, ezdrp_metric_rejestracja_w_skladzie);
    }
    dodajMetadane(param) {
        return this.checkBody(this.ezdRpApi.dodajMetadane(param), null, null, null, ezdrp_metric_metadane);
    }
    dodajRejestr(param) {
        return this.checkBody(this.ezdRpApi.dodajRejestr(param));
    }
    pobierzRejestry(param) {
        return this.checkBody(this.ezdRpApi.pobierzRejestry(param));
    }
}

export { _EzdRpRejestry as EzdRpRejestry }