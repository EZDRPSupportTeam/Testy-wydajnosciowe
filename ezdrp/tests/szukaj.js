import { _EzdRpApiSzukaj } from '../api/szukaj.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { Counter } from 'k6/metrics';
import { EzdRpTest } from './_test-base.js'

const apiMetricCounterSzukajSprawa = new Counter('ezdrp_counter_sprawa_szukaj');

class _EzdRpSzukaj extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiSzukaj(ezdrpc));
    }

    szukajByZnakSprawy(znakSprawy) {
        return this.checkBody(this.ezdRpApi.szukajByZnakSprawy({ 'znak': znakSprawy }), apiMetricCounterSzukajSprawa);
    }
}

export { _EzdRpSzukaj as EzdRpSzukaj }