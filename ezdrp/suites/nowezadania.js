import { EzdRpTestSuite } from './_suite-base.js'
import { EzdRpProfile } from '../tests/profile.js'
import { EzdRpZadania } from '../tests/zadania.js'
import { EzdRpRejestry } from '../tests/rejestry.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { EzdRpSprawy } from '../tests/sprawy.js'
import { EzdRpBiurka } from '../tests/biurka.js'
import { EzdRpNoweZadania } from '../tests/nowezadania.js'
import { randomBool, randomFromArray, randomIntInclusive, randomStringNumberCase, randomIntMax } from '../../utils/random.js'
import { log } from '../../utils/log.js'
import { ParamsUsers } from '../../params/users.js'
import { ParamsFiles } from '../../params/files.js'
import { EzdRpFiles } from '../tests/files.js'

import { Counter } from 'k6/metrics';


export class EzdRpTestSuiteNoweZadania extends EzdRpTestSuite {

    pobierzDoObsluzenia() {
        let ezdRpNoweZadania = new EzdRpNoweZadania(this._ezdRpClient);
        let ezdRpProfile = new EzdRpProfile(this._ezdRpClient);
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpProfile.pobierzUstawienia(['EZDRP.Zadania.LiczbaDniZadanPilnych']);
        ezdRpDashoard.pobierzPraweMenu('ZADANIA_DO_OBSLUZENIA',null,'nowe-zadania.dodaj-obieg');
        return ezdRpNoweZadania.pobierzDoObsluzenia();
    }

    pobierzMonitorowanie() {

    }
    
    szczegolyPrzestrzeni(param) {
        let ezdRpNoweZadania = new EzdRpNoweZadania(this._ezdRpClient);
        let ezdRpProfile = new EzdRpProfile(this._ezdRpClient);
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        let szczegoly = ezdRpNoweZadania.szczegolyPrzestrzeni(param);
        ezdRpDashoard.pobierzPraweMenu('SZCZEGOLY_NOWE_ZADANIA', param.idZadanie, 'NAGLOWEK');
        ezdRpDashoard.pobierzPraweMenu('SZCZEGOLY_NOWE_ZADANIA', param.idZadanie, 'AKTA');
        ezdRpDashoard.pobierzPraweMenu('SZCZEGOLY_NOWE_ZADANIA', param.idZadanie, 'OBIEG');
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.PotwierdzeniePrawidlowejOperacji']);
        let akta = ezdRpNoweZadania.pobierzAkta(param);
        let sekcje = ezdRpNoweZadania.pobierzSekcje({idPrzestrzenRobocza:szczegoly.idPrzestrzenRobocza});
        let obieg = ezdRpNoweZadania.pobierzObieg({idObieg:szczegoly.idObieg});
        return {
            przestrzen: szczegoly,
            akta: akta,
            sekcje: sekcje,
            obieg: obieg
        };
    }

    wylosujPrzestrzenie(lista, ileWylosowac) {
        let przestrzenie = new Array();
        for (let i = 0; i < ileWylosowac; i++) {
            przestrzenie.push(lista.items[randomIntMax(lista.items.length)]);
        }
        return przestrzenie;
    }
    dodajDokument(idPrzestrzen, idZadanie, idDokument) {
        let ezdRpFiles = new EzdRpFiles(this.ezdRpClient);
        let fileParamsInput = { userId: this.session.getTestUserEngineId(), iterationId: this.session.getTestIterationEngineId() };
        let fileParamsRes = ParamsFiles.getFileParams(fileParamsInput);
        if (!fileParamsRes) {
            throw `file was not drawn ${fileParamsInput.userId} ${fileParamsInput.iterationId}`;
        }
        let fileNameToUpload = fileParamsRes;

        let uploadParams = {
            'fileName': fileNameToUpload,
            'prefix': `${randomStringNumberCase(10)}`
        };
        if (idPrzestrzen && idPrzestrzen != '') {

            uploadParams['idPrzestrzen'] = idPrzestrzen;
        }
        if (idDokument && idDokument != '') {

            uploadParams['idDokument'] = idDokument;
        }

        let dokument = ezdRpFiles.uploadPlikuNZ(uploadParams);

        return this.szczegolyPrzestrzeni({idZadanie:idZadanie});
    }
}