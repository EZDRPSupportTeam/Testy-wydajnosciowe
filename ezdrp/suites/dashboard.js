import { EzdRpTestSuite } from './_suite-base.js'
import { EzdRpProfile } from '../tests/profile.js'
import { EzdRpDashboard } from '../tests/dashboard.js'
import { EzdRpAdmin } from '../tests/admin.js'
import { EzdRpSprawy } from '../tests/sprawy.js'
import { EzdRpBiurka } from '../tests/biurka.js'
import { Counter } from 'k6/metrics';
const apiMetricCounter = new Counter('ezdrp_counter_glownastrona');

export class EzdRpTestSuiteDashboard extends EzdRpTestSuite {

    glownaStrona() {
        let ezdRpProfile = new EzdRpProfile(this.ezdRpClient);
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        let ezdRpAdmin = new EzdRpAdmin(this.ezdRpClient);
        let ezdRpSprawy = new EzdRpSprawy(this.ezdRpClient);
        let tozsamosc = ezdRpProfile.zaladujTozsamosc();
        this.session._setUserOrganization(tozsamosc);
        ezdRpProfile.pobierzWersjeApi();
        ezdRpProfile.bpmnPobierzStatus();
        ezdRpDashoard.pobierzPraweMenu();
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.PotwierdzeniePrawidlowejOperacji']);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpProfile.pobierzDostepneOperacje();
        ezdRpDashoard.pobierzMenu();
        ezdRpProfile.pobierzStatusPowiadomienia(); //cykliczne
        ezdRpDashoard.pobierzLicznikMenu(); //cykliczne
        ezdRpAdmin.pobierzDashboardAdministracja();
        ezdRpSprawy.pobierzNotatkiSpraw();
        ezdRpAdmin.pobierzKomunikatyAdministracja();
        ezdRpDashoard.statystykaZadan();
        ezdRpDashoard.pobierzPrzydatneLinki();
        ezdRpDashoard.pobierzStatystykeSpraw();
        ezdRpProfile.pobierzDoPowiadomienAkcjeWTle();        
        ezdRpDashoard.pobierzZastepstwaDashboard(null);//{ pageNumber: 0, pageSize: 4 });        
        let now = new Date();
        ezdRpAdmin.pobierzKalendarzAdministracja({ dataOd: `${now.toISOString()}`, dataDo: `${now.toISOString()}` });
        apiMetricCounter.add(1);
    }

    sharedSprawy(idSprawy) {
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        let ezdRpProfile = new EzdRpProfile(this.ezdRpClient);
        ezdRpDashoard.pobierzPraweMenu('SPRAWA', idSprawy, 'NAGLOWEK');
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpProfile.pobierzUstawienia(['EZDRP.Sprawy.MaksymalnaLiczbaNotatekWlasnych']);
        ezdRpProfile.pobierzUstawienia(['EZDRP.Sprawy.LiczbaDniSprawPilnych']);
        ezdRpProfile.pobierzUstawienia(['EZDRP.System.RozmiarStrony']);
        ezdRpDashoard.pobierzPraweMenu('SPRAWA', idSprawy, 'AKTA');
    }

    cyklicznePowiadomienia() {
        let ezdRpProfile = new EzdRpProfile(this.ezdRpClient);
        return ezdRpProfile.pobierzStatusPowiadomienia();
    }

    cykliczneLicznikiMenu() {
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        return ezdRpDashoard.pobierzLicznikMenu();
    }
    pobierzLicznikByTyp(liczniki, typ) {
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        return ezdRpDashoard.pobierzLicznikByTyp(liczniki, typ);
    }
    wersja() {
        let ezdRpDashoard = new EzdRpDashboard(this.ezdRpClient);
        return ezdRpDashoard.wersja();
    }
}