import { sleep } from 'k6'
import { RazorTests } from '../api/razor.js';

export function razorTestSuit() {

    RazorTests.generatePDF()
    sleep(1)

    RazorTests.generateConfigPDF()
    sleep(1)

    RazorTests.fillDocumentTags()
    sleep(1)

    RazorTests.generateEnvelope()
    sleep(1)

    RazorTests.generateLabel()
    sleep(1)

    RazorTests.generateFromHtml()
    sleep(1)

    RazorTests.mergePdfDocuments()
    sleep(1)

    RazorTests.generateBarcode()
    sleep(1)

    RazorTests.generateDocWithBookmarks()
    sleep(1)

    RazorTests.generatePdfFromJasonModel()
    sleep(1)

    RazorTests.getNumberOfPdfPages()
    sleep(1)

}
