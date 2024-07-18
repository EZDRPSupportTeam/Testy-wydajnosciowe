import { _EzdRpApiPisma } from '../api/pisma.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'
import { Counter } from "k6/metrics";

const ezdrp_metric_metadane = new Counter("ezdrp_metrics_uzupelnianie_metadanych_kancelaria");

class _EzdRpPisma extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiPisma(ezdrpc));
    }

    _dodajPismoByDokument(dokument, isRpw) {
        let dokumentyPisma = [];
        dokumentyPisma[0] = { 'idDokument': dokument.idDokument };
        let pismoApiRes = this.checkBody(this.ezdRpApi.dodajPismo(dokumentyPisma, isRpw));
        if (!pismoApiRes || pismoApiRes.length === undefined || pismoApiRes.length <= 0) {
            throw 'invalid dodaj pismo response';
        }
        let pismoRes = pismoApiRes[0];
        if (!pismoRes || pismoRes === '') {
            throw 'invalid pismo id';
        }
        return pismoRes;
    }
    dodajPismoByDokument(dokument, isRpw) {

        let pismo = this._dodajPismoByDokument(dokument, isRpw);

        return pismo;
    }
    szukajPismoZZalacznikiemByBiurko(lstPisma, skip) {
        if (!skip) { skip = 0; }
        if (lstPisma) {
            return this.szukajPismoZZalacznikiem(lstPisma.items, skip);
        }
    }
    szukajPismoZZalacznikiem(pisma, skip) {
        if (!skip) { skip = 0; }
        if (pisma && pisma.length > 0) {
            let skipCount = skip;
            for (let pismo of pisma) {
                if (pismo.atrybuty && pismo.atrybuty.czyZeskanowany) {
                    if (skipCount <= 0) {
                        return pismo;
                    }
                    skipCount--;
                }
            }
        }
        return null;
    }
    szukajPismoZRpwByBiurko(lstPisma, skip) {
        if (!skip) { skip = 0; }
        if (lstPisma) {
            return this.szukajPismoZRpw(lstPisma.items, skip);
        }
    }
    szukajPismoZRpw(pisma, skip) {
        if (!skip) { skip = 0; }
        if (pisma && pisma.length > 0) {
            let skipCount = skip;
            for (let pismo of pisma) {
                if (pismo.listaDokumentowPisma && pismo.listaDokumentowPisma.length > 0) {
                    let isRpw = false;
                    for (let zal of pismo.listaDokumentowPisma) {
                        if (zal && zal.dokumentNazwa && zal.dokumentNazwa.includes('RPW/')) {
                            isRpw = true;
                            break;
                        } else {
                        }
                    }
                    if (isRpw) {
                        if (skipCount <= 0) {
                            return pismo;
                        }
                        skipCount--;
                    }
                } else {
                    log('listaDokumentow is empty');
                }
            }
        } else {
        }
        return null;
    }
    pobierzListePism(params) {
        return this.checkBody(this.ezdRpApi.pobierzListePism(params));
    }
    wyszukajPisma(params) {
        return this.checkBody(this.ezdRpApi.wyszukajPisma(params));
    }
    zapiszPismo(params) {
        return this.checkBody(this.ezdRpApi.zapiszPismo(params), null, null, null, ezdrp_metric_metadane);
    }
    wczytajDokumentUtworzZadanie(params) {
        return this.checkBody(this.ezdRpApi.wczytajDokumentUtworzZadanie(params));
    }
    pobierzPisma(params) {
        return this.checkBody(this.ezdRpApi.pobierzPisma(params));
    }
    pobierzDokumenty(params) {
        return this.checkBody(this.ezdRpApi.pobierzDokumenty(params));
    }
}

export { _EzdRpPisma as EzdRpPisma }