import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__rejestruj_przesylke_hurtowa');
const apiMetricWaitingTime2 = new Trend('ezdrp__pobierz_pisma_do_zarejestrowania_w_skladzie');
const apiMetricWaitingTime3 = new Trend('ezdrp__korespondencja_wychodzaca_as_zarejestruj');
const apiMetricWaitingTime4 = new Trend('ezdrp_pobierz_szablony_wydrukow');
const apiMetricWaitingTime5 = new Trend('ezdrp_wybierz_rodzaj_wydruku');;
const apiMetricWaitingTime6 = new Trend('ezdrp_otworz_karton');
const apiMetricWaitingTime8 = new Trend('ezdrp__kancelaria_inne');

export class _EzdRpApiKancelaria extends EzdRpApi {

    rejestrujPrzesylkeHurtowa(param) {
        let params = this.getParams();
        let reqParam = param ?
            {
                "idStanowiskoOdbiorca": param.idStanowiskoOdbiorca,
                "dataWplywu": param.dataWplywu,
                "typ": param.typ,
                "iloscRekordow": param.iloscRekordow,
                "czyFileMonitor": param.czyFileMonitor
            } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/rejestruj-przesylke-hurtowa', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }

    pobierzPismaDoRejestracjiWSkladzie(param) {
        let params = this.getParams();
        let reqParam = param ?
            {
                "searchValue": param.idPismo
            } : null;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/pobierz-pismo-do-zarejestrowania-w-skladzie', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
    rejestrujKorespondencjeWychodzaca(param) {
        let params = this.getParams();
        let reqParam = param;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/korespondencja-wychodzaca-as-zarejestruj-korespondencje', reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    pobierzSzablonyWydrukowKW(param) {
        let params = this.getParams();
        let reqParam = { "czyZpo": param.czyZpo, "czyOsobiscie": false, "czyPriorytet": param.czyPriorytet };
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/korespondencja-wychodzaca/szablon-wydruku/pobierz-pelne', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    wybierzRodzajWydruku(param) {
        let params = this.getParams();
        let reqParam = { "idGrupy": param.idGrupy };
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/wybierz-rodzaj-wydruku', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        return res;
    }
    otworzKarton(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqParam = param;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/ezdrp/sklad-chronologiczny/karton/otworz-nowy', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        return res;
    }
    zestawienieKorespondencjiWychodzacej(param) {
        let params = this.getParams();
        let reqParam = {
            "pageInfo":
            {
                "pageNumber": 0,
                "pageSize": 20
            },
            "sort": [{"propertyColumn" : "numerRKW", "propertySortType" : "asc"}],
            "status": param.status,
            "idOddzial": null, "idKomorkaOrganizacyjna": null, "idRodzajPrzesylki": null,
            "dataRejestracjiZakres": param.dataWplywu
        }; // param;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/korespondencja-zestawienie-lista-korespondencji', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
    wczytanieKW(param) {
        let params = this.getParams();
        let reqParam = { "id": param.rkw, "czyZpo": false }; // param;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/korespondencja-wychodzaca-as-przesylka-do-kancelarii', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
    pobierzCenyPrzesylki(param) {
        let params = this.getParams();
        let reqParam = {
            "idRodzajPrzesylki": param.rodzajPrzesylki,
            "idCennikOperator": param.cennikOperatora,
            "czyPriorytet": param.priorytet,
            "idStrefa": param.strefaOperatora,
            "czyLokalny": false
        }; // param;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/korespondencja-wychodzaca-as-pobierz-ceny-dla-przesylki', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
    wyslijKoperte(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqParam = {
            "idKorespondencji": param.idKorespondencji,
            "dataPrzyjecia": param.dataPrzyjecia,
            "czyPriorytet": param.czyPriorytet,
            "idRodzajPrzesylki": param.idRodzajPrzesylki,
            "status": param.status,
            "idStrefaPrzesylki": param.idStrefaPrzesylki,
            "idOperatorPrzesylki": param.idOperatorPrzesylki,
            "cena": param.cena,
            "idCennikWykaz": param.idCennikWykaz
        }; // param;
        let reqData = reqParam ? this.toJson(reqParam) : null;
        let res = this.post('/korespondencja-wychodzaca-as-przygotuj-przesylke-do-wyslania', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
}