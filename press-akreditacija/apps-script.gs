/**
 * Press akreditacije - otvaranje 2026/27
 * Google Apps Script vezan za tabelu (Proširenja -> Apps Script).
 * Sajt (WPCode snippet "Press akreditacija -> Google Sheets") posle svake prijave
 * šalje JSON na URL ove web aplikacije, a skripta dodaje novi red.
 *
 * Jednom: pokreni funkciju podesi() (zaglavlje, STATUS meni, boje),
 * pa Deploy -> New deployment -> Web app: Execute as "Me", Who has access "Anyone".
 */
var LIST = 'Prijave';
var OBRAZAC = 'press-otvaranje-2627';
var KOLONE = [
  'Vrijeme prijave', 'Medij', 'Vrsta', 'Država', 'Novinar', 'Kontakt',
  'Snimatelj / fotograf', 'Odabrani nastupi', 'Posebne potrebe', 'STATUS',
  'Grad', 'Email redakcije', 'Telefon redakcije', 'Link medija', 'Funkcija novinara',
  'Jezik', 'Broj prijave'
];
var KLJUCEVI = [
  'vrijeme', 'medij', 'vrsta', 'drzava', 'novinar', 'kontakt',
  'snimatelj', 'nastupi', 'potrebe', null,
  'grad', 'medij_email', 'medij_telefon', 'medij_link', 'nov_funkcija',
  'jezik', 'broj'
];
var STATUSI = ['Na čekanju', 'Odobreno', 'Odbijeno', 'Lista čekanja'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.obrazac !== OBRAZAC) return odgovor('preskoceno');
    var sh = list_();
    var red = KLJUCEVI.map(function (k) { return k ? cisto_(d[k]) : ''; });
    sh.appendRow(red);
    return odgovor('ok');
  } catch (err) {
    return odgovor('greska: ' + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return odgovor('Press akreditacije: radi.'); }

/** Jednom ručno: zaglavlje, širine, zamrznut red, STATUS padajući meni i boje. */
function podesi() {
  var sh = list_();
  sh.getRange(1, 1, 1, KOLONE.length).setValues([KOLONE])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#0A1120').setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);
  sh.setRowHeight(1, 34);
  var sirine = [140, 180, 110, 120, 170, 230, 230, 230, 230, 130, 110, 200, 140, 200, 140, 60, 90];
  sirine.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  var st = KOLONE.indexOf('STATUS') + 1;
  sh.getRange(1, st).setBackground('#00B9F2').setFontColor('#0A1120');
  var opseg = sh.getRange(2, st, sh.getMaxRows() - 1, 1);
  opseg.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSI, true).setAllowInvalid(true).build());
  var boje = { 'Odobreno': '#d6f5e3', 'Odbijeno': '#fbdcdc', 'Lista čekanja': '#fff1d6', 'Na čekanju': '#e8eef5' };
  var pravila = Object.keys(boje).map(function (s) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s).setBackground(boje[s]).setRanges([opseg]).build();
  });
  sh.setConditionalFormatRules(pravila);
  sh.getRange(2, 1, sh.getMaxRows() - 1, KOLONE.length).setWrap(true).setVerticalAlignment('top');
}

function list_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(LIST) || ss.insertSheet(LIST);
}

/** Tekst bez formula (zaštita od =, +, -, @ na početku) i ograničene dužine. */
function cisto_(v) {
  var s = (v === undefined || v === null) ? '' : String(v).trim().slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function odgovor(t) {
  return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT);
}
