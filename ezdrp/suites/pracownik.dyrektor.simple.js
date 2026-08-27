import { EzdRpTestSuiteFactory } from "./_suite-factory.js";
import { randomByProbability, randomIntMax } from "../../utils/random.js";
import { EzdRpZadaniaConst, EzdRpZadaniaTypConst } from "../tests/zadania.js";

/**
 * Uproszczona funkcja testowa dla roli Dyrektora
 * - Wszystkie pauzy są krótkie (sleepQuick)
 * - Używa randomByProbability z konfigurowalnymi prawdopodobieństwami
 */
export function rolaDyrektorSimple(data, globalCache, session, ssoSignIn) {
  let suitesFactory = new EzdRpTestSuiteFactory(session);
  let dashboardSuite = suitesFactory.getDashboard();
  let sprawySuites = suitesFactory.getSprawy();
  let pismaSuite = suitesFactory.getPisma();
  let biurkaSuite = suitesFactory.getBiurka();

  dashboardSuite.glownaStrona();
  session.sleepQuick();

  let ezdRpBiurkaTypConst = new EzdRpZadaniaTypConst();
  let ezdRpBiurkaConst = new EzdRpZadaniaConst();

  biurkaSuite.przegladZadan(
    "ZADANIA_NOWE",
    ezdRpBiurkaConst.Zadania_Nowe(),
    () => {
      session.sleepQuick();
    },
    () => {
      session.sleepQuick();
    },
    ezdRpBiurkaTypConst.ZadaniaTyp_DoPodpisu(),
  );
  session.sleepQuick();

  biurkaSuite.przegladZadan(
    "ZADANIA_W_REALIZACJI",
    ezdRpBiurkaConst.Zadania_WRealizacji(),
    () => {
      session.sleepQuick();
    },
    () => {
      session.sleepQuick();
    },
    ezdRpBiurkaTypConst.ZadaniaTyp_DoPodpisu(),
  );
  session.sleepQuick();

  biurkaSuite.przegladZadan(
    "ZADANIA_NOWE",
    ezdRpBiurkaConst.Zadania_Nowe(),
    () => {
      session.sleepQuick();
    },
    () => {
      session.sleepQuick();
    },
  );
  session.sleepQuick();

  biurkaSuite.przegladZadan(
    "ZADANIA_W_REALIZACJI",
    ezdRpBiurkaConst.Zadania_WRealizacji(),
    () => {
      session.sleepQuick();
    },
    () => {
      session.sleepQuick();
    },
  );
  session.sleepQuick();

  dashboardSuite.cyklicznePowiadomienia();
  session.sleepQuick();

  randomByProbability(
    () => {
      let biurko = biurkaSuite.pobierzPismaWtoku();
      session.sleepQuick();

      randomByProbability(
        () => {
          pismaSuite.pobierzRpwByBiurko(biurko, randomIntMax(3));
          session.sleepQuick();
        },
        () => {
          pismaSuite.pobierzDokumentPismaByBiurko(biurko, randomIntMax(3));
          session.sleepQuick();
        },
        50, // 50% szans na każdą opcję
      );
    },
    null,
    50,
  ); // 50% szans na wykonanie całej operacji
}
