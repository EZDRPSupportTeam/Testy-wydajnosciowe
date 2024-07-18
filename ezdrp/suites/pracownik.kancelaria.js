import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { randomBool, randomIntMax, randomFromArray, randomIntInclusive, randomStringNumberCase, randomNumberAsString } from '../../utils/random.js'
import { log } from '../../utils/log.js'
import { ParamsUsers } from '../../params/users.js'
import { ParamsFiles } from '../../params/files.js'
import { uzupelnienieMetadanych } from './pracownik.shared.js'
import { Counter } from "k6/metrics";

const ezdrp_metric_rpw = new Counter("ezdrp_metrics_rpw");
const ezdrp_metric_rpw_missed = new Counter("ezdrp_ometrics_rpw_missed");

function rejestracjaRPW(ezdRpAdmin, ezdRpKancelaria, ezdRpStruktura, session, options) {

    let currentUserLogin = session.getLogin();
    ezdRpAdmin.pobierzOstatnioWybieraneStanowiska();

    let uzytkownicyKierownicy = ParamsUsers.getUserNamesByRole('Kierownik');
    let isOdbiorcaKorespondencjiExists = uzytkownicyKierownicy !== undefined && uzytkownicyKierownicy !== null && uzytkownicyKierownicy.length > 0;
    if (isOdbiorcaKorespondencjiExists) {
        let kierownikDoKorespondencjiNazwisko = randomFromArray(uzytkownicyKierownicy);
        
        let wyszukaniOdbiorcy = ezdRpStruktura.getUsersExact(ezdRpStruktura.szukaj({ search: kierownikDoKorespondencjiNazwisko }), kierownikDoKorespondencjiNazwisko);
        if (wyszukaniOdbiorcy && wyszukaniOdbiorcy.length > 0) {
            let odbiorcaKorespondencji = null;
            for (let u = 0; u < wyszukaniOdbiorcy.length; u++) {
                let user = wyszukaniOdbiorcy[u];
                if (user.idStanowiska != '' && user.email !== currentUserLogin) {
                    odbiorcaKorespondencji = user;
                    break;
                }
            }
            if (odbiorcaKorespondencji === null) {
                log(`${kierownikDoKorespondencjiNazwisko} as 'odbiorca RPW' not found`);
            } else {
                let cDate = new Date();
                let zarejestrujPrzesylkeParam = {
                    idStanowiskoOdbiorca: odbiorcaKorespondencji.idStanowiska,
                    dataWplywu: `${cDate.toISOString()}`,
                    typ: 1, 
                    iloscRekordow: randomIntInclusive(1, 5),
                    czyFileMonitor: randomBool()
                };
                randomBool(() => {
                    zarejestrujPrzesylkeParam.typ = 2; 
                }, null, 2);
                
                if (options) {
                    if (options.czyFileMonitor !== undefined) {
                        zarejestrujPrzesylkeParam.czyFileMonitor = options.czyFileMonitor;
                    }
                    if (options.iloscRekordow !== undefined) {
                        zarejestrujPrzesylkeParam.iloscRekordow = options.iloscRekordow;
                    }
                }
                let zarejestrowanePrzesylki = ezdRpKancelaria.rejestrujPrzesylke(zarejestrujPrzesylkeParam);
                if (zarejestrowanePrzesylki && zarejestrowanePrzesylki.errorId) {
                    log(`nie zarejestrowano ${zarejestrujPrzesylkeParam.iloscRekordow} RPW do ${kierownikDoKorespondencjiNazwisko} przez ${currentUserLogin} ${zarejestrowanePrzesylki.errorId}`);
                } else {
                    ezdrp_metric_rpw.add(zarejestrujPrzesylkeParam.iloscRekordow);
                    
                }
                
                ezdRpAdmin.pobierzOstatnioWybieraneStanowiska();
            }
        } else {
            log(`nie znaleziono kierownika ${kierownikDoKorespondencjiNazwisko}`);
        }
    } else {
        log('nie ma uzytkownika o roli Kierownik');
    }
}

