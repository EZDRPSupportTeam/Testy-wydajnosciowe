import { randomIntInclusive } from '../../utils/random.js'
export class EzdRpTestSuite {
    constructor() {
        this._ezdRpClient = {};
        this._session = {};
        this._suitesFactory = {};
    }

    get session() {
        return this._session;
    }
    get ezdRpClient() {
        return this._ezdRpClient;
    }

    get suitesFactory() {
        return this._suitesFactory;
    }

    setSession(session) {
        this._session = session;
    }
    setEzdRpClient(ezdRpClient) {
        this._ezdRpClient = ezdRpClient;
    }
    setSuitesFactory(sf) {
        this._suitesFactory = sf;
    }
    sleep(max) {
        if (!max) {
            max = 2;
        }
        this._session.sleep(randomIntInclusive(0, max));
    }
}