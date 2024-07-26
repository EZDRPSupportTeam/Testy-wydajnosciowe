import { randomIntMax, randomBool, randomFromArray, randomIntInclusive, randomStringNumberCase, randomNumberAsString } from '../../utils/random.js'
import { log } from '../../utils/log.js'
import { ParamsFiles } from '../../params/files.js'
import { ParamsUsers } from '../../params/users.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { Counter, Trend } from "k6/metrics";

const ezdrp_metric_dodanieskanu_dokumentu = new Counter("ezdrp_metrics_dodanieskanu_dokumentu");

export function uzupelnienieMetadanych(liczbaPismdoUzupelnienia, pismaDoMetadanych, ezdRpPisma, ezdRpKancelaria, ezdRpRejestry, ezdRpFiles, session, templateConfig) {

    let currentUserLogin = session.getLogin();

    for (let i = 0; i < liczbaPismdoUzupelnienia; i++) {
        let pismoDoWyszukania = pismaDoMetadanych[i];
        if (pismoDoWyszukania.numer !== undefined && pismoDoWyszukania.numer !== '') {
            let pismoZnalezione = ezdRpPisma.wyszukajPisma({ searchValue: pismoDoWyszukania.numer });
            if (pismoZnalezione == null || pismoZnalezione.idPismo === undefined) {
                continue;
            }
            let zalacznikiDoSkladu = ezdRpKancelaria.pobierzPismaDoRejestracjiWSkladzie({ idPismo: pismoZnalezione.idPismo });
            ezdRpRejestry.getKonfiguracjaMetadanych({ klucz: 'EZDRP.Metadane.Klucze2', idObiekt: pismoZnalezione.idPismo });
            session.sleepLong();
            let zalacznikDoSkladu = zalacznikiDoSkladu.zalaczniki && zalacznikiDoSkladu.zalaczniki.length && zalacznikiDoSkladu.zalaczniki.length > 0 ? zalacznikiDoSkladu.zalaczniki[0] : null;



            if ((templateConfig && templateConfig.uploadFiles) || !templateConfig) {
                if (zalacznikDoSkladu) {
                    let fileParamsInput = { userId: session.getTestUserEngineId(), iterationId: session.getTestIterationEngineId() };
                    let fileParamsRes = ParamsFiles.getFileParams(fileParamsInput);
                    if (!fileParamsRes) {
                        throw `file was not drawn ${fileParamsInput.userId} ${fileParamsInput.iterationId}`;
                    }
                    let fileNameToUpload = fileParamsRes;
                    let uploadParams = {
                        'fileName': fileNameToUpload,
                        'prefix': `${randomStringNumberCase(10)}`
                    };
                    let uploadedFile = ezdRpFiles.uploadPlikuOnly(uploadParams);
                    if (uploadedFile) {
                        ezdRpPisma.wczytajDokumentUtworzZadanie({
                            idPlikStorage: uploadedFile.index,
                            checksum: uploadedFile.checksum,
                            tytulDokumentu: `Auto-dokument ${uploadParams.prefix} ${uploadParams.fileName}`,
                            idDokument: zalacznikDoSkladu.idDokument,
                            idPismo: pismoZnalezione.idPismo
                        });
                        ezdrp_metric_dodanieskanu_dokumentu.add(1);
                    } else {
                        log(`brak informacji o pliku przy aktualizacji RPW ${currentUserLogin} ${pismoZnalezione.numerRPW}`);
                    }
                } else {
                    log(`brak zalacznikow w RPW do aktualizacji skanu ${currentUserLogin} ${pismoZnalezione.numerRPW}`);
                }
            }
            let adresaciMinisterstwa = ezdRpRejestry.wyszukajAdresataProponowanego({ search: 'mini' });
            if (adresaciMinisterstwa !== null && adresaciMinisterstwa.lista !== undefined && adresaciMinisterstwa.lista.length > 0) {
                let adresatPisma = randomFromArray(adresaciMinisterstwa.lista);
                if (adresatPisma !== null && adresatPisma.adresy !== undefined && adresatPisma.adresy.length > 0) {
                    let adresAdresata = adresatPisma.adresy[0].idAdresWersja;
                    let now = new Date();
                    let termin = new Date(now);
                    termin.setDate(termin.getDate() - randomIntInclusive(1, 3));
                    let metadane = {
                        "adresaci": [{ "idAdresWersja": adresAdresata, "rodzaj": "EZDRP.RPW.RodzajNadawcy.1" }],//Nadawca
                        "tytul": `Przesyłka ${randomStringNumberCase(15)} ${now.toISOString().slice(0, 10)}`,
                        "idPismo": pismoZnalezione.idPismo,
                        "rejestrujSkladChronologiczny": false,
                        "czyAnonimowy": false,
                        "dostep": "EZDRP.Metadane.RPW.Dostep2",
                        "uwagi": `${randomStringNumberCase(15)} ${randomStringNumberCase(15)}`,
                        "liczbaZalacznikow": 1,
                        "znakNaPismie": null,
                        "sposobDostarczenia": "EZDRP.Metadane.SposobDostarczenia2",
                        "typDokumentu": "EZDRP.Metadane.RPW.Typ.1",
                        "rodzajDokumentu": "EZDRP.Metadane.Rodzaj.Dokumentu.1",
                        "dataNaPismie": termin.toISOString(),
                        "dataWplywu": now.toISOString(),
                        "dataNadania": termin.toISOString(),
                        "numerNadawczyR": "",
                        "metadanePismo": { "idObiekt": pismoZnalezione.idPismo, "klucz": "EZDRP.Metadane.Klucze2", "listaMetadanych": {} }
                    };
                    randomBool(() => {
                        metadane.numerNadawczyR = randomNumberAsString(20);
                    });
                    ezdRpPisma.zapiszPismo(metadane);
                    if ((templateConfig && (templateConfig.sklad || templateConfig.sklad === undefined)) || !templateConfig) {
                        let isPominacSklad = randomBool();//null, null, 2);
                        if (!isPominacSklad) {
                            let zalacznikiDoSkladu = ezdRpKancelaria.pobierzPismaDoRejestracjiWSkladzie({ idPismo: pismoZnalezione.idPismo });
                            if (zalacznikDoSkladu && zalacznikDoSkladu.listaSkladow !== undefined && zalacznikDoSkladu.listaSkladow.length > 0) {
                                let sklad = zalacznikDoSkladu.listaSkladow[0];
                                if (sklad.kartonSkladu !== undefined && sklad.kartonSkladu.id !== undefined && sklad.kartonSkladu.id !== '') {
                                    let rocznikSkladu = now.getFullYear();
                                    if (sklad.kartonSkladu.rocznik === rocznikSkladu) {
                                        let rejestracjaWSkladzie = [{
                                            "idSklad": sklad.id,
                                            "idDokument": zalacznikDoSkladu.idDokument,
                                            "idPrzestrzenRobocza": zalacznikDoSkladu.idPrzestrzenRobocza,
                                            "wartoscKoduKreskowego": zalacznikDoSkladu.wartoscKodu,
                                            "rocznik": rocznikSkladu,
                                            "idPismo": zalacznikiDoSkladu.idPismo,
                                            "numerRPW": zalacznikiDoSkladu.numerRPW,
                                            "nazwa": zalacznikDoSkladu.nazwa,
                                            "typOdwzorowania": zalacznikDoSkladu.typOdwzorowania
                                        }];
                                        randomBool(() => {
                                            rejestracjaWSkladzie.uwagi = randomNumberAsString(15);
                                        });
                                        ezdRpRejestry.zarejestrujZalacznikiWSkladzie(rejestracjaWSkladzie);
                                    }
                                    else {
                                        log(`nieaktualny rocznik ${rocznikSkladu} kartonu ${sklad.kartonSkladu.znak} dla skladu ${sklad.typSkladu.nazwa} do rejestracji w skladzie ${currentUserLogin} ${pismoZnalezione.numerRPW}`);
                                    }
                                } else {
                                    log(`brak kartonu dla skladu ${sklad.typSkladu.nazwa} do rejestracji w skladzie ${currentUserLogin} ${pismoZnalezione.numerRPW}`);
                                }
                            }
                            else {
                            }
                        }
                        else {
                        }
                    } else {
                    }
                    session.sleepLong();
                } else {
                    log(`brak adresow dla nadawcy w RPW ${currentUserLogin} ${adresatPisma.nazwaPodmiotu}`);
                }
            } else {
                log(`brak adresatow do wyboru w RPW ${currentUserLogin}`);
            }
        } else {
            log(`pismo do uzupełnienia metadanych nie ma numeru ${currentUserLogin} ${pismoDoWyszukania.tytul} ${pismoDoWyszukania.id}`);
        }
    }

}
export class ObslugaSprawy {
    constructor(sessionParam, sprawaParam) {
        this.session = sessionParam;
        this.sprawa = sprawaParam;
        this.suitesFactory = new EzdRpTestSuiteFactory(sessionParam);
        this.sprawaSzczegoly = null;
        this.sprawaObj = {};
        this._operacje1 = [
            this.pobierzHistorie,
            this.pobierzSklad,
            this.pobierzMetryke,
            this.pobierzMetadane,
            this.dodajFolder,
            this.zmienTytul,
            this.zmienTermin
        ];
        this._operacje2 = [
            this.pobierzDokument,
            this.dodajDokument,
            this.aktualizujDokument,
            this.dodajOpinie,
            this.dodajNotatke,
            this.dodajZadanieAkceptacji,
            this.dodajNotatkeWlasna,
            this.podpiszDokument,
            this.pobierzDokument,
            this.aktualizujDokument,
            this.dodajZadanieAkceptacji
        ];
        this._operacje3 = [
            this.rejestracjaKorespondencjiWychodzacej
        ];
    }
    sprawaId() {
        return this.sprawa.idSprawa;
    }
    sprawaZnak() {
        return this.sprawa.znak ? this.sprawa.znak : this.sprawaSzczegoly.getSprawa().znak;
    }
    sprawaIdPrzestrzen() {
        try {
            return this.sprawaSzczegoly ? this.sprawaSzczegoly.getSprawa().idPrzestrzenRobocza : '';
        } catch (e) {
            log(`id przestrzen undefined ${this.session.getLogin()} ${e} ${this.sprawaZnak()}`);
        }
    }
    wykonajOperacje(operationList, sleep) {
        if (this.sprawaSzczegoly === null) {
            this.otworzSprawe();
        }
        for (const operation of operationList) {
            operation.call(this);
            sleep.call(this.session);
        }
    }
    losujOperacje(minCount, maxCount, operacje, sleep) {
        let operationCount = randomIntInclusive(minCount, maxCount ? maxCount : operacje.length);
        let operationArray = new Array();
        let operationIndexList = [...Array(operacje.length).keys()];
        for (let i = 0; i < operationCount; i++) {
            let operationIndexRandom = randomFromArray(operationIndexList);
            operationArray.push(operacje[operationIndexRandom]);
            operationIndexList.splice(operationIndexRandom, 1);
        }
        this.wykonajOperacje(operationArray, sleep);
    }
    losujOperacje1(minCount, maxCount) {
        this.losujOperacje(minCount, maxCount, this._operacje1, this.session.sleepQuick);
    }
    losujOperacje2(minCount, maxCount) {
        this.losujOperacje(minCount, maxCount, this._operacje2, this.session.sleepLong);
    }
    wykonajOperacje1() {
        this.wykonajOperacje(this._operacje1, this.session.sleepQuick);
    }
    wykonajOperacje2() {
        this.wykonajOperacje(this._operacje2, this.session.sleepQuick);
    }
    wykonajOperacje3() {
        this.wykonajOperacje(this._operacje3, this.session.sleepQuick);
    }