export function rolaKancelariaGenerateData(data, globalCache, session, ssoSignIn) {
    let suitesFactory = new EzdRpTestSuiteFactory(session);

    let ezdRpAdmin = suitesFactory.getAdminTests();
    let ezdRpStruktura = suitesFactory.getStrukturaTests();
    let ezdRpKancelaria = suitesFactory.getKancelariaTests();
    let ezdRpRejestry = suitesFactory.getRejestryTests();
    let ezdRpPisma = suitesFactory.getPismaTests();
    let ezdRpFiles = suitesFactory.getFilesTests();

    rejestracjaRPW(ezdRpAdmin, ezdRpKancelaria, ezdRpStruktura, session, { czyFileMonitor: true, iloscRekordow: randomIntInclusive(5,19) });

    let pismaDoMetadanych = ezdRpPisma.pobierzListePism({ mojePisma: true, brakMetadanych: true });
    if (pismaDoMetadanych !== null && pismaDoMetadanych.items !== undefined && pismaDoMetadanych.items.length > 0) {
        let liczbaPismdoUzupelnienia = Math.min(10, randomIntInclusive(1, pismaDoMetadanych.items.length));
        uzupelnienieMetadanych(liczbaPismdoUzupelnienia, pismaDoMetadanych.items, ezdRpPisma, ezdRpKancelaria, ezdRpRejestry, ezdRpFiles, session, { uploadFiles: true });
    }
}

function oznaczanieKW(ezdRpKancelaria, ezdRpProfile, session) {
    
    let korespondencjaWychodzaca = ezdRpKancelaria.zestawienieKorespondencjiWychodzacej(
        {
            status: 4,
            dataWplywu: 2 
        });
    if (korespondencjaWychodzaca && korespondencjaWychodzaca.items && korespondencjaWychodzaca.items.length > 0) {
        let przefiltrowaneItems = korespondencjaWychodzaca.items.filter(item => 
            !item.danePrzesylki.includes("odbiór osobisty") && 
            !item.danePrzesylki.includes("międzyresortowa")
        );

        let copyKoperty = [...przefiltrowaneItems];
        let limitKoperty = Math.min(randomIntInclusive(3, 15), copyKoperty.length);
        
        for (let i = 0; i < limitKoperty; i++) {
            if (copyKoperty.length <= 0) { break; }
            let kopertaWylosowanaIndex = randomIntMax(copyKoperty.length);
            let kopertaWylosowana = copyKoperty[kopertaWylosowanaIndex];
            
            let rpwDoWczytania = kopertaWylosowana.numerRKW;
            
            let kopertaRKW = ezdRpKancelaria.wczytanieKW({ rkw: rpwDoWczytania });
            if (kopertaRKW && kopertaRKW.idRodzajPrzesylki) {
                
                let parametryCenyPrzesylki = { rodzajPrzesylki: kopertaRKW.idRodzajPrzesylki, cennikOperatora: kopertaRKW.idOperatorPrzesylki, strefaOperatora: kopertaRKW.idStrefaPrzesylki, priorytet: false };
                let parametryRodzajePrzesylek = { operator: parametryCenyPrzesylki.cennikOperatora };
                ezdRpProfile.pobierzRodzajePrzesylek(parametryRodzajePrzesylek);
                let cenyDostepne = ezdRpKancelaria.pobierzCenyPrzesylki(parametryCenyPrzesylki);
                
                let strefyDostepne = ezdRpProfile.pobierzStrefyPrzesylek({ operator: parametryCenyPrzesylki.cennikOperatora, rodzaj: parametryCenyPrzesylki.rodzajPrzesylki });
                
                session.sleepQuick();
                let strefaDlaKoperty = strefyDostepne && strefyDostepne.lista && strefyDostepne.lista.length > 0 ? randomFromArray(strefyDostepne.lista) : null;
                if (strefaDlaKoperty) {
                    let priorytetyDostepne = ezdRpProfile.pobierzPriorytetyPrzesylek({ operator: parametryCenyPrzesylki.cennikOperatora, rodzaj: parametryCenyPrzesylki.rodzajPrzesylki, strefa: strefaDlaKoperty.id });
                    let priorytetDlaKoperty = priorytetyDostepne && priorytetyDostepne.length > 0 ? randomFromArray(priorytetyDostepne) : null;
                    if (parametryCenyPrzesylki.priorytet != priorytetDlaKoperty || parametryCenyPrzesylki.strefaOperatora != strefaDlaKoperty.id) {
                        parametryCenyPrzesylki.priorytet = priorytetDlaKoperty;
                        parametryCenyPrzesylki.strefaOperatora = strefaDlaKoperty.id;
                        cenyDostepne = ezdRpKancelaria.pobierzCenyPrzesylki(parametryCenyPrzesylki);
                    }
                    if (cenyDostepne && cenyDostepne.ceny && cenyDostepne.ceny.length > 0) {
                        let cenaDlaKoperty = randomFromArray(cenyDostepne.ceny);
                        session.sleepQuick();
                        ezdRpKancelaria.wyslijKoperte({
                            idKorespondencji: kopertaRKW.idKorespondencja,
                            dataPrzyjecia: (new Date()).toISOString().split('T')[0],
                            czyPriorytet: parametryCenyPrzesylki.priorytet,
                            idRodzajPrzesylki: parametryCenyPrzesylki.rodzajPrzesylki,
                            status: 3,
                            idStrefaPrzesylki: parametryCenyPrzesylki.strefaOperatora,
                            idOperatorPrzesylki: parametryCenyPrzesylki.cennikOperatora,
                            cena: cenaDlaKoperty.cena,
                            idCennikWykaz: cenaDlaKoperty.idCennikWykaz
                        });
                        kopertaRKW = ezdRpKancelaria.wczytanieKW({ rkw: rpwDoWczytania });
                        ezdRpKancelaria.pobierzCenyPrzesylki(parametryCenyPrzesylki);
                        ezdRpKancelaria.pobierzCenyPrzesylki(parametryCenyPrzesylki);
                        ezdRpProfile.pobierzRodzajePrzesylek(parametryRodzajePrzesylek);
                        strefyDostepne = ezdRpProfile.pobierzStrefyPrzesylek({ operator: parametryCenyPrzesylki.cennikOperatora, rodzaj: parametryCenyPrzesylki.rodzajPrzesylki });
                        priorytetyDostepne = ezdRpProfile.pobierzPriorytetyPrzesylek({ operator: parametryCenyPrzesylki.cennikOperatora, rodzaj: parametryCenyPrzesylki.rodzajPrzesylki, strefa: strefaDlaKoperty.id });
                        session.sleepQuick();
                        copyKoperty.splice(kopertaWylosowanaIndex, 1);
                    }
                } else {
                    
                }
            }
        }
    } else {
        
    }
}

