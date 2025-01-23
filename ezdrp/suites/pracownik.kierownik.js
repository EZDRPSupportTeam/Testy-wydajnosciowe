import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive } from '../../utils/random.js'
import { EzdRpZadaniaConst, EzdRpZadaniaTypConst } from '../tests/zadania.js'
import { log } from '../../utils/log.js'

export function rolaKierownik(data, globalCache, session, ssoSignIn) {

    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let dashboardSuite = suitesFactory.getDashboard();
    let sprawySuites = suitesFactory.getSprawy();
    let pismaSuite = suitesFactory.getPisma();
    let biurkaSuite = suitesFactory.getBiurka();

    dashboardSuite.glownaStrona();
    session.sleepQuick();

    
    
    let ezdRpBiurkaConst = new EzdRpZadaniaConst();
    let ezdRpBiurkaTypConst = new EzdRpZadaniaTypConst();
    
    /**/
    biurkaSuite.przegladZadan(
        'ZADANIA_NOWE',
        ezdRpBiurkaConst.Zadania_Nowe(),
        () => { session.sleepQuick(); },
        () => { session.sleepLong(); },
        ezdRpBiurkaTypConst.ZadaniaTyp_DoAkceptacji()
    );
    biurkaSuite.przegladZadan(
        'ZADANIA_W_REALIZACJI',
        ezdRpBiurkaConst.Zadania_WRealizacji(),
        () => { session.sleepQuick(); },
        () => { session.sleepLong(); },
        ezdRpBiurkaTypConst.ZadaniaTyp_DoAkceptacji()
    );

    
    biurkaSuite.przegladZadan(
        'ZADANIA_NOWE',
        ezdRpBiurkaConst.Zadania_Nowe(),
        () => { session.sleepQuick(); },
        () => { session.sleepLong(); },
        ezdRpBiurkaTypConst.ZadaniaTyp_DoDekretacji()
    );
    biurkaSuite.przegladZadan(
        'ZADANIA_W_REALIZACJI',
        ezdRpBiurkaConst.Zadania_WRealizacji(),
        () => { session.sleepQuick(); },
        () => { session.sleepLong(); },
        ezdRpBiurkaTypConst.ZadaniaTyp_DoDekretacji()
    );
    

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
    /* */
    let biurko = [];
    session.sleepLong();
    dashboardSuite.cyklicznePowiadomienia();

    randomBool(() => {
        biurko = biurkaSuite.pobierzPismaWtoku();
        session.sleepLong();

    }, null, 3);
    randomBool(() => {
        pismaSuite.pobierzRpwByBiurko(biurko, randomIntMax(3));
        session.sleepLong();

    }, null, 3);
    randomBool(() => {
        pismaSuite.pobierzDokumentPismaByBiurko(biurko, randomIntMax(3));
        session.sleepLong();

    }, null, 4);
    /*
        randomBool(() => {
            
            session.sleepQuick();
            dashboardSuite.glownaStrona();
            session.sleepLong();
        }, null, 4, 3);
    */

    
    
    
    

    session.sleepLong();
}