    otworzSprawe() {
        let sprawySuites = this.suitesFactory.getSprawy();
        this.sprawaSzczegoly = sprawySuites.zaladujSprawe(this.sprawaId());
    }
    pobierzHistorie() {
        let sprawySuites = this.suitesFactory.getSprawy();
        sprawySuites.pobierzHistorieSprawy(this.sprawaId());
    }
    pobierzSklad() {
        let sprawySuites = this.suitesFactory.getSprawy();
        let sklad = sprawySuites.zaladujSklad(this.sprawaIdPrzestrzen(), this.sprawaId());
    }
    pobierzMetryke() {
        let sprawySuites = this.suitesFactory.getSprawy();
        let metryka = sprawySuites.zaladujMetryke(this.sprawaIdPrzestrzen(), this.sprawaId());

    }
    pobierzMetadane() {
        let sprawySuites = this.suitesFactory.getSprawy();
        let metryka = sprawySuites.zaladujMetadane(this.sprawaId());

    }
    dodajFolder() {
        let sprawySuites = this.suitesFactory.getSprawy();
        this.sprawaSzczegoly = sprawySuites.dodajFolder(this.sprawaIdPrzestrzen(), this.sprawaId());

    }
    zmienTytul() {
        let sprawySuites = this.suitesFactory.getSprawy();
        this.sprawaSzczegoly = sprawySuites.zmienTytul(this.sprawa);
    }
    zmienTermin() {
        let sprawySuites = this.suitesFactory.getSprawy();
        let now = new Date();
        let termin = new Date(now);
        termin.setDate(termin.getDate() + randomIntInclusive(1, 3));
        this.sprawaSzczegoly = sprawySuites.zmienTermin(this.sprawa, termin.toISOString());
    }

