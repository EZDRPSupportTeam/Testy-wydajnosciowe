import { _EzdRpApiStruktura } from '../api/struktura.js'
import { check } from 'k6';
import { log } from '../../utils/log.js'
import { Counter } from 'k6/metrics';
import { EzdRpTest } from './_test-base.js'
import { randomBool } from '../../utils/random.js'
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
    losujUzytkownika(struktura) {
        let losujZeStruktury = (komorka) => {
            let currentUserLogin = this.session.getLogin();
            const filtrUzytkownicy = komorka.uzytkownicy ? komorka.uzytkownicy.filter(u => !u.imie.toLowerCase().includes('api') && !u.email.toLowerCase().includes(currentUserLogin)) : [];
            const maUzytkownikow = filtrUzytkownicy.length > 0;
            const maKomorki = komorka.komorkiOrganizacyjne && komorka.komorkiOrganizacyjne.length > 0;
    
            if (maUzytkownikow && maKomorki) {
                let isUser = false;
                randomBool(() => {
                    isUser = true;
                }, null, 3, 3);
                if (isUser) {
                    return filtrUzytkownicy[Math.floor(Math.random() * filtrUzytkownicy.length)];
                } else {
                    const nastepnaKomorka = komorka.komorkiOrganizacyjne.length > 1
                        ? komorka.komorkiOrganizacyjne[Math.floor(Math.random() * komorka.komorkiOrganizacyjne.length)]
                        : komorka.komorkiOrganizacyjne[0];
                    return losujZeStruktury(nastepnaKomorka);
                }
            } else if (maUzytkownikow) {
                return filtrUzytkownicy[Math.floor(Math.random() * filtrUzytkownicy.length)];
            } else if (maKomorki) {
                const nastepnaKomorka = komorka.komorkiOrganizacyjne.length > 1
                    ? komorka.komorkiOrganizacyjne[Math.floor(Math.random() * komorka.komorkiOrganizacyjne.length)]
                    : komorka.komorkiOrganizacyjne[0];
                return losujZeStruktury(nastepnaKomorka);
            }
    
            return null;
        }
    
        const root = struktura.komorkiOrganizacyjne[0];
        let uzytkownik = losujZeStruktury(root);
    
        while (!uzytkownik) {
            uzytkownik = losujZeStruktury(root);
        }
    
        return uzytkownik;
    }
}

export { _EzdRpStruktura as EzdRpStruktura }