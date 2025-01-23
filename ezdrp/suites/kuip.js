import { EzdRpTestSuite } from './_suite-base.js'
import { Counter } from 'k6/metrics';
import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { EzdRpKuip } from '../tests/kuip.js'
import { EzdRpAdminPodmioty } from '../tests/admin.podmioty.js'
import { EzdRpAdmin } from '../tests/admin.js'
import { ParamsKuip } from '../../params/kuip.js'
import { ParamsJrwaB64 } from '../../params/jrwab64.js'
import { EzdRpProfile } from '../tests/profile.js'
import { EzdRpRejestry } from '../tests/rejestry.js'
import { EzdRpKancelaria } from '../tests/kancelaria.js'
import { EzdRpJrwa } from '../tests/jrwa.js'
import { EzdRpStruktura } from '../tests/struktura.js'
import { ParamsJrwa } from '../../params/jrwa.js'
import { randomBool, randomIntMax, randomIntInclusive, randomStringNumber, randomFromArray, randomStringNumberCase } from '../../utils/random.js'
import { log } from '../../utils/log.js'
import { Cache } from '../../utils/cache.js'
import { uuidv4 } from "../../utils/k6utils.js";
import { EzdRpFiles } from '../tests/files.js';
import encoding from 'k6/encoding';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import http from 'k6/http';
import { sleep as k6sleep } from 'k6';

export const KUIP_ENV_PREFIX = 'KUIP_';

const SLEEP_FACTORY = __ENV['SLEEP_FACTORY'] === undefined || __ENV['SLEEP_FACTORY'] === 'undefined' || __ENV['SLEEP_FACTORY'] === '' ? 1 : parseFloat(__ENV['SLEEP_FACTORY']);
const SLEEP_MIN = Math.floor(2 * SLEEP_FACTORY);
const SLEEP_MAX = Math.ceil(5 * SLEEP_FACTORY);
const SLEEP_QUICK_MIN = Math.floor(1 * SLEEP_FACTORY);
const SLEEP_QUICK_MAX = Math.ceil(2 * SLEEP_FACTORY);

export class EzdRpTestSuiteKuip extends EzdRpTestSuite {
    dashboard() {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        ezdRpKuip.getUzytkownik();
        ezdRpKuip.getDostepneOperacje(["C28", "C30", "C29", "C31"]);
    }
    listaPodmiotow() {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        ezdRpKuip.getDostepneOperacje(["C26", "C27", "C1"]);
        ezdRpKuip.getSlownik('TYPY_PODMIOTOW');
        let podmiotyRes = ezdRpKuip.szukajPodmioty('');
        ezdRpKuip.getDostepneOperacje(["C12", "C18", "C23", "C24", "C25", "C1"]);
        if (podmiotyRes && podmiotyRes.items && podmiotyRes.items.length > 0) {
            return ezdRpKuip.getPodmiot(podmiotyRes.items[0].id);
        }
        return null;
    }
    listaUzytkownikow(podmiot) {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        ezdRpKuip.getDostepneOperacje(["C2", "C4"]);
        if (podmiot && podmiot.id !== undefined && podmiot.id !== '') {
            let usersRes = ezdRpKuip.getUzytkownicy({ idPodmiotu: podmiot.id, login: '' });
            if (usersRes && usersRes.items && usersRes.items.length > 0) {
                let userToGet = randomFromArray(usersRes.items);
                let userToGetParam = { idPodmiotu: podmiot.id, idUzytkownika: userToGet.id };
                ezdRpKuip.getUzytkownikPodmiotu(userToGetParam);
                ezdRpKuip.getDaneAutentykujace(userToGetParam);
            }
        }
    }
    pobierzStrukture(podmiot) {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        ezdRpKuip.getDostepneOperacje(["C28", "C30", "C29", "C31"]);
        let strukturaKuip = ezdRpKuip.getStruktura({ typ: '' });
        ezdRpKuip.getWalidacjaStruktury({ typ: '' });
        strukturaKuip = ezdRpKuip.getStruktura({ typ: 'ROBOCZA' });
        ezdRpKuip.getWalidacjaStruktury({ typ: 'ROBOCZA' });
        ezdRpKuip.pobierzRejestrZmian({ idPodmiotu: podmiot.id });
    }

    administracja(podmiot) {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        ezdRpKuip.getDostepneOperacje(["C13", "C14", "C15", "C20", "C22", "C23", "C24", "C25"]);
        ezdRpKuip.getDostepneOperacje(["C28", "C30", "C29"]);

        ezdRpKuip.getDostepneOperacje(["C8", "C9", "C10"]);
        ezdRpKuip.pobierzRoleOrganizacyjne({ idPodmiotu: podmiot.id });

        ezdRpKuip.getDostepneOperacje(["C1", "C2", "C3"]);
        let slownikStanowisk = ezdRpKuip.getSlownikStanowisk();

        ezdRpKuip.getDostepneOperacje(["C13", "C14", "C15", "C20", "C22", "C23", "C24", "C25"]);
        let typyKomorek = ezdRpKuip.getTypyKomorek();
    }

