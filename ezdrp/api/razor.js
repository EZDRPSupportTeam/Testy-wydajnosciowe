import http from "k6/http";
import { Trend } from "k6/metrics";
import { EzdRpConfig } from "../ezdrp-config.js";

const session = {
  getConfig: (key, section) => {
    const config = {
      URL_EZDRP: __ENV.URL_EZDRP || "https://ezdrp-web.5k.cs.pib.nask.pl",
    };
    return config[key];
  },
  setConfig: (key, value, section) => {
  },
};
const config = new EzdRpConfig();
config.load(session);
const baseUrl = config.getEzdRpUrl();
const pdfBianry = open("./../../new_file.pdf", "b");

const generatePDFTime = new Trend("razor_generatePDF");
const generateConfigPDFTime = new Trend("razor_generateConfigPDF");
const fillDocumentTagsTime = new Trend("razor_fillDocumentTags");
const generateEnvelopeTime = new Trend("razor_generateEnvelope");
const generateLabelTime = new Trend("razor_generateLabelTime");
const generateFromHtmlTime = new Trend("razor_generateFromHtmlTime");
const mergePdfDocumentsTime = new Trend("razor_mergePdfDocumentsTime");
const generateBarcodeTime = new Trend("razor_generateBarcodeTime");
const generateDocWithBookmarksTime = new Trend(
  "razor_generateDocWithBookmarksTime",
);
const generatePdfFromJasonModelTime = new Trend(
  "razor_generatePdfFromJasonModelTime",
);
const getNumberOfPdfPagesTime = new Trend("razor_getNumberOfPdfPagesTime");

export class RazorTests {
  static generatePDF() {
    let generateUrl = `${baseUrl}/GeneratePdf`;
    let pdfData = JSON.stringify("bmV3IGdlbmVyYXRlZCBwZGY=");
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let generatePdfRes = http.post(generateUrl, pdfData, params);
    generatePDFTime.add(generatePdfRes.timings.waiting);
    return generatePdfRes;
  }

  static generateConfigPDF() {
    let generateConfigUrl = `${baseUrl}/GenerateConfiguredPdf`;
    let configPdfData = {
      base64WordDocument: "bmV3IGdlbmVyYXRlZCBwZGY=",
      signatureFields: [
        {
          width: "1.5",
          height: "1.5",
          page: "1",
          bookmark: "new bookmark",
          x: "2.5",
          y: "2.5",
        },
        {
          width: "2.5",
          height: "2.5",
          page: "2",
          bookmark: "new bookmark1",
          x: "2.5",
          y: "2.5",
        },
      ],
    };
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let generateConfigPdfRes = http.post(
      generateConfigUrl,
      JSON.stringify(configPdfData),
      params,
    );
    generateConfigPDFTime.add(generateConfigPdfRes.timings.waiting);
    return generateConfigPdfRes;
  }

  static fillDocumentTags() {
    let documentTagsUrl = `${baseUrl}/FillDocumentTags`;
    let documentTagsData = {
      documentBytes: "bmV3IGdlbmVyYXRlZCBwZGY=",
      documentTagsValues: {
        Duis_6: "tag1",
        animc: "tag2",
      },
      lockDocument: false,
      optionalTags: ["tag3", "tag4"],
    };
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let fillDocumentTagsRes = http.post(
      documentTagsUrl,
      JSON.stringify(documentTagsData),
      params,
    );
    fillDocumentTagsTime.add(fillDocumentTagsRes.timings.waiting);
    return fillDocumentTagsRes;
  }

  static generateEnvelope() {
    let generateEnvelopeUrl = `${baseUrl}/GenerateEnvelope`;
    let generateEnvelopeData = {
      template: "bmV3IGdlbmVyYXRlZCBwZGY=",
      szerokosc: 35,
      barcodeHeight: 2,
      barcodeWidth: 5,
      wysokosc: 20,
      isLandscape: true,
      koperty: [
        {
          pola: [
            {
              nazwa: "imię",
              tekst: "Jan Kowalski",
            },
          ],
        },
      ],
    };
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let generateEnvelopeRes = http.post(
      generateEnvelopeUrl,
      JSON.stringify(generateEnvelopeData),
      params,
    );
    generateEnvelopeTime.add(generateEnvelopeRes.timings.waiting);
    return generateEnvelopeRes;
  }

  static generateLabel() {
    let generateLabelUrl = `${baseUrl}/GenerateLabel`;
    let generateLabelData = {
      isLandscape: true,
      template: "bmV3IGdlbmVyYXRlZCBwZGY=",
      szerokosc: "350",
      wysokosc: "200",
      barcodeHeight: "2",
      barcodeWidth: "5",
      listaEtykietaDoWygenerowania: [
        {
          listaPoleDoWygenerowania: [
            {
              nazwa: "imię",
              tekst: "jan kowalski",
            },
            {
              nazwa: "adres",
              tekst: "ul. Kwiatowa",
            },
          ],
          idKodKreskowy: "abc123",
          wartoscKodKreskowy: "12345678987654321",
        },
        {
          listaPoleDoWygenerowania: [
            {
              nazwa: "nadawca",
              tekst: "jan kowalski2",
            },
            {
              nazwa: "znaczek",
              tekst: "jest",
            },
          ],
          idKodKreskowy: "abc 123",
          wartoscKodKreskowy: "98765432123456789",
        },
      ],
    };
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let generateLabelRes = http.post(
      generateLabelUrl,
      JSON.stringify(generateLabelData),
      params,
    );
    generateLabelTime.add(generateLabelRes.timings.waiting);
    return generateLabelRes;
  }

