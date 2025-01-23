import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive, randomStringNumberCase } from '../../utils/random.js'
import { EzdRpZadaniaConst } from '../tests/zadania.js'
import { log } from '../../utils/log.js'
import { uzupelnienieMetadanych, ObslugaSprawy } from './pracownik.shared.js'
import { ParamsJrwa } from '../../params/jrwa.js'

export function rolaPracownikGenerateData(data, globalCache, session, ssoSignIn) {

    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let dashboardSuite = suitesFactory.getDashboard();
    let sprawySuites = suitesFactory.getSprawy();
    let pismaSuite = suitesFactory.getPisma();
    let biurkaSuite = suitesFactory.getBiurka();
    
    let ezdRpKancelaria = suitesFactory.getKancelariaTests();
    let ezdRpRejestry = suitesFactory.getRejestryTests();
    let ezdRpPisma = suitesFactory.getPismaTests();
    let ezdRpFiles = suitesFactory.getFilesTests();
    let ezdRpJrwa = suitesFactory.getJrwaTests();
    let ezdRpSprawy = suitesFactory.getSprawyTests();
    
    pismaSuite.nowePismoZGlownejStrony();
    session.sleepQuick();

}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function rolaPracownik(data, globalCache, session, ssoSignIn) {

    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let dashboardSuite = suitesFactory.getDashboard();
    let sprawySuites = suitesFactory.getSprawy();
    let pismaSuite = suitesFactory.getPisma();
    let biurkaSuite = suitesFactory.getBiurka();

    let ezdRpKancelaria = suitesFactory.getKancelariaTests();
    let ezdRpRejestry = suitesFactory.getRejestryTests();
    let ezdRpPisma = suitesFactory.getPismaTests();
    let ezdRpFiles = suitesFactory.getFilesTests();
    let ezdRpJrwa = suitesFactory.getJrwaTests();
    let ezdRpSprawy = suitesFactory.getSprawyTests();

    let currentUserLogin = session.getLogin();

    dashboardSuite.glownaStrona();
    session.sleepQuick();

    let biurkaSortByDataRejestracjiAsc = { sort: [{ "propertyColumn": "dataRejestracji", "propertySortType": "asc" }] };
    let biurko = biurkaSuite.pobierzSprawyWtoku(randomBool(null, null, 2) ? biurkaSortByDataRejestracjiAsc : null);
    if (biurko && biurko.items && biurko.items.length > 0) {
        let limitRandom = randomIntInclusive(1, 4);
        let biurkoRandom = randomIntInclusive(1, biurko.items.length);
        let sprawy = sprawySuites.wylosujSprawy(biurko, Math.min(limitRandom, biurkoRandom));
        for (let sprawa of sprawy) {
            let obslugaSprawy = new ObslugaSprawy(session, sprawa);
            randomBool(() => {
                sprawySuites.szukajSpraweByZnak(sprawa.znak);
            }, null, 3, 3);
            
            randomBool(() => {
                session.sleepQuick();
                obslugaSprawy.losujOperacje1(0, 2);
            }, null, 5, 3);
            randomBool(() => {
                session.sleepLong();
                obslugaSprawy.losujOperacje2(0, 2);
            }, null, 3, 3);
            randomBool(() => {
                session.sleepQuick();
                obslugaSprawy.wykonajOperacje3();
            }, null, 5, 3);

            session.sleepLong();
            biurkaSuite.pobierzSprawyWtoku();


        }
    }

    
    let ezdRpBiurkaConst = new EzdRpZadaniaConst();
    biurkaSuite.przegladZadan(
        'ZADANIA_NOWE',
        ezdRpBiurkaConst.Zadania_Nowe(),
        () => { session.sleepQuick(); },
        () => { session.sleepLong(); }
    );
    biurkaSuite.przegladZadan(
        'ZADANIA_W_REALIZACJI',
        ezdRpBiurkaConst.Zadania_WRealizacji(),
        () => { session.sleepQuick(); },
        () => { session.sleepLong(); }
    );

    randomBool(() => {
        session.sleepQuick();
        dashboardSuite.glownaStrona();
        session.sleepLong();

        randomBool(() => {
            pismaSuite.nowePismoZGlownejStrony();
            session.sleepLong();
        }, null, 4);

    }, null, 2);

    randomBool(() => {
        sprawySuites.nowaSprawaZGlownejStrony();
        
        session.sleepLong();
    }, null, 5, 3);

    session.sleepLong();
    dashboardSuite.cyklicznePowiadomienia();
    let biurkaSortByDataWplywuAsc = { sort: [{ "propertyColumn": "dataWplywu", "propertySortType": "asc" }] };
    biurko = biurkaSuite.pobierzPismaWtoku(randomBool(null, null, 2) ? biurkaSortByDataWplywuAsc : null);
    if (biurko && biurko.items && biurko.items.length > 0) {
        let limitRandom = randomIntInclusive(1, 10);
        let biurkoRandom = randomIntInclusive(1, biurko.items.length);
        let liczbaPismDoZalozeniaSprawy = Math.min(limitRandom, biurkoRandom);
        if (liczbaPismDoZalozeniaSprawy > 0) {
            for (let i = 0; i < liczbaPismDoZalozeniaSprawy; i++) {
                biurko = biurkaSuite.pobierzPismaWtoku();
                let pismo = biurko && biurko.items && biurko.items.length > 0 ? i >= biurko.items.length ? null : biurko.items[i] : null;
                if (pismo === null) { continue; }

                if (!pismo.atrybuty.czyUzupelnioneMetadane) {
                    
                    if (pismo.numer && pismo.numer !== '') {
                        let liczbaPismdoUzupelnienia = 1;
                        let pismaBezMetadanych = new Array();
                        pismaBezMetadanych.push(pismo);
                        uzupelnienieMetadanych(liczbaPismdoUzupelnienia, pismaBezMetadanych, ezdRpPisma, ezdRpKancelaria, ezdRpRejestry, ezdRpFiles, session, { uploadFiles: false, sklad: false });
                    } else {
                        if (pismo.dokumentPisma && pismo.dokumentPisma !== '') {
                            let idDokument = pismo.dokumentPisma.idDokument;
                            let madataneConfig = ezdRpRejestry.getKonfiguracjaMetadanych({ idObiekt: idDokument, klucz: 'EZDRP.Metadane.Klucze1' });
                            session.sleepQuick();
                            if (madataneConfig.listaKonfiguracji) {
                                let listaMetadanych = {};
                                let cDate = new Date();
                                for (let c of madataneConfig.listaKonfiguracji) {
                                    listaMetadanych[c.id] = "";
                                    if (c.nazwa === "Dostęp") {
                                        listaMetadanych[c.id] = 'EZDRP.Metadane.RPW.Dostep2';
                                    } else if (c.nazwa === "Rodzaj dokumentu") {
                                        listaMetadanych[c.id] = 'EZDRP.Metadane.Rodzaj.Dokumentu.1';
                                    } else if (c.nazwa === "Typ dokumentu") {
                                        listaMetadanych[c.id] = 'EZDRP.Metadane.RPW.Typ.1';
                                    } else if (c.nazwa === "Data na dokumencie") {
                                        listaMetadanych[c.id] = `${cDate.toISOString()}`;
                                    }
                                }
                                let metadane = {
                                    "idObiekt": idDokument,
                                    "klucz": "EZDRP.Metadane.Klucze1",
                                    "listaMetadanych": listaMetadanych
                                };
                                ezdRpRejestry.dodajMetadane(metadane);
                                session.sleepQuick();
                            }
                        }
                    }
                }

                ezdRpPisma.pobierzPisma({ idPismo: pismo.id });
                ezdRpPisma.pobierzDokumenty({ idPrzestrzen: pismo.idDokumentPrzestrzeni });
                session.sleepQuick();
                randomBool(() => {
                    let typProwadzenia = pismo.atrybuty.czyWSkladzieChronologicznym ? ParamsJrwa.typElektroniczna() : ParamsJrwa.typPapierowa();
                    let jrwaSearchParam = {
                      typ: typProwadzenia,
                      userId: session.getTestUserEngineId(),
                      iterationId: session.getTestIterationEngineId(),
                      login: session.getLogin(),
                    };

                    let jrwaForSprawa;
                    let znalezioneJrwa;
                    let proba = 0;
                    while (!znalezioneJrwa && proba < 4) {
                        let jrwaToSearch = ParamsJrwa.getJrwaParams(jrwaSearchParam);
                        let symbolJrwa = jrwaToSearch.jrwa;
                        jrwaForSprawa = ezdRpJrwa.wyszukajWykaz({
                            symbol: symbolJrwa
                        });
                    
                        if (jrwaForSprawa === undefined) {
                            log(`brak JRWA dla ${currentUserLogin}`);
                            break;
                        } else if (jrwaForSprawa.length > 0) {
                            const listaJrwa = [...jrwaForSprawa];
                            const pomieszanaListaJrwa = shuffle(listaJrwa);
                    
                            znalezioneJrwa = pomieszanaListaJrwa.find(element => {
                                return element.symbol.startsWith(symbolJrwa) && (proba < 3 ? element.typProwadzenia == typProwadzenia : true);
                            });
                        }
                    
                        proba++;
                    }
                    
                    if (znalezioneJrwa) {
                        jrwaForSprawa = znalezioneJrwa;
                    } else {
                    }

                    if (!jrwaForSprawa || jrwaForSprawa.id === undefined) {
                        log(`brak id dla JRWA ${symbolJrwa} ${currentUserLogin}`);
                    } else {
                        let roczniki = ezdRpSprawy.pobierzRoczniki({});
                        let nowYear = new Date().getFullYear();
                        if (roczniki.includes(nowYear)) {
                        } else {
                            throw `roczniki not includes ${nowYear}`;
                        }
                        let pobierzNumerSprawyParams = {
                            jrwaId: jrwaForSprawa.id,
                            rok: nowYear,
                            symbol: jrwaForSprawa.symbol,
                        };
                        let numerSprawyRes = ezdRpSprawy.pobierzNumerSprawy(pobierzNumerSprawyParams);
                        if (!numerSprawyRes || !numerSprawyRes.numerSprawy) {
                            log(`no numer sprawy for: ${pobierzNumerSprawyParams.symbol}.${pobierzNumerSprawyParams.rok}`);
                        } else {
                            let znakSprawyParams = {
                                jrwaId: pobierzNumerSprawyParams.jrwaId,
                                rok: pobierzNumerSprawyParams.rok,
                                numer: numerSprawyRes.numerSprawy,
                            };
                            let znakSprawyRes = ezdRpSprawy.pobierzZnakSprawy(znakSprawyParams);
                            if (!znakSprawyRes || !znakSprawyRes.znakSprawy) {
                                log(`no znak sprawy for: ${pobierzNumerSprawyParams.symbol}.${znakSprawyParams.numer}.${znakSprawyParams.rok}`);
                            } else {
                                
                                if (pismo.atrybuty.czyWSkladzieChronologicznym) {
                                    
                                }
                                session.sleepQuick();
                                let utworzSpraweParams = {
                                    tytul: pismo.tytul,
                                    idPismo: pismo.id,
                                    idPrzestrzen: pismo.idPrzestrzenRobocza,
                                    jrwaId: znakSprawyParams.jrwaId,
                                    katArch: jrwaForSprawa.kategorieArchiwalne[0].katArch,
                                    rok: znakSprawyParams.rok,
                                    symbol: pobierzNumerSprawyParams.symbol,
                                    numer: 0
                                };
                                let sprawaRes = ezdRpSprawy.generujSprawe(utworzSpraweParams);
                                if (!sprawaRes || !sprawaRes.idSprawa) {
                                    let message = sprawaRes && sprawaRes.messages ? JSON.stringify(sprawaRes.messages) : '';
                                    log(`no valid sprawa for: ${pobierzNumerSprawyParams.symbol}.${znakSprawyParams.numer}.${znakSprawyParams.rok} ${pismo.tytul} ${currentUserLogin}: ${message} ${pismo.atrybuty.czyUzupelnioneMetadane} ${jrwaSearchParam.typ} ${pismo.atrybuty.czyWSkladzieChronologicznym} ${pismo.id}`);
                                }
                                else {

                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                    

                                }
                            }
                        }
                    }
                    
                }, null, 5, 3);
            }
        }
    }


    session.sleepLong();
}