    zalozPodmioty() {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        ezdRpKuip.getUzytkownik();

        let podmiotyParams = ParamsKuip.getKuipParams();
        podmiotyParams.forEachPodmiot((podmiot) => {

            let podmiotRes = ezdRpKuip.szukajPodmioty(podmiot.symbol);
            let podmiotFound = podmiotRes && podmiotRes.items && podmiotRes.items.length > 0 ? podmiotRes.items.find((p) => { return p.skrot && p.skrot === podmiot.symbol }) : null;
            if (podmiotFound != null) {
                let podmiotIdToGet = podmiotFound.id;
                log(`podmiot ${podmiot.symbol} found ${podmiotIdToGet} ${podmiot.czy_aktualizowac}`);
                if (podmiot.czy_aktualizowac) {
                    podmiotRes = ezdRpKuip.getPodmiot(podmiotIdToGet);
                } else {
                    podmiotRes = null;
                }
            } else {
                let danePodmiotu = { nazwa: podmiot.nazwa, symbol: podmiot.symbol, typ: podmiot.typ, epuap: podmiot.epuap, rcl: podmiot.rcl };
                let dodanyPodmiotRes = ezdRpKuip.dodajPodmiot(danePodmiotu);
                podmiotRes = ezdRpKuip.getPodmiot(dodanyPodmiotRes.id);
                if (!podmiotRes || !podmiotRes.id) {
                    podmiotRes = null;
                }
            }
            if (!podmiotRes) {
                log(`brak danych o podmiocie ${podmiot.symbol}`);
                return;
            }
            podmiot.kuip = podmiotRes;
            let idPodmiotu = podmiotRes.id;
            let administratorzy = new Array();
            podmiot.typy = new Array();
            podmiot.stanowiska = new Array();
            podmiot.idStanowiskaAll = new Array();
            podmiot.kancelaria = new Array();
            podmiot.kluczeAPI = new Array();
            this.zalozUzytkownikow(podmiot, podmiot, idPodmiotu, ezdRpKuip, administratorzy);
            if (administratorzy.length > 0) {
                let zalozParam = { idPodmiotu: idPodmiotu, admins: [] };
                for (let i = 0; i < administratorzy.length; i++) {
                    zalozParam.admins.push(administratorzy[i]);
                }
                ezdRpKuip.ustawAdministratora(zalozParam);
            }
            podmiot.admins = administratorzy;
        });

        return podmiotyParams;
    }
    zalozUzytkownikow(podmiot, struktura, idPodmiotu, ezdRpKuip, administratorzy) {
        if (struktura.uzytkownicy && struktura.uzytkownicy.length > 0) {
            for (let i = 0; i < struktura.uzytkownicy.length; i++) {
                let user = struktura.uzytkownicy[i];
                let userRes = null;
                let usersRes = ezdRpKuip.getUzytkownicy({ idPodmiotu: idPodmiotu, login: user.login });
                if (usersRes && usersRes.items && usersRes.items.some(item => item.login === user.login)) {
                    userRes = usersRes.items.find(item => item.login === user.login);                
                } else {
                    userRes = ezdRpKuip.utworzUzytkownika({ imie: user.imie, nazwisko: user.nazwisko, login: user.login, idPodmiotu: idPodmiotu });
                    ezdRpKuip.zmianaHasla({ idUzytkownika: userRes.id, haslo: user.haslo });
                }
                if (!userRes) {
                    usersRes = ezdRpKuip.getUzytkownicy({ idPodmiotu: idPodmiotu, login: user.login });
                    if (usersRes && usersRes.items && usersRes.items.some(item => item.login === user.login)) {
                        userRes = usersRes.items.find(item => item.login === user.login);      
                    }
                }
                if (userRes) {
                    ezdRpKuip.zmianaHasla({ idUzytkownika: userRes.id, haslo: user.haslo });//umwaw - do odkomentowania
                    if (user.isadmin && user.isadmin > 0 && user.isadmin < 3) {
                        administratorzy.push({ isadmin: user.isadmin, admin: userRes, idPodmiotu: idPodmiotu, login: user.login, haslo: user.haslo });
                    }
                    struktura.uzytkownicy[i].kuip = userRes;
                    if (podmiot.kluczAPI || user.kluczAPI) {
                        podmiot.kluczeAPI.push(userRes);
                    } else {
                    }
                }
                if (podmiot.stanowiska && user.stanowisko && user.stanowisko != '' && !podmiot.stanowiska.includes(user.stanowisko)) {
                    podmiot.stanowiska.push(user.stanowisko);
                }
            }
        }
        if (struktura.struktura && struktura.struktura.length > 0) {
            for (let n = 0; n < struktura.struktura.length; n++) {
                let str = struktura.struktura[n];
                if (podmiot.typy && str.typ && str.typ != '' && !podmiot.typy.includes(str.typ)) {
                    podmiot.typy.push(str.typ);
                }
                this.zalozUzytkownikow(podmiot, str, idPodmiotu, ezdRpKuip, administratorzy);
            }
        }
    }
    inicjalizacjaPodmiotu(idPodmiotu, numer) {
        let ezdRpAdminPodmioty = new EzdRpAdminPodmioty(this.ezdRpClient);
        let currentPodmiotyList = ezdRpAdminPodmioty.pobierzPodmioty(idPodmiotu);
        if (currentPodmiotyList != null) {
            return ezdRpAdminPodmioty.inicjalizacjaPodmiotu({ idPodmiotu: idPodmiotu, numer: numer });
        }
        return null;
    }
    zalozTypyKomorek(podmiot) {
        let typyPodmiotu = podmiot.typy;
        let typyKuip = new Array();
        if (!typyPodmiotu || typyPodmiotu.length <= 0) {
            return typyKuip;
        }
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        let typyKomorek = ezdRpKuip.getTypyKomorek();

        let typyMap = new Map();
        for (let t of typyKomorek.items) {
            typyMap.set(t.nazwa.trim().toLowerCase(), t);
        }

        for (let typ of typyPodmiotu) {    
            let typNazwa = typ.trim().toLowerCase();        
            let typExisted = typyMap.get(typNazwa);
            if (!typExisted) {
                typExisted = ezdRpKuip.dodajTypKomorki({ nazwa: typ });
                typyMap.set(typNazwa, typExisted);
            }
        }
        typyKomorek = ezdRpKuip.getTypyKomorek();
        podmiot.typyKuip = typyKomorek.items;
    }
    zalozSlownikStanowisk(podmiot) {
        let stanowiskaPodmiotu = podmiot.stanowiska;
        if (!stanowiskaPodmiotu || stanowiskaPodmiotu.length <= 0) {
            return;
        }
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        let slownikStanowisk = ezdRpKuip.getSlownikStanowisk();

        let stanowiskaMap = new Map();
        for (let t of slownikStanowisk.items) {
            stanowiskaMap.set(t.nazwa.trim().toLowerCase(), t);
        }  
        
        for (let stanowisko of stanowiskaPodmiotu) {
            let stanowiskoNazwa = stanowisko.trim().toLowerCase();
            let typExisted = stanowiskaMap.get(stanowiskoNazwa);
            if (!typExisted) {
                typExisted = ezdRpKuip.dodajStanowisko({ nazwa: stanowisko });
                stanowiskaMap.set(stanowiskoNazwa, typExisted);
            }
        }
        slownikStanowisk = ezdRpKuip.getSlownikStanowisk();
        podmiot.stanowiskaKuip = slownikStanowisk && slownikStanowisk.items ? slownikStanowisk.items : [];
    }
    zalozStrukturePodmiotu(podmiot) {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);

        let strukturaKuip = ezdRpKuip.getStruktura({ typ: 'ROBOCZA' });
        if (!strukturaKuip || !strukturaKuip.komorkiOrganizacyjne || strukturaKuip.komorkiOrganizacyjne.length <= 0) {
            podmiot.isChanged = true;
            ezdRpKuip.inicjalizowanieStruktury();
            strukturaKuip = ezdRpKuip.getStruktura({ typ: 'ROBOCZA' });
        }
        if (!strukturaKuip || !strukturaKuip.komorkiOrganizacyjne || strukturaKuip.komorkiOrganizacyjne.length <= 0) {
            log(`nieudana inicjalizacja struktury ${podmiot.symbol}`);
            return;
        }
        strukturaKuip.komorkiOrganizacyjne.forEach(function (ko) {
            if (ko.idTypKomorkiOrganizacyjnej === "ROOT_UNIT") {
                podmiot.struktura_kuip = ko;
            }
        });
        if (!podmiot.struktura_kuip) {
            log(`nie znaleziono ROOT w strukturze podmiotu ${podmiot.symbol}`);
            return;
        }
        podmiot.struktura_kuip_list = [];
        