  static generateFromHtml() {
    let generateFromHtmlUrl = `${baseUrl}/GenerateFromHtml`;
    let generateFromHtmlData = "bmV3IGdlbmVyYXRlZCBwZGY=";
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let generateFromHtmlRes = http.post(
      generateFromHtmlUrl,
      JSON.stringify(generateFromHtmlData),
      params,
    );
    generateFromHtmlTime.add(generateFromHtmlRes.timings.waiting);
    return generateFromHtmlRes;
  }

  static mergePdfDocuments() {
    let mergePdfDocumentsUrl = `${baseUrl}/MergePdfDocuments`;
    let mergePdfDocumentsData = {
      pdfDocumentsToMergeBytes: [
        "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L0tpZHNbIDEgMCBSIF0KL0NvdW50IDE+PgplbmRvYmoKCjEyIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyA0IDAgUgovVmlld2VyUHJlZmVyZW5jZXM8PC9EaXNwbGF5RG9jVGl0bGUgdHJ1ZQo+PgovTGFuZyhlbi1HQikKPj4KZW5kb2JqCgoxMyAwIG9iago8PC9UaXRsZTxGRUZGMDA2RTAwNjUwMDc3MDA1RjAwNTcwMDZGMDA3MjAwNjQwMDVGMDA2NDAwNkYwMDYzMDAyMDAwMjgwMDYzMDA2RjAwNzAwMDc5MDAyOTAwMkUwMDY0MDA2RjAwNjMwMDc4PgovQ3JlYXRvcjxGRUZGMDA0QzAwNjkwMDYyMDA3MjAwNjUwMDRGMDA2NjAwNjYwMDY5MDA2MzAwNjUwMDIwMDAzNzAwMkUwMDMzMDAyRTAwMzcwMDJFMDAzMj4KL1Byb2R1Y2VyPEZFRkYwMDRDMDA2OTAwNjIwMDcyMDA2NTAwNEYwMDY2MDA2NjAwNjkwMDYzMDA2NTAwMjAwMDM3MDAyRTAwMzMwMDJFMDAzNzAwMkUwMDMyPgovQ3JlYXRpb25EYXRlKEQ6MjAyNTAzMTIxMDQxMDYrMDEnMDAnKT4+CmVuZG9iagoKeHJlZgowIDE0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwNjk4MiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKMDAwMDAwNzEzNSAwMDAwMCBuIAowMDAwMDAwMjI3IDAwMDAwIG4gCjAwMDAwMDYxMjggMDAwMDAgbiAKMDAwMDAwNjE0OSAwMDAwMCBuIAowMDAwMDA2MzM5IDAwMDAwIG4gCjAwMDAwMDY2ODcgMDAwMDAgbiAKMDAwMDAwNjg5NSAwMDAwMCBuIAowMDAwMDA2OTI3IDAwMDAwIG4gCjAwMDAwMDcyMzQgMDAwMDAgbiAKMDAwMDAwNzM0MCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgMTQvUm9vdCAxMiAwIFIKL0luZm8gMTMgMCBSCi9JRCBbIDxDNzczRERGNjUyNDgwMkQ3OEE0N0IwQjc4Q0UxOUU2RT4KPEM3NzNEREY2NTI0ODAyRDc4QTQ3QjBCNzhDRTE5RTZF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L0tpZHNbIDEgMCBSIF0KL0NvdW50IDE+PgplbmRvYmoKCjEyIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyA0IDAgUgovVmlld2VyUHJlZmVyZW5jZXM8PC9EaXNwbGF5RG9jVGl0bGUgdHJ1ZQo+PgovTGFuZyhlbi1HQikKPj4KZW5kb2JqCgoxMyAwIG9iago8PC9UaXRsZTxGRUZGMDA2RTAwNjUwMDc3MDA1RjAwNTcwMDZGMDA3MjAwNjQwMDVGMDA2NDAwNkYwMDYzMDAyMDAwMjgwMDYzMDA2RjAwNzAwMDc5MDAyOTAwMkUwMDY0MDA2RjAwNjMwMDc4PgovQ3JlYXRvcjxGRUZGMDA0QzAwNjkwMDYyMDA3MjAwNjUwMDRGMDA2NjAwNjYwMDY5MDA2MzAwNjUwMDIwMDAzNzAwMkUwMDMzMDAyRTAwMzcwMDJFMDAzMj4KL1Byb2R1Y2VyPEZFRkYwMDRDMDA2OTAwNjIwMDcyMDA2NTAwNEYwMDY2MDA2NjAwNjkwMDYzMDA2NTAwMjAwMDM3MDAyRTAwMzMwMDJFMDAzNzAwMkUwMDMyPgovQ3JlYXRpb25EYXRlKEQ6MjAyNTAzMTIxMDQxMDYrMDEnMDAnKT4+CmVuZG9iagoKeHJlZgowIDE0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwNjk4MiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKMDAwMDAwNzEzNSAwMDAwMCBuIAowMDAwMDAwMjI3IDAwMDAwIG4gCjAwMDAwMDYxMjggMDAwMDAgbiAKMDAwMDAwNjE0OSAwMDAwMCBuIAowMDAwMDA2MzM5IDAwMDAwIG4gCjAwMDAwMDY2ODcgMDAwMDAgbiAKMDAwMDAwNjg5NSAwMDAwMCBuIAowMDAwMDA2OTI3IDAwMDAwIG4gCjAwMDAwMDcyMzQgMDAwMDAgbiAKMDAwMDAwNzM0MCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgMTQvUm9vdCAxMiAwIFIKL0luZm8gMTMgMCBSCi9JRCBbIDxDNzczRERGNjUyNDgwMkQ3OEE0N0IwQjc4Q0UxOUU2RT4KPEM3NzNEREY2NTI0ODAyRDc4QTQ3QjBCNzhDRTE5RTZFPiBdCi9Eb2NDaGVja3N1bSAvNjk3MjU1MTY1RUYzOERFQUZCMENCQzM5ODA3REEzQTAKPj4Kc3RhcnR4cmVmCjc2OTIKJSVFT0YK",
      ],
    };
    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    let mergePdfDocumentsRes = http.post(
      mergePdfDocumentsUrl,
      JSON.stringify(mergePdfDocumentsData),
      params,
    );
    mergePdfDocumentsTime.add(mergePdfDocumentsRes.timings.waiting);
    return mergePdfDocumentsRes;
  }

