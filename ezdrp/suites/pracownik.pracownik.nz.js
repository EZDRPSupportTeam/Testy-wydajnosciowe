import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive, randomStringNumberCase } from '../../utils/random.js'
import { EzdRpZadaniaConst } from '../tests/zadania.js'
import { log } from '../../utils/log.js'
import { uzupelnienieMetadanych, ObslugaSprawy } from './pracownik.shared.js'
import { ObslugaPrzestrzeni } from './pracownik.shared.nz.js'
import { ParamsJrwa } from '../../params/jrwa.js'

export function rolaPracownikNZGenerateData(data, globalCache, session, ssoSignIn) {

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

export function rolaPracownikNZ(data, globalCache, session, ssoSignIn) {

    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let dashboardSuite = suitesFactory.getDashboard();
    let sprawySuites = suitesFactory.getSprawy();
    let pismaSuite = suitesFactory.getPisma();
    let biurkaSuite = suitesFactory.getBiurka();
    let noweZadaniaSuite = suitesFactory.getNoweZadania();

    let ezdRpKancelaria = suitesFactory.getKancelariaTests();
    let ezdRpRejestry = suitesFactory.getRejestryTests();
    let ezdRpPisma = suitesFactory.getPismaTests();
    let ezdRpFiles = suitesFactory.getFilesTests();
    let ezdRpJrwa = suitesFactory.getJrwaTests();
    let ezdRpSprawy = suitesFactory.getSprawyTests();

    let currentUserLogin = session.getLogin();
    dashboardSuite.glownaStrona();
    session.sleepQuick();
    randomBool(() => {
        dashboardSuite.cyliczneZapytania();
    });


    let doObsluzenia = noweZadaniaSuite.pobierzDoObsluzenia();
    if (doObsluzenia && doObsluzenia.items && doObsluzenia.items.length > 0) {
        let limitRandom = randomIntInclusive(1, 4);
        let doObsluzeniaRandom = randomIntInclusive(1, doObsluzenia.items.length);
        let przestrzenie = noweZadaniaSuite.wylosujPrzestrzenie(doObsluzenia, Math.min(limitRandom, doObsluzeniaRandom));
        przestrzenie.forEach(przestrzen => {
            let obslugaPrzestrzeni = new ObslugaPrzestrzeni(session, przestrzen);

      
            randomBool(() => {
                session.sleepQuick();
                obslugaPrzestrzeni.losujOperacje1(0, 2);
            }, null, 5, 3);
            randomBool(() => {
                session.sleepLong();
                obslugaPrzestrzeni.losujOperacje2(0, 2);
            }, null, 3, 3);
            randomBool(() => {
                session.sleepQuick();
                obslugaPrzestrzeni.wykonajOperacje3();
            }, null, 5, 3);

            randomBool(() => {
                session.sleepQuick();
                obslugaPrzestrzeni.przekaz();
            }, null, 5, 3);

        });
    }

    let cDate = new Date();
    let nowYear = cDate.getFullYear();
    const idJednostka = session.getUserOrganization().uzytkownik.idJednostka;
    const listaSpraw = ezdRpSprawy.pobierzListeSpraw({rok:nowYear,idJednostka:idJednostka});
    if (listaSpraw && listaSpraw.items && listaSpraw.items.length > 0) {
            let limitRandom = randomIntInclusive(1, 2);
            let sprawyRandom = randomIntInclusive(1, listaSpraw.items.length);
            let sprawy = sprawySuites.wylosujSprawy(listaSpraw, Math.min(limitRandom, sprawyRandom));
            sprawy.forEach(sprawa => {
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

        });
    }

    randomBool(() => {
        session.sleepQuick();
        dashboardSuite.glownaStrona();
        session.sleepLong();

        randomBool(() => {
            pismaSuite.nowePismoZGlownejStronyNZ();
            session.sleepLong();
        }, null, 4);

    }, null, 2);


    randomBool(() => {
        sprawySuites.nowaSprawaZGlownejStrony();
        
        session.sleepLong();
    }, null, 5, 3);

    session.sleepLong();
}