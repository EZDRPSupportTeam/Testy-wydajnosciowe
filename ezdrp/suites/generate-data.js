import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'



import { log } from '../../utils/log.js'
import { ParamsUsers } from '../../params/users.js'

import { rolaPracownikGenerateData } from './pracownik.pracownik.js'
import { rolaKancelariaGenerateData } from './pracownik.kancelaria.js'



export function generateData(data, globalCache) {
    let session = new Session(data, globalCache);
    session.setTestUserEngineId(__VU);
    session.setTestIterationEngineId(__ITER);

    let ssoSignIn = new SsoSignIn(session);
    ssoSignIn.signIn();
    let ssoLogin = session.getLogin();

    let tozsamosc = session.getUserOrganization();
    if (!tozsamosc || !tozsamosc.uzytkownik || !tozsamosc.uzytkownik.id) {
        let suitesFactory = new EzdRpTestSuiteFactory(session);
        let dashboardSuite = suitesFactory.getDashboard();
        
        dashboardSuite.glownaStrona();
    }

    let scenarios = [
        
        
        { "key": "Kancelista", "callback": () => { rolaKancelariaGenerateData(data, globalCache, session, ssoSignIn); } },
        
        { "key": "Pracownik merytoryczny", "callback": () => { rolaPracownikGenerateData(data, globalCache, session, ssoSignIn); } }
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