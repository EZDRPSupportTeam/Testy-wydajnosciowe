import { ParamsFiles } from './files.js'
import { ParamsUsers } from './users.js'
import { ParamsJrwa } from './jrwa.js'
import { ParamsJrwaB64 } from './jrwab64.js'
import { ParamsKuip } from './kuip.js'

class _ParamsLoader {
    static init(vuid) {
        ParamsFiles.init(vuid);
        ParamsUsers.init();
        ParamsJrwa.init();
        ParamsKuip.init();
        ParamsJrwaB64.init();
    }
}

export { _ParamsLoader as ParamsLoader }