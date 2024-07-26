
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('kuip_waiting');

export class _EzdRpApiKuip extends EzdRpApi {

    getDostepneOperacje(param) {
        let params = this.getParams();
        let reqDataRaw = { "listaOperacji": param };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/dostepne-operacje', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getSlownik(slownikKey) {
        let params = this.getParams();
        let reqDataRaw = null;
        let reqData = null;
        let res = this.post(`/kuip/slownik/${slownikKey}`, reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getUzytkownikPodmiotu(param) {
        let params = this.getParams();
        let reqDataRaw = { "idUzytkownik": param.idUzytkownika, "idPodmiot": param.idPodmiotu };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/pobierz-uzytkownika-podmiotu', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getDaneAutentykujace(param) {
        let params = this.getParams();
        let reqDataRaw = { "idUzytkownik": param.idUzytkownika, "idPodmiot": param.idPodmiotu };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/pobierz-dane-autentykujace', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getWalidacjaStruktury(param) {
        let params = this.getParams();
        let reqDataRaw = {};
        if (param && param.typ && param.typ !== '') {
            reqDataRaw["typStrukturaOrganizacyjna"] = param.typ;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-walidacja-struktury', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzRejestrZmian(param) {
        let params = this.getParams();
        let reqDataRaw = { "idPodmiot": param.idPodmiotu, "pageInfo": { "pageSize": 10, "pageIndex": 0, "pageNumber": 1 }, "filtersConjunction": [], "sort": [] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-rejestr-zmian', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzRoleOrganizacyjne(param) {
        let params = this.getParams();
        let reqDataRaw = { "idPodmiot": param.idPodmiotu, "pageInfo": { "pageNumber": 0, "pageSize": 10 }, "filtersConjunction": [], "sort": [] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/role-organizacyjne', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }

    getUzytkownik() {
        let params = this.getParams();
        let reqData = null;
        let res = this.get('/kuip/get-uzytkownik', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getPodmioty(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "pageInfo":
            {
                "pageNumber": 1,
                "pageSize": 10
            },
            "sort": []
        };
        if (param && param.value !== undefined && param.value !== '') {
            reqDataRaw["filtersConjunction"] = [
                {
                    "propertyColumn": "skrot",
                    "propertyFilterType": "ILIKE",
                    "propertyValue": param.value,
                    "propertyValueType": "string"
                }
            ];
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip-podmioty', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    szukajPodmioty(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "pageInfo":
            {
                "pageNumber": 1,
                "pageSize": 10
            },
            "sort": []
        };
        if (param && param.value !== undefined && param.value !== '') {
            reqDataRaw["filtersConjunction"] = [
                {
                    "propertyColumn": param.column && param.column !== '' ? param.column : "skrot",
                    "propertyFilterType": "ILIKE",
                    "propertyValue": param.value,
                    "propertyValueType": "string"
                }
            ];
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/szukaj-podmioty', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajPodmiot(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "podmiot":
            {
                "nazwa": param.nazwa,
                "skrot": param.symbol,
                "typ": param.typ,
                "adresEPUAP": param.epuap,
                "nazwaRCL": param.rcl
            }
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/dodaj-podmiot', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getPodmiot(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "idPodmiot": param.id,
            "dolaczAdministratorow": true
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-podmiot', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getUzytkownicy(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "idPodmiot": param.idPodmiotu,
            "pageInfo": {
                "pageNumber": 1,
                "pageSize": 100
            },
            "sort": [{
                "propertyColumn": "nazwisko",
                "propertySortType": "asc"
            }
            ]
        };
        if (param && param.login !== undefined && param.login !== '') {
            reqDataRaw["filtersConjunction"] = [{
                "propertyColumn": "login",
                "propertyFilterType": "ILIKE",
                "propertyValue": param.login,
                "propertyValueType": "string"
            }];
        } else {
            reqDataRaw["filtersConjunction"] = [];
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/pobierz-uzytkownikow', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    utworzUzytkownika(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "uzytkownik": {
                "imie": param.imie,
                "nazwisko": param.nazwisko,
                "email": param.login,
                "dataWaznosci": null,
                "idPodmiotWlascicielBiznesowy": param.idPodmiotu
            },
            "login": param.login
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/utworz-uzytkownika', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    ustawHaslo(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "idUzytkownik": param.idUzytkownika,
            "login": param.login,
            "haslo": param.haslo,
            "idPodmiot": param.idPodmiotu
        }
            ;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/zmien-dane-autentykujace-lp', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    ustawAdministratora(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "idPodmiot": param.idPodmiotu
        };
        for (let i = 0; i < param.admins.length; i++) {
            let adm = param.admins[i];
            let adminNodeName = `administrator${adm.isadmin}Uzytkownik`;
            reqDataRaw[adminNodeName] = adm.admin;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/podmiot-aktualizacja-administratorow', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getTypyKomorek() {
        let params = this.getParams();
        let reqDataRaw = {
            "pageInfo": {
                "pageNumber": 1,
                "pageSize": 50
            },
            "filtersConjunction": [],
            "sort": [{
                "propertyColumn": "nazwa",
                "propertySortType": "asc"
            }
            ]
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-typy-komorek-organizacyjnych-widok', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajTypKomorki(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "typKomorkiOrganizacyjnej": {
                "nazwa": param.nazwa,
                "kolor": param.kolor && param.kolor != '' ? param.kolor : "#f47373"
            }
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-typ-komorki-organizacyjnej', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getSlownikStanowisk() {
        let params = this.getParams();
        let reqDataRaw = {
            "pageInfo": {
                "pageNumber": 1,
                "pageSize": 50
            },
            "filtersConjunction": [],
            "sort": [{
                "propertyColumn": "nazwa",
                "propertySortType": "asc"
            }
            ]
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/kuip/pobierz-typy-stanowisk-widok', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajStanowisko(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "typStanowiska": {
                "nazwa": param.nazwa,
                "kolor": param.kolor && param.kolor != '' ? param.kolor : "#f47373"
            }
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-typ-stanowiska', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }

    getStruktura(param) {
        let params = this.getParams();
        let reqDataRaw = {};
        if (param && param.typ && param.typ !== '') {
            reqDataRaw["typStrukturaOrganizacyjna"] = param.typ;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-struktura-organizacyjna', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    inicjalizowanieStruktury() {
        let params = this.getParams();
        let reqDataRaw = {};
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/przygotuj-plan-struktury-organizacyjnej', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodanieKomorkiOrganizacyjnej(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "komorkaOrganizacyjna": {
                "nazwa": param.nazwa,
                "symbol": param.symbol,
                "opis": "",
                "idTypKomorkiOrganizacyjnej": param.typ,
                "idNadrzednaKomorkaOrganizacyjna": param.nadrzedna,
                "kolejnoscWyswietlania": 0
            },
            "typStrukturyOrganizacyjnej": param.typ_struktury
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-komorke-organizacyjna', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodanieStanowiska(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "stanowisko": {
                "idUzytkownik": param.idUzytkownik,
                "idKomorkaOrganizacyjna": param.idKomorka,
                "idTypStanowiska": param.idStanowisko,
                "typStanowiska": param.typStanowisko,
                "nazwa": param.nazwa,
                "kolejnoscWyswietlania": 0,
                "dataWaznosci": ""
            },
            "typStrukturyOrganizacyjnej": param.typ_struktury
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-stanowisko', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    wdrozenieStruktury() {
        let params = this.getParams();
        let reqDataRaw = { "uwagi": "", "dataWdrozenia": "" };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/wdroz-planowana-struktura-organizacyjna', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    zmianaHasla(param) {
        let params = this.getParams();
        let reqDataRaw = { "IdUzytkownika": param.idUzytkownika, "NoweHaslo": param.haslo, "StareHaslo": "asd" };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/zmiana-hasla', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}