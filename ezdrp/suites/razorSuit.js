import { sleep } from "k6";
import { RazorTests } from "../api/razor.js";
import { summaryExport } from "../../_setup.js";
import { Cache } from "../../utils/cache.js";

const vus = parseInt(__ENV.VUS, 10) || 1;
const duration = __ENV.DURATION || "300s";

export let options = {
  maxRedirects: 10,
  summaryTrendStats: [
    "avg",
    "min",
    "med",
    "max",
    "p(90)",
    "p(95)",
    "p(99)",
    "p(99.99)",
    "count",
  ],
  summaryTimeUnit: "ms",
  vus,
  duration,
};

export function razorTestSuit() {
  RazorTests.generatePDF();
  sleep(1);

  RazorTests.generateConfigPDF();
  sleep(1);

  RazorTests.fillDocumentTags();
  sleep(1);

  RazorTests.generateEnvelope();
  sleep(1);

  RazorTests.generateLabel();
  sleep(1);

  RazorTests.generateFromHtml();
  sleep(1);

  RazorTests.mergePdfDocuments();
  sleep(1);

  RazorTests.generateBarcode();
  sleep(1);

  RazorTests.generateDocWithBookmarks();
  sleep(1);

  RazorTests.generatePdfFromJasonModel();
  sleep(1);

  RazorTests.getNumberOfPdfPages();
  sleep(1);
}

export default function () {
  razorTestSuit();
}

export function handleSummary(data) {
  return summaryExport(data, new Cache());
}
