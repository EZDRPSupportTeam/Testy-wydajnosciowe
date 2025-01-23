import { _EzdRpApiKuip } from '../api/kuip.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { Counter } from 'k6/metrics';
import { randomBool, randomFromArray, randomInt } from '../../utils/random.js'
import { EzdRpTest } from './_test-base.js'

const typKomorekKolory = ['#d9e3f0', '#f47373', '#697689', '#2ccce4', '#dce775', '#ff8a65', '#ba68c8', '#37d67a'];
class _EzdRpKuip extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiKuip(ezdrpc));
    }

    getDostepneOperacje(operacje) {
        return this.checkBody(this.ezdRpApi.getDostepneOperacje(operacje));
    }
    getSlownik(key) {
        return this.checkBody(this.ezdRpApi.getSlownik(key));
    }
    getUzytkownikPodmiotu(param) {
        return this.checkBody(this.ezdRpApi.getUzytkownikPodmiotu(param));
    }
    getDaneAutentykujace(param) {
        return this.checkBody(this.ezdRpApi.getDaneAutentykujace(param));
    }
    getWalidacjaStruktury(param) {
        return this.checkBody(this.ezdRpApi.getWalidacjaStruktury(param));
    }
    pobierzRejestrZmian(param) {
        return this.checkBody(this.ezdRpApi.pobierzRejestrZmian(param));
    }
    pobierzRoleOrganizacyjne(param) {
        return this.checkBody(this.ezdRpApi.pobierzRoleOrganizacyjne(param));
    }

    getUzytkownik() {
        return this.checkBody(this.ezdRpApi.getUzytkownik());
    }

    getPodmioty(valueToSearch) {
        return this.checkBody(this.ezdRpApi.getPodmioty({ value: valueToSearch }));
    }
    szukajPodmioty(valueToSearch, column) {
        return this.checkBody(this.ezdRpApi.szukajPodmioty({ value: valueToSearch, column: column ? column : '' }));
    }

    dodajPodmiot(param) {
        return this.checkBody(this.ezdRpApi.dodajPodmiot(param));
    }

    getPodmiot(id) {
        return this.checkBody(this.ezdRpApi.getPodmiot({ id: id }));
    }

    getUzytkownicy(params) {
        return this.checkBody(this.ezdRpApi.getUzytkownicy(params));
    }
    utworzUzytkownika(param) {
        return this.checkBody(this.ezdRpApi.utworzUzytkownika(param));
    }
    ustawHaslo(param) {
        return this.checkBody(this.ezdRpApi.ustawHaslo(param));
    }
    ustawAdministratora(param) {
        return this.checkBody(this.ezdRpApi.ustawAdministratora(param));
    }
    getTypyKomorek() {
        return this.checkBody(this.ezdRpApi.getTypyKomorek());
    }
    dodajTypKomorki(param) {
        if (!param.kolor || param.kolor == '') {
            param.kolor = typKomorekKolory[randomInt(0, typKomorekKolory.length)];
        }
        return this.checkBody(this.ezdRpApi.dodajTypKomorki(param));
    }
    getSlownikStanowisk() {
        return this.checkBody(this.ezdRpApi.getSlownikStanowisk());
    }
    dodajStanowisko(param) {
        if (!param.kolor || param.kolor == '') {
            param.kolor = typKomorekKolory[randomInt(0, typKomorekKolory.length)];
        }
        return this.checkBody(this.ezdRpApi.dodajStanowisko(param));
    }
    getStruktura(param) {
        return this.checkBody(this.ezdRpApi.getStruktura(param));
    }
    inicjalizowanieStruktury() {
        return this.checkBody(this.ezdRpApi.inicjalizowanieStruktury());
    }
    dodanieKomorkiOrganizacyjnej(param) {
        if (!param.typ_struktury || param.typ_struktury == '') {
            param.typ_struktury = 'ROBOCZA';
        }
        return this.checkBody(this.ezdRpApi.dodanieKomorkiOrganizacyjnej(param));
    }
    dodanieStanowiska(param) {
        if (!param.typ_struktury || param.typ_struktury == '') {
            param.typ_struktury = 'ROBOCZA';
        }
        return this.checkBody(this.ezdRpApi.dodanieStanowiska(param));
    }
    wdrozenieStruktury() {
        return this.checkBody(this.ezdRpApi.wdrozenieStruktury());
    }
    getSzablonyUprawnien() {
        return this.checkBody(this.ezdRpApi.getSzablonyUprawnien());
    }
    dodajSzablonUprawnien(param) {
        return this.checkBody(this.ezdRpApi.dodajSzablonUprawnien(param));
    }
    zmianaHasla(param) {
        return this.checkBody(this.ezdRpApi.zmianaHasla(param));
    }
}

export { _EzdRpKuip as EzdRpKuip }