    dodajZadaniePodpisu() {

        /*let sprawySuites = this.suitesFactory.getSprawy();
        let anyDokument = this.sprawaSet.getDokument();
        if (anyDokument) {
            let uzytkownicyKierownicy = ParamsUsers.getUserNamesByRole('Kierownik');
            let isOdbiorcaKorespondencjiExists = uzytkownicyKierownicy !== undefined && uzytkownicyKierownicy !== null && uzytkownicyKierownicy.length > 0;
            if (isOdbiorcaKorespondencjiExists) {
                let kierownikDoKorespondencjiNazwisko = randomFromArray(uzytkownicyKierownicy);
                let zlecenie = sprawySuites.dodajZadanieAkceptacji(anyDokument, this.sprawaSet.getSprawa(), kierownikDoKorespondencjiNazwisko);
                if (zlecenie && zlecenie.commandResponseMessage) {
                }
            }
        }*/
    }

    dodajZadanieAkceptacji() {

        let sprawySuites = this.suitesFactory.getSprawy();
        let anyDokument = this.sprawaSzczegoly.getDokument();
        if (anyDokument) {
            let uzytkownicyKierownicy = ParamsUsers.getUserNamesByRole('Kierownik');
            let isOdbiorcaKorespondencjiExists = uzytkownicyKierownicy !== undefined && uzytkownicyKierownicy !== null && uzytkownicyKierownicy.length > 0;
            if (isOdbiorcaKorespondencjiExists) {
                let kierownikDoKorespondencjiNazwisko = randomFromArray(uzytkownicyKierownicy);
                let zlecenie = sprawySuites.dodajZadanieAkceptacji(anyDokument, this.sprawaSzczegoly.getSprawa(), kierownikDoKorespondencjiNazwisko);
                if (zlecenie && zlecenie.commandResponseMessage) {
                }
            }
        }
    }
    pobierzDokument() {
        if (this.sprawaSzczegoly.getDokumentCount() > 0) {
            let pismaSuite = this.suitesFactory.getPisma();
            pismaSuite.pobierzDokument(this.sprawaSzczegoly.getDokument());
        } else {
        }
    }
    dodajDokument() {
        let sprawySuites = this.suitesFactory.getSprawy();
        this.sprawaSzczegoly = sprawySuites.dodajDokument(this.sprawaIdPrzestrzen(), this.sprawaId());

    }
    aktualizujDokument() {
        let sprawySuites = this.suitesFactory.getSprawy();
        let anyDokument = this.sprawaSzczegoly.getDokument();
        if (anyDokument) {
            this.session.sleepLong();
            this.sprawaSzczegoly = sprawySuites.dodajDokument(this.sprawaIdPrzestrzen(), this.sprawaId(), anyDokument.idDokument);
        } else {
            this.dodajDokument();
        }
    }
    dodajOpinie() {
        let sprawySuites = this.suitesFactory.getSprawy();
        let pismaSuite = this.suitesFactory.getPisma();
        this.sprawaSzczegoly = sprawySuites.dodajOpinie(this.sprawaIdPrzestrzen(), this.sprawaId(), this.sprawa.znak);

        let anyDokument = this.sprawaSzczegoly.getDokument();
        pismaSuite.pobierzDokument(anyDokument);
        if (anyDokument) {
            this.session.sleepLong();
            this.sprawaSzczegoly = sprawySuites.dodajDokument(this.sprawaIdPrzestrzen(), this.sprawaId(), anyDokument.idDokument);
        }
    }
    pobierzOpinie() {
        this.pobierzDokument();
    }
    dodajNotatke() {
        let sprawySuites = this.suitesFactory.getSprawy();
        let pismaSuite = this.suitesFactory.getPisma();
        this.sprawaSzczegoly = sprawySuites.dodajNotatke(this.sprawaIdPrzestrzen(), this.sprawaId(), this.sprawa.znak);

        let anyDokument = this.sprawaSzczegoly.getDokument();
        pismaSuite.pobierzDokument(anyDokument);
        if (anyDokument) {
            this.session.sleepLong();
            this.sprawaSzczegoly = sprawySuites.dodajDokument(this.sprawaIdPrzestrzen(), this.sprawaId(), anyDokument.idDokument);

        }
    }
    dodajNotatkeWlasna() {
        let sprawySuites = this.suitesFactory.getSprawy();
        sprawySuites.dodajNotatkeWlasna(this.sprawaIdPrzestrzen(), this.sprawaId(), this.sprawa.znak);

    }
    podpiszDokument() {
        this.aktualizujDokument();
    }
    rejestracjaKorespondencjiWychodzacej() {
        let currentUserLogin = this.session.getLogin();
        let anyDokument = this.sprawaSzczegoly.getDokument();
        if (!anyDokument) {
            this.dodajDokument();
            anyDokument = this.sprawaSzczegoly.getDokument();
        }
        if (anyDokument) {
            let ezdRpRejestry = this.suitesFactory.getRejestryTests();
            let ezdRpProfile = this.suitesFactory.getProfileTests();
            ezdRpProfile.pobierzWykazySlownika('Adresaci.Podmiot.Typ');
            this.session.sleepQuick();
            let adresaciMinisterstwa = ezdRpRejestry.wyszukajAdresataProponowanego({ search: 'mini' });
            if (adresaciMinisterstwa !== null && adresaciMinisterstwa.lista !== undefined && adresaciMinisterstwa.lista.length > 0) {
                let adresatPisma = randomFromArray(adresaciMinisterstwa.lista);
                if (adresatPisma !== null && adresatPisma.adresy !== undefined && adresatPisma.adresy.length > 0) {
                    let adresAdresata = adresatPisma.adresy[0].idAdresWersja;
                    this.session.sleepQuick();
                    let operatorzy = ezdRpProfile.pobierzWykazySlownika('EZDRP.KW.Operator');
                    if (operatorzy && operatorzy.lista && operatorzy.lista.length > 0) {
                        let parametrySlownika = { operator: 'EZDRP.KW.Operator1' };
                        for (let op of operatorzy.lista) {
                            if (op.wartoscText === 'Poczta Polska') {
                                parametrySlownika.operator = op.id;
                                break;
                            }
                        }
                        this.session.sleepQuick();
                        ezdRpProfile.pobierzTypyPrzesylek();
                        let rodzajePrzesylek = ezdRpProfile.pobierzRodzajePrzesylek(parametrySlownika);
                        if (rodzajePrzesylek && rodzajePrzesylek.lista && rodzajePrzesylek.lista.length > 0) {
                            parametrySlownika.rodzaj = 'EZDRP.KW.RodzajPrzesylki3';
                            for (let op of rodzajePrzesylek.lista) {
                                if (op.wartoscTekst === 'list polecony + ZPO') {
                                    parametrySlownika.rodzaj = op.id;
                                    break;
                                }
                                if (op.wartoscTekst.includes('list polecony')) {
                                    parametrySlownika.rodzaj = op.id;
                                    break;
                                }
                            }
                            let strefyPrzesylek = ezdRpProfile.pobierzStrefyPrzesylek(parametrySlownika);
                            if (strefyPrzesylek && strefyPrzesylek.lista && strefyPrzesylek.lista.length > 0) {
                                parametrySlownika.strefa = 'EZDRP.KW.Strefa1';
                                for (let op of strefyPrzesylek.lista) {
                                    if (op.wartoscTekst === 'Krajowa') {
                                        parametrySlownika.rodzaj = op.id;
                                        break;
                                    }
                                    if (op.wartoscTekst.includes('Krajowa')) {
                                        parametrySlownika.rodzaj = op.id;
                                        break;
                                    }
                                }
                                let priorytetyPrzesylek = ezdRpProfile.pobierzPriorytetyPrzesylek(parametrySlownika);
                                let rejestracjaKorespondencjiParam = {
                                    "idPrzestrzenRobocza": this.sprawaIdPrzestrzen(),
                                    "dodatkoweInformacje": `dodatkowe ${randomStringNumberCase(10)}`,
                                    "idRodzajPrzesylki": parametrySlownika.rodzaj,
                                    "idStrefaPrzesylki": parametrySlownika.strefa,
                                    "idOperatorPrzesylki": parametrySlownika.operator,
                                    "czyPriorytet": priorytetyPrzesylek && priorytetyPrzesylek.length && randomBool() ? priorytetyPrzesylek[0] : false,
                                    "adresaci": [{ "idAdresWersja": adresAdresata }],
                                    "idDokumentWersja": [anyDokument.idDokumentWersja],
                                    "idSprawy": this.sprawaId(),
                                    "znakSprawy": this.sprawa.znak,
                                    "zawartoscKoperty": `zawartosc ${randomStringNumberCase(10)}`
                                };
                                this.session.sleepQuick();
                                let ezdRpKancelaria = this.suitesFactory.getKancelariaTests();
                                let zarejestrowanaKorespondencja = ezdRpKancelaria.rejestrujKorespondencjeWychodzaca(rejestracjaKorespondencjiParam);
                                if (zarejestrowanaKorespondencja && zarejestrowanaKorespondencja.idGrupa) {
                                    this.session.sleepQuick();
                                    let rodzajeWydrukow = ezdRpKancelaria.pobierzSzablonyWydrukowKW({ czyZpo: false, czyPriorytet: rejestracjaKorespondencjiParam.czyPriorytet });
                                    this.session.sleepQuick();
                                    let wydrukKw = ezdRpKancelaria.wybierzRodzajWydruku({ idGrupy: zarejestrowanaKorespondencja.idGrupa });
                                    if (wydrukKw && wydrukKw.lista && wydrukKw.lista.length > 0) {
                                        this.session.sleepQuick();
                                        let wydrukUrl = wydrukKw.lista[0].wartosc.url;
                                        let ezdRpFiles = this.suitesFactory.getFilesTests();
                                        ezdRpFiles.downloadFile(wydrukUrl);
                                    } else {
                                        log(`nie wygenerowano wydruku KW ${zarejestrowanaKorespondencja.idGrupa} ${currentUserLogin}`);
                                    }
                                } else {
                                    log(`nie zarejestrowano KW ${currentUserLogin}`);
                                }
                            } else {
                                log(`brak stref przesylek dla operatora ${parametrySlownika.operator} i rodzaju ${parametrySlownika.rodzaj} w KW ${currentUserLogin}`);
                            }
                        } else {
                            log(`brak rodzajow przesylek dla operatora ${parametrySlownika.operator} w KW ${currentUserLogin}`);
                        }
                    } else {
                        log(`brak operatorów do wyboru w KW ${currentUserLogin} ${typeof (operatorzy)} ${typeof (operatorzy.lista)} ${JSON.stringify(operatorzy)}`);
                    }
                } else {
                    log(`brak adresow dla nadawcy w KW ${currentUserLogin} ${adresatPisma.nazwaPodmiotu}`);
                }
            } else {
                log(`brak adresatow do wyboru w KW ${currentUserLogin}`);
            }
        } else {
        }
    }
}