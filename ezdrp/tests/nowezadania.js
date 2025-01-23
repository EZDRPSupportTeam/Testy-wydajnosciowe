import { _EzdRpApiNoweZadania } from '../api/nowezadania.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'
import { Counter } from "k6/metrics";

const ezdrp_metric1 = new Counter("ezdrp_metrics_nz_doobsluzenia");
const ezdrp_metric2 = new Counter("ezdrp_metrics_nz_szczegoly");
const ezdrp_metric3 = new Counter("ezdrp_metrics_nz_przekaz");
const ezdrp_metric4 = new Counter("ezdrp_metrics_nz_inne");
class _EzdRpNoweZadania extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiNoweZadania(ezdrpc));
    }
    
    pobierzDoObsluzenia(param) {
        return this.checkBody(this.ezdRpApi.pobierzDoObsluzenia(param), null, null, null, ezdrp_metric1);
    }

    dodajObieg(param) { 
        return this.checkBody(this.ezdRpApi.dodajObieg(param), null, null, null, ezdrp_metric4);
    }

    szczegolyPrzestrzeni(param) { 
        return this.checkBody(this.ezdRpApi.szczegolyPrzestrzeni(param), null, null, null, ezdrp_metric2);
    }
    pobierzAkta(param) { 
        return this.checkBody(this.ezdRpApi.pobierzAkta(param), null, null, null, ezdrp_metric4);
    }
    pobierzSekcje(param) { 
        return this.checkBody(this.ezdRpApi.pobierzSekcje(param), null, null, null, ezdrp_metric4);
    }
    pobierzObieg(param) { 
        return this.checkBody(this.ezdRpApi.pobierzObieg(param), null, null, null, ezdrp_metric4);
    }
    zmienNazweDokumentu(param) { 
        return this.checkBody(this.ezdRpApi.zmienNazweDokumentu(param), null, null, null, ezdrp_metric4);
    }
    zmienNazweDokumentuRpw(param) { 
        return this.checkBody(this.ezdRpApi.zmienNazweDokumentuRpw(param), null, null, null, ezdrp_metric4);
    }
    historiaPrzestrzeni(param) { 
        return this.checkBody(this.ezdRpApi.historiaPrzestrzeni(param), null, null, null, ezdrp_metric4);
    }
    przekaz(param) { 
        return this.checkBody(this.ezdRpApi.przekaz(param), null, null, null, ezdrp_metric3);
    }
    przyjmijZadanie(param) { 
        return this.checkBody(this.ezdRpApi.przyjmijZadanie(param), null, null, null, ezdrp_metric4);
    }
}

export { _EzdRpNoweZadania as EzdRpNoweZadania }