        this.zalozStrukturePodmiotuRecursive(podmiot, podmiot.struktura_kuip, podmiot, ezdRpKuip, strukturaKuip);
    }
    znajdzTypStruktury(nazwaTypu, listaTypow) {
        if (!listaTypow || listaTypow.length <= 0) { return null; }
        for (let i = 0; i < listaTypow.length; i++) {
            let t = listaTypow[i];
            if (t.nazwa.trim().toLowerCase() === nazwaTypu.trim().toLowerCase()) { return t; }
        }
        return null;
    }
    znajdzKomorke(symbol, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.symbol === symbol) { return t; }
        }
        return null;
    }
    znajdzKomorkeById(id, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.id === id) { return t; }
        }
        return null;
    }
    znajdzUzytkownika(usrId, komorkaId, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.idUzytkownik === usrId && t.idKomorkaOrganizacyjna === komorkaId) { return t; }
        }
        return null;
    }
    znajdzStanowisko(nazwa, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.nazwa.trim().toLowerCase() === nazwa.trim().toLowerCase()) { 
                return t; }
        }
        return null;
    }
    zalozStrukturePodmiotuRecursive(podmiot, nadrzednyKuip, struktura, ezdRpKuip, strukturaKuip) {
        let symbolToSearch = struktura.struktura_kuip && struktura.struktura_kuip.symbol && struktura.struktura_kuip.symbol != '' ? struktura.struktura_kuip.symbol : struktura.symbol;
        let kuipExisted = this.znajdzKomorke(symbolToSearch, strukturaKuip.komorkiOrganizacyjne);
        let aktualnaStrukturaKuip = null;
        if (kuipExisted) {
            struktura.struktura_kuip = kuipExisted;
            podmiot.struktura_kuip_list.push(kuipExisted);
            aktualnaStrukturaKuip = strukturaKuip;
        } else {
            let typStruktury = this.znajdzTypStruktury(struktura.typ, podmiot.typyKuip);
            if (typStruktury == null) {
                log(`nie znaleziono typu komórki dla ${struktura.nazwa}`);
            } else {
                let nowaKomorka = ezdRpKuip.dodanieKomorkiOrganizacyjnej({
                    nazwa: struktura.nazwa,
                    symbol: struktura.symbol,
                    typ: typStruktury.id,
                    nadrzedna: nadrzednyKuip.id
                });
                podmiot.isChanged = true;
                aktualnaStrukturaKuip = ezdRpKuip.getStruktura({ typ: 'ROBOCZA' });
                kuipExisted = this.znajdzKomorke(struktura.symbol, aktualnaStrukturaKuip.komorkiOrganizacyjne);
                if (kuipExisted) {
                    struktura.struktura_kuip = kuipExisted;
                    podmiot.struktura_kuip_list.push(kuipExisted);
                } else {
                    log(`nie znaleziono komórki ${struktura.symbol} dla ${struktura.nazwa} po dodaniu do struktury`);
                }
            }
        }
        if (struktura.struktura_kuip) {
            if (struktura.uzytkownicy && struktura.uzytkownicy.length > 0) {
                for (let i = 0; i < struktura.uzytkownicy.length; i++) {
                    let usr = struktura.uzytkownicy[i];
                    if (usr.kuip) {
                        let usrUzytkownik = this.znajdzUzytkownika(usr.kuip.id, struktura.struktura_kuip.id, aktualnaStrukturaKuip.stanowiska);
                        if (usrUzytkownik) {
                            usr.stanowisko_kuip = usrUzytkownik;
                        } else {
                            let usrStanowisko = this.znajdzStanowisko(usr.stanowisko, podmiot.stanowiskaKuip);
                            if (usrStanowisko) {
                                let noweStanowisko = ezdRpKuip.dodanieStanowiska({
                                    idUzytkownik: usr.kuip.id,
                                    idKomorka: struktura.struktura_kuip.id,
                                    idStanowisko: usrStanowisko.id,
                                    typStanowisko: usrStanowisko,
                                    nazwa: usr.stanowisko
                                });
                                podmiot.isChanged = true;
                                aktualnaStrukturaKuip = ezdRpKuip.getStruktura({ typ: 'ROBOCZA' });
                                usrUzytkownik = this.znajdzUzytkownika(usr.kuip.id, struktura.struktura_kuip.id, aktualnaStrukturaKuip.stanowiska);
                                if (usrUzytkownik) {
                                    usr.stanowisko_kuip = usrUzytkownik;
                                } else {
                                    usr.stanowisko_kuip = noweStanowisko;
                                    log(`nie znaleziono stanowiska kuip dla uzytkownika ${usr.nazwisko} ${usr.imie} ${usr.stanowisko} po dodaniu do struktury`);
                                }
                            } else {
                                log(`nie znaleziono stanowiska kuip dla uzytkownika ${usr.nazwisko} ${usr.imie} ${usr.stanowisko}`);
                            }
                        }
                    } else {
                        log(`uzytkownik ${usr.nazwisko} ${usr.imie} nie ma danych z kuip`);
                    }
                    if (usr.stanowisko_kuip) {
                        if (usr.epuap !== undefined && usr.epuap === true) {
                            podmiot.epuap_user = usr.stanowisko_kuip;
                        }
                        podmiot.idStanowiskaAll.push(usr.stanowisko_kuip.id);
                    }
                }
            }

            if (struktura.struktura && struktura.struktura.length > 0) {
                for (let i = 0; i < struktura.struktura.length; i++) {
                    let str = struktura.struktura[i];
                    aktualnaStrukturaKuip = this.zalozStrukturePodmiotuRecursive(podmiot, struktura.struktura_kuip, str, ezdRpKuip, aktualnaStrukturaKuip);
                }
            }
        }
        return aktualnaStrukturaKuip;
    }
    zalozStrukturePodmiotuOfflineRecursive(podmiot, nadrzednyKuip, struktura, ezdRpKuip, strukturaKuip) {
        let symbolToSearch = struktura.struktura_kuip && struktura.struktura_kuip.symbol && struktura.struktura_kuip.symbol != '' ? struktura.struktura_kuip.symbol : struktura.symbol;
        let kuipExisted = this.znajdzKomorke(symbolToSearch, strukturaKuip.komorkiOrganizacyjne);
        let aktualnaStrukturaKuip = null;
        if (kuipExisted) {
            struktura.struktura_kuip = kuipExisted;
            aktualnaStrukturaKuip = strukturaKuip;
        } else {
            let typStruktury = this.znajdzTypStruktury(struktura.typ, podmiot.typyKuip);
            if (typStruktury == null) {
                log(`nie znaleziono typu komórki dla ${struktura.nazwa}`);
            } else {
                let nowaKomorka = ezdRpKuip.dodanieKomorkiOrganizacyjnej({
                    nazwa: struktura.nazwa,
                    symbol: struktura.symbol,
                    typ: typStruktury.id,
                    nadrzedna: nadrzednyKuip.id
                });
                podmiot.isChanged = true;
                aktualnaStrukturaKuip = strukturaKuip;//umwaw - do usuniecia
                struktura.struktura_kuip = nowaKomorka;
            }
        }
        if (struktura.struktura_kuip) {
            if (struktura.uzytkownicy && struktura.uzytkownicy.length > 0) {
                for (let i = 0; i < struktura.uzytkownicy.length; i++) {
                    let usr = struktura.uzytkownicy[i];
                    if (usr.kuip) {
                        let usrUzytkownik = this.znajdzUzytkownika(usr.kuip.id, struktura.struktura_kuip.id, aktualnaStrukturaKuip.stanowiska);
                        if (usrUzytkownik) {
                            usr.stanowisko_kuip = usrUzytkownik;
                        } else {
                            let usrStanowisko = this.znajdzStanowisko(usr.stanowisko, podmiot.stanowiskaKuip);
                            if (usrStanowisko) {
                                let noweStanowisko = ezdRpKuip.dodanieStanowiska({
                                    idUzytkownik: usr.kuip.id,
                                    idKomorka: struktura.struktura_kuip.id,
                                    idStanowisko: usrStanowisko.id,
                                    typStanowisko: usrStanowisko,
                                    nazwa: usr.stanowisko
                                });
                                podmiot.isChanged = true;
                                    usr.stanowisko_kuip = noweStanowisko;
                            } else {
                                log(`nie znaleziono stanowiska kuip dla uzytkownika ${usr.nazwisko} ${usr.imie} ${usr.stanowisko}`);
                            }
                        }
                    } else {
                        log(`uzytkownik ${usr.nazwisko} ${usr.imie} nie ma danych z kuip`);
                    }
                    if (usr.stanowisko_kuip) {
                        if (usr.epuap !== undefined && usr.epuap === true) {
                            podmiot.epuap_user = usr.stanowisko_kuip;
                        }
                    }
                }
            }

            if (struktura.struktura && struktura.struktura.length > 0) {
                for (let i = 0; i < struktura.struktura.length; i++) {
                    let str = struktura.struktura[i];
                    aktualnaStrukturaKuip = this.zalozStrukturePodmiotuOfflineRecursive(podmiot, struktura.struktura_kuip, str, ezdRpKuip, aktualnaStrukturaKuip);
                }
            }
        }
        return aktualnaStrukturaKuip;
    }
    zaladujStrukturePodmiotuRecursive(podmiot, nadrzednyKuip, struktura, ezdRpKuip, strukturaKuip) {
        let symbolToSearch = struktura.struktura_kuip && struktura.struktura_kuip.symbol && struktura.struktura_kuip.symbol != '' ? struktura.struktura_kuip.symbol : struktura.symbol;
        let kuipExisted = this.znajdzKomorke(symbolToSearch, strukturaKuip.komorkiOrganizacyjne);
        let aktualnaStrukturaKuip = null;
        if (kuipExisted) {
            struktura.struktura_kuip = kuipExisted;
            podmiot.struktura_kuip_list.push(kuipExisted);
            aktualnaStrukturaKuip = strukturaKuip;
        }
        if (struktura.struktura_kuip) {
            aktualnaStrukturaKuip = strukturaKuip;
            if (struktura.uzytkownicy && struktura.uzytkownicy.length > 0) {
                for (let i = 0; i < struktura.uzytkownicy.length; i++) {
                    let usr = struktura.uzytkownicy[i];
                    if (usr.kuip) {
                        let usrUzytkownik = this.znajdzUzytkownika(usr.kuip.id, struktura.struktura_kuip.id, aktualnaStrukturaKuip.stanowiska);
                        if (usrUzytkownik) {
                            usr.stanowisko_kuip = usrUzytkownik;
                        }
                    } else {
                        log(`uzytkownik ${usr.nazwisko} ${usr.imie} nie ma danych z kuip`);
                    }
                    if (usr.stanowisko_kuip) {
                        if (usr.epuap !== undefined && usr.epuap === true) {
                            podmiot.epuap_user = usr.stanowisko_kuip;
                        }
                        podmiot.idStanowiskaAll.push(usr.stanowisko_kuip.id);
                    }
                }
            }

            if (struktura.struktura && struktura.struktura.length > 0) {
                for (let i = 0; i < struktura.struktura.length; i++) {
                    let str = struktura.struktura[i];
                    aktualnaStrukturaKuip = this.zaladujStrukturePodmiotuRecursive(podmiot, struktura.struktura_kuip, str, ezdRpKuip, aktualnaStrukturaKuip);
                }
            }
        }
        return aktualnaStrukturaKuip;
    }
    wdrozenieStruktury() {
        let ezdRpKuip = new EzdRpKuip(this.ezdRpClient);
        ezdRpKuip.wdrozenieStruktury();
    }
    zalozSzablonyUprawnien(podmiot) {
        let szablonyPodmiotuToBe = podmiot.role;
        if (!szablonyPodmiotuToBe || szablonyPodmiotuToBe.length <= 0) {
            return;
        }
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let szablonyUprawnienAsIs = ezdRpAdmin.getSzablonyUprawnien();
        let checkTypExists = function (szablonNazwaToSearch, szablonyToCheck) {
            if (!szablonyToCheck || szablonyToCheck.length <= 0) { return null; }
            for (let n = 0; n < szablonyToCheck.length; n++) {
                let t = szablonyToCheck[n];
                if (t.nazwa.trim().toLowerCase() === szablonNazwaToSearch.trim().toLowerCase()) { return t; }
            }
            return;
        };
        podmiot.role_kuip = new Array();
        for (let i = 0; i < szablonyPodmiotuToBe.length; i++) {
            let rola = szablonyPodmiotuToBe[i];
            if (!rola.uprawnienia || rola.uprawnienia.length <= 0) { continue; }
            let typExisted = checkTypExists(rola.nazwa, szablonyUprawnienAsIs.items);
            if (typExisted == null) {
                typExisted = ezdRpAdmin.dodajSzablonUprawnien({ nazwa: rola.nazwa, prawa: rola.uprawnienia });
                szablonyUprawnienAsIs = ezdRpAdmin.getSzablonyUprawnien();
                typExisted = checkTypExists(rola.nazwa, szablonyUprawnienAsIs.items);
                if (typExisted) {
                    typExisted.prawa = null;
                    typExisted.listaDostepnychOperacji = null;
                    podmiot.role_kuip.push(typExisted);
                } else {
                    log(`nie znaleziono szablonu uprawnien ${rola.nazwa} po dodaniu do listy`);
                }
            } else {
                typExisted.prawa = null;
                typExisted.listaDostepnychOperacji = null;
                podmiot.role_kuip.push(typExisted);
            }
        }
    }
    
    ustalRoleToBe(podmiot, stanowiskoNazwa, symbolKomorki, randomUzytkownika, login) {
        const nazwaToSearch = [
            stanowiskoNazwa,
            `${symbolKomorki}_${stanowiskoNazwa}`,
            `${symbolKomorki}_${randomUzytkownika}`,
            login
        ];
        
        let roleToBe = new Set();
        
        const addRoles = (roles) => {
            if (roles && roles.length > 0) {
                roles.forEach(rola => roleToBe.add(rola));
            }
        };
    
        podmiot.stanowiska_map.forEach(sm => {
            if (nazwaToSearch.includes(sm.nazwa)) {
                addRoles(sm.role);
            }
        });
    
        if (roleToBe.size === 0) {
            podmiot.stanowiska_map.forEach(sm => {
                if (sm.nazwa === "*") {
                    addRoles(sm.role);
                }
            });
        }
    
        return Array.from(roleToBe);
    }
    
    znajdzRoleKuip(nazwa, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.nazwa.trim().toLowerCase() === nazwa.trim().toLowerCase()) { return t; }
        }
        return null;
    }
    znajdzRoleKuipById(id, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.id === id) { return t; }
        }
        return null;
    }
    przypiszUprawnienia(podmiot) {
        if (!podmiot.role_kuip) {
            log(`brak role_kuip w podmiocie ${podmiot.nazwa} ${podmiot.symbol}`);
            return;
        }
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);

        if (podmiot.struktura && podmiot.struktura.length > 0) {
            for (let i = 0; i < podmiot.struktura.length; i++) {
                let str = podmiot.struktura[i];
                this.przypiszUprawnieniaRecursive(podmiot, str, ezdRpAdmin);
            }
        }

        let ezdRpStruktura = new EzdRpStruktura(this.ezdRpClient);
        let struktura = ezdRpStruktura.pobierzDrzewo({});
        if (struktura.komorkiOrganizacyjne) {
            let root = struktura.komorkiOrganizacyjne[0];
            if (root && root.uzytkownicy && root.uzytkownicy.length > 0) {
                for (let userFromRoot of root.uzytkownicy) {
                    if (userFromRoot.stanowisko === 'Administrator') {
                        this.przypiszRoleUzytkownika(podmiot, root.symbol, ezdRpAdmin, userFromRoot.idStanowiska, {
                            login: userFromRoot.email,
                            random: '',
                            stanowisko: userFromRoot.stanowisko,
                            haslo: '',
                            imie: userFromRoot.imie,
                            nazwisko: userFromRoot.nazwisko
                        });
                    }
                }
            }
        }
    }
    przypiszRoleUzytkownika(podmiot, symbol, ezdRpAdmin, idStanowiskoUprawnienia, usr) {
        let roleUzytkownikaAsIs = ezdRpAdmin.getUprawnieniaStanowiska({ idStanowisko: idStanowiskoUprawnienia });
        let roleUzytkownikaToBe = this.ustalRoleToBe(podmiot, usr.stanowisko, symbol, usr.random, usr.login);
        if (roleUzytkownikaToBe && roleUzytkownikaToBe.length > 0) {
            let roleToAdd = new Array();
            for (let n = 0; n < roleUzytkownikaToBe.length; n++) {
                let rolaToCheck = roleUzytkownikaToBe[n];
                if (rolaToCheck === "Kancelista") {
                    podmiot.kancelaria.push({ login: usr.login, haslo: usr.haslo });
                }
                let rolaAsIsExisted = this.znajdzRoleKuip(rolaToCheck, roleUzytkownikaAsIs.items);
                if (rolaAsIsExisted) {
                } else {
                    let rolaToBe = this.znajdzRoleKuip(rolaToCheck, podmiot.role_kuip);
                    if (rolaToBe) {
                        roleToAdd.push(rolaToBe.id);
                    } else {
                        log(`nie znaleziono roli ${rolaToCheck} w rola_kuip podmiotu ${podmiot.symbol}`);
                    }
                }
            }
            if (roleToAdd.length > 0) {
                ezdRpAdmin.dodajUprawnieniaStanowiska({ idStanowisko: idStanowiskoUprawnienia, role: roleToAdd });
                roleUzytkownikaAsIs = ezdRpAdmin.getUprawnieniaStanowiska({ idStanowisko: idStanowiskoUprawnienia });

                for (let n = 0; n < roleToAdd.length; n++) {
                    let rolaToCheck = roleToAdd[n];
                    let rolaAsIsExisted = this.znajdzRoleKuipById(rolaToCheck, roleUzytkownikaAsIs.items);
                    if (rolaAsIsExisted) {
                    } else {
                        log(`nie znaleziono szbalonu uprawnienia ${rolaToCheck} u uzytkownika ${usr.nazwisko} ${usr.imie} po przypisaniu`);
                    }
                }
            } else {
                log(`brak ról do dodania dla ${usr.nazwisko}`);
            }
        } else {
            log(`brak danych stanowisko_kuip dla ${usr.nazwisko} ${usr.imie} ${usr.login} - nie nadano uprawnien`);
        }
    }
    przypiszUprawnieniaRecursive(podmiot, struktura, ezdRpAdmin) {

        if (struktura.uzytkownicy && struktura.uzytkownicy.length > 0) {
            for (let i = 0; i < struktura.uzytkownicy.length; i++) {
                let usr = struktura.uzytkownicy[i];
                if (usr.stanowisko_kuip) {
                    let idStanowiskoUprawnienia = usr.stanowisko_kuip.id;
                    this.przypiszRoleUzytkownika(podmiot, struktura.symbol, ezdRpAdmin, idStanowiskoUprawnienia, usr);
                }
            }
        }

        if (struktura.struktura && struktura.struktura.length > 0) {
            for (let i = 0; i < struktura.struktura.length; i++) {
                let str = struktura.struktura[i];
                this.przypiszUprawnieniaRecursive(podmiot, str, ezdRpAdmin);
            }
        }
    }
    importJrwa(podmiot) {
        let jrwaToImport = ParamsJrwaB64.getJrwaB64Params();
        if (!jrwaToImport || jrwaToImport === '') {
            log(`brak jrwa do importu`);
            return;
        }
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let currentJrwa = ezdRpAdmin.getJrwaList();
        if (currentJrwa && currentJrwa.lista && currentJrwa.lista.length > 0) {
            return;
        }
        let cDate = new Date();
        let nowYear = cDate.getFullYear();
        ezdRpAdmin.importJrwa({
            nazwa: `JRWA ${nowYear}`,
            symbol: `JRWA${nowYear}`,
            dataOd: `${cDate.toISOString().slice(0, 10)}`,
            file: jrwaToImport
        });
        currentJrwa = ezdRpAdmin.getJrwaList();
        if (currentJrwa && currentJrwa.lista && currentJrwa.lista.length > 0) {

        } else {
            log(`brak JRWA bo imporcie ${podmiot.symbol}`);
        }
        let jrwaAll = podmiot.jrwa;
        if (jrwaAll && jrwaAll.length > 0) {
            let ezdRpJrwa = new EzdRpJrwa(this.ezdRpClient);
            podmiot.rejestry_jrwa = [];
            for (let j of jrwaAll) {
                let jrwaForTyp = ezdRpJrwa.wyszukajWykaz({ symbol: j.jrwa });
                if (jrwaForTyp && jrwaForTyp.length > 0) {
                    let czySaPodteczki = jrwaForTyp.some(item => item.typ === "Podteczka");
                    for (let jt of jrwaForTyp) {
                        if (jt.typ !== "Wykaz" || !jt.symbol.startsWith(j.jrwa)) { continue; }
                        if (j.t !== undefined && jt.typProwadzenia !== j.t) {
                            ezdRpJrwa.zmienTypProwadzenia({ jrwa: jt.id, typ: j.t });
                        }
                        if (j.nas !== undefined && j.nas === true && jt.nazwaNAS === undefined || jt.nazwaNAS === '') {
                            ezdRpJrwa.ustawNAS({ "idJRWASchematWykaz": jt.id, "czyNieStanowiAktSprawy": true, "nazwaNAS": jt.nazwa });
                        }
                        if (j.pt !== undefined && j.pt.length > 0 && !czySaPodteczki) {
                            for (let jednostka_symbol of j.pt) {
                                for (let dzial_podmiotu of podmiot.struktura_kuip_list) {
                                    if (dzial_podmiotu.symbol === jednostka_symbol) {
                                        ezdRpJrwa.dodajPodteczke({ "idJednostka": dzial_podmiotu.id, "idSchematWykaz": jt.id, "nazwa": `podteczka autotestowa ${randomStringNumberCase(10)}`, "symbolJednostki": jednostka_symbol, "numer": 0, "rok": `${nowYear}` });
                                        break;
                                    }
                                }
                            }
                        }

                        if (j.rejestr !== undefined) {
                            podmiot.rejestry_jrwa.push({ "symbol": jt.symbol, "id": jt.id });
                        }
                    }
                }
            }
        }
    }
    przelaczNaAdmina(podmiot) {
        let ezdRpProfile = new EzdRpProfile(this.ezdRpClient);
        return ezdRpProfile.zaladujTozsamosc('Administrator', podmiot.symbol);
    }
    inicjalizacjaKreatoraPodmiotu(podmiot) {
        let profilUzytkownika = this.przelaczNaAdmina(podmiot);
        let ezdRpAdminPodmioty = new EzdRpAdminPodmioty(this.ezdRpClient);
        if ((profilUzytkownika == null || profilUzytkownika.uzytkownik === undefined || profilUzytkownika.uzytkownik == null) || (profilUzytkownika && profilUzytkownika.uzytkownik && profilUzytkownika.uzytkownik.czyInicjalizacjaSystemuWymagana)) {
            ezdRpAdminPodmioty.inicjalizacjaKreatoraPodmiotu();
        } else {
            log(profilUzytkownika);
        }
    }
    znajdzByKlucz(klucz, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.klucz == klucz) { return t; }
        }
        return null;
    }
    znajdzByKluczSystemowy(klucz, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.kluczSystemowy == klucz) { return t; }
        }
        return null;
    }
    znajdzByNazwaPodmiotu(nazwa, lista) {
        if (!lista || lista.length <= 0) { return null; }
        for (let i = 0; i < lista.length; i++) {
            let t = lista[i];
            if (t.nazwaPodmiotu == nazwa) { return t; }
        }
        return null;
    }
    zalozKontakty(podmiot) {
        let kontaktyPodmiotu = podmiot.kontakty;
        if (!kontaktyPodmiotu || kontaktyPodmiotu.length <= 0) {
            return;
        }
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let ezdRpProfile = new EzdRpProfile(this.ezdRpClient);
        let ezdRpRejestry = new EzdRpRejestry(this.ezdRpClient);
        let typyPodmiotow = ezdRpProfile.pobierzWykazySlownika('Adresaci.Podmiot.Typ');
        let typPodmiotuJednostka = this.znajdzByKlucz('Jednostka', typyPodmiotow.lista);
        let typyAdresow = ezdRpProfile.pobierzWykazySlownika('Adresaci.Adres.Typ_Jednostka');
        let typAdresuKorespondencyjny = this.znajdzByKlucz('AdresKorespondencyjny', typyAdresow.lista);
        let typyMetadanych = ezdRpProfile.pobierzWykazySlownika('EZDRP.Metadane.Klucze');
        let kluczPodmiotu = this.znajdzByKlucz('EZDRP.Metadane.Klucze.Adresat.Podmiot', typyMetadanych.lista);
        let konfiguracjaMetadanych = ezdRpRejestry.getKonfiguracjaMetadanych({ idObiekt: null, klucz: kluczPodmiotu.id });
        let nipId = this.znajdzByKluczSystemowy('EZDRP.Metadane.Nip', konfiguracjaMetadanych.listaKonfiguracji);
        let regonId = this.znajdzByKluczSystemowy('EZDRP.Metadane.Regon', konfiguracjaMetadanych.listaKonfiguracji);
        let krsId = this.znajdzByKluczSystemowy('EZDRP.Metadane.Krs', konfiguracjaMetadanych.listaKonfiguracji);

        let obecneKontakty = [];
        for (let i = 0; i < kontaktyPodmiotu.length; i++) {
            let kontaktToAdd = kontaktyPodmiotu[i];
            let newKontakt = {
                "idImie": kontaktToAdd.idImie,
                "idDrugieImie": kontaktToAdd.idDrugieImie,
                "idNazwisko": kontaktToAdd.idNazwisko,
                "nazwaPodmiotu": kontaktToAdd.nazwaPodmiotu,
                "listaPodadresaci": [],
                "listaEPUAP": [],
                "metadaneAdresata": {
                    "listaMetadanych": {
                    },
                    "idObiekt": null,
                    "klucz": "EZDRP.Metadane.Klucze4"
                },
                "czyZbiorczy": false,
                "prefix": "",
                "sufix": ""
            };
            obecneKontakty = ezdRpRejestry.getAdresatow({ search: newKontakt.nazwaPodmiotu.substring(0, newKontakt.nazwaPodmiotu.indexOf(' ')) }).lista;
            let kontaktExisted = this.znajdzByNazwaPodmiotu(newKontakt.nazwaPodmiotu, obecneKontakty);
            if (kontaktExisted) {

            } else {
                newKontakt.listaAdresowEmail = [];
                kontaktToAdd.listaAdresowEmail.forEach(function (k) {
                    newKontakt.listaAdresowEmail.push({ id: randomStringNumber(22), email: k.email, czyDomyslny: k.czyDomyslny });
                });
                kontaktToAdd.listaEPUAP.forEach(function (k) {
                    newKontakt.listaEPUAP.push(Object.assign({}, k));
                });
                newKontakt.typAdresata = typPodmiotuJednostka.id;
                if (kontaktToAdd.listaAdresow && kontaktToAdd.listaAdresow.length > 0) {
                    newKontakt.listaAdresow = [];
                    kontaktToAdd.listaAdresow.forEach(function (k) {
                        let nla = Object.assign({}, k);
                        nla.typAdresu = typAdresuKorespondencyjny.id;
                        newKontakt.listaAdresow.push(nla);
                    });
                }
                newKontakt.metadaneAdresata.klucz = kluczPodmiotu.id;
                if (nipId) {
                    newKontakt.metadaneAdresata.listaMetadanych[nipId.id] = kontaktToAdd.metadaneAdresata.listaMetadanych.NIP;
                }
                if (regonId) {
                    newKontakt.metadaneAdresata.listaMetadanych[regonId.id] = kontaktToAdd.metadaneAdresata.listaMetadanych.REGON;
                }
                if (krsId) {
                    newKontakt.metadaneAdresata.listaMetadanych[krsId.id] = kontaktToAdd.metadaneAdresata.listaMetadanych.KRS;
                }
                ezdRpRejestry.dodajNowegoAdresata(newKontakt);
            }
        }
    }
    utworzCennik(podmiot) {
        let cennikPodmiotu = podmiot.cennik;
        if (!cennikPodmiotu || cennikPodmiotu.length <= 0) {
            return;
        }
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let obecneCenniki = ezdRpAdmin.pobierzCenniki();
        let cennikExists = (cn) => {
            let allMatched = new Array();
            if (obecneCenniki == null || obecneCenniki.items == undefined || obecneCenniki.items == null || obecneCenniki.items.lenght <= 0) { return false; }
            for (let i = 0; i < obecneCenniki.items.length; i++) {
                let cc = obecneCenniki.items[i];
                if (cc.nazwa === cn) {
                    allMatched.push(cc);
                }
            }
            return allMatched;
        };
        for (let i = 0; i < cennikPodmiotu.length; i++) {
            let cennikToAdd = cennikPodmiotu[i];
            let cennikExisted = cennikExists(cennikToAdd.nazwa);
            if (cennikExisted && cennikExisted.length > 0) {
				let arr = new Array();
				for (let i = 0; i < cennikExisted.length; i++) {	
					let cc = cennikExisted[i];
					arr.push(cc.idCennik)
				}
				
                ezdRpAdmin.usunCennik({ "listaIdCennik": arr });
            }
            ezdRpAdmin.zapiszCennik(cennikToAdd);
        }
    }
    zalozSklady(podmiot) {
        log(`Lokalizacje skladu`);
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let lokalizacjaSkladu = { "nazwa": "Skład kancelarii", "adres": "Kancelaria Główna", "symbol": "SKG" };
        let obecneLokalizacje = ezdRpAdmin.pobierzLokalizacjeSkladu();
        log('Sprawdzenie obecności lokalizacji')
        if (obecneLokalizacje && obecneLokalizacje.items && obecneLokalizacje.items.length > 0) {
            log(`lokalizacje: ${JSON.stringify(obecneLokalizacje)}`);
            for (let i = 0; i < obecneLokalizacje.items.length; i++) {
                let cl = obecneLokalizacje.items[i];
                if (cl.symbol === lokalizacjaSkladu.symbol) {
                    return;
                }
            }
        } else {
            log(`Obecnie nie ma lokalizacji`);
        }
        let lokalizacjaSkladuRes = ezdRpAdmin.dodajLokalizacjeSkladu(lokalizacjaSkladu);
        ezdRpAdmin.aktywujLokalizacjeSkladu({ id: lokalizacjaSkladuRes.id });
        let skladyPodmiotu = podmiot.sklady;
        if (!skladyPodmiotu || skladyPodmiotu.length <= 0) {

        } else {
            for (let i = 0; i < skladyPodmiotu.length; i++) {
                let skladToAdd = skladyPodmiotu[i];
                skladToAdd.idLokalizacja = lokalizacjaSkladuRes.id;
                let skladRes = ezdRpAdmin.dodajDefinicjeSkladu(skladToAdd);
                skladToAdd.id = skladRes.idSklad;
            }
        }
        if (podmiot.idStanowiskaAll && podmiot.idStanowiskaAll.length > 0) {
            ezdRpAdmin.modyfikujLokalizacjeSkladu({ id: lokalizacjaSkladuRes.id, nazwa: lokalizacjaSkladu.nazwa, adres: lokalizacjaSkladu.adres, ids: podmiot.idStanowiskaAll });
        }
    }
    dodajKluczeAPI(podmiot) {
        let kluczePodmiotu = podmiot.kluczeAPI;
        if (!kluczePodmiotu || kluczePodmiotu.length <= 0) {
            return;
        }
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let obecneKlucze = ezdRpAdmin.pobierzKluczeAPI();
        let kluczExists = (kuid) => {
            if (obecneKlucze == null || obecneKlucze.items == undefined || obecneKlucze.items == null || obecneKlucze.items.lenght <= 0) { return false; }
            for (let i = 0; i < obecneKlucze.items.length; i++) {
                let ck = obecneKlucze.items[i];
                if (ck.idUzytkownikSystemowy === kuid) {
                    return true;
                }
            }
        };

        for (let i = 0; i < kluczePodmiotu.length; i++) {
            let kluczUserToAdd = kluczePodmiotu[i];
            if (kluczExists(kluczUserToAdd.id)) { continue; }
            ezdRpAdmin.dodajKluczAPI({ "nazwa": `${kluczUserToAdd.login}`, "klucz1": `${uuidv4()}`, "idUzytkownikSystemowy": kluczUserToAdd.id });
        }
    }
    zalozKartony(podmiot) {
        let ezdRpKancelaria = new EzdRpKancelaria(this.ezdRpClient);
        let skladyPodmiotu = podmiot.sklady;
        if (!skladyPodmiotu || skladyPodmiotu.length <= 0) {

        } else {
            let now = new Date();
            for (let i = 0; i < skladyPodmiotu.length; i++) {
                let skladToAdd = skladyPodmiotu[i];
                if (skladToAdd.id) {
                    let rocznikSkladu = now.getFullYear();
                    ezdRpKancelaria.otworzKarton({ "rocznik": rocznikSkladu, "idSklad": skladToAdd.id });
                }
            }
        }
    }
    zaladujSzablonyDokumentow(podmiot) {
        let szablonyPodmiotyDoZalozenia = podmiot.szablony_dokumentow;
        if (!szablonyPodmiotyDoZalozenia || szablonyPodmiotyDoZalozenia.length <= 0) {

        } else {
            let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
            let obecneSzablonyFoldery = ezdRpAdmin.pobierzSzablonyDokumentowFoldery();
            let ezdRpFiles = new EzdRpFiles(this.ezdRpClient);
            for (let i = 0; i < szablonyPodmiotyDoZalozenia.length; i++) {
                let szablonDoZalozeniaFolder = szablonyPodmiotyDoZalozenia[i].folder;
                let szablonFolderIstniejacy = null;
                let idFolderuSzablonu = null;
                for (let j = 0; j < obecneSzablonyFoldery.katalogi.length; j++) {
                    let currentFolderIstniejacy = obecneSzablonyFoldery.katalogi[j];
                    if (currentFolderIstniejacy.nazwa === szablonDoZalozeniaFolder.nazwa) {
                        szablonFolderIstniejacy = currentFolderIstniejacy;
                        break;
                    }
                }
                if (szablonFolderIstniejacy === null) {
                    let nowyFolder = ezdRpAdmin.dodajSzablonDokumentuFolder(szablonDoZalozeniaFolder);
                    idFolderuSzablonu = nowyFolder.id;
                    obecneSzablonyFoldery = ezdRpAdmin.pobierzSzablonyDokumentowFoldery();
                } else {
                    idFolderuSzablonu = szablonFolderIstniejacy.id;
                }
                if (idFolderuSzablonu === null || idFolderuSzablonu === '') {
                    continue;
                }

                let fileToken = ezdRpFiles._uzyskajTokenDodaniaDokumentow();
                if (!fileToken) {
                    continue;
                }
                let plikDoZaladowania = szablonyPodmiotyDoZalozenia[i].szablon;
                let istniejacySzablonDokumentu = null;
                let obecneSzablonyWybranegoFolderu = ezdRpAdmin.pobierzSzablonyDokumentowFoldery({ "idKatalogNadrzedny": idFolderuSzablonu });
                for (let j = 0; j < obecneSzablonyWybranegoFolderu.szablony.length; j++) {
                    let currentSzablonIstniejacy = obecneSzablonyWybranegoFolderu.szablony[j];
                    if (currentSzablonIstniejacy.nazwa === plikDoZaladowania.nazwaSzablonu) {
                        istniejacySzablonDokumentu = currentSzablonIstniejacy;
                        break;
                    }
                }
                if (istniejacySzablonDokumentu && istniejacySzablonDokumentu !== null) {
                    continue;
                }
                let uploadParams = {
                    'fileName': plikDoZaladowania.nazwaPliku,
                    'prefix': ''
                };
                let fd = new FormData();
                let fileContent = encoding.b64decode(szablonyPodmiotyDoZalozenia[i].plikbase64);
                let key = uploadParams.fileName;
                let fileContentType = key.endsWith('pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                fd.append('files', http.file(fileContent, key, fileContentType));
                let fileToUpload = { body: fd.body(), boundary: fd.boundary, name: key };
                let fileUploaded = ezdRpFiles._fileUpload(fileToUpload, fileToken);
                plikDoZaladowania.idFileRepository = fileUploaded.index;
                plikDoZaladowania.idKatalog = idFolderuSzablonu;
                ezdRpAdmin.dodajSzablonDokumentu(plikDoZaladowania);
                plikDoZaladowania.idFileRepository = '';
                plikDoZaladowania.idKatalog = '';
                istniejacySzablonDokumentu = null;
                obecneSzablonyWybranegoFolderu = ezdRpAdmin.pobierzSzablonyDokumentowFoldery({ "idKatalogNadrzedny": idFolderuSzablonu });
                for (let j = 0; j < obecneSzablonyWybranegoFolderu.szablony.length; j++) {
                    let currentSzablonIstniejacy = obecneSzablonyWybranegoFolderu.szablony[j];
                    if (currentSzablonIstniejacy.nazwa === plikDoZaladowania.nazwaSzablonu) {
                        istniejacySzablonDokumentu = currentSzablonIstniejacy;
                        break;
                    }
                }
                if (istniejacySzablonDokumentu && istniejacySzablonDokumentu !== null) {
                    log(`Znaleziono szablon dokumentu ${plikDoZaladowania.nazwaSzablonu} ${istniejacySzablonDokumentu.id}`);
                    let dodanieDostepuParams = {
                        "listaIdSzablon": [istniejacySzablonDokumentu.id],
                        "struktury": []
                    }
                    for (let stanowisko of podmiot.idStanowiskaAll) {
                        dodanieDostepuParams.struktury.push({ "idObiekt": stanowisko, "obiektTyp": "Stanowisko" });
                    }
                    ezdRpAdmin.dodajDostepDoSzablonowDokumentow(dodanieDostepuParams);
                } else {
                    log(`nie znaleziono szablonu ${plikDoZaladowania.nazwaSzablonu} po dodaniu`);
                }
            }


        }
    }

    zalozRejestry(podmiot) {
        let rejestryDoZalozenia = podmiot.rejestry;
        if (!rejestryDoZalozenia || rejestryDoZalozenia.length <= 0) {
            log(`brak rejestrow do zalozenia` /* ${JSON.stringify(podmiot)}*/);
        } else {
            let ezdRpRejestry = new EzdRpRejestry(this.ezdRpClient);
            let rejestryIstniejace = ezdRpRejestry.pobierzRejestry({ "pageInfo": { "pageNumber": 0, "pageSize": 20 }, "sort": [] });
            rejestryIstniejace = rejestryIstniejace.items ? rejestryIstniejace.items : [];
            for (let rejestrDoZalozenia of rejestryDoZalozenia) {
                if (!rejestryIstniejace.some(item => item.nazwa.startsWith(rejestrDoZalozenia.nazwa))) {
                    if (rejestrDoZalozenia.typProwadzenia === "sprawa") {
                        if (podmiot.rejestry_jrwa && podmiot.rejestry_jrwa.length > 0) {
                            for (let jrwaDoRejestru of podmiot.rejestry_jrwa) {
                                rejestrDoZalozenia.listaJrwa.push({
                                    "idJrwaSchematWykaz": jrwaDoRejestru.id,
                                    "symbolJrwaSchematWykaz": jrwaDoRejestru.symbol
                                });
                            }
                        }
                        else {
                            continue;
                        }
                    }
                    ezdRpRejestry.dodajRejestr(rejestrDoZalozenia);
                }
            }
        }
    }
    konfiguracjaEpuap(podmiot) {
        if (!podmiot.konfiguracja_epuap) {
            log(`brak konfiguracji epuap w ${podmiot.random}`);
            return;
        }
        if (!podmiot.epuap_user) {
            log(`brak epuap_user w ${podmiot.random}`);
            return;
        }
        if (podmiot.konfiguracja_epuap.idKonto && podmiot.konfiguracja_epuap.idKonto === '') {
            return;
        }
        let konfiguracjaEpuap = podmiot.konfiguracja_epuap;
        konfiguracjaEpuap.idKonto.replace('#', podmiot.random);
        let skrytkaEpuap = `skrytka${podmiot.random}`;
        konfiguracjaEpuap.skrytki.push(skrytkaEpuap);
        konfiguracjaEpuap.domyslnaSkrytka = skrytkaEpuap;
        konfiguracjaEpuap.stanowiskoOdbiorca = `${podmiot.epuap_user.uzytkownik.imie} ${podmiot.epuap_user.uzytkownik.nazwisko} - ${podmiot.epuap_user.nazwa}`;
        konfiguracjaEpuap.idUzytkownik = podmiot.epuap_user.idUzytkownik;
        konfiguracjaEpuap.idStanowiskoOdbiorca = podmiot.epuap_user.id;

        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        ezdRpAdmin.zapiszKonfiguracjeEpuap(konfiguracjaEpuap);
    }
    dodajPKN(podmiot) {

        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let obecnePkn = ezdRpAdmin.pobierz_pkn();
        if (obecnePkn.lista && obecnePkn.lista.length > 0) {

        } else {
            ezdRpAdmin.dodaj_pkn({
                "nazwa": "Pocztowa Książka Nadawcza",
                "listaIdOperator": ["EZDRP.KW.Operator1"],
                "listaIdRodzajPrzesylki": ["EZDRP.KW.RodzajPrzesylki3", "EZDRP.KW.RodzajPrzesylki2"],
                "listaIdStrefaPrzesylki": ["EZDRP.KW.Strefa5", "EZDRP.KW.Strefa4", "EZDRP.KW.Strefa1"],
                "listaIdCennikWykaz": [],
                "idRodzajSzablonPkn": "3"
            });
        }
    }
}

