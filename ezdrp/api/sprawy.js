import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__dodaj_nowe_zadanie');
const apiMetricWaitingTime2 = new Trend('ezdrp__etykiety_utworz_folder_workspace');
const apiMetricWaitingTime3 = new Trend('ezdrp__zmien_sprawe');
const apiMetricWaitingTime4 = new Trend('ezdrp__generuj_opinie');
const apiMetricWaitingTime5 = new Trend('ezdrp__generuj_notatke_sluzbowa');
const apiMetricWaitingTime6 = new Trend('ezdrp__dodaj_notatke_wlasna');
const apiMetricWaitingTime7 = new Trend('ezdrp__metadane_obiekt_pobierz_konfiguracje');
const apiMetricWaitingTime8 = new Trend('ezdrp__ezdrp_administracja_sprawy_pobierz_roczniki');
const apiMetricWaitingTime9 = new Trend('ezdrp__pobierz_numer_sprawy');
const apiMetricWaitingTime10 = new Trend('ezdrp__pobierz_znak_sprawy');
const apiMetricWaitingTime11 = new Trend('ezdrp__sprawy_generuj');
const apiMetricWaitingTime12 = new Trend('ezdrp__pobierz_sprawe');
const apiMetricWaitingTime13 = new Trend('ezdrp__pobierz_akta');
const apiMetricWaitingTime14 = new Trend('ezdrp__pobierz_notatki_wlasne');
const apiMetricWaitingTime15 = new Trend('ezdrp__pobierz_liste_zdarzen');
const apiMetricWaitingTime16 = new Trend('ezdrp__pobierz_sprawy_notatki');
export class _EzdRpApiSprawy extends EzdRpApi {

