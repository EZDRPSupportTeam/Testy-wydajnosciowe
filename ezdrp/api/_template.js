import http from 'k6/http';
export class _EzdRpApiTemplate {
    constructor(ezdRPApiClient) {
        this._apiHttpClient = ezdRPApiClient.apiHttpClient;
        this._ezdRpClient = ezdRPApiClient;
    }

    operacja(reqParams) {
        let params = {
            headers: {
            },
        };
        let reqData = reqParams ? JSON.stringify({
            
        }) : null;
        let res = this._apiHttpClient.post('/adres', reqData, params);
        return res;
    }
}