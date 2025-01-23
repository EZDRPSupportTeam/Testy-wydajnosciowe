import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive } from '../../utils/random.js'
import { EzdRpZadaniaConst } from '../tests/zadania.js'
import { log } from '../../utils/log.js'


export function rolaSekretariat(data, globalCache, session, ssoSignIn) {

    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let dashboardSuite = suitesFactory.getDashboard();
    let sprawySuites = suitesFactory.getSprawy();
    let pismaSuite = suitesFactory.getPisma();
    let biurkaSuite = suitesFactory.getBiurka();

    dashboardSuite.glownaStrona();
    session.sleepQuick();

    
    
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

    let biurko = [];
    
    
    biurko = biurkaSuite.pobierzPismaWtoku();
    
    
    

    session.sleepLong();
    dashboardSuite.cyklicznePowiadomienia();

    randomBool(() => {
        randomBool(() => {

            pismaSuite.pobierzRpwByBiurko(biurko, randomIntMax(3));
            session.sleepLong();
        });
    }, () => {
        randomBool(() => {

            pismaSuite.pobierzDokumentPismaByBiurko(biurko, randomIntMax(3));
            session.sleepLong();
        });
    });
    
    randomBool(() => {
        
        session.sleepQuick();
        dashboardSuite.glownaStrona();
        session.sleepLong();
    }, null, 3, 3);


    
    randomBool(() => {
        
    }, null, 3);

    session.sleepLong();
}