    dodajZadanie(param) {
        let params = this.getParams();
        let dokument = {
            'dokumenty': [{
                'idDokument': param.idDokument,
                'dokumentNazwa': param.nazwaDokument,
                'czyTylkoDoOdczytu': param.czyTylkoDoOdczytu !== undefined ? param.czyTylkoDoOdczytu : false
            }],
            'idPrzestrzenRobocza': param.idPrzestrzen
        };
        if (param.idSprawa) {
            dokument.idSprawy = param.idSprawa;
        }
        if (param.tytulSprawa) {
            dokument.tytulSprawy = param.tytulSprawa;
        }
        if (param.znakSprawa) {
            dokument.znakSprawy = param.znakSprawa;
        }
        if (param.numerRPW) {
            dokument.numerRPW = param.numerRPW;
        }
        if (param.idPoprzednie) {
            dokument.idPoprzednie = param.idPoprzednie;
        }
        if (param.idReferencja) {
            dokument.idReferencja = param.idReferencja;
        }
        if (param.idPismo) {
            dokument.idPismo = param.idPismo;
        }

        let reqDataRaw = {
            'listaZadan': [],
            'listaIdTunel': [],
            'listaIdStanowiskoOdbiorca': [param.idStanowiskoOdbiorca],
            'terminRealizacji': param.terminRealizacji,
            'typ': param.typ,
            'opis': param.opis
        };
        reqDataRaw.listaZadan.push(dokument);
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/zadania/zadanie/zlec-do-dodania', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajFolder(reqParams) {
        let params = {
            headers: {
            },
            responseType : 'none'
        };
        let reqDataRaw = {
            'idPrzestrzenRobocza': reqParams.idPrzestrzen,
            'nazwa': reqParams.nazwa
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/etykiety-utworz-folder-workspace', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        return res;
    }
    zmienSprawe(reqParams) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            'id': reqParams.id,
            'tytul': reqParams.tytul,
            'kategoriaArchiwalna': reqParams.kategoriaArchiwalna,
            'terminZalatwienia': reqParams.terminZalatwienia,
            'idStanowiskoProwadzacy': reqParams.idStanowiskoProwadzacy
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/sprawy/sprawa/zmien', reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        return res;
    }
    dodajOpinie(reqParams) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            'idPrzestrzenRobocza': reqParams.idPrzestrzen,
            'numerSprawy': reqParams.nrSprawy,
            'tytul': reqParams.tresc
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/generuj-opinie', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    dodajNotatke(reqParams) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            'idPrzestrzenRobocza': reqParams.idPrzestrzen,
            'numerSprawy': reqParams.nrSprawy,
            'tytul': reqParams.tresc
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/generuj-notatke-sluzbowa', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        return res;
    }
    dodajNotatkeWlasna(reqParams) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
            'idPrzestrzenRobocza': reqParams.idPrzestrzen,
            'tytul': reqParams.nrSprawy,
            'tresc': reqParams.tresc,
            'idSprawa': reqParams.idSprawa,
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-notatke-wlasna', reqData, params);
        apiMetricWaitingTime6.add(res.timings.waiting);
        return res;
    }
    pobierzMetadane(reqParams) {
        let params = this.getParams();
        let reqDataRaw = {
            'idObiekt': reqParams.idObiekt,
            'klucz': reqParams.klucz,
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/metadane-obiekt-pobierz-konfiguracje', reqData, params);
        apiMetricWaitingTime7.add(res.timings.waiting);
        return res;
    }
    pobierzRoczniki(reqParams) {
        let params = this.getParams();
        let reqData = reqParams ? this.toJson({

        }) : null;
        let res = this.post('/ezdrp/administracja/ustawienia/sprawy/roczniki', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }

    pobierzNumerSprawy(reqParams) {
        let params = this.getParams();
        let reqData = reqParams ? this.toJson({
            'IdJRWASchematWykaz': reqParams.jrwaId,
            'rokZalozenia': reqParams.rok,
            'typ': 'Wykaz',
            'symbolJRWA': reqParams.symbol,
        }) : null;
        let res = this.post('/pobierz-numer-sprawy', reqData, params);
        apiMetricWaitingTime9.add(res.timings.waiting);
        return res;
    }

    pobierzZnakSprawy(reqParams) {
        let params = this.getParams();
        let reqData = reqParams ? this.toJson({
            'IdJRWASchematWykaz': reqParams.jrwaId,
            'rokZalozenia': reqParams.rok,
            'numer': reqParams.numer,
            'typ': 'Wykaz',
        }) : null;
        let res = this.post('/pobierz-znak-sprawy', reqData, params);
        apiMetricWaitingTime10.add(res.timings.waiting);
        return res;
    }
    

    generujSprawe(reqParams) {
        let params = this.getParams();
        let reqDataRaw = reqParams ? {
            "tytul": reqParams.tytul,
            "numer": reqParams.numer,
            "rokZalozenia": reqParams.rok,
            "typ": "Wykaz",
            "symbolJRWA": reqParams.symbol,
            "ustawSekwencjePoczatkowa": false
        } : {};
        if (reqParams.idPismo && reqParams.idPismo != '') {
            reqDataRaw.idPismo = reqParams.idPismo;
        }
        if (reqParams.idPrzestrzen && reqParams.idPrzestrzen != '') {
            reqDataRaw.idDokumentPrzestrzeni = reqParams.idPrzestrzen;
        }
        if (reqParams.jrwaId) {
            reqDataRaw.idJRWASchematWykaz = reqParams.jrwaId;
        }
        if (reqParams.katArch) {
            reqDataRaw.kategoriaArchiwalna = reqParams.katArch;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/sprawy/sprawa/generuj', reqData, params);
        apiMetricWaitingTime11.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }

    pobierzSprawe(reqParams) {
        let params = this.getParams();
        let reqData = reqParams ? this.toJson({
            'id': reqParams
        }) : null;
        let res = this.post('/pobierz-sprawe', reqData, params);
        apiMetricWaitingTime12.add(res.timings.waiting);
        return res;
    }

    pobierzAktaSprawy(reqParams) {
        let params = this.getParams();
        let filterValue = [];
        if (reqParams.filterValue && reqParams.filterValue != '') {
            filterValue = [{ "propertyValue": reqParams.filterValue, "propertyFilterType": "", "propertyColumn": reqParams.filterValue }];
        }
        let reqDataRaw = {
            "pageInfo": { "pageNumber": 0, "pageSize": 5, "totalItems": 10 },
            "searchValue": "",
            "sort": [],
            "filtersConjunction": filterValue,
        };
        if (reqParams.idSprawa && reqParams.idSprawa != '') {
            reqDataRaw.idSprawa = reqParams.idSprawa;
        }
        if (reqParams.idPrzestrzen && reqParams.idPrzestrzen != '') {
            reqDataRaw.idPrzestrzenRobocza = reqParams.idPrzestrzen;
        }
        if (reqParams.idZadanie && reqParams.idZadanie != '') {
            reqDataRaw.idZadanie = reqParams.idZadanie;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-akta', reqData, params);
        apiMetricWaitingTime13.add(res.timings.waiting);
        return res;
    }
    pobierzNotatkiWlasne(reqParams) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqData = reqParams ? this.toJson({
            'idPrzestrzenRobocza': reqParams
        }) : null;
        let res = this.post('/pobierz-notatki-wlasne', reqData, params);
        apiMetricWaitingTime14.add(res.timings.waiting);
        return res;
    }
    pobierzHistorieSprawy(reqParams) {
        let params = this.getParams();
        let reqData = reqParams ? this.toJson({
            'idSprawa': reqParams.idSprawa,
            "pageInfo": { "pageSize": 10, "pageNumber": 0 }
        }) : null;
        let res = this.post('/pobierz-liste-zdarzen', reqData, params);
        apiMetricWaitingTime15.add(res.timings.waiting);
        return res;
    }
    pobierzNotatkiSpraw(param) {
        let params = this.getParams();
        params.responseType = 'none';
        let reqDataRaw = {
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/ezdrp/sprawy/notatki/pobierz', reqData, params);
        apiMetricWaitingTime16.add(res.timings.waiting);
        return res;
    }
    pobierzListeSpraw(param) {
        let params = this.getParams();
        let reqDataRaw = {
            "mojeSprawy":true,
            "idJRWASchematWykaz":null,
            "idPodteczka":null,
            "idJednostka":param.idJednostka,
            "rokZalozenia":param.rok,
            "status":null,
            "spisSpraw":true,
            "pageInfo": {
                "pageNumber":0,
                "pageSize":20
            },
            "sort": [
                { "propertyColumn": "dataZakonczenia", "propertySortType":"desc"}
            ]
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-liste-spraw', reqData, params);
        apiMetricWaitingTime8.add(res.timings.waiting);
        return res;
    }
    pobierzNoweAkta(param) {
        let params = this.getParams();
        let reqDataRaw = { "pageInfo":
            {
                "pageNumber":0,
                "pageSize":20
            },
            "searchValue":"",
            "sort":[],
            "filtersConjunction":[],
            "idSprawa":param.idSprawa,
            "idPrzestrzenRobocza": param.idPrzestrzenRobocza,
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/pobierz-nowe-akta', reqData, params);
        apiMetricWaitingTime13.add(res.timings.waiting);
        return res;
    }
}