export function rolaKancelaria(data, globalCache, session, ssoSignIn) {

    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let dashboardSuite = suitesFactory.getDashboard();
    
    
    

    let ezdRpProfile = suitesFactory.getProfileTests();
    let ezdRpDashoard = suitesFactory.getDashboardTests();
    let ezdRpAdmin = suitesFactory.getAdminTests();
    let ezdRpStruktura = suitesFactory.getStrukturaTests();
    let ezdRpKancelaria = suitesFactory.getKancelariaTests();
    let ezdRpRejestry = suitesFactory.getRejestryTests();
    let ezdRpPisma = suitesFactory.getPismaTests();
    let ezdRpFiles = suitesFactory.getFilesTests();

    let currentUserLogin = session.getLogin();

    dashboardSuite.glownaStrona();
    session.sleepQuick();

    ezdRpProfile.pobierzUstawienia(['EZDRP.RPW.MaksymalnaLiczbaRejestracji']);
    ezdRpDashoard.pobierzLicznikMenu();
    ezdRpProfile.pobierzStatusPowiadomienia();
    
    randomBool(() => {
        
        rejestracjaRPW(ezdRpAdmin, ezdRpKancelaria, ezdRpStruktura, session);
    }, () => {
        ezdrp_metric_rpw_missed.add(1);
        
    }, 5, 3);

    session.sleepLong();
    randomBool(() => {
        
        let pismaDoMetadanych = ezdRpPisma.pobierzListePism({ mojePisma: true, brakMetadanych: true });
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpProfile.pobierzWykazySlownika('EZDRP.System.RozmiaryStron');
        if (pismaDoMetadanych !== null && pismaDoMetadanych.items !== undefined && pismaDoMetadanych.items.length > 0) {
            let liczbaPismdoUzupelnienia = Math.min(20, randomIntInclusive(1, pismaDoMetadanych.items.length));
            uzupelnienieMetadanych(liczbaPismdoUzupelnienia, pismaDoMetadanych.items, ezdRpPisma, ezdRpKancelaria, ezdRpRejestry, ezdRpFiles, session, { uploadFiles: true });
        } else {
            if (pismaDoMetadanych && pismaDoMetadanych.errorId && pismaDoMetadanych.errorId !== '') {
                log(`blad pobierania listy pism do rejestracji ${currentUserLogin} ${pismaDoMetadanych.errorId}`);
            } else {
                
            }
        }
    }, null, 6, 3);
    session.sleepLong();

    randomBool(() => {
        oznaczanieKW(ezdRpKancelaria, ezdRpProfile, session);
    }, null, 2);
    
    session.sleepLong();
}