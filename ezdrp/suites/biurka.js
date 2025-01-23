import { EzdRpTestSuite } from './_suite-base.js'
import { EzdRpProfile } from '../tests/profile.js'
import { EzdRpZadania } from '../tests/zadania.js'
import { EzdRpRejestry } from '../tests/rejestry.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { EzdRpSprawy } from '../tests/sprawy.js'
import { EzdRpBiurka } from '../tests/biurka.js'
import { randomBool, randomFromArray, randomIntInclusive, randomStringNumberCase } from '../../utils/random.js'
import { log } from '../../utils/log.js'
import { ParamsUsers } from '../../params/users.js'

import { Counter } from 'k6/metrics';

const apiMetricCounterSprawy = new Counter('ezdrp_counter_lista_spraw');
const apiMetricCounterPisma = new Counter('ezdrp_counter_lista_pisma');
const apiMetricCounterZadania = new Counter('ezdrp_counter_lista_zadania');
const apiMetricZadaniaSzczegoly = new Counter('ezdrp_counter_zadania_szczegoly');
const apiMetricZadaniaAkceptuj = new Counter('ezdrp_counter_zadania_akceptuj');
const apiMetricZadaniaDekretuj = new Counter('ezdrp_counter_zadania_dekretuj');
const apiMetricZadaniaPrzyjecia = new Counter('ezdrp_counter_zadania_przyjecia');
const ezdrp_metric_zadanie_przyjecie = new Counter("ezdrp_metrics_zadanie_przyjecie");

export class EzdRpTestSuiteBiurka extends EzdRpTestSuite {

    pobierzSprawyWtoku(param) {

        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        let ezdRpProfile = new EzdRpProfile(this._ezdRpClient);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpDashoard.pobierzLicznikMenu();

        ezdRpProfile.pobierzWykazySlownika('Sprawy.Status.Menu');
        ezdRpProfile.pobierzWykazySlownika('EZDRP.System.RozmiaryStron');

        let ezdRpBiurka = new EzdRpBiurka(this._ezdRpClient);
        let pobierzParam = { zakres: 2 };
        if (param) {
            if (param.sort) {
                pobierzParam.sort = param.sort;
            }
            if (param.pageNumber) {
                pobierzParam.pageNumber = param.pageNumber;
            }
        }
        let lstSprawy = ezdRpBiurka.pobierzBiurka(pobierzParam);
        
        randomBool(() => {
            ezdRpProfile.pobierzStatusPowiadomienia();
        });
        apiMetricCounterSprawy.add(1);
        return lstSprawy;
    }

    pobierzPismaWtoku(param) {

        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        let ezdRpProfile = new EzdRpProfile(this._ezdRpClient);
        let ezdRpRejestry = new EzdRpRejestry(this._ezdRpClient);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpDashoard.pobierzLicznikMenu();
        let ezdRpBiurka = new EzdRpBiurka(this._ezdRpClient);
        let pobierzParam = { zakres: 1 };
        if (param) {
            if (param.sort) {
                pobierzParam.sort = param.sort;
            }
            if (param.pageNumber) {
                pobierzParam.pageNumber = param.pageNumber;
            }
        }
        let lstPisma = ezdRpBiurka.pobierzBiurka(pobierzParam);
        if (param && param.pageNumber) {

        } else {
            ezdRpDashoard.pobierzPraweMenu('BIURKO-LISTA');
        }
        ezdRpDashoard.pobierzPraweMenu('PISMA_PRZYJETE');
        randomBool(() => {
            ezdRpProfile.pobierzStatusPowiadomienia();
        });
        apiMetricCounterPisma.add(1);
        return lstPisma;
    }

