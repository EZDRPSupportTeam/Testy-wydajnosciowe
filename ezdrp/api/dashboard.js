
import { Trend } from 'k6/metrics';
import { log } from '../../utils/log.js'
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__pobierz_prawe_menu');
const apiMetricWaitingTime2 = new Trend('ezdrp__pobierz_menu');
const apiMetricWaitingTime3 = new Trend('ezdrp__pobierz_licznik_menu');
const apiMetricWaitingTime4 = new Trend('ezdrp__pobierz_elementy_dashboard');
const apiMetricWaitingTime5 = new Trend('ezdrp__statystyka_zadan');
const apiMetricWaitingTime6 = new Trend('ezdrp__pobierz_przydatne_linki');
const apiMetricWaitingTime7 = new Trend('ezdrp__pobierz_statystyke_spraw');
const apiMetricWaitingTime8 = new Trend('ezdrp__pobierz_zastepstwa_dashboard');

export class _EzdRpApiDashboard extends EzdRpApi {

    wersja() {
        let params = this.getParams();
        let reqData = null;
        let res = this.get('/wersja', reqData, params);
        return res;
    }
    pobierzPraweMenu(idWidoku, idObiekt, idSekcja) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqParam = idWidoku ? {
            'idWidok': idWidoku,
            'idObiekt': idObiekt,
            'idSekcja': idSekcja
        } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/pobierz-prawe-menu', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    pobierzMenu() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = null;
        let res = this.get('/ezdrp/administracja/menu/menu/pobierz', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
    pobierzLicznikMenu() {
        let params = this.getParams();
        let reqData = null;
        let res = this.get(this.drid('/pobierz-licznik-menu'), reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        return res;
    }
    pobierzElementyDashboard() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = null;
        let res = this.post('/pobierz-elementy-dashboard', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    statystykaZadan() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqParam = {};
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/statystyka-zadan', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        return res;
    }
    pobierzPrzydatneLinki() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqParam = {
			"pageInfo":
            {
                "pageNumber": 0,
                "pageSize": 20
            },
		};
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/administracja/menu/liczniki/pobierz', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        return res;
    }
    pobierzStatystykeSpraw() {
        let params = this.getParams();
        params.responseType = 'none';
        let reqParam = {};
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/pobierz-statystyke-spraw', reqData, params);
        apiMetricWaitingTime7.add(res.timings.waiting);
        return res;
    }
    pobierzZastepstwaDashboard(pageParams) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqParam = pageParams ? {
            "searchBy": "",
            "filtersConjunction": null,
            "filtry": null,
            "pageInfo": {
                "pageNumber": pageParams.pageNumber,
                "pageSize": pageParams.pageSize
            }
        } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/pobierz-zastepstwa-dashboard', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
}