import { _EzdRpApiZadania } from '../api/zadania.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'
import { Counter } from "k6/metrics";

const ezdrp_metric_akceptacja = new Counter("ezdrp_metrics_akceptacja");

class _EzdRpZadania extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiZadania(ezdrpc));
    }

    pobierzZadania(typParam) {
        return this.checkBody(this.ezdRpApi.pobierzZadania(typParam));
    }
    licznikZadan() {
        return this.checkBody(this.ezdRpApi.licznikZadan());
    }
    pobierzSzczegolyZadania(idZadania) {
        return this.checkBody(this.ezdRpApi.pobierzSzczegolyZadania({ idZadania: idZadania }));
    }
    przyjmijZadanie(idZadania) {
        return this.checkBody(this.ezdRpApi.przyjmijZadanie({ idZadania: idZadania }));
    }
    cofnijZadanie(idZadania, opis) {
        return this.checkBody(this.ezdRpApi.cofnijZadanie({ idZadania: idZadania, opis: opis }));
    }
    akceptujZadanie(param) {
        return this.checkBody(this.ezdRpApi.akceptujZadanie(param), null, null, null, ezdrp_metric_akceptacja);
    }
    dokumentSprawdzCzyIstniejeNowszaWersja(param) {
        return this.checkBody(this.ezdRpApi.dokumentSprawdzCzyIstniejeNowszaWersja(param));
    }
    pobierzZadaniaPowiazane(param) {
        return this.checkBody(this.ezdRpApi.pobierzZadaniaPowiazane(param));
    }
    pobierzSzablonyObiegu(param) {
        return this.checkBody(this.ezdRpApi.pobierzSzablonyObiegu(param));
    }
    pobierzSzablonyDekretacji(param) {
        return this.checkBody(this.ezdRpApi.pobierzSzablonyDekretacji(param));
    }
}

class _EzdRpZadaniaConst {
    Zadania_Nowe() { return '1'; }
    Zadania_WRealizacji() { return '3'; }
}
class _EzdRpZadaniaTypConst {
    ZadaniaTyp_DoAkceptacji() { return '2'; }
    ZadaniaTyp_DoPodpisu() { return '3'; }
    ZadaniaTyp_DoDekretacji() { return '4'; }
    ZadaniaTyp_DoRealizacji() { return '5'; }
}

export { _EzdRpZadania as EzdRpZadania, _EzdRpZadaniaConst as EzdRpZadaniaConst, _EzdRpZadaniaTypConst as EzdRpZadaniaTypConst }