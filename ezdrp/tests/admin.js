import { _EzdRpApiAdmin } from '../api/admin.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { Counter } from 'k6/metrics';
import { randomBool, randomFromArray, randomInt } from '../../utils/random.js'
import { EzdRpTest } from './_test-base.js'

const typKomorekKolory = ['#d9e3f0', '#f47373', '#697689', '#2ccce4', '#dce775', '#ff8a65', '#ba68c8', '#37d67a'];
class _EzdRpAdmin extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiAdmin(ezdrpc));
    }
    
    getSzablonyUprawnien() {
        return this.checkBody(this.ezdRpApi.getSzablonyUprawnien());
    }
    dodajSzablonUprawnien(param) {
        return this.checkBody(this.ezdRpApi.dodajSzablonUprawnien(param));
    }
    getUprawnieniaStanowiska(param) {
        return this.checkBody(this.ezdRpApi.getUprawnieniaStanowiska(param));
    }
    dodajUprawnieniaStanowiska(param) {
        return this.checkBody(this.ezdRpApi.dodajUprawnieniaStanowiska(param));
    }
    importJrwa(param) {
        return this.checkBody(this.ezdRpApi.importJrwa(param));
    }
    getJrwaList() {
        return this.checkBody(this.ezdRpApi.getJrwaList());
    }
    pobierzKomunikatyAdministracja() {
        return this.checkBody(this.ezdRpApi.pobierzKomunikatyAdministracja());
    }
    pobierzDashboardAdministracja() {
        return this.checkBody(this.ezdRpApi.pobierzDashboardAdministracja());
    }
    pobierzKalendarzAdministracja(param) {
        return this.checkBody(this.ezdRpApi.pobierzKalendarzAdministracja(param));
    }
    pobierzOstatnioWybieraneStanowiska(param) {
        return this.checkBody(this.ezdRpApi.pobierzOstatnioWybieraneStanowiska(param));
    }
    usunCennik(param) {
        return this.checkBody(this.ezdRpApi.usunCennik(param));
    }
    zapiszCennik(param) {
        return this.checkBody(this.ezdRpApi.zapiszCennik(param));
    }
    pobierzCenniki(param) {
        return this.checkBody(this.ezdRpApi.pobierzCenniki(param));
    }
    dodajLokalizacjeSkladu(param) {
        return this.checkBody(this.ezdRpApi.dodajLokalizacjeSkladu(param));
    }
    pobierzLokalizacjeSkladu(param) {
        return this.checkBody(this.ezdRpApi.pobierzLokalizacjeSkladu(param));
    }
    dodajKluczAPI(param) {
        return this.checkBody(this.ezdRpApi.dodajKluczAPI(param));
    }
    pobierzKluczeAPI(param) {
        return this.checkBody(this.ezdRpApi.pobierzKluczeAPI(param));
    }
    aktywujLokalizacjeSkladu(param) {
        return this.checkBody(this.ezdRpApi.aktywujLokalizacjeSkladu(param));
    }
    dodajDefinicjeSkladu(param) {
        return this.checkBody(this.ezdRpApi.dodajDefinicjeSkladu(param));
    }
    modyfikujLokalizacjeSkladu(param) {
        return this.checkBody(this.ezdRpApi.modyfikujLokalizacjeSkladu(param));
    }
    pobierzSzablonyDokumentowFoldery(param) {
        return this.checkBody(this.ezdRpApi.pobierzSzablonyDokumentowFoldery(param));
    }
    dodajSzablonDokumentuFolder(param) {
        return this.checkBody(this.ezdRpApi.dodajSzablonDokumentuFolder(param));
    }
    dodajSzablonDokumentu(param) {
        return this.checkBody(this.ezdRpApi.dodajSzablonDokumentu(param));
    }
    dodajDostepDoSzablonowDokumentow(param) {
        return this.checkBody(this.ezdRpApi.dodajDostepDoSzablonowDokumentow(param));
    }
    zapiszKonfiguracjeEpuap(param) {
        return this.checkBody(this.ezdRpApi.zapiszKonfiguracjeEpuap(param));
    }
    pobierz_pkn(param) {
        return this.checkBody(this.ezdRpApi.pobierz_pkn(param));
    }
    dodaj_pkn(param) {
        return this.checkBody(this.ezdRpApi.dodaj_pkn(param));
    }
}

export { _EzdRpAdmin as EzdRpAdmin }