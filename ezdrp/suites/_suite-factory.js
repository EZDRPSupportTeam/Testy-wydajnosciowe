import { EzdRpClient } from '../_apiclient.js'
import { EzdRpTestSuiteSprawy } from './sprawy.js'
import { EzdRpTestSuiteDashboard } from './dashboard.js'
import { EzdRpTestSuitePisma } from './pisma.js'
import { EzdRpTestSuiteBiurka } from './biurka.js'
import { EzdRpTestSuiteKuip } from './kuip.js'
import { EzdRpTestSuiteIce } from './ice.js'
import { EzdRpProfile } from '../tests/profile.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { EzdRpStruktura } from '../tests/struktura.js'
import { EzdRpKancelaria } from '../tests/kancelaria.js'
import { EzdRpRejestry } from '../tests/rejestry.js'
import { EzdRpPisma } from '../tests/pisma.js'
import { EzdRpAdmin } from '../tests/admin.js'
import { EzdRpFiles } from '../tests/files.js'
import { EzdRpJrwa } from '../tests/jrwa.js'
import { EzdRpSprawy } from '../tests/sprawy.js'
import { EzdRpZadania } from '../tests/zadania.js'

export class EzdRpTestSuiteFactory {
    constructor(session) {
        this._session = session;
        this._ezdRpClient = new EzdRpClient(session);
    }

    prepareTestSuite(suite) {
        suite.setSession(this._session);
        suite.setEzdRpClient(this._ezdRpClient);
        suite.setSuitesFactory(this);
        return suite;
    }

    getSprawy() {
        return this.prepareTestSuite(new EzdRpTestSuiteSprawy());
    }
    getDashboard() {
        return this.prepareTestSuite(new EzdRpTestSuiteDashboard());
    }
    getPisma() {
        return this.prepareTestSuite(new EzdRpTestSuitePisma());
    }
    getBiurka() {
        return this.prepareTestSuite(new EzdRpTestSuiteBiurka());
    }
    getKuip() {
        return this.prepareTestSuite(new EzdRpTestSuiteKuip());
    }
    getKuipReset() {
        return this.prepareTestSuite(new EzdRpTestSuiteKuip());
    }
    getIce() {
        return this.prepareTestSuite(new EzdRpTestSuiteIce());
    }

    getProfileTests() {
        return new EzdRpProfile(this._ezdRpClient);
    }
    getDashboardTests() {
        return new EzdRpDashboard(this._ezdRpClient);
    }
    getStrukturaTests() {
        return new EzdRpStruktura(this._ezdRpClient);
    }
    getKancelariaTests() {
        return new EzdRpKancelaria(this._ezdRpClient);
    }
    getAdminTests() {
        return new EzdRpAdmin(this._ezdRpClient);
    }
    getPismaTests() {
        return new EzdRpPisma(this._ezdRpClient);
    }
    getRejestryTests() {
        return new EzdRpRejestry(this._ezdRpClient);
    }
    getFilesTests() {
        return new EzdRpFiles(this._ezdRpClient);
    }
    getJrwaTests() {
        return new EzdRpJrwa(this._ezdRpClient);
    }
    getZadania() {
        return new EzdRpZadania(this._ezdRpClient);
    }
    getSprawyTests() {
        return new EzdRpSprawy(this._ezdRpClient);
    }
}