export function zakladaniestruktury1(data, globalCache) {
    let kuipSession = new Session(data, globalCache, KUIP_ENV_PREFIX);
    kuipSession.setTestUserEngineId(__VU);
    kuipSession.setTestIterationEngineId(__ITER);
    let kuipSsoSignIn = new SsoSignIn(kuipSession);
    kuipSsoSignIn.signIn();
    let kuipSuitesFactory = new EzdRpTestSuiteFactory(kuipSession);
    let kuipSuite = kuipSuitesFactory.getKuip();
    let podmioty = kuipSuite.zalozPodmioty();
    kuipSsoSignIn.signOut();

    data.data = {};
    data.params = {};
    globalCache = new Cache();
    let session = new Session(data, globalCache);
    session.setTestUserEngineId(__VU);
    session.setTestIterationEngineId(__ITER);
    session.setClearCookie(true);
    let ssoSignIn = new SsoSignIn(session);
    ssoSignIn.signIn();
    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let kuipSuite2 = suitesFactory.getKuip();

    podmioty.forEachPodmiot((podmiot) => {
        kuipSuite2.inicjalizacjaPodmiotu(podmiot.kuip.id, podmiot.numer);
    });
    log(`wylogowanie ${session.getLogin()} z EZDRP`);
    ssoSignIn.signOut();

    log(podmioty.podmioty);

    podmioty.forEachPodmiot((podmiot) => {
        let adminUser = podmiot.admins && podmiot.admins.length > 0 ? podmiot.admins[0] : null;
        if (adminUser) {
            data.data = {};
            data.params = {};
            globalCache = new Cache();
            session = new Session(data, globalCache, KUIP_ENV_PREFIX);
            session.setTestUserEngineId(__VU);
            session.setTestIterationEngineId(__ITER);
            session.setClearCookie(true);
            ssoSignIn = new SsoSignIn(session);
            log(`logowanie ${adminUser.login} do KUIP`);
            ssoSignIn.signIn({ login: adminUser.login, password: adminUser.haslo });
            suitesFactory = new EzdRpTestSuiteFactory(session);
            kuipSuite2 = suitesFactory.getKuip();
            kuipSuite2.zalozTypyKomorek(podmiot);
            kuipSuite2.zalozSlownikStanowisk(podmiot);
            kuipSuite2.zalozStrukturePodmiotu(podmiot);
			
			session.sleep(20);
            if (podmiot.isChanged) {
                kuipSuite2.wdrozenieStruktury();
            }
			
			session.sleep(20);

            log(`wylogowanie ${adminUser.login} z KUIP`);
            ssoSignIn.signOut();
            data.data = {};
            data.params = {};
            globalCache = new Cache();
            session = new Session(data, globalCache);
            session.setTestUserEngineId(__VU);
            session.setTestIterationEngineId(__ITER);
            session.setClearCookie(true);
            ssoSignIn = new SsoSignIn(session);
            log(`logowanie ${adminUser.login} do EZDRP`);
            ssoSignIn.signIn({ login: adminUser.login, password: adminUser.haslo });
            suitesFactory = new EzdRpTestSuiteFactory(session);
            kuipSuite2 = suitesFactory.getKuip();
            kuipSuite2.inicjalizacjaKreatoraPodmiotu(podmiot);
            kuipSuite2.zalozSzablonyUprawnien(podmiot);
            kuipSuite2.przypiszUprawnienia(podmiot);
            kuipSuite2.importJrwa(podmiot);
            kuipSuite2.zalozKontakty(podmiot);
            kuipSuite2.utworzCennik(podmiot);
            kuipSuite2.zalozSklady(podmiot);
            kuipSuite2.dodajKluczeAPI(podmiot);
            kuipSuite2.zaladujSzablonyDokumentow(podmiot);
            kuipSuite2.zalozRejestry(podmiot);
            kuipSuite2.konfiguracjaEpuap(podmiot);
            kuipSuite2.dodajPKN(podmiot);
            log(`wylogowanie ${adminUser.login} z EZDRP`);
            ssoSignIn.signOut();
        } else {
            log(`no admin for podmiot`);
        }
        let kancelariaUser = podmiot.kancelaria && podmiot.kancelaria.length > 0 ? podmiot.kancelaria[0] : null;
        if (kancelariaUser) {
            data.data = {};
            data.params = {};
            globalCache = new Cache();
            session = new Session(data, globalCache);
            session.setTestUserEngineId(__VU);
            session.setTestIterationEngineId(__ITER);
            session.setClearCookie(true);
            ssoSignIn = new SsoSignIn(session);
            log(`logowanie ${kancelariaUser.login} do EZDRP`);
            ssoSignIn.signIn({ login: kancelariaUser.login, password: kancelariaUser.haslo });
            suitesFactory = new EzdRpTestSuiteFactory(session);
            kuipSuite2 = suitesFactory.getKuip();
            kuipSuite2.zalozKartony(podmiot);
            log(`wylogowanie ${kancelariaUser.login} z EZDRP`);
            ssoSignIn.signOut();
        } else {
            log(`no kancelaria for podmiot`);
        }
    });
    log(podmioty.podmioty);
}

