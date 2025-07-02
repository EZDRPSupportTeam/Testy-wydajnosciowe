import { Session } from '../../session.js'
import { EzdRpTestSuiteFactory } from './_suite-factory.js'
import { SsoSignIn } from '../../sso-is/signin.js'
import { randomBool, randomStringNumberCase } from '../../utils/random.js'
import { ParamsFiles } from '../../params/files.js'
import { log } from '../../utils/log.js';


export function filerepotests(data, globalCache) {
    let session = new Session(data, globalCache);
    session.setTestUserEngineId(__VU);
    session.setTestIterationEngineId(__ITER);
        
    let suitesFactory = new EzdRpTestSuiteFactory(session);
    let ezdRpFiles = suitesFactory.getFilesTests();

    let fileParamsInput = { userId: session.getTestUserEngineId(), iterationId: session.getTestIterationEngineId() };
    let fileParamsRes = ParamsFiles.getFileParams(fileParamsInput);
    if (!fileParamsRes) {
        throw `file was not drawn ${fileParamsInput.userId} ${fileParamsInput.iterationId}`;
    }
    let fileNameToUpload = fileParamsRes;
    let fileUploadToken = ezdRpFiles.directFileUploadToken(fileNameToUpload);
    let fileToUpload = ezdRpFiles._zaladujPlikDoWyslania(fileNameToUpload);
    let fileUploadRes = ezdRpFiles.directFileUpload(fileToUpload,fileUploadToken);

    let fileId = fileUploadRes[0].index;
    fileUploadToken = ezdRpFiles.directFileUploadToken(fileNameToUpload);
    ezdRpFiles.directFileChangeTitle(fileId,`${randomStringNumberCase(10)}%20${randomStringNumberCase(10)}`, fileUploadToken);

    let fileDownloadToken = ezdRpFiles.directFileGetDownloadToken(fileId);
    ezdRpFiles.directDownloadFile(fileDownloadToken.body);



}