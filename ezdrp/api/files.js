import http from 'k6/http';
import { Trend, Counter } from 'k6/metrics';
import { EzdRpApi } from './_api-base.js'

const apiMetricWaitingTime = new Trend('ezdrp__uzyskaj_token_dodania_dokumentow');
const apiMetricWaitingTime2 = new Trend('ezdrp__dodaj_nowy_dokument');
const apiMetricWaitingTime3 = new Trend('ezdrp__dokumenty_as_dodaj_nowa_wersje_dokumentu');
const apiMetricWaitingTime4 = new Trend('ezdrp__dokumenty_as_open_file');
const apiMetricWaitingTime5 = new Trend('ezdrp__dokumenty_as_get_file');
const api2MetricWaitingTime = new Trend('ezdrp__file_upload');
const api3MetricWaitingTime = new Trend('ezdrp__filerepo_down');
const api2MetricSendingTime = new Trend('ezdrp_sending_file_upload');


export class _EzdRpApiFiles extends EzdRpApi {

    uzyskajTokenDodaniaDokumentow() {
        let params = this.getParams();
        let reqData = null;
        let res = this.post('/uzyskaj-token-dodania-dokumentow', reqData, params);
        apiMetricWaitingTime.add(res.timings.waiting);
        return res;
    }
    dodajNowyDokument(reqParams) {
        let params = this.getParams();
        let fileUploaded = reqParams.fileUploaded;
        let reqDataRaw = {
            'lista': [{
                'idPlikStorage': fileUploaded.index,
                'tytulDokumentu': `Dokument ${reqParams.prefix} ${fileUploaded.uploadName}`,
                'checksum': fileUploaded.checksum,
                'rozmiar': fileUploaded.size,
            }]
        };
        if (reqParams.idPrzestrzen && reqParams.idPrzestrzen != '') {
            reqDataRaw['idPrzestrzenRobocza'] = reqParams.idPrzestrzen;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dodaj-nowy-dokument', reqData, params);
        apiMetricWaitingTime2.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    akutalizujDokument(reqParams) {
        let params = this.getParams();
        let fileUploaded = reqParams.fileUploaded;
        let reqDataRaw = {
            'idDokument': reqParams.idDokument,
            'idPrzestrzenRobocza': reqParams.idPrzestrzen,
            'dokument': {
                'nazwaDokumentu': `Dokument ${reqParams.prefix} ${fileUploaded.uploadName}`,
                'idZawartosc': fileUploaded.index,
                'rozmiar': fileUploaded.size
            }
        };
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dokumenty-as-dodaj-nowa-wersje-dokumentu', reqData, params);
        apiMetricWaitingTime3.add(res.timings.waiting);
        this.metricsOperacje.add(res.timings.waiting);
        return res;
    }
    fileUpload(fileToUpload, fileToken) {
        let params = this.getParams();
        params.headers['Accept-Encoding'] = 'gzip, deflate, br';
        params.headers['Authorization'] = `Bearer ${this.ezdRpClient.session.getSsoToken()}`;
        params.headers['ftoken'] = fileToken;
        params.headers['Content-Type'] = 'multipart/form-data; boundary=' + fileToUpload.boundary;
        let reqData = fileToUpload.body;
        let res = http.post(`${this.ezdRpClient.ezdRPConfig.getFileUrl()}/Upload/file-upload`, reqData, params);
        this.checkRes(res);
        api2MetricWaitingTime.add(res.timings.waiting);
        api2MetricSendingTime.add(res.timings.sending);
        
        return res;
    }
    fileDownload(idDokument, idPlikStorage) {
        let params = this.getParams();
        params.headers['Accept-Encoding'] = 'gzip, deflate, br';
        params.headers['Authorization'] = `Bearer ${this.ezdRpClient.session.getSsoToken()}`;
        params.responseType = 'none';
        let reqDataRaw = {
            'idDokument': idDokument
        };
        if (idPlikStorage) {
            reqDataRaw['idPlikStorage'] = idPlikStorage;
        }
        let reqData = this.toJson(reqDataRaw);
        let res = this.post('/dokumenty-as-open-file', reqData, params);
        apiMetricWaitingTime4.add(res.timings.waiting);
        return res;
    }
    dokumentDownload(idPlikStorage) {

        let params = this.getParams();
        let reqData = this.toJson({
            'idPlikStorage': idPlikStorage
        });
        let res = this.post('/dokumenty-as-get-file', reqData, params);
        apiMetricWaitingTime5.add(res.timings.waiting);
        return res;
    }
    apiDownloadFile(url) {
        let params = this.getParams();
        params.headers['Accept-Encoding'] = 'gzip, deflate, br';
        params.responseType = 'none';
        let urlObj = new URL(url);
        params.tags = { name: `${urlObj.origin}${urlObj.pathname}` }
        let res = http.get(url, params);
        this.checkRes(res);
        api3MetricWaitingTime.add(res.timings.waiting);
        return res;
    }
}