    pobierzZadania(typ, typSzczegolowy) {
        let ezdRpProfile = new EzdRpProfile(this._ezdRpClient);
        let ezdRpZadania = new EzdRpZadania(this.ezdRpClient);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.PotwierdzeniePrawidlowejOperacji']);
        let typParam = { typ: typ };
        if (typSzczegolowy) {
            typParam.typSzczegolowy = typSzczegolowy;
        }
        let lstZadania = ezdRpZadania.pobierzZadania(typParam);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        apiMetricCounterZadania.add(1);
        if (lstZadania && lstZadania.items) {
            return lstZadania.items;
        }
        return [];
    }
    licznikZadan() {
        let ezdRpZadania = new EzdRpZadania(this.ezdRpClient);
        return ezdRpZadania.licznikZadan();
    }
    pobierzSzczegolyZadania(idZadania, czyPrzyjac) {
        let ezdRpZadania = new EzdRpZadania(this.ezdRpClient);
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        let ezdRpProfile = new EzdRpProfile(this._ezdRpClient);
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        if (czyPrzyjac) {
            ezdRpZadania.przyjmijZadanie(idZadania);
            ezdrp_metric_zadanie_przyjecie.add(1);
        }
        let zadanieRes = ezdRpZadania.pobierzSzczegolyZadania(idZadania);
        ezdRpDashoard.pobierzPraweMenu('SZCZEGOLY_ZADANIA', idZadania);
        ezdRpProfile.pobierzUstawienia(['EZDRP.Zadania.LiczbaDniZadanPilnych']);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        let aktaRes = ezdRpSprawy.pobierzAktaSprawy({ idZadanie: idZadania, filterValue: 'udostepnione' });
        apiMetricZadaniaSzczegoly.add(1);
        return { zadanie: zadanieRes, akta: aktaRes };
    }
    przegladZadan(typLicznika, typZadania, sleepQuick, sleep, typSzczegolowy) {

        let ezdRpZadania = new EzdRpZadania(this.ezdRpClient);
        let ezdRpStruktura = this.suitesFactory.getStrukturaTests();

        let result = { szczegoly: 0, zrealizowane: 0 };
        let dashboardSuite = this.suitesFactory.getDashboard();

        let licznikiMenu = dashboardSuite.cykliczneLicznikiMenu();
        let licznikCount = dashboardSuite.pobierzLicznikByTyp(licznikiMenu, typLicznika);
        if (licznikCount && licznikCount.value && licznikCount.value !== "0") {
            let lstZadania = typSzczegolowy ? this.pobierzZadania(typZadania, typSzczegolowy) : this.pobierzZadania(typZadania);
            this.licznikZadan();
            if (lstZadania && lstZadania.length > 0) {
                let limitRandom = randomIntInclusive(1, 3);
                let iterationRandom = randomIntInclusive(1, lstZadania.length);
                let maxIterations = Math.min(limitRandom, iterationRandom);
                let zadanieDoRealizacji = null;
                let czyPrzyjac = false;
                let isZrealizowane = false;
                for (let zi = 0; zi < maxIterations; zi++) {
                    isZrealizowane = false;
                    zadanieDoRealizacji = lstZadania[zi];
                    if (sleepQuick) {
                        sleepQuick();
                    }
                    czyPrzyjac = zadanieDoRealizacji.status === 'Nowy';
                    let szczegolyZadania = this.pobierzSzczegolyZadania(zadanieDoRealizacji.idZadanie, czyPrzyjac);
                    result.szczegoly++;
                    if (sleepQuick) {
                        sleepQuick();
                    }
                    let isToSkip = randomBool(null, null, 3);
                    if (!isToSkip) {
                        if (zadanieDoRealizacji.typ === 'Do podpisu') {
                            if (sleep) {
                                sleep();
                            }
                        } else if (zadanieDoRealizacji.typ === 'Do akceptacji' || zadanieDoRealizacji.typZadaniaEnum === 2) {
                            if (sleep) {
                                sleep();
                            }
                            randomBool(() => {
                                if (szczegolyZadania && szczegolyZadania.zadanie && szczegolyZadania.zadanie.dokumenty && szczegolyZadania.zadanie.dokumenty.length > 0) {
                                    let filesTests = this.suitesFactory.getFilesTests();
                                    let dokumentFile = filesTests.downloadPliku({ idDokument: szczegolyZadania.zadanie.dokumenty[0].idDokument });
                                    if (dokumentFile && dokumentFile.wartosc.url) {
                                        filesTests.downloadFile(dokumentFile.wartosc.url);
                                        if (sleep) {
                                            sleep();
                                        }
                                    }
                                }
                                if (zadanieDoRealizacji.dokumenty && zadanieDoRealizacji.dokumenty.length > 0) {
                                    let czyNowszaWersja = ezdRpZadania.dokumentSprawdzCzyIstniejeNowszaWersja({ idDokumentWersja: zadanieDoRealizacji.dokumenty[0].idDokumentWersja });
                                    if (czyNowszaWersja && czyNowszaWersja.lista && czyNowszaWersja.lista.length > 0 && czyNowszaWersja.lista[0].czyIstniejeNowszaWersja) {
                                    } else {
                                        ezdRpZadania.akceptujZadanie({
                                            idDokumentWersja: zadanieDoRealizacji.dokumenty[0].idDokumentWersja,
                                            idPrzestrzen: zadanieDoRealizacji.idPrzestrzenRobocza,
                                            idDokument: zadanieDoRealizacji.dokumenty[0].idDokument,
                                            idZadania: zadanieDoRealizacji.idZadanie
                                        });
                                        apiMetricZadaniaAkceptuj.add(1);
                                        isZrealizowane = true;
                                        result.zrealizowane++;
                                    }
                                }
                            }, null, 4);

                        } else if (zadanieDoRealizacji.typ === "Do dekretacji" || zadanieDoRealizacji.typZadaniaEnum === 4) {
                            if (sleep) {
                                sleep();
                            }
                            if (szczegolyZadania && szczegolyZadania.zadanie && szczegolyZadania.zadanie.dokumenty && szczegolyZadania.zadanie.dokumenty.length > 0) {
                                let filesTests = this.suitesFactory.getFilesTests();
                                let dokumentFile = filesTests.downloadPliku({ idDokument: szczegolyZadania.zadanie.dokumenty[0].idDokument });
                                if (dokumentFile && dokumentFile.wartosc.url) {
                                    filesTests.downloadFile(dokumentFile.wartosc.url);
                                    if (sleep) {
                                        sleep();
                                    }
                                }
                            }
                            if (ParamsUsers.isUserParamContainsRole(this.session.getLogin(), 'Kierownik')) {
                                let uzytkownicyDoWyboru = ParamsUsers.getUserNamesByRole('Pracownik merytoryczny');
                                let isUzytkownikDoWyboruExists = uzytkownicyDoWyboru !== undefined && uzytkownicyDoWyboru !== null && uzytkownicyDoWyboru.length > 0;
                                if (isUzytkownikDoWyboruExists) {
                                    let ezdRpProfile = this.suitesFactory.getProfileTests();
                                    ezdRpProfile.pobierzUstawienia(['EZDRP.Zadania.MaksymalnaLiczbaOdbiorcowZadanUdostepnienia']);
                                    let ezdRpZadania = this.suitesFactory.getZadania();
                                    ezdRpZadania.pobierzSzablonyObiegu();
                                    ezdRpZadania.pobierzSzablonyDekretacji();
                                    if (sleepQuick) {
                                        sleepQuick();
                                    }
                                    let uzytkownikDoPrzekazania = randomFromArray(uzytkownicyDoWyboru);
                                    let wyszukaniOdbiorcy = ezdRpStruktura.getUsersExact(ezdRpStruktura.szukaj({ search: uzytkownikDoPrzekazania }), uzytkownikDoPrzekazania);
                                    if (wyszukaniOdbiorcy && wyszukaniOdbiorcy.length > 0 && szczegolyZadania.zadanie && szczegolyZadania.zadanie.dokumenty && szczegolyZadania.zadanie.dokumenty.length > 0) {
                                        let uzytkownik = wyszukaniOdbiorcy[0];
                                        let ezdRpSprawy = this.suitesFactory.getSprawyTests();
                                        let now = new Date();
                                        let termin = new Date(now);
                                        termin.setDate(termin.getDate() + randomIntInclusive(1, 3));
                                        let zadanieParam = {
                                            idDokument: szczegolyZadania.zadanie.dokumenty[0].idDokument,
                                            nazwaDokument: szczegolyZadania.zadanie.dokumenty[0].dokumentNazwa,
                                            czyTylkoDoOdczytu: szczegolyZadania.zadanie.dokumenty[0].czyTylkoDoOdczytu,
                                            idPrzestrzen: szczegolyZadania.zadanie.idPrzestrzenRobocza,
                                            idStanowiskoOdbiorca: uzytkownik.idStanowiska,
                                            idPismo: szczegolyZadania.zadanie.idPismo,
                                            idPoprzednie: szczegolyZadania.zadanie.idZadanie,
                                            idReferencja: szczegolyZadania.zadanie.idZadanie,
                                            terminRealizacji: randomBool() ? termin.toISOString() : "",
                                            typ: '5',//do realizacji
                                            opis: `Proszę o realizację ${randomStringNumberCase(10)}`
                                        };
                                        if (szczegolyZadania.zadanie.numerRPW !== undefined && szczegolyZadania.zadanie.numerRPW !== '') {
                                            zadanieParam.numerRPW = szczegolyZadania.zadanie.numerRPW;
                                        }
                                        let zadanieRes = ezdRpSprawy.dodajZadanie(zadanieParam);
                                    }
                                }
                                apiMetricZadaniaDekretuj.add(1);
                                isZrealizowane = true;
                                result.zrealizowane++;
                            } else {
                                ezdRpZadania.cofnijZadanie(zadanieDoRealizacji.idZadanie, `zadanie Do-dekretacji nie u Kierownika ${this.session.getLogin()}`);
                                if (sleepQuick) {
                                    sleepQuick();
                                }
                            }
                        } else if (zadanieDoRealizacji.typ === "Do realizacji" || zadanieDoRealizacji.typZadaniaEnum === 1) {
                            if (ParamsUsers.isUserParamContainsRole(this.session.getLogin(), 'Pracownik merytoryczny')) {
                            } else {
                                ezdRpZadania.cofnijZadanie(zadanieDoRealizacji.idZadanie, `zadanie Do-realizacji nie u Pracownika ${this.session.getLogin()}`);
                                if (sleepQuick) {
                                    sleepQuick();
                                }
                            }
                        }
                    }
                    if (isZrealizowane && sleep) {
                        if (sleepQuick) {
                            sleepQuick();
                        }
                        this.pobierzZadania(typZadania);
                        this.licznikZadan();
                    }
                }
            }
        }
    }
}