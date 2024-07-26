import { _EzdRpApiAdminPodmioty } from '../api/admin.podmioty.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { EzdRpTest } from './_test-base.js'

class _EzdRpAdminPodmioty extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiAdminPodmioty(ezdrpc));
    }
    
    pobierzPodmiotyKUIP_notused(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.pobierzPodmiotyKUIP_notused(param));
        if (param) {
            if (objApiRes && objApiRes.items && objApiRes.items.length > 0) {
                for (let i = 0; i < objApiRes.items.length; i++) {
                    let cp = objApiRes.items[i];
                    if (cp.id === param) {
                        return cp;
                    }
                }
            }
            return null;
        }
        return objApiRes;
    }
    pobierzPodmioty(param) {
        let objApiRes = this.checkBody(this.ezdRpApi.pobierzPodmioty(param));
        if (param) {
            if (objApiRes && objApiRes.items && objApiRes.items.length > 0) {
                for (let i = 0; i < objApiRes.items.length; i++) {
                    let cp = objApiRes.items[i];
                    if (cp.id === param) {
                        return cp;
                    }
                }
            }
            return null;
        }
        return objApiRes;
    }
    inicjalizacjaPodmiotu(param) {
        return this.checkBody(this.ezdRpApi.inicjalizacjaPodmiotu(param));
    }
    inicjalizacjaKreatoraPodmiotu() {
        return this.checkBody(this.ezdRpApi.inicjalizacjaKreatoraPodmiotu());
    }
}

export { _EzdRpAdminPodmioty as EzdRpAdminPodmioty }