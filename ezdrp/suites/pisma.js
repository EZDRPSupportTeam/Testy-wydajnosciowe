import { EzdRpTestSuite } from './_suite-base.js'
import { EzdRpFiles } from '../tests/files.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { EzdRpRejestry } from '../tests/rejestry.js'
import { EzdRpPisma } from '../tests/pisma.js'
import { EzdRpNoweZadania } from '../tests/nowezadania.js'
import { ParamsFiles } from '../../params/files.js'
import { randomStringNumberCase, randomBool } from '../../utils/random.js'
import { log } from '../../utils/log.js'

import { Counter } from 'k6/metrics';

const apiMetricCounterPismoNowe = new Counter('ezdrp_counter_pismo_nowe');

export class EzdRpTestSuitePisma extends EzdRpTestSuite {
    
    nowePismoZGlownejStrony() {
        
        let ezdRpFiles = new EzdRpFiles(this.ezdRpClient);
        
        let fileParamsInput = { userId: this.session.getTestUserEngineId(), iterationId: this.session.getTestIterationEngineId() };
        let fileParamsRes = ParamsFiles.getFileParams(fileParamsInput);
        if (!fileParamsRes) {
            throw `file was not drawn ${fileParamsInput.userId} ${fileParamsInput.iterationId}`;
        }
        let fileNameToUpload = fileParamsRes;

        let dokument = ezdRpFiles.uploadPliku({ fileName: fileNameToUpload, prefix: `${randomStringNumberCase(10)}` });
        if (!dokument) { return; }
        let ezdRpPisma = new EzdRpPisma(this.ezdRpClient);
        let isRpw = randomBool(); 
        let pismo = ezdRpPisma.dodajPismoByDokument(dokument, isRpw);
        let ezdRpBiurka = this.suitesFactory.getBiurka();
        ezdRpBiurka.pobierzSprawyWtoku();
        apiMetricCounterPismoNowe.add(1);
    }

    nowePismoZGlownejStronyNZ() {        
        let ezdRpNoweZadania = new EzdRpNoweZadania(this.ezdRpClient);
        let fileParamsInput = { userId: this.session.getTestUserEngineId(), iterationId: this.session.getTestIterationEngineId() };
        let fileParamsRes = ParamsFiles.getFileParams(fileParamsInput);
        if (!fileParamsRes) {
            throw `file was not drawn ${fileParamsInput.userId} ${fileParamsInput.iterationId}`;
        }
        let fileNameToUpload = fileParamsRes;
        let nowyObieg = ezdRpNoweZadania.dodajObieg({ nazwaPliku: `${fileNameToUpload}`, isRpw: randomBool() });

        let ezdRpFiles = new EzdRpFiles(this.ezdRpClient);

        let fileToUpload = ezdRpFiles._zaladujPlikDoWyslania(fileNameToUpload);
        let dokument = ezdRpFiles._fileUpload(fileToUpload, nowyObieg.tokenPrzesylaniaPlikow);
        if (!dokument) { return; }
        let ezdRpNoweZadaniaSuite = this.suitesFactory.getNoweZadania();
        ezdRpNoweZadaniaSuite.pobierzDoObsluzenia();
    }

    pobierzRpwByBiurko(biurko, skip) {
        let ezdRpPisma = new EzdRpPisma(this.ezdRpClient);
        let pismoRpw = ezdRpPisma.szukajPismoZRpwByBiurko(biurko, skip);
        if (pismoRpw && pismoRpw.id && pismoRpw.id != '') {
            let ezdRpRejestry = new EzdRpRejestry(this.ezdRpClient);
            ezdRpRejestry.szczegolyRpwByPismo(pismoRpw.id);
        } else {
            
        }
        
        
        
    }

    pobierzDokumentPismaByBiurko(biurko, skip) {
        let ezdRpPisma = new EzdRpPisma(this.ezdRpClient);
        let pismoZalacznik = ezdRpPisma.szukajPismoZZalacznikiemByBiurko(biurko, skip);
        let dokumentToDownload = null;
        if (pismoZalacznik) {
            
            let ezdRpRejestry = new EzdRpRejestry(this.ezdRpClient);
            let pismoRpw = ezdRpRejestry.szczegolyRpwByPismo(pismoZalacznik.id);
            if (pismoRpw && pismoRpw.listaDokumentowPisma.length > 0) {
                let pismoDokument = pismoRpw.listaDokumentowPisma[0];
                if (pismoDokument) {
                    
                    dokumentToDownload = pismoDokument;
                }
            }
        }
        if (dokumentToDownload) {
            let ezdRpFiles = new EzdRpFiles(this.ezdRpClient);
            ezdRpFiles.downloadPliku(dokumentToDownload);
        }
    }
    pobierzDokument(dokument) {
        let ezdRpFiles = new EzdRpFiles(this.ezdRpClient);
        if (dokument && dokument.idPlikStorage && dokument.idPlikStorage != '') {
            ezdRpFiles.downloadDokumentu({ idPlikStorage: dokument.idPlikStorage });
        }
    }
}