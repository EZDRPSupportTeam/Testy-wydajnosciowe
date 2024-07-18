import { EzdRpProfile } from './profile.js'
import { check } from 'k6';
import { _EzdRpApiFiles } from '../api/files.js'
import { FileLoader } from '../../utils/file-loader.js'
import { log } from '../../utils/log.js'
import { Counter } from 'k6/metrics';
import { EzdRpTest } from './_test-base.js'

const apiMetricCounterFileDown = new Counter('ezdrp_counter_file_down');
const apiMetricCounterFileUp = new Counter('ezdrp_counter_file_up');
const ezdrp_metric_dodanie_dokumentu = new Counter("ezdrp_metrics_dodanie_dokumentu");
const ezdrp_metric_aktualizacja_dokumentu = new Counter("ezdrp_metrics_aktualizacja_dokumentu");
const ezdrp_metric_pobranie_dokumentu = new Counter("ezdrp_metrics_pobranie_dokumentu");

class _EzdRpFiles extends EzdRpTest {
    constructor(ezdrpc) {
        super(ezdrpc, new _EzdRpApiFiles(ezdrpc));
    }

    _uzyskajTokenDodaniaDokumentow() {
        let fileTokenRes = this.checkBody(this.ezdRpApi.uzyskajTokenDodaniaDokumentow());
        if (!fileTokenRes || fileTokenRes.token === undefined || fileTokenRes.token === null || fileTokenRes.token === '') {
            return null;//throw 'no file token';
        }
        let fileToken = fileTokenRes.token;
        return fileToken;
    }
    _zaladujPlikDoWyslania(fileName) {
        let fileLoader = FileLoader;
        let fileLoadParams = { name: fileName };
        let fileToUpload = fileLoader.loadFile(fileLoadParams);
        return fileToUpload;
    }
    _fileUpload(fileToUpload, fileToken) {
        let fileApiRes = this.checkBody(this.ezdRpApi.fileUpload(fileToUpload, fileToken));
        if (!fileApiRes || fileApiRes.length === undefined || fileApiRes.length <= 0) {
            throw 'invalid file repo response';
        }
        let fileRes = fileApiRes[0];
        if (!fileRes || !fileRes.index || fileRes.index === '') {
            throw 'file index not exists';
        }
        fileRes.uploadName = fileToUpload.name;
        return fileRes;
    }
    _dodajNowyDokument(params) {
        let dokumentApiRes = this.checkBody(this.ezdRpApi.dodajNowyDokument(params), null, null, null, ezdrp_metric_dodanie_dokumentu);
        if (!dokumentApiRes || dokumentApiRes.length === undefined || dokumentApiRes.length <= 0) {
            throw 'invalid dodaj nowy dokument response';
        }
        let dokumentRes = dokumentApiRes[0];
        if (!dokumentRes || !dokumentRes.idDokument || dokumentRes.idDokument === '') {
            throw 'nowy dokument id not exists';
        }
        dokumentRes.uploadName = params.fileUploaded.uploadName;
        return dokumentRes;
    }
    _aktualizujDokument(params) {
        this.checkBody(this.ezdRpApi.akutalizujDokument(params), null, null, null, ezdrp_metric_aktualizacja_dokumentu);
        return {};
    }
    _fileDownload(idDokument, idPlikStorage) {
        this.checkBody(this.ezdRpApi.fileDownload(idDokument, idPlikStorage), null, null, null, ezdrp_metric_pobranie_dokumentu);
        return null;
    }
    uploadPlikuOnly(params) {
        let fileToken = this._uzyskajTokenDodaniaDokumentow();
        if (!fileToken) {
            return null;
        }
        let fileToUpload = this._zaladujPlikDoWyslania(params.fileName);
        let fileUploaded = this._fileUpload(fileToUpload, fileToken);
        apiMetricCounterFileUp.add(1);
        return fileUploaded;
    }
    uploadPliku(params) {
        let fileToken = this._uzyskajTokenDodaniaDokumentow();
        if (!fileToken) {
            return null;
        }
        let fileToUpload = this._zaladujPlikDoWyslania(params.fileName);
        let fileUploaded = this._fileUpload(fileToUpload, fileToken);
        params.fileUploaded = fileUploaded;
        let dokument = null;
        if (params.idDokument && params.idDokument != '') {
            dokument = this._aktualizujDokument(params);
        } else {
            dokument = this._dodajNowyDokument(params);
        }
        apiMetricCounterFileUp.add(1);
        return dokument;
    }
    downloadPliku(params) {
        let dokument = this._fileDownload(params.idDokument, params.idPlikStorage);
        apiMetricCounterFileDown.add(1);
        return dokument;
    }
    downloadDokumentu(params) {
        let objApiRes = this.checkBody(this.ezdRpApi.dokumentDownload(params.idPlikStorage), null, null, null, ezdrp_metric_pobranie_dokumentu);
        if (objApiRes && objApiRes.wartosc && objApiRes.wartosc.url && objApiRes.wartosc.url != '') {
            this.downloadFile(objApiRes.wartosc.url);
        } else {
            let isObjNotNull = objApiRes != null;
            let jsonObj = objApiRes ? JSON.stringify(objApiRes) : '-';
            log(`no download url for file ${params.idPlikStorage} ${isObjNotNull} ${jsonObj}`);
        }
        return null;
    }
    downloadFile(url) {
        let apiRes = this.ezdRpApi.apiDownloadFile(url);
        apiMetricCounterFileDown.add(1);
    }
}

export { _EzdRpFiles as EzdRpFiles }