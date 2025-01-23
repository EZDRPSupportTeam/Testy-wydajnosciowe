import { _EzdRpApiSprawy } from '../api/sprawy.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'
import { Counter } from "k6/metrics";

const ezdrp_metric_zakladanie_spraw = new Counter("ezdrp_metrics_zakladanie_sprawy");

const apiMetricCounterZadanieDoAkceptacji = new Counter('ezdrp_metrics_nowezadanie_doakceptacji');
const apiMetricCounterZadanieDoDekretacji = new Counter('ezdrp_metrics_nowezadanie_dodekretacji');
const apiMetricCounterZadanieDoRealizacji = new Counter('ezdrp_metrics_nowezadanie_dorealizacji');
const apiMetricCounterZadanieInne = new Counter('ezdrp_metrics_nowezadanie_inne');

class SzczegolySprawy {

    constructor() {
        this.dataSet = {
            sprawa: null,
            akta: null,
            notatkiWlasne: null,
            zadania: null
        }
    }
    getSprawa() {
        return this.dataSet.sprawa;
    }
    setSprawa(sprawa) {
        this.dataSet.sprawa = sprawa;
    }
    getAkta() {
        return this.dataSet.akta;
    }
    setAkta(akta) {
        this.dataSet.akta = akta;
    }
    getDokumentCount(typ) {
        if (!this.dataSet || !this.dataSet.akta) {
            return 0;
        }
        let aktaItems = this.dataSet.akta.items;
        if (!aktaItems || aktaItems.length <= 0) {
            return 0;
        }

        return aktaItems.length;
    }
    getDokument(skip, typ) {
        if (!this.dataSet || !this.dataSet.akta) {
            return null;
        }
        let aktaItems = this.dataSet.akta.items;
        if (!aktaItems || aktaItems.length <= 0) {
            return null;
        }
        let anyDokument = null;
        let typToSearch = typ ? typ : "dokumentPrzestrzeni";
        let toSkip = skip ? skip : 0;
        for (let akt of aktaItems) {
            let validAkt = akt[typToSearch];
            if (validAkt && validAkt.idPlikStorage && validAkt.idPlikStorage != '') {
                anyDokument = validAkt;
                return validAkt;
            }
        }
        return anyDokument;
    }
}
class _EzdRpSprawy extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiSprawy(ezdrpc));
    }

    dodajZadanie(params) {
        let metricForZadanie = apiMetricCounterZadanieInne;
        if (params.typ == "2") {
            metricForZadanie = apiMetricCounterZadanieDoAkceptacji;
        } else if (params.typ == "5") {
            metricForZadanie = apiMetricCounterZadanieDoRealizacji;
        }
        return this.checkBody(this.ezdRpApi.dodajZadanie(params), null, null, null, metricForZadanie);
    }
    dodajFolder(params) {
        return this.checkBody(this.ezdRpApi.dodajFolder(params));
    }
    zmienSprawe(params) {
        return this.checkBody(this.ezdRpApi.zmienSprawe(params));
    }
    dodajOpinie(idPrzestrzen, nrSprawy, tresc) {
        return this.checkBody(this.ezdRpApi.dodajOpinie({ idPrzestrzen: idPrzestrzen, nrSprawy: nrSprawy, tresc: tresc }));
    }
    dodajNotatke(idPrzestrzen, nrSprawy, trescNotatki) {
        return this.checkBody(this.ezdRpApi.dodajNotatke({ idPrzestrzen: idPrzestrzen, nrSprawy: nrSprawy, tresc: trescNotatki }));
    }
    dodajNotatkeWlasna(idPrzestrzen, nrSprawy, idSprawa, trescNotatki) {
        return this.checkBody(this.ezdRpApi.dodajNotatkeWlasna({ idPrzestrzen: idPrzestrzen, nrSprawy: nrSprawy, tresc: trescNotatki, idSprawa: idSprawa }));
    }
    pobierzHistorieSprawy(idSprawy) {
        return this.checkBody(this.ezdRpApi.pobierzHistorieSprawy({ idSprawa: idSprawy }));
    }
    pobierzAktaSprawy(params) {
        return this.checkBody(this.ezdRpApi.pobierzAktaSprawy(params));
    }
    pobierzNotatkiWlasne(params) {
        return this.checkBody(this.ezdRpApi.pobierzNotatkiWlasne(params));
    }
    pobierzMetadane(params) {
        return this.checkBody(this.ezdRpApi.pobierzMetadane(params));
    }
    pobierzRoczniki() {
        return this.checkBody(this.ezdRpApi.pobierzRoczniki({}));
    }
    pobierzNumerSprawy(params) {
        return this.checkBody(this.ezdRpApi.pobierzNumerSprawy(params));
    }
    pobierzZnakSprawy(params) {
        return this.checkBody(this.ezdRpApi.pobierzZnakSprawy(params));
    }
    pobierzSprawe(idSprawy) {
        return this.checkBody(this.ezdRpApi.pobierzSprawe(idSprawy));
    }
    pobierzKalendarzAdministracja(param) {
        return this.checkBody(this.ezdRpApi.pobierzKalendarzAdministracja(param));
    }
    pobierzNotatkiSpraw(param) {
        return this.checkBody(this.ezdRpApi.pobierzNotatkiSpraw(param));
    }
    generujSprawe(param) {
        return this.checkBody(this.ezdRpApi.generujSprawe(param), null, null, null, ezdrp_metric_zakladanie_spraw);
    }
    szukajSpraweByBiurko(lstSprawy, skip, anyIfNot) {
        if (!skip) { skip = 0; }
        if (lstSprawy) {
            return this.szukajSprawe(lstSprawy.items, skip);
        }
    }
    szukajSprawe(sprawy, skip, anyIfNot) {
        if (!skip) { skip = 0; }
        if (sprawy && sprawy.length > 0) {
            let skipCount = skip;
            if (skip >= sprawy.length && anyIfNot) { return sprawy.length > 0 ? sprawy[0] : null; }
            for (let sprawa of sprawy) {
                if (skipCount <= 0) {
                    return sprawa;
                }
                skipCount--;
            }
        } else {
        }
        return null;
    }
    pobierzListeSpraw(param) {
        return this.checkBody(this.ezdRpApi.pobierzListeSpraw(param));
    }
    pobierzNoweAkta(param) {
        return this.checkBody(this.ezdRpApi.pobierzNoweAkta(param));
    }
}

export { _EzdRpSprawy as EzdRpSprawy, SzczegolySprawy }