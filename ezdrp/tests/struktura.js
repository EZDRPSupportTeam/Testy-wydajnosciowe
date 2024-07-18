import { _EzdRpApiStruktura } from '../api/struktura.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { Counter } from 'k6/metrics';
import { EzdRpTest } from './_test-base.js'

const apiMetricCounterStruktura = new Counter('ezdrp_counter_struktura');

class _EzdRpStruktura extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiStruktura(ezdrpc));
    }

    pobierzDrzewo(param) {
        return this.checkBody(this.ezdRpApi.pobierzDrzewo(param), apiMetricCounterStruktura);
    }
    szukaj(param) {
        return this.checkBody(this.ezdRpApi.szukaj(param), apiMetricCounterStruktura);
    }
    getUsersExact(users, filter) {
        let newUsers = [];
        let usersToFilter = users ? users.lista : null;
        if (usersToFilter == null || usersToFilter.length === undefined || usersToFilter.length <= 0) {
            return newUsers;
        }
        for (let i = 0; i < usersToFilter.length; i++) {
            if (usersToFilter[i].nazwisko === filter) {
                newUsers.push(usersToFilter[i]);
            } //else {
        }
        return newUsers;
    }
}

export { _EzdRpStruktura as EzdRpStruktura }