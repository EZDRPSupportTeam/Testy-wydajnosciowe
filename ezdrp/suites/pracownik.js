import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomIntMax, randomIntInclusive } from '../../utils/random.js'
import { EzdRpZadaniaConst } from '../tests/zadania.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { log } from '../../utils/log.js'
import { ParamsUsers } from '../../params/users.js'
import { rolaDyrektor } from './pracownik.dyrektor.js'
import { rolaPracownik } from './pracownik.pracownik.js'
import { rolaKancelaria } from './pracownik.kancelaria.js'
import { rolaKierownik } from './pracownik.kierownik.js'
import { rolaSekretariat } from './pracownik.sekretariat.js'

const DISABLED_MODULES = __ENV['MOFF'];


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
        { "key": "Dyrektor", "callback": () => { rolaDyrektor(data, globalCache, session, ssoSignIn); } },
        { "key": "Kierownik", "callback": () => { rolaKierownik(data, globalCache, session, ssoSignIn); } },
        { "key": "Kancelista", "callback": () => { rolaKancelaria(data, globalCache, session, ssoSignIn); } },
        
        { "key": "Pracownik merytoryczny", "callback": () => { rolaPracownik(data, globalCache, session, ssoSignIn); } }
    ];

    scenarios.forEach((scenario) => {
        let scenarioKey = scenario.key;
        if (ParamsUsers.isUserParamContainsRole(ssoLogin, scenarioKey)) {
            
            session.setStanowiskoByKey(scenarioKey);
            scenario.callback();
        } else {
            
        }
    });

    
    
    
    

    
}


export function pracownikSso(data, globalCache) {
    let session = new Session(data, globalCache);
    session.setTestUserEngineId(__VU);
    session.setTestIterationEngineId(__ITER);

    
    
    


    let ssoSignIn = new SsoSignIn(session);
    ssoSignIn.signIn();

}