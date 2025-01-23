import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'
import { log } from '../../utils/log.js'
const apiMetricWaitingTime = new Trend('ezdrp__admin');

export class _EzdRpApiAdmin extends EzdRpApi {

    getSzablonyUprawnien() {
        let params = this.getParams();
        let reqDataRaw = { "pageInfo": { "pageNumber": 0, "pageSize": 50 }, "sort": [] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/uprawnienia/szablony/lista-stronnicowana', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajSzablonUprawnien(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "nazwa": param.nazwa,
            "prawa": param.prawa
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/uprawnienia/szablon/dodaj', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getUprawnieniaStanowiska(param) {
        let params = this.getParams();
        let reqDataRaw = { "idStanowisko": param.idStanowisko, "pageInfo": { "pageNumber": 0, "pageSize": 50 }, "sort": [] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/uzytkownicy/uprawnienia/szablony/lista-stronnicowana', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajUprawnieniaStanowiska(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "idStanowisko": param.idStanowisko,
            "listaIdUprawnieniaSzablon": param.role
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/uprawnienia/szablon/nadaj', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    importJrwa(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "nazwa": param.nazwa,
            "skrot": param.skrot,
            "dataDoDostepnosci": null,
            "dataOdDostepnosci": param.dataOd,
            "file": param.file
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/jrwa/schemat/importuj', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    getJrwaList() {
        let params = this.getParams();
        let reqDataRaw = {};
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/jrwa/zarzadzanie/schematy/lista', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzDashboardAdministracja(param) {
        let params = this.getParams();
        let reqData = null;
        let res = this.post('/ezdrp/administracja/dashboard/dashboard/pobierz', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzKomunikatyAdministracja(param) {
        let params = this.getParams();
        let reqData = null;
        let res = this.post('/ezdrp/administracja/dashboard/komunikaty', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzKalendarzAdministracja(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "dataOd": param.dataOd,
            "dataDo": param.dataDo
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/dashboard/kalendarz', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }

    pobierzOstatnioWybieraneStanowiska(param) {
        let params = this.getParams();
        let reqDataRaw = {};
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/stanowiska/ostatnio-wybierane', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    usunCennik(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/usun-cennik', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    zapiszCennik(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/zapisz-cennik', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzCenniki() {
        let params = this.getParams();
        let reqDataRaw = { "pageInfo": { "pageNumber": 0, "pageSize": 50 }, "sort": [] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-cenniki', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajLokalizacjeSkladu(param) {
        log('Dodanie lokalizacji skladu' + param)
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-lokalizacja-skladu', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzLokalizacjeSkladu() {
        let params = this.getParams();
        let reqDataRaw = { "pageInfo": { "pageNumber": 0, "pageSize": 50 }, "sort": [] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-liste-lokalizacji-skladu', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajKluczAPI(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/api/klucz/dodaj', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzKluczeAPI() {
        let params = this.getParams();
        let reqDataRaw = { "pageInfo": { "pageNumber": 0, "pageSize": 50 }, "sort": [] };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/klucze-api/lista-stronicowana', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    aktywujLokalizacjeSkladu(param) {
        log('Aktywowanie lokalizacji skladu' + param)
        let params = this.getParams();
        let reqDataRaw = {
            "idLokalizacja": param.id
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/aktywuj-lokalizacja-skladu', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajDefinicjeSkladu(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-definicja-skladu', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    modyfikujLokalizacjeSkladu(param) {
        log('Modyfikacja lokalizacji skladu' + param)
        let params = this.getParams();
        let reqDataRaw =
        {
            "idLokalizacja": param.id,
            "nowaNazwa": param.nazwa,
            "nowyAdres": param.adres,
            "listaIdStanowisko": param.ids
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/modyfikuj-lokalizacja-skladu', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzSzablonyDokumentowFoldery(param) {
        let params = this.getParams();
        let reqDataRaw = { "dolaczSzablony": true, "tylkoAktywne": true };
        if (param && param.idKatalogNadrzedny) {
            reqDataRaw.idKatalogNadrzedny = param.idKatalogNadrzedny;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/katalogi-szablonow/pobierz-administracja', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajSzablonDokumentuFolder(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/katalogi-szablonow/dodaj', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajSzablonDokumentu(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/szablony/dodaj', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajDostepDoSzablonowDokumentow(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/administracja/dostepy-szablonow/ustaw', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    zapiszKonfiguracjeEpuap(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/epuap/konfiguracja/zapisz', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierz_pkn(param) {
        let params = this.getParams();
        let reqDataRaw = null;
        let reqData = null;// this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/korespondencja-wychodzaca/pkn/szablony/lista', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodaj_pkn(param) {
        let params = this.getParams();
        let reqDataRaw = param;
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/korespondencja-wychodzaca/pkn/szablon/dodaj', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}