  static generateBarcode() {
    let generateBarcodeUrl = `${baseUrl}/GenerateBarcode`;
    let generateBarcodeData = JSON.stringify("123456789");

    let type = 6; //Math.floor(Math.random()*10)
    let width = "500"; //Math.floor(Math.random()*401)+200
    let height = "200"; //Math.floor(Math.random() *100)+100
    let newGenerateBarcodeUrl = `${generateBarcodeUrl}?type=${type}&width=${width}&height=${height}`;

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    let generateBarcodeRes = http.post(
      generateBarcodeUrl,
      generateBarcodeData,
      params,
    );
    generateBarcodeTime.add(generateBarcodeRes.timings.waiting);
    return generateBarcodeRes;
  }

  static generateDocWithBookmarks() {
    let generateDocWithBookmarksUrl = `${baseUrl}/FillBookmarks/Stream`;
    let generateDocWithBookmarksData = {
      documentBytes: "bmV3IGdlbmVyYXRlZCBwZGY=",
      documentBookmarksValues: {
        additionalProp1: "bmV3IGdlbmVyYXRlZCBwZGY=",
      },
    };

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    let generateDocWithBookmarksRes = http.post(
      generateDocWithBookmarksUrl,
      JSON.stringify(generateDocWithBookmarksData),
      params,
    );
    generateDocWithBookmarksTime.add(
      generateDocWithBookmarksRes.timings.waiting,
    );
    return generateDocWithBookmarksRes;
  }

  static generatePdfFromJasonModel() {
    let generatePdfFromJasonModelUrl = `${baseUrl}/compile/view/model/pdf`;
    let generatePdfFromJasonModelData = {
      IsBased: true,
      View: "QHVzaW5nIFN5c3RlbTsKQHVzaW5nIFN5c3RlbS5MaW5xOwo8Yj5Lb21waWxhY2phPC9iPgo8cD5ARGF0ZVRpbWUuTm93LlRvU3RyaW5nKCk8L3A+CjxoMT5ATW9kZWwuTmFtZTwvaDE+",
      Model:
        "ewogICAiTmFtZSI6ICJUZXN0IG5hbWUiLAogICAiTGlzdE9mSW50cyI6IFsxLCAyLCAzLCA0XQp9",
    };

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    let generatePdfFromJasonModelRes = http.post(
      generatePdfFromJasonModelUrl,
      JSON.stringify(generatePdfFromJasonModelData),
      params,
    );
    generatePdfFromJasonModelTime.add(
      generatePdfFromJasonModelRes.timings.waiting,
    );
    return generatePdfFromJasonModelRes;
  }

  static getNumberOfPdfPages() {
    let getNumberOfPdfPagesUrl = `${baseUrl}/GetNumberOfPages`;

    const params = {
      headers: {
        "Content-Type": "application/pdf",
        Accept: "application/pdf",
      },
    };

    let getNumberOfPdfPagesRes = http.post(
      getNumberOfPdfPagesUrl,
      pdfBianry,
      params,
    );
    getNumberOfPdfPagesTime.add(getNumberOfPdfPagesRes.timings.waiting);
    console.log(getNumberOfPdfPagesRes.body);
    return getNumberOfPdfPagesRes;
  }
}
