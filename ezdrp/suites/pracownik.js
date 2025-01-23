import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive } from '../../utils/random.js'
import { EzdRpZadaniaConst } from '../tests/zadania.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { log } from '../../utils/log.js'
import { ParamsUsers } from '../../params/users.js'
import { rolaDyrektor } from './pracownik.dyrektor.js'
import { rolaDyrektorNZ } from './pracownik.dyrektor.nz.js'
import { rolaPracownik } from './pracownik.pracownik.js'
import { rolaPracownikNZ } from './pracownik.pracownik.nz.js'
import { rolaKancelaria } from './pracownik.kancelaria.js'
import { rolaKancelariaNZ } from './pracownik.kancelaria.nz.js'
import { rolaKierownik } from './pracownik.kierownik.js'
import { rolaKierownikNZ } from './pracownik.kierownik.nz.js'
import { rolaSekretariat } from './pracownik.sekretariat.js'

const DISABLED_MODULES = __ENV['MOFF'];

const NZ = __ENV['NOWE_ZADANIA'] ? __ENV['NOWE_ZADANIA'] === "1" || __ENV['NOWE_ZADANIA'] === "true": false;

export function pracownikLogowanie(data, globalCache) {
    let session = new Session(data, globalCache);
    session.setTestUserEngineId(__VU);
    session.setTestIterationEngineId(__ITER);

    randomBool(() => {
        session.sleepQuick();
    });

    let ssoSignIn = new SsoSignIn(session);
    ssoSignIn.signIn();

    let tozsamosc = session.getUserOrganization();
    if (!tozsamosc || !tozsamosc.uzytkownik || !tozsamosc.uzytkownik.id) {
        let suitesFactory = new EzdRpTestSuiteFactory(session);
        let dashboardSuite = suitesFactory.getDashboard();
        
        dashboardSuite.glownaStrona();
    }
    return {
        session: session,
        ssoSignIn: ssoSignIn
    };
}

export function pracownik4(data, globalCache) {
    let logowanie = pracownikLogowanie(data, globalCache);
    let session = logowanie.session;
    let ssoSignIn = logowanie.ssoSignIn;

    let ssoLogin = session.getLogin();
    let scenarios = [
        
        { "key": "Dyrektor", "role":[""], stop: false, "callback": () => { 
                NZ ? rolaDyrektorNZ(data, globalCache, session, ssoSignIn) : rolaDyrektor(data, globalCache, session, ssoSignIn); 
            } 
        },
        { "key": "Kierownik", "role":[""], stop: false, "callback": () => { 
                NZ ? rolaKierownikNZ(data, globalCache, session, ssoSignIn) : rolaKierownik(data, globalCache, session, ssoSignIn); 
            } 
        },
        { "key": "Kancelista", "role":["KANCELARIA_WPLYWAJACE"], stop: true, "callback": () => { 
                NZ ? rolaKancelariaNZ(data, globalCache, session, ssoSignIn) : rolaKancelaria(data, globalCache, session, ssoSignIn); 
            } 
        },

        { "key": "Pracownik merytoryczny", stop: false, "role":["DO_OBSLUZENIA"], "callback": () => {
                NZ ? rolaPracownikNZ(data, globalCache, session, ssoSignIn) : rolaPracownik(data, globalCache, session, ssoSignIn);
            }
        },
    ];
    for (const scenario of scenarios) {
        const scenarioKey = scenario.key;
        
        if (ParamsUsers.isUserParamContainsRole(ssoLogin, scenarioKey) || session.hasRole(scenario.role)) {
            session.setStanowiskoByKey(scenarioKey);
            scenario.callback();
    
            if (scenario.stop) {
                break;
            }
        }
    }
}


export function pracownikSso(data, globalCache) {
    let session = new Session(data, globalCache);
    session.setTestUserEngineId(__VU);
    session.setTestIterationEngineId(__ITER);
    let ssoSignIn = new SsoSignIn(session);
    ssoSignIn.signIn();

}