import { check } from 'k6';
import { log } from "../../utils/log.js";
import { _EzdRpApiProfile } from '../api/profile.js'
import { EzdRpTest } from './_test-base.js'

class _EzdRpProfile extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiProfile(ezdrpc));
    }

    pobierzDostepneOperacje() {
        return this.checkBody(this.ezdRpApi.pobierzDostepneOperacje(), null, null, true);
    }

    pobierzWersjeApi() {
        return this.checkBody(this.ezdRpApi.pobierzWersjeApi(), null, null, true);
    }
    _pobierzUzytkownika(param) {
        let uzytkownikResData = this.checkBody(this.ezdRpApi.pobierzUzytkownika(param));
        let ssoUserId = this._session.getSsoUserId();
        if (uzytkownikResData && uzytkownikResData.errorId && uzytkownikResData.errorId !== '') {
            throw `ezdrp user id errorId: ${uzytkownikResData.errorId}  ${this._session.getLogin()} ${ssoUserId}`;
        }
        let uzytkownikId = uzytkownikResData ? uzytkownikResData.id : null;
        if (uzytkownikId === null) {
            throw `null user profile ${ssoUserId}`;
        }
        if (uzytkownikId !== ssoUserId) {
            throw `ezdrp user id ${uzytkownikId} ${this._session.getLogin()} mismatch sso id ${ssoUserId}`;
        }
        return uzytkownikResData;
    }
    _pobierzJednostkeNadrzedna() {
        let jednstokaResData = this.checkBody(this.ezdRpApi.pobierzJednostkeNadrzedna());
        let jednostkaId = jednstokaResData ? jednstokaResData.id : null;
        if (!(jednostkaId != '')) {
            throw `jednostka id ${jednostkaId} invalid`;
        }
        return jednstokaResData;
    }
    pobierzUstawienia(klucze) {
        return this.checkBody(this.ezdRpApi.pobierzUstawienia(klucze), null, null, true);
    }
    zaladujTozsamosc(doceloweStanowisko, doceloweBiuro) {
        let uzytkownikData = this._pobierzUzytkownika();
        let stanowiskoToSelect = null;
        if (doceloweStanowisko !== undefined && doceloweStanowisko !== '' && uzytkownikData !== null && uzytkownikData.listaStanowisk !== null) {
            uzytkownikData.listaStanowisk.forEach(function (s) {
                if (s.stanowisko === doceloweStanowisko) {
                    if (doceloweBiuro !== undefined && doceloweBiuro !== '') {
                        if (s.komorkaOrganizacyjnaSymbol === doceloweBiuro) {
                            stanowiskoToSelect = s;
                        }
                    } else {
                        stanowiskoToSelect = s;
                    }
                }
            });
        }
        if (stanowiskoToSelect === null && uzytkownikData !== null && uzytkownikData.listaStanowisk !== null && uzytkownikData.listaStanowisk.length >= 1) {
            for (let i = 0; i < uzytkownikData.listaStanowisk.length; i++) {
                let cs = uzytkownikData.listaStanowisk[i];
                if (cs.stanowisko !== 'Administrator') {
                    stanowiskoToSelect = cs;
                    break;
                }
            }
        }
        if (stanowiskoToSelect != null && stanowiskoToSelect.idStanowisko !== '') {
            uzytkownikData = this._pobierzUzytkownika({ idStanowiskoProponowane: stanowiskoToSelect.idStanowisko });
            if (uzytkownikData !== null && uzytkownikData.idStanowiska === stanowiskoToSelect.idStanowisko) {
                this._session.setSid(stanowiskoToSelect.idStanowisko);
            } else {
            }
        } else {
        }
        let jednostkaData = this._pobierzJednostkeNadrzedna();
        return {
            uzytkownik: uzytkownikData,
            jednostkaNadrzedna: jednostkaData
        };
    }
    pobierzDoPowiadomienAkcjeWTle() {
        return this.checkBody(this.ezdRpApi.pobierzDoPowiadomienAkcjeWTle());
    }
    pobierzStatusPowiadomienia() {
        return this.checkBody(this.ezdRpApi.pobierzStatusPowiadomienia());
    }
    pobierzWykazySlownika(param) {
        return this.checkBody(this.ezdRpApi.pobierzWykazySlownika(param));
    }
    pobierzTypyPrzesylek(param) {
        return this.checkBody(this.ezdRpApi.pobierzTypyPrzesylek(param));
    }
    pobierzRodzajePrzesylek(param) {
        return this.checkBody(this.ezdRpApi.pobierzRodzajePrzesylek(param));
    }
    pobierzStrefyPrzesylek(param) {
        return this.checkBody(this.ezdRpApi.pobierzStrefyPrzesylek(param));
    }
    pobierzPriorytetyPrzesylek(param) {
        return this.checkBody(this.ezdRpApi.pobierzPriorytetyPrzesylek(param));
    }
    bpmnPobierzStatus() {
        return this.checkBody(this.ezdRpApi.bpmnPobierzStatus());
    }
}

export { _EzdRpProfile as EzdRpProfile }