export function kuip2(data, globalCache) {
    let kuipSession = new Session(data, globalCache);
    kuipSession.setTestUserEngineId(__VU);
    kuipSession.setTestIterationEngineId(__ITER);
    let kuipSsoSignIn = new SsoSignIn(kuipSession);
    kuipSsoSignIn.signIn();
    let kuipSuitesFactory = new EzdRpTestSuiteFactory(kuipSession);
    let kuipSuite = kuipSuitesFactory.getKuip();

    kuipSuite.dashboard();
    kuipSession.sleepMinMax(SLEEP_QUICK_MIN, SLEEP_QUICK_MAX);

    let podmiot = kuipSuite.listaPodmiotow();
    kuipSession.sleepMinMax(SLEEP_QUICK_MIN, SLEEP_QUICK_MAX);

    kuipSuite.listaUzytkownikow(podmiot);
    kuipSession.sleepMinMax(SLEEP_QUICK_MIN, SLEEP_QUICK_MAX);

    kuipSuite.pobierzStrukture(podmiot);
    kuipSession.sleepMinMax(SLEEP_QUICK_MIN, SLEEP_QUICK_MAX);

    kuipSuite.administracja(podmiot);
    kuipSession.sleepMinMax(SLEEP_QUICK_MIN, SLEEP_QUICK_MAX);

}