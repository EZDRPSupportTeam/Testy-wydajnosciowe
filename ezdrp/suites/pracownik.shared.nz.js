import { randomIntMax, randomBool, randomFromArray, randomIntInclusive, randomStringNumberCase, randomNumberAsString } from '../../utils/random.js'
import { log } from '../../utils/log.js'
import { ParamsFiles } from '../../params/files.js'
import { ParamsUsers } from '../../params/users.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { Counter, Trend } from "k6/metrics";








export class ObslugaPrzestrzeni {
    constructor(sessionParam, przestrzenParam) {
        this.session = sessionParam;
        this.przestrzen = przestrzenParam;
        this.suitesFactory = new EzdRpTestSuiteFactory(sessionParam);
        this.przestrzenSzczegoly = null;
        this.przestrzenObj = {};
        this._operacje1 = [
            this.pobierzHistorie,
            this.zmienTytulDokumentu,
        ];
        this._operacje2 = [
            this.pobierzDokument,
            this.podgladDokumentu,
            this.dodajDokument,
            this.aktualizujDokument,
        ];
        this._operacje3 = [
        ];
    }
    przestrzenId() {
        return this.przestrzen.idZadanie;
    }
    przestrzenAkta() {
        return this.przestrzenSzczegoly.akta.items;
    }
    idObieg() {
        return this.przestrzenSzczegoly.przestrzen.idObieg;
    }
    idPrzestrzenRobocza(){
        return this.przestrzenSzczegoly.przestrzen.idPrzestrzenRobocza;
    }
    wykonajOperacje(operationList, sleep) {
        if (this.przestrzenSzczegoly === null) {
            this.otworzPrzestrzen();
        }
        for (const operation of operationList) {
            operation.call(this);
            sleep.call(this.session);
        }
    }
    losujOperacje(minCount, maxCount, operacje, sleep) {
        let operationCount = randomIntInclusive(minCount, maxCount ? maxCount : operacje.length);
        let operationArray = new Array();
        let operationIndexList = [...Array(operacje.length).keys()];
        for (let i = 0; i < operationCount; i++) {
            let operationIndexRandom = randomFromArray(operationIndexList);
            operationArray.push(operacje[operationIndexRandom]);
            operationIndexList.splice(operationIndexRandom, 1);
        }
        this.wykonajOperacje(operationArray, sleep);
    }
    losujOperacje1(minCount, maxCount) {
        this.losujOperacje(minCount, maxCount, this._operacje1, this.session.sleepQuick);
    }
    losujOperacje2(minCount, maxCount) {
        this.losujOperacje(minCount, maxCount, this._operacje2, this.session.sleepLong);
    }
    wykonajOperacje1() {
        this.wykonajOperacje(this._operacje1, this.session.sleepQuick);
    }
    wykonajOperacje2() {
        this.wykonajOperacje(this._operacje2, this.session.sleepQuick);
    }
    wykonajOperacje3() {
        this.wykonajOperacje(this._operacje3, this.session.sleepQuick);
    }

    otworzPrzestrzen() {
        let noweZadaniaSuite = this.suitesFactory.getNoweZadania();
        if(this.przestrzen.status === 1) {
            let noweZadaniaTests = this.suitesFactory.getNoweZadaniaTests();
            noweZadaniaTests.przyjmijZadanie({idZadanie: this.przestrzenId() });
        }
        this.przestrzenSzczegoly = noweZadaniaSuite.szczegolyPrzestrzeni({ idZadanie : this.przestrzenId() });
    }
    pobierzHistorie() {
        let noweZadaniaTests = this.suitesFactory.getNoweZadaniaTests();
        noweZadaniaTests.historiaPrzestrzeni({ idObieg: this.idObieg() });
    }



    zmienTytulDokumentu() {
        const noweZadaniaTests = this.suitesFactory.getNoweZadaniaTests();
        const akta = this.przestrzenAkta();

        if (akta && akta.length > 0) {
            const { id, numerRpw } = akta[0].dokumentPrzestrzeni; // ewentualnie można losować dokument
            const nazwa = `Dokument ${randomStringNumberCase(10)}${numerRpw ? '-rpw' : ''}`;
            const zmienNazwe = numerRpw ? noweZadaniaTests.zmienNazweDokumentuRpw(({ idDokumentPrzestrzeni: id, nazwa })) : noweZadaniaTests.zmienNazweDokumentu({ idDokumentPrzestrzeni: id, nazwa });
        }
    }




    pobierzDokument() {
        const akta = this.przestrzenAkta();

        if (akta && akta.length > 0) {
            const { idPlikStorage } = akta[0].dokumentPrzestrzeni;

            if (idPlikStorage) {
                const fileTests = this.suitesFactory.getFilesTests();
                fileTests.downloadDokumentu({ idPlikStorage });
            }
        }
    }
    podgladDokumentu() {
        const akta = this.przestrzenAkta();

        if (akta && akta.length > 0) {
            const { idDokument } = akta[0].dokumentPrzestrzeni;
            const fileTests = this.suitesFactory.getFilesTests();
            const dokumentFile = fileTests.downloadPliku({ idDokument });
            if (dokumentFile && dokumentFile.wartosc && dokumentFile.wartosc.url) {
                fileTests.downloadFile(dokumentFile.wartosc.url);
            } else {
                log(`open file ${JSON.stringify(dokumentFile)}`);
            }
        }
    }
    przekaz() {
        const strTests = this.suitesFactory.getStrukturaTests();
        const struktura = strTests.pobierzDrzewo();
        const uzytkownik = strTests.losujUzytkownika(struktura);
        const noweZadaniaTests = this.suitesFactory.getNoweZadaniaTests();
        noweZadaniaTests.przekaz({idObieg:this.idObieg(),idObiekt:uzytkownik.idStanowiska,uwagi:`Proszę o  ${randomStringNumberCase(10)}`});
    }
    dodajDokument() {
        const noweZadaniaSuite = this.suitesFactory.getNoweZadania();
        this.przestrzenSzczegoly = noweZadaniaSuite.dodajDokument(this.idPrzestrzenRobocza(), this.przestrzenId());
    }
    aktualizujDokument() {
        const akta = this.przestrzenAkta();

        if (akta && akta.length > 0) {
            const { id, idPlikStorage, numerRpw } = akta[0].dokumentPrzestrzeni;

            if (idPlikStorage && (!numerRpw || numerRpw === '')) {
                this.session.sleepLong();
                const noweZadaniaSuite = this.suitesFactory.getNoweZadania();
                this.przestrzenSzczegoly = noweZadaniaSuite.dodajDokument(this.idPrzestrzenRobocza(), this.przestrzenId(), id);
            }
        } else {
            this.dodajDokument();
        }
    }




}