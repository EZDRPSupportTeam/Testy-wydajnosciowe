import { EzdRpTestSuite } from './_suite-base.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { EzdRpJrwa } from '../tests/jrwa.js'
import { EzdRpSprawy, SzczegolySprawy } from '../tests/sprawy.js'
import { ParamsJrwa } from '../../params/jrwa.js'
import { ParamsUsers } from '../../params/users.js'
import { EzdRpProfile } from '../tests/profile.js'
import { EzdRpRejestry } from '../tests/rejestry.js'
import { EzdRpFiles } from '../tests/files.js'
import { EzdRpSzukaj } from '../tests/szukaj.js'
import { EzdRpZadania } from '../tests/zadania.js'
import { EzdRpStruktura } from '../tests/struktura.js'
import { EzdRpNoweZadania } from '../tests/nowezadania.js'
import { log } from '../../utils/log.js'
import { ParamsFiles } from '../../params/files.js'
import { randomStringNumberCase, randomIntInclusive, randomBool, randomIntMax, randomFromArray } from '../../utils/random.js'

import { Counter } from 'k6/metrics';

const apiMetricCounterSprawaNowa = new Counter('ezdrp_counter_sprawa_nowa');
const apiMetricCounterSprawa = new Counter('ezdrp_counter_sprawa_szczegoly');
const ezdrp_metric_otworz_sprawe = new Counter("ezdrp_metrics_otworz_sprawe");
const apiMetricCounterSprawaInne = new Counter('ezdrp_counter_sprawa_inne');
const apiMetricCounterNotatkaDodaj = new Counter('ezdrp_counter_notatka_dodaj');
const apiMetricCounterOpiniaDodaj = new Counter('ezdrp_counter_opinia_dodaj');
export class EzdRpTestSuiteSprawy extends EzdRpTestSuite {

    nowaSprawaZGlownejStrony() {
        let ezdRpProfile = new EzdRpProfile(this.ezdRpClient);

        ezdRpProfile.pobierzUstawienia(['EZDRP.System.PotwierdzeniePrawidlowejOperacji']);

        let ezdRpJrwa = new EzdRpJrwa(this.ezdRpClient);
        let jrwaSearchParam = { userId: this.session.getTestUserEngineId(), iterationId: this.session.getTestIterationEngineId(), login: this.session.getLogin() };
        let jrwaToSearch = ParamsJrwa.getJrwaParams(jrwaSearchParam);
        let wykaz = ezdRpJrwa.wyszukajWykaz({ symbol: jrwaToSearch.jrwa });

        let ezdRpDashboard = new EzdRpDashboard(this.ezdRpClient);
        ezdRpProfile.pobierzStatusPowiadomienia();

        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let roczniki = ezdRpSprawy.pobierzRoczniki();
        let nowYear = new Date().getFullYear();
        if (roczniki.includes(nowYear)) {

        } else {
            throw `roczniki not includes ${nowYear}`;
        }

        let jrwaForSprawa = ParamsUsers.getUserJrwaFromWykaz(wykaz, jrwaSearchParam);
        if (!jrwaForSprawa) {
            return null;
        }

        let ezdRpRejestry = new EzdRpRejestry(this.ezdRpClient);
        let rejestryByJrwa = ezdRpRejestry.listaByJrwa(jrwaForSprawa.id);

        let pobierzNumerSprawyParams = {
            jrwaId: jrwaForSprawa.id,
            rok: nowYear,
            symbol: jrwaForSprawa.symbol,
        };
        let numerSprawyRes = ezdRpSprawy.pobierzNumerSprawy(pobierzNumerSprawyParams);
        if (!numerSprawyRes || !numerSprawyRes.numerSprawy) {
            throw `no numer sprawy for: ${pobierzNumerSprawyParams.symbol}.${pobierzNumerSprawyParams.rok}`;
        }

        let znakSprawyParams = {
            jrwaId: pobierzNumerSprawyParams.jrwaId,
            rok: pobierzNumerSprawyParams.rok,
            numer: numerSprawyRes.numerSprawy,
        };
        let znakSprawyRes = ezdRpSprawy.pobierzZnakSprawy(znakSprawyParams);
        if (!znakSprawyRes || !znakSprawyRes.znakSprawy) {
            throw `no znak sprawy for: ${pobierzNumerSprawyParams.symbol}.${znakSprawyParams.numer}.${znakSprawyParams.rok}`;
        }

        ezdRpDashboard.pobierzLicznikMenu();

        let utworzSpraweParams = {
            tytul: `Automatyczna sprawa ${randomStringNumberCase(10)}`,
            jrwaId: znakSprawyParams.jrwaId,
            katArch: jrwaForSprawa.kategorieArchiwalne[0].katArch,
            rok: znakSprawyParams.rok,
            numer: 0
        };
        let sprawaRes = ezdRpSprawy.generujSprawe(utworzSpraweParams);
        if (!sprawaRes || !sprawaRes.idSprawa) {
            throw `no valid pusta sprawa for: ${pobierzNumerSprawyParams.symbol}.${znakSprawyParams.numer}.${znakSprawyParams.rok} ${ sprawaRes && sprawaRes[0] ? sprawaRes[0].text : ''}`;
        }
        apiMetricCounterSprawaNowa.add(1);
        return this.zaladujSprawe(sprawaRes.idSprawa);
    }

    zaladujSprawe(idSprawy) {

        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let szczegolySprawy = this.zaladujSpraweAndAkta(idSprawy);
        let ezdRpProfile = new EzdRpProfile(this.ezdRpClient);
        let ezdRpDashboard = new EzdRpDashboard(this.ezdRpClient);
        let ezdRpZadania = new EzdRpZadania(this.ezdRpClient);

        let sprawaRes = szczegolySprawy.getSprawa();//ezdRpSprawy.pobierzSprawe(idSprawy);
        let ezdRpDashboardSuites = this.suitesFactory.getDashboard();
        if (sprawaRes && sprawaRes.idSprawa) {
            ezdRpDashboardSuites.sharedSprawy(sprawaRes.idSprawa);
        }
        if (sprawaRes && sprawaRes.idPrzestrzenRobocza) {
            ezdRpSprawy.pobierzNotatkiWlasne(sprawaRes.idPrzestrzenRobocza);
        }
        ezdRpProfile.pobierzWykazySlownika('EZDRP.Zadania.Typ');
        ezdRpProfile.pobierzWykazySlownika('EZDRP.Zadania.Status');
        if (sprawaRes && sprawaRes.idSprawa) {
            ezdRpZadania.pobierzZadaniaPowiazane({ idSprawa: sprawaRes.idSprawa });
        }
        apiMetricCounterSprawa.add(1);
        ezdrp_metric_otworz_sprawe.add(1);
        return szczegolySprawy;
    }
    dodajZadanieAkceptacji(dokument, sprawa, userFilter) {
        let ezdRpStruktura = new EzdRpStruktura(this.ezdRpClient);
        let uzytkownicy = new Array();
        randomBool(() => {
            let searchFilter = userFilter ? userFilter : 'test';
            let wyniki = ezdRpStruktura.getUsersExact(ezdRpStruktura.szukaj({ search: searchFilter }), searchFilter);
            if (wyniki && wyniki.length) {
                let currentUser = this.session.getLogin();

                for (let u = 0; u < wyniki.length; u++) {
                    let user = wyniki[u];
                    if (user.idStanowiska != '' && user.email !== currentUser) {
                        uzytkownicy.push(user);
                    }
                }
            }
        });
        if (uzytkownicy.length <= 0) {
            let struktura = ezdRpStruktura.pobierzDrzewo({});
            if (struktura.komorkiOrganizacyjne) {
                let root = struktura.komorkiOrganizacyjne[0];
                if (root.komorkiOrganizacyjne) {
                    let maxLoop = 1;
                    let komorki = new Array(root.komorkiOrganizacyjne);
                    for (let i = 0; i < root.komorkiOrganizacyjne.length; i++) {
                        let komorka = root.komorkiOrganizacyjne[i];
                        if (maxLoop <= 0) { break; }
                        let komorkaStruktura = ezdRpStruktura.pobierzDrzewo({ id: komorka.id });
                        if (komorkaStruktura && komorkaStruktura.komorkiOrganizacyjne) {
                            komorkaStruktura = komorkaStruktura.komorkiOrganizacyjne[0];
                            if (komorkaStruktura.uzytkownicy) {
                                for (let u = 0; u < root.uzytkownicy.length; u++) {
                                    let user = root.uzytkownicy[u];
                                    if (user.idStanowiska != '') {
                                        uzytkownicy.push(user);
                                    }
                                }
                            }
                        }
                        maxLoop--;
                    }
                }
                if (root.uzytkownicy) {
                    for (let u = 0; u < root.uzytkownicy.length; u++) {
                        let user = root.uzytkownicy[u];
                        if (user.idStanowiska != '') {
                            uzytkownicy.push(user);
                        }
                    }
                }
            }
        }
        if (uzytkownicy.length <= 0) {
            log(`no users for akceptacja ${this.session.getLogin()} ${uzytkownicy.length}`);
            return;
        }
        let userForAkceptuj = randomFromArray(uzytkownicy);//uzytkownicy[randomIntMax(uzytkownicy.length)];
        if (!userForAkceptuj || !userForAkceptuj.idStanowiska) {
            log(`no user selected for akceptuj ${this.session.getLogin()} ${uzytkownicy.length} ${userForAkceptuj ? userForAkceptuj.id : 'no-id'}`);
            return;
        }
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);

        let now = new Date();
        let termin = new Date(now);
        termin.setDate(termin.getDate() + randomIntInclusive(1, 3));

        let zadanieParam = {
            idDokument: dokument.idDokument,
            nazwaDokument: dokument.nazwa,
            idSprawa: sprawa.idSprawa,
            tytulSprawa: sprawa.tytul,
            znakSprawa: sprawa.znak,
            idPrzestrzen: sprawa.idPrzestrzenRobocza,
            idStanowiskoOdbiorca: userForAkceptuj.idStanowiska,
            terminRealizacji: randomBool() ? termin.toISOString() : "",
            typ: '2',//do akceptacji
            opis: `Proszę o akceptację ${randomStringNumberCase(10)}`
        };
        let zadanieRes = ezdRpSprawy.dodajZadanie(zadanieParam);
        return zadanieRes;
    }
    zaladujMetadane(idSprawy) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let aktaRes = ezdRpSprawy.pobierzMetadane({ idObiekt: idSprawy, klucz: 'EZDRP.Metadane.Klucze5' });
        apiMetricCounterSprawaInne.add(1);
        return aktaRes;
    }
    zaladujMetryke(idPrzestrzen, idSprawy) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let aktaRes = ezdRpSprawy.pobierzAktaSprawy({ idSprawa: idSprawy, idPrzestrzen: idPrzestrzen, filterValue: 'metryka' });
        apiMetricCounterSprawaInne.add(1);
        return aktaRes;
    }
    zaladujSklad(idPrzestrzen, idSprawy) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let aktaRes = ezdRpSprawy.pobierzAktaSprawy({ idSprawa: idSprawy, idPrzestrzen: idPrzestrzen, filterValue: 'sklad' });
        apiMetricCounterSprawaInne.add(1);
        return aktaRes;
    }

    zaladujSpraweAndAkta(idSprawy) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let sprawaRes = ezdRpSprawy.pobierzSprawe(idSprawy);
        let szczegolySprawy = new SzczegolySprawy();
        if (sprawaRes && sprawaRes.errorId) {
            log(`brak danych sprawy ${idSprawy} ${this.session.getLogin()} ${sprawaRes.errorId}`);
        } else {
            let aktaRes = ezdRpSprawy.pobierzNoweAkta({ idSprawa: sprawaRes.idSprawa, idPrzestrzenRobocza: sprawaRes.idPrzestrzenRobocza });
            szczegolySprawy.setSprawa(sprawaRes);
            szczegolySprawy.setAkta(aktaRes);
        }
        return szczegolySprawy;
    }

    szukajSpraweByBiurko(biurko, skip) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let getAnyIfNotFound = true;
        return ezdRpSprawy.szukajSpraweByBiurko(biurko, skip, getAnyIfNotFound);
    }

    szukajSpraweByZnak(znakSprawy) {
        let ezdRpSzukaj = new EzdRpSzukaj(this.ezdRpClient);
        return ezdRpSzukaj.szukajByZnakSprawy(znakSprawy);
    }

    pobierzHistorieSprawy(idSprawy) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let historia = ezdRpSprawy.pobierzHistorieSprawy(idSprawy);
        apiMetricCounterSprawaInne.add(1);
        return historia;
    }
    dodajFolder(idPrzestrzen, idSprawy) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let nazwa = `Folder ${randomStringNumberCase(10)}`;
        let daneFolderu = {
            idPrzestrzen: idPrzestrzen,
            nazwa: nazwa,
        };
        ezdRpSprawy.dodajFolder(daneFolderu);
        apiMetricCounterSprawaInne.add(1);
        return this.zaladujSpraweAndAkta(idSprawy);
    }
    zmienTytul(sprawa, tytulOver) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let tytul = tytulOver && tytulOver !== '' ? tytulOver : `Zmieniona sprawa ${randomStringNumberCase(10)}`;
        let daneSprawy = {
            id: sprawa.idSprawa,
            tytul: tytul,
            kategoriaArchiwalna: sprawa.kategoriaArchiwalna,
            terminZalatwienia: sprawa.terminZalatwienia,
            idStanowiskoProwadzacy: sprawa.idStanowiskoProwadzacy
        };
        ezdRpSprawy.zmienSprawe(daneSprawy);
        apiMetricCounterSprawaInne.add(1);
        return this.zaladujSpraweAndAkta(sprawa.idSprawa);
    }
    zmienTermin(sprawa, termin) {
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let daneSprawy = {
            id: sprawa.idSprawa,
            tytul: sprawa.tytul,
            kategoriaArchiwalna: sprawa.kategoriaArchiwalna,
            terminZalatwienia: termin,
            idStanowiskoProwadzacy: sprawa.idStanowiskoProwadzacy
        };
        ezdRpSprawy.zmienSprawe(daneSprawy);
        apiMetricCounterSprawaInne.add(1);
        return this.zaladujSpraweAndAkta(sprawa.idSprawa);
    }
    dodajOpinie(idPrzestrzen, idSprawy, nrSprawy) {

        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let tytul = `Opinia ${randomStringNumberCase(10)}`;
        ezdRpSprawy.dodajOpinie(idPrzestrzen, nrSprawy, tytul);
        apiMetricCounterOpiniaDodaj.add(1);
        return this.zaladujSpraweAndAkta(idSprawy);
    }
    dodajNotatke(idPrzestrzen, idSprawy, nrSprawy) {

        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let tytulNotatki = `Notatka ${randomStringNumberCase(10)}`;
        ezdRpSprawy.dodajNotatke(idPrzestrzen, nrSprawy, tytulNotatki);
        apiMetricCounterNotatkaDodaj.add(1);
        return this.zaladujSpraweAndAkta(idSprawy);
    }
    dodajNotatkeWlasna(idPrzestrzen, idSprawy, nrSprawy) {

        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let trescArray = new Array();
        let dlugosc = 1;
        for (let i = randomIntInclusive(5, 15); i > 0; i--) {
            dlugosc = randomIntInclusive(4, 10);
            trescArray.push(`${randomStringNumberCase(dlugosc)}`);
        }
        let trescNotatki = trescArray.join(' ');
        ezdRpSprawy.dodajNotatkeWlasna(idPrzestrzen, nrSprawy, idSprawy, trescNotatki);
        ezdRpSprawy.pobierzNotatkiWlasne(idPrzestrzen);
        apiMetricCounterSprawaInne.add(1);
    }
    dodajDokument(idPrzestrzen, idSprawy, idDokument) {
        let ezdRpFiles = new EzdRpFiles(this.ezdRpClient);
        let fileParamsInput = { userId: this.session.getTestUserEngineId(), iterationId: this.session.getTestIterationEngineId() };
        let fileParamsRes = ParamsFiles.getFileParams(fileParamsInput);
        if (!fileParamsRes) {
            throw `file was not drawn ${fileParamsInput.userId} ${fileParamsInput.iterationId}`;
        }
        let fileNameToUpload = fileParamsRes;

        let uploadParams = {
            'fileName': fileNameToUpload,
            'prefix': `${randomStringNumberCase(10)}`
        };
        if (idPrzestrzen && idPrzestrzen != '') {

            uploadParams['idPrzestrzen'] = idPrzestrzen;
        }
        if (idDokument && idDokument != '') {

            uploadParams['idDokument'] = idDokument;
        }

        let dokument = ezdRpFiles.uploadPliku(uploadParams);

        return this.zaladujSpraweAndAkta(idSprawy);
    }
    wylosujSprawy(biurko, sprawyCount) {
        let sprawy = new Array();
        for (let i = 0; i < sprawyCount; i++) {
            sprawy.push(biurko.items[randomIntMax(biurko.items.length)]);
        }
        return sprawy;
    }
}