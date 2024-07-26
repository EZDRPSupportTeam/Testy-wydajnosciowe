import { log } from '../../utils/log.js'
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__pobierz_uzytkownika');
const apiMetricWaitingTime2 = new Trend('ezdrp__wersja');
const apiMetricWaitingTime3 = new Trend('ezdrp__pobierz_jednostke_nadrzedna');
const apiMetricWaitingTime4 = new Trend('ezdrp__pobierz_ustawienie');
const apiMetricWaitingTime5 = new Trend('ezdrp__pobierz_dostepne_operacje');
const apiMetricWaitingTime6 = new Trend('ezdrp__pobierz_status_powiadomienia');
const apiMetricWaitingTime7 = new Trend('ezdrp__slownik_as_pobierz_wykazy_slownika');
const apiMetricWaitingTime8 = new Trend('ezdrp__bpmn_pobierz_status');
const apiMetricWaitingTime9 = new Trend('ezdrp__typy_przesylek');
const apiMetricWaitingTime10 = new Trend('ezdrp__rodzaje_przesylek');
const apiMetricWaitingTime11 = new Trend('ezdrp__inne_przesylki');
const apiMetricWaitingTime12 = new Trend('ezdrp__akcje_w_tle__do_powiadomien');

export class _EzdRpApiProfile extends EzdRpApi {

    pobierzUzytkownika(param) {
        let params = this.getParams();
        let reqParam = {};
        if (param && param.idStanowiskoProponowane) {
            reqParam["IdStanowiskoProponowane"] = param.idStanowiskoProponowane;
        }
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/pobierz-uzytkownika', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzWersjeApi() {
        let params = this.getParams();
        params.responseType = 'none';
        let res = this.get('/wersja', null, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
    pobierzJednostkeNadrzedna() {
        let params = this.getParams();
        let res = this.get('/ezdrp/administracja/struktura-organizacyjna/jednostka/nadrzedna', null, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        return res;
    }
    pobierzUstawienia(keys) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = this.toJson({
            "klucze": keys
        });
        let res = this.post(this.drid('/pobierz-ustawienie'), reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    pobierzDostepneOperacje() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = this.toJson({
        });
        let res = this.post('/ezdrp/administracja/menu/operacje/pobierz', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        return res;
    }
    pobierzStatusPowiadomienia() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = this.toJson({});
        let res = this.post(this.drid('/pobierz-status-powiadomienia'), reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        return res;
    }
    pobierzWykazySlownika(klucz) {
        let params = this.getParams();
        let reqData = this.toJson({
            "klucz": klucz
        });
        let res = this.post('/slownik-as-pobierz-wykazy-slownika', reqData, params);
        apiMetricWaitingTime7.add(res.timings.waiting);
        return res;
    }
    pobierzTypyPrzesylek() {
        let params = this.getParams();
        let reqData = this.toJson({

        });
        let res = this.post('/ezdrp/korespondencja-wychodzaca/pobierz-typy-przesylek', reqData, params);
        apiMetricWaitingTime9.add(res.timings.waiting);
        return res;
    }
    pobierzRodzajePrzesylek(param) {
        let params = this.getParams();
        let reqData = this.toJson({
            "idOperator": param.operator
        });
        let res = this.post('/pobierz-rodzaje-przesylek', reqData, params);
        apiMetricWaitingTime10.add(res.timings.waiting);
        return res;
    }
    pobierzStrefyPrzesylek(param) {
        let params = this.getParams();
        let reqData = this.toJson({
            "idOperator": param.operator,
            "idRodzajPrzesylki": param.rodzaj
        });
        let res = this.post('/pobierz-strefy-przesylek', reqData, params);
        apiMetricWaitingTime11.add(res.timings.waiting);
        return res;
    }
    pobierzPriorytetyPrzesylek(param) {
        let params = this.getParams();
        let reqData = this.toJson({
            "idOperator": param.operator,
            "idRodzajPrzesylki": param.rodzaj,
            "idStrefaPrzesylki": param.strefa
        });
        let res = this.post('/pobierz-priorytety-przesylek', reqData, params);
        apiMetricWaitingTime11.add(res.timings.waiting);
        return res;
    }
    bpmnPobierzStatus() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = null;
        let res = this.post('/bpmn/pobierz-status', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
    pobierzDoPowiadomienAkcjeWTle() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = this.toJson({});;
        let res = this.post('/ezdrp/administracja/akcje-w-tle/do-powiadomien/lista-stronnicowana', reqData, params);
        apiMetricWaitingTime12.add(res.timings.waiting);
        return res;
    }
}