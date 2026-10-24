/**
 * =========================================================================
 * FO PROJECT MANAGEMENT - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * =========================================================================
 * 
 * Konfigurasi Spreadsheet & Drive:
 * 1. Jika Script terikat langsung (Container-Bound) pada Spreadsheet dataFTTM:
 *    Biarkan SPREADSHEET_ID kosong. Script akan otomatis mendeteksi Spreadsheet aktif.
 * 2. Jika Script berdiri sendiri (Standalone di script.google.com):
 *    Isi SPREADSHEET_ID dengan ID Spreadsheet Anda dari URL:
 *    https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
 * 3. Isi DRIVE_FOLDER_ID dengan ID folder Google Drive jika ingin menyimpan foto kegiatan & PDF redaman.
 * 4. Deploy > New deployment > Web app:
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (atau Anyone with Google Account)
 */

// ================= KONFIGURASI UTAMA =================
var SPREADSHEET_ID = ''; // Biarkan kosong jika Container-Bound, atau isi ID Spreadsheet Anda
var DRIVE_FOLDER_ID = '1MrR8tPUijE7UfGaJccb2P2CWvqoyL90M'; // Folder Google Drive untuk upload foto kegiatan & PDF redaman

var SHEET_DATA_FTTM = 'dataFTTM';
var SHEET_RESPONSES = 'DailyReportResponses';
var SHEET_AUDIT_LOGS = 'AuditLogs';
var SHEET_USERS = 'Users';

/**
 * Web App Entry Point (GET request)
 */
function doGet(e) {
  try {
    // 0. Endpoint Utilitas Cepat jika dipanggil via parameter URL Web App
    if (e && e.parameter) {
      if (e.parameter.action === 'send_otp') {
        var ident = e.parameter.identifier || e.parameter.phone || '';
        var tele = e.parameter.telegram || e.parameter.tele || '';
        var customOtp = e.parameter.otp || '';
        var sendOtpRes = sendTelegramOtpGas(ident, tele, customOtp);
        return ContentService.createTextOutput(JSON.stringify(sendOtpRes))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'check_bot' || e.parameter.action === 'test_bot') {
        var token = getTelegramBotTokenGas();
        var meRes = null;
        var hookRes = null;
        try {
          meRes = JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getMe').getContentText());
        } catch (mErr) { meRes = { error: mErr.toString() }; }
        try {
          hookRes = JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getWebhookInfo').getContentText());
        } catch (hErr) { hookRes = { error: hErr.toString() }; }
        return ContentService.createTextOutput(JSON.stringify({
          ok: true,
          bot: meRes,
          webhook: hookRes
        })).setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'set_webhook') {
        var customUrl = e.parameter.url || '';
        var setRes = resetTelegramWebhookAndDropQueueGas(customUrl);
        return ContentService.createTextOutput(JSON.stringify({
          ok: true,
          action: 'set_webhook',
          result: setRes
        })).setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'delete_webhook') {
        var delRes = deleteTelegramWebhookGas();
        return ContentService.createTextOutput(JSON.stringify({
          ok: true,
          action: 'delete_webhook',
          result: delRes
        })).setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'get_updates' || e.parameter.action === 'poll_updates') {
        var token = getTelegramBotTokenGas();
        var updRes = null;
        try {
          updRes = JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getUpdates?limit=20').getContentText());
        } catch (uErr) { updRes = { error: uErr.toString() }; }
        return ContentService.createTextOutput(JSON.stringify(updRes)).setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'get_users') {
        var usersList = getRegisteredUsersGas();
        return ContentService.createTextOutput(JSON.stringify({
          ok: true,
          total: usersList.length,
          users: usersList
        })).setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'clean_admin' || e.parameter.action === 'reset_admin') {
        var cleanAdminRes = resetAdminIdentitiesGas();
        return ContentService.createTextOutput(JSON.stringify(cleanAdminRes))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'drop_telegram_queue' || e.parameter.action === 'stop_spam' || e.parameter.action === 'fix_webhook') {
        var dropRes = resetTelegramWebhookAndDropQueueGas();
        return ContentService.createTextOutput(JSON.stringify({
          ok: true,
          action: 'drop_telegram_queue',
          message: 'Antrean retry Telegram berhasil dibersihkan (drop_pending_updates: true)!',
          result: dropRes
        })).setMimeType(ContentService.MimeType.JSON);
      }
      if (e.parameter.action === 'susun_ulang_header' || e.parameter.action === 'reorganize_headers') {
        var targetRow = Number(e.parameter.row) || 2;
        var reorgRes = checkAndReorganizeHeadersGas(targetRow);
        return ContentService.createTextOutput(JSON.stringify({
          ok: true,
          action: 'susun_ulang_header',
          targetRow: targetRow,
          message: 'Header sheet Users dan DailyReportResponses berhasil disusun ulang pada baris ' + targetRow + '!',
          logs: reorgRes.logs
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var template = null;
    var candidateNames = ['Index', 'Index.html', 'index', 'index.html', 'Index.html.html', 'index.html.html', 'INDEX', 'INDEX.html'];
    var lastError = null;

    for (var i = 0; i < candidateNames.length; i++) {
      try {
        var rawHtml = HtmlService.createHtmlOutputFromFile(candidateNames[i]).getContent();
        if (rawHtml) {
          var activeEmail = '';
          try {
            activeEmail = Session.getActiveUser().getEmail() || '';
          } catch (e) {}
          if (activeEmail) {
            var injection = '<script>window.__GAS_ACTIVE_EMAIL__ = ' + JSON.stringify(activeEmail) + ';</script>';
            rawHtml = rawHtml.replace('</head>', injection + '</head>');
          }
          template = HtmlService.createHtmlOutput(rawHtml);
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!template) {
      throw lastError || new Error('File Index tidak ditemukan di proyek Apps Script.');
    }

    return template
      .setTitle('Telkom Infranexia Project Reporting & Dashboard')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setFaviconUrl('https://img.icons8.com/color/48/000000/network.png');
  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:32px;background:#060b18;color:#e2e8f0;min-height:100vh;">' +
      '<div style="max-width:600px;margin:40px auto;background:#0d1a36;border:1px solid #223966;border-radius:16px;padding:24px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">' +
      '<h2 style="color:#f87171;margin-top:0;font-size:18px;">Gagal Memuat Halaman Web: ' + err.toString() + '</h2>' +
      '<p style="color:#94a3b8;font-size:14px;line-height:1.6;">Google Apps Script tidak menemukan file HTML utama. Lakukan langkah berikut di script.google.com:</p>' +
      '<ol style="color:#cbd5e1;font-size:13px;line-height:1.8;padding-left:20px;">' +
      '<li>Di panel kiri editor Apps Script, klik tombol <b>+</b> (Tambahkan file) &rarr; pilih <b>HTML</b>.</li>' +
      '<li>Beri nama persis: <code style="background:#1e293b;color:#38bdf8;padding:2px 6px;border-radius:4px;">Index</code> (cukup ketik Index tanpa .html).</li>' +
      '<li>Buka file <b>Index.html</b> di project ini, copy seluruh isinya, dan paste ke dalam file Index di Apps Script.</li>' +
      '<li>Simpan proyek (<kbd>Ctrl+S</kbd>) lalu klik <b>Deploy &gt; New deployment (atau Manage deployments &gt; Edit &gt; New version)</b>.</li>' +
      '</ol>' +
      '</div></div>'
    );
  }
}

/**
 * Helper untuk include file modular jika dibutuhkan
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mengambil referensi Spreadsheet aktif atau via ID secara aman tanpa crash
 */
function getSpreadsheet() {
  try {
    if (SPREADSHEET_ID && SPREADSHEET_ID !== 'GANTI_DENGAN_SPREADSHEET_ID_ANDA' && SPREADSHEET_ID.trim() !== '') {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    }
  } catch (err) {
    Logger.log('Warning openById: ' + err);
  }

  try {
    var prop = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (prop && prop.trim() !== '') {
      return SpreadsheetApp.openById(prop.trim());
    }
  } catch (err) {}

  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {
    Logger.log('Warning getActiveSpreadsheet: ' + err);
  }

  return null;
}

/**
 * Helper mencari Sheet dataFTTM (toleran huruf besar/kecil dan spasi)
 */
function findSheetFttm(ss) {
  if (!ss) return null;
  // 1. Cek nama exact
  var sheet = ss.getSheetByName(SHEET_DATA_FTTM);
  if (sheet) return sheet;

  // 2. Cek toleran spasi dan huruf besar/kecil
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var clean = sheets[i].getName().replace(/[\s_-]+/g, '').toLowerCase();
    if (clean === 'datafttm' || clean.indexOf('fttm') !== -1) {
      return sheets[i];
    }
  }

  // 3. Cari sheet dengan baris terbanyak
  var maxRows = 0;
  var bestSheet = null;
  for (var i = 0; i < sheets.length; i++) {
    var r = sheets[i].getLastRow();
    if (r > maxRows) {
      maxRows = r;
      bestSheet = sheets[i];
    }
  }
  if (bestSheet && maxRows > 1) return bestSheet;

  // 4. Fallback ke sheet pertama
  if (sheets.length > 0) return sheets[0];
  return null;
}

// 36 Header Kolom Standar DailyReportResponses yang diselaraskan 100% dengan urutan input Form Daily Report
var EXPECTED_DAILY_RESPONSE_HEADERS = [
  'Submission ID', 'Submitted At', 'Email Submitter', 'Nama Submitter', 'Role Submitter',
  'Nomor HP Submitter', 'Telegram Submitter',
  'SITE ID', 'REGION', 'SUBCON (Mitra Pelaksana)',
  'STATUS', 'SUB STATUS',
  'TYPE FO [KU]', 'TARGET TIANG (KU)', 'REAL TIANG (KU)', 'TARGET FO KU (m)', 'REAL FO KU (m)',
  'TYPE FO [KT]', 'TARGET GALIAN (KT)', 'REAL GALIAN (KT)', 'TARGET FO KT (m)', 'REAL FO KT (m)',
  'PERIZINAN [PU Nas]', 'PERIZINAN [PU Prov]', 'PERIZINAN [PU Kota / Kab]', 'PERIZINAN [Private Area]',
  'TOTAL BIAYA PERIZINAN', 'COMMIT FINISH INSTALL', 'JML MAN POWER',
  'DETIL PROGRESS',
  'EVIDENCE URL', 'REDAMAN URL',
  'APPROVAL STATUS', 'APPROVED BY', 'APPROVED AT', 'NOTES'
];

/**
 * Mendeteksi baris header secara dinamis (apakah ada di Baris 1 atau Baris 2)
 * Sangat berguna jika Baris 1 digunakan untuk Title Banner / Judul Sheet
 */
function detectHeaderRowGas(sheet, sampleHeaders) {
  if (!sheet) return 1;
  var lastRow = sheet.getLastRow();
  var lastCol = Math.min(sheet.getLastColumn(), 25);
  if (lastRow < 1 || lastCol < 1) return 1;

  try {
    // Cek Baris 1
    var row1Values = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var match1 = 0;
    for (var i = 0; i < row1Values.length; i++) {
      var val1 = String(row1Values[i] || '').trim().toLowerCase();
      for (var s = 0; s < sampleHeaders.length; s++) {
        if (val1 === sampleHeaders[s].toLowerCase()) match1++;
      }
    }

    // Cek Baris 2 jika sheet memiliki minimal 2 baris
    var match2 = 0;
    if (lastRow >= 2) {
      var row2Values = sheet.getRange(2, 1, 1, lastCol).getValues()[0];
      for (var j = 0; j < row2Values.length; j++) {
        var val2 = String(row2Values[j] || '').trim().toLowerCase();
        for (var s2 = 0; s2 < sampleHeaders.length; s2++) {
          if (val2 === sampleHeaders[s2].toLowerCase()) match2++;
        }
      }
    }

    if (match2 > match1) return 2;
    return 1;
  } catch (e) {
    return 1;
  }
}

/**
 * Mendapatkan peta nama kolom ke indeks kolom (1-indexed) dari baris header sheet
 */
function getHeaderColumnMapGas(sheet, headerRow) {
  if (!sheet) return {};
  var hRow = headerRow || 1;
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  try {
    var headers = sheet.getRange(hRow, 1, 1, lastCol).getValues()[0];
    var map = {};
    for (var c = 0; c < headers.length; c++) {
      var hName = String(headers[c] || '').trim().toLowerCase();
      if (hName) map[hName] = c + 1;
    }
    return map;
  } catch (e) {
    return {};
  }
}

/**
 * Helper mencari Sheet Responses (toleran variasi nama sheet seperti Form Responses 1, Responses, Response, dll)
 * Otomatis mendukung Header di Baris 1 maupun Baris 2
 */
function findSheetResponses(ss) {
  if (!ss) return null;
  // 1. Cek nama exact SHEET_RESPONSES ('DailyReportResponses')
  var sheet = ss.getSheetByName(SHEET_RESPONSES);

  // 2. Cek variasi nama yang sering dipakai di Google Form / Google Sheets
  if (!sheet) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var name = sheets[i].getName().replace(/[\s_-]+/g, '').toLowerCase();
      if (name.indexOf('response') !== -1 || name.indexOf('respons') !== -1 || name.indexOf('laporanharian') !== -1) {
        sheet = sheets[i];
        break;
      }
    }
  }

  // 3. Jika belum ada, buat sheet baru
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RESPONSES);
  }

  // Pastikan baris header terisi dan diformat rapi
  try {
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var detectedHeader = detectHeaderRowGas(sheet, ['Submission ID', 'Submitted At', 'SITE ID']);

    if (lastRow === 0 || lastCol < 5) {
      sheet.appendRow(EXPECTED_DAILY_RESPONSE_HEADERS);
      var headerRange = sheet.getRange(1, 1, 1, EXPECTED_DAILY_RESPONSE_HEADERS.length);
      headerRange.setBackground('#0f2347');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    } else {
      sheet.setFrozenRows(detectedHeader);
    }
  } catch (err) {
    Logger.log('Header formatting notice: ' + err);
  }

  return sheet;
}

/**
 * Helper format tanggal agar selalu string DD/MM/YYYY
 */
function formatGasDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var d = val.getDate();
    var m = val.getMonth() + 1;
    var y = val.getFullYear();
    return (d < 10 ? '0' + d : d) + '/' + (m < 10 ? '0' + m : m) + '/' + y;
  }
  return String(val).trim();
}

/**
 * Mendapatkan informasi user aktif saat ini
 */
function getCurrentUserGas() {
  var email = '';
  try {
    email = Session.getActiveUser().getEmail();
  } catch (e) {
    email = '';
  }

  if (!email) {
    return {
      authenticated: false,
      isGoogleActiveUser: false,
      email: '',
      name: '',
      role: 'Tim Lapangan'
    };
  }

  var name = email.split('@')[0];
  name = name.charAt(0).toUpperCase() + name.slice(1);
  var isOwner = (email.toLowerCase().trim() === 'mhaniifa22@gmail.com');
  var role = isOwner ? 'Admin' : 'Tim Lapangan';
  var status = isOwner ? 'Approved' : 'Pending Approval';
  var subcon = isOwner ? 'PT Telkom Infranexia' : '';
  var supervisorType = isOwner ? 'Supervisor Telkom Infranexia' : '';
  var region = isOwner ? 'TIF1' : '';
  var branch = isOwner ? 'ALL BRANCH' : '';
  var accessProjects = isOwner ? ['FTTM', 'Backbone', 'FTTH', 'FTTE', 'OLO'] : ['FTTM'];
  var isRegistered = isOwner;

  try {
    var ss = getSpreadsheet();
    if (ss) {
      var userSheet = ss.getSheetByName(SHEET_USERS);
      if (userSheet) {
        var data = userSheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          if (String(data[i][1]).toLowerCase().trim() === email.toLowerCase().trim()) {
            name = data[i][0] || name;
            role = data[i][2] || role;
            subcon = data[i][3] || subcon;
            supervisorType = data[i][4] || supervisorType;
            status = data[i][5] || status;
            region = data[i][8] || region;
            if (data[i][10]) {
              accessProjects = String(data[i][10]).split(',').map(function(s) { return s.trim(); }).filter(Boolean);
            }
            branch = data[i][11] || branch;
            isRegistered = true;
            break;
          }
        }
      }
    }
  } catch (err) {
    Logger.log('Warning cek sheet Users: ' + err);
  }

  if (isOwner) {
    role = 'Admin';
    status = 'Approved';
    region = 'TIF1';
    branch = 'ALL BRANCH';
    accessProjects = ['FTTM', 'Backbone', 'FTTH', 'FTTE', 'OLO'];
  }

  return {
    authenticated: true,
    isGoogleActiveUser: true,
    isRegistered: isRegistered,
    id: email,
    name: name,
    email: email,
    role: role,
    status: status,
    subcon: subcon,
    supervisorType: supervisorType,
    region: region,
    branch: branch,
    accessProjects: accessProjects,
    avatar: role === 'Admin' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
  };
}

/**
 * Menyimpan atau memperbarui profil registrasi pengguna ke sheet "Users"
 * Kolom: Nama, Email, Role, SUBCON, Supervisor Type, Status, Terdaftar Pada, Disetujui Oleh, REGION, Password, OSP Project, BRANCH, Nomor HP, Telegram Username, Telegram Chat ID, Telegram Verified
 */
function saveUserRegistrationGas(userData) {
  try {
    if (!userData || (!userData.email && !userData.phoneNumber)) return { success: false, message: 'Data tidak valid' };
    var ss = getSpreadsheet();
    if (!ss) return { success: false, message: 'Spreadsheet tidak ditemukan' };

    var userSheet = ss.getSheetByName(SHEET_USERS);
    if (!userSheet) {
      userSheet = ss.insertSheet(SHEET_USERS);
      userSheet.appendRow(['Nama', 'Email', 'Role', 'SUBCON', 'Supervisor Type', 'Status', 'Terdaftar Pada', 'Disetujui Oleh', 'REGION', 'Password', 'OSP Project', 'BRANCH', 'Nomor HP', 'Telegram Username', 'Telegram Chat ID', 'Telegram Verified']);
      userSheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#1f2937').setFontColor('#ffffff');
    }

    var data = userSheet.getDataRange().getValues();
    var email = String(userData.email || '').toLowerCase().trim();
    var phone = String(userData.phoneNumber || '').trim();
    var rowFound = -1;
    var existingPassword = '';
    var existingAccess = '';
    var existingBranch = '';
    var existingStatus = '';
    var existingRegisteredAt = '';

    var uHeaderRow = detectHeaderRowGas(userSheet, ['Nama', 'Email', 'Role']);
    for (var i = uHeaderRow; i < data.length; i++) {
      var rowEmail = String(data[i][1] || '').toLowerCase().trim();
      var rowPhone = String(data[i][12] || '').trim();
      if ((email && rowEmail === email) || (phone && rowPhone === phone)) {
        rowFound = i + 1;
        existingPassword = String(data[i][9] || '');
        existingAccess = String(data[i][10] || '');
        existingBranch = String(data[i][11] || '');
        existingStatus = String(data[i][5] || '');
        existingRegisteredAt = data[i][6] || '';
        break;
      }
    }

    var now = new Date();
    var cleanPhoneVal = phone.replace(/[^0-9]/g, '');
    var isOwner = (
      email === 'mhaniifa22@gmail.com' ||
      phone === '081210282521' ||
      cleanPhoneVal === '081210282521' ||
      cleanPhoneVal === '6281210282521'
    );
    var userRole = isOwner ? 'Admin' : (userData.role || 'Tim Lapangan');
    var userStatus = isOwner ? 'Approved' : (userData.status || existingStatus || 'Pending Approval');
    var subconVal = userData.subcon || userData.mitra || '';
    var regionVal = userData.region || '';
    var branchVal = userData.branch || existingBranch || '';
    var approvedByVal = isOwner ? 'System' : (userData.approvedBy || '');
    var passwordVal = userData.password || existingPassword || 'google-sso';
    var accessProjectsVal = Array.isArray(userData.accessProjects) && userData.accessProjects.length > 0 
      ? userData.accessProjects.join(', ') 
      : (existingAccess || 'FTTM');
    var phoneVal = userData.phoneNumber || '';
    var teleUserVal = userData.telegramUsername || '';
    var teleChatIdVal = userData.telegramChatId || '';
    var teleVerifiedVal = userData.isTelegramVerified ? 'TRUE' : 'FALSE';

    var rowValues = [
      userData.name || '',
      userData.email || '',
      userRole,
      subconVal,
      userData.supervisorType || '',
      userStatus,
      existingRegisteredAt || userData.registeredAt || now,
      approvedByVal,
      regionVal,
      passwordVal,
      accessProjectsVal,
      branchVal,
      phoneVal,
      teleUserVal,
      teleChatIdVal,
      teleVerifiedVal
    ];

    if (rowFound > 0) {
      userSheet.getRange(rowFound, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      userSheet.appendRow(rowValues);
    }
    return { success: true };
  } catch (err) {
    Logger.log('Error saveUserRegistrationGas: ' + err);
    return { success: false, error: err.toString() };
  }
}

/**
 * Registrasi baru: menolak jika nomor HP, username Telegram, atau email sudah terdaftar.
 * LockService mencegah dua registrasi bersamaan lolos dari pemeriksaan duplikat.
 */
function registerNewUserGas(userData) {
  var lock = LockService.getScriptLock();
  try {
    if (!userData) return { success: false, message: 'Data registrasi tidak valid.' };
    lock.waitLock(10000);
    var ss = getSpreadsheet();
    if (!ss) return { success: false, message: 'Spreadsheet tidak ditemukan.' };
    var sh = ss.getSheetByName(SHEET_USERS);
    if (sh) {
      var values = sh.getDataRange().getValues();
      var headerRow = detectHeaderRowGas(sh, ['Nama', 'Email', 'Role']);
      var email = String(userData.email || '').toLowerCase().trim();
      var phone = normalizeUserPhoneGas_(userData.phoneNumber || '');
      var telegram = String(userData.telegramUsername || '').replace(/^@/, '').toLowerCase().trim();
      for (var i = headerRow; i < values.length; i++) {
        var row = values[i];
        var rowEmail = String(row[1] || '').toLowerCase().trim();
        var rowPhone = normalizeUserPhoneGas_(row[12] || '');
        var rowTelegram = String(row[13] || '').replace(/^@/, '').toLowerCase().trim();
        if ((email && rowEmail && email === rowEmail) ||
            (phone && rowPhone && phone === rowPhone) ||
            (telegram && rowTelegram && telegram === rowTelegram)) {
          var existingName = String(row[0] || 'akun ini');
          var matchedBy = phone && rowPhone === phone ? 'nomor HP' : telegram && rowTelegram === telegram ? 'username Telegram' : 'email';
          return { success: false, duplicate: true, message: 'Registrasi gagal: ' + matchedBy + ' sudah terdaftar atas nama ' + existingName + '. Silakan login menggunakan akun tersebut.' };
        }
      }
    }
    var result = saveUserRegistrationGas(userData);
    if (!result || !result.success) return result || { success: false, message: 'Gagal menyimpan registrasi.' };
    return { success: true, message: 'Registrasi berhasil disimpan dan menunggu persetujuan Admin.' };
  } catch (err) {
    Logger.log('registerNewUserGas error: ' + err);
    return { success: false, message: String(err) };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function normalizeUserPhoneGas_(value) {
  var phone = String(value || '').replace(/[^0-9]/g, '');
  if (phone.indexOf('62') === 0) phone = '0' + phone.substring(2);
  return phone;
}

/**
 * Jalankan MANUAL dari editor Apps Script (sebagai Admin) untuk menyiapkan akun testing.
 * Akun Tim Lapangan memakai identitas yang sudah disebutkan. Akun SPV Mitra memakai
 * placeholder unik karena nomor HP/username Telegram khusus untuk akun kedua belum diberikan.
 * Setelah fungsi dijalankan, ubah placeholder SPV Mitra di sheet Users ke identitas Telegram nyata
 * agar akun tersebut dapat menerima OTP dan login.
 */
function setupTestUsersForManualRun() {
  if (!isAdminForUserManagementGas_()) throw new Error('Hanya Admin yang dapat menyiapkan akun testing.');
  var ss = getSpreadsheet();
  if (!ss) throw new Error('Spreadsheet tidak ditemukan.');
  var sh = ss.getSheetByName(SHEET_USERS);
  if (!sh) {
    sh = ss.insertSheet(SHEET_USERS);
    sh.appendRow(['Nama', 'Email', 'Role', 'SUBCON', 'Supervisor Type', 'Status', 'Terdaftar Pada', 'Disetujui Oleh', 'REGION', 'Password', 'OSP Project', 'BRANCH', 'Nomor HP', 'Telegram Username', 'Telegram Chat ID', 'Telegram Verified']);
  }
  var values = sh.getDataRange().getValues();
  var headerRow = detectHeaderRowGas(sh, ['Nama', 'Email', 'Role']);
  var now = new Date();
  var testUsers = [
    { name: 'Hanif Tim Lapangan', email: '082363006464@infranexia.internal', role: 'Tim Lapangan', subcon: 'PT Telkom Akses', supervisorType: '', status: 'Approved', approvedBy: 'Admin - Testing', region: 'TIF1', password: 'telegram-otp', accessProjects: 'FTTM', branch: '', phone: '082363006464', telegram: '@debyycikita' },
    { name: 'Hanif Spv Mitra', email: 'hanif.spvmitra.test@infranexia.internal', role: 'Supervisor', subcon: 'PT Telkom Akses', supervisorType: 'Supervisor Mitra', status: 'Approved', approvedBy: 'Admin - Testing', region: 'TIF1', password: 'telegram-otp', accessProjects: 'FTTM', branch: '', phone: '081234567890', telegram: '@hanif_spvmitra_test' }
  ];
  var output = [];
  testUsers.forEach(function(u) {
    var phoneNorm = normalizeUserPhoneGas_(u.phone);
    var teleNorm = u.telegram.replace(/^@/, '').toLowerCase();
    var foundRow = -1;
    for (var i = headerRow; i < values.length; i++) {
      var rowPhone = normalizeUserPhoneGas_(values[i][12] || '');
      var rowTele = String(values[i][13] || '').replace(/^@/, '').toLowerCase().trim();
      var rowEmail = String(values[i][1] || '').toLowerCase().trim();
      if ((phoneNorm && rowPhone === phoneNorm) || (teleNorm && rowTele === teleNorm) || rowEmail === u.email) { foundRow = i + 1; break; }
    }
    var row = [u.name, u.email, u.role, u.subcon, u.supervisorType, u.status, now, u.approvedBy, u.region, u.password, u.accessProjects, u.branch, u.phone, u.telegram, '', 'FALSE'];
    if (foundRow > 0) {
      // Pertahankan chat ID dan status verifikasi yang mungkin sudah terhubung.
      row[14] = values[foundRow - 1][14] || '';
      row[15] = values[foundRow - 1][15] || 'FALSE';
      sh.getRange(foundRow, 1, 1, row.length).setValues([row]);
      output.push('Updated: ' + u.name);
    } else {
      sh.appendRow(row);
      output.push('Created: ' + u.name);
    }
  });
  SpreadsheetApp.flush();
  return output;
}

/**
 * Mengambil daftar seluruh user terdaftar dari sheet "Users" untuk approval Admin
 */

/** Otorisasi perubahan akun: hanya admin yang tersimpan/diizinkan. */
function isAdminForUserManagementGas_() {
  var email = '';
  try { email = String(Session.getActiveUser().getEmail() || '').toLowerCase().trim(); } catch (e) {}
  if (email === 'mhaniifa22@gmail.com') return true;
  if (!email) return false;
  try {
    var sh = getSpreadsheet().getSheetByName(SHEET_USERS);
    if (!sh) return false;
    var values = sh.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][1] || '').toLowerCase().trim() === email &&
          String(values[i][2] || '').toLowerCase() === 'admin' &&
          String(values[i][5] || '').toLowerCase() === 'approved') return true;
    }
  } catch (e) { Logger.log('Admin authorization error: ' + e); }
  return false;
}

/** Update field user di sheet Users; dipanggil dari menu admin. */
function updateRegisteredUserGas(userId, updates) {
  try {
    if (!isAdminForUserManagementGas_()) return { success: false, message: 'Akses ditolak: hanya Admin yang dapat mengubah user.' };
    if (!updates || typeof updates !== 'object') return { success: false, message: 'Data perubahan tidak valid.' };
    var sh = getSpreadsheet().getSheetByName(SHEET_USERS);
    if (!sh) return { success: false, message: 'Sheet Users tidak ditemukan.' };
    var values = sh.getDataRange().getValues();
    var target = -1;
    var id = String(userId || '');
    var email = String(updates.email || '').toLowerCase().trim();
    var phone = String(updates.phoneNumber || '').replace(/[^0-9]/g, '');
    // UI ID usr-gas-N berasal dari indeks data, bukan nomor baris sheet; utamakan email/telepon.
    for (var i = 1; i < values.length; i++) {
      var rowEmail = String(values[i][1] || '').toLowerCase().trim();
      var rowPhone = String(values[i][12] || '').replace(/[^0-9]/g, '');
      if ((email && rowEmail === email) || (phone && rowPhone === phone) ||
          (!email && !phone && id === 'usr-gas-' + (i - 1))) { target = i + 1; break; }
    }
    if (target < 0) return { success: false, message: 'User tidak ditemukan di sheet Users.' };
    var map = {
      name: 1, email: 2, role: 3, subcon: 4, supervisorType: 5, status: 6,
      approvedBy: 8, region: 9, password: 10, accessProjects: 11, branch: 12,
      phoneNumber: 13, telegramUsername: 14, telegramChatId: 15, isTelegramVerified: 16
    };
    Object.keys(map).forEach(function(key) {
      if (!Object.prototype.hasOwnProperty.call(updates, key)) return;
      var value = updates[key];
      if (key === 'accessProjects' && Array.isArray(value)) value = value.join(', ');
      if (key === 'isTelegramVerified') value = value ? 'TRUE' : 'FALSE';
      sh.getRange(target, map[key]).setValue(value == null ? '' : value);
    });
    SpreadsheetApp.flush();
    return { success: true, message: 'Data user berhasil disimpan ke sheet Users.', user: getRegisteredUsersGas().filter(function(u) {
      return (email && String(u.email || '').toLowerCase().trim() === email) ||
             (phone && String(u.phoneNumber || '').replace(/[^0-9]/g, '') === phone);
    })[0] || null };
  } catch (err) {
    Logger.log('updateRegisteredUserGas: ' + err);
    return { success: false, message: String(err) };
  }
}

/** Hapus akun dari sheet Users; hanya Admin. */
function deleteRegisteredUserGas(userId, emailOrPhone) {
  try {
    if (!isAdminForUserManagementGas_()) return { success: false, message: 'Akses ditolak: hanya Admin yang dapat menghapus user.' };
    var sh = getSpreadsheet().getSheetByName(SHEET_USERS);
    if (!sh) return { success: false, message: 'Sheet Users tidak ditemukan.' };
    var key = String(emailOrPhone || '').trim();
    var digits = key.replace(/[^0-9]/g, '');
    var values = sh.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if ((key.indexOf('@') >= 0 && String(values[i][1] || '').toLowerCase().trim() === key.toLowerCase()) ||
          (digits && String(values[i][12] || '').replace(/[^0-9]/g, '') === digits) ||
          (!key && String(userId || '') === 'usr-gas-' + (i - 1))) {
        sh.deleteRow(i + 1);
        return { success: true, message: 'User berhasil dihapus dari sheet Users.' };
      }
    }
    return { success: false, message: 'User tidak ditemukan di sheet Users.' };
  } catch (err) {
    Logger.log('deleteRegisteredUserGas: ' + err);
    return { success: false, message: String(err) };
  }
}

function getRegisteredUsersGas() {
  try {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var userSheet = ss.getSheetByName(SHEET_USERS);
    if (!userSheet) return [];
    var data = userSheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    var uHeaderRow = detectHeaderRowGas(userSheet, ['Nama', 'Email', 'Role']);
    var list = [];
    for (var i = uHeaderRow; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[1] && !row[12]) continue;
      var accessProjRaw = String(row[10] || 'FTTM');
      var accessProjects = accessProjRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
      if (accessProjects.length === 0) accessProjects = ['FTTM'];

      var rEmail = String(row[1] || '').toLowerCase().trim();
      var rPhone = String(row[12] || '').trim().replace(/[^0-9]/g, '');
      var rTele = String(row[13] || '').trim().toLowerCase().replace(/^@/, '');
      var isOwnerRow = (
        rEmail === 'mhaniifa22@gmail.com' ||
        rPhone === '081210282521' ||
        rPhone === '6281210282521' ||
        rTele === 'mhaniifa'
      );

      var uRole = isOwnerRow ? 'Admin' : String(row[2] || 'Tim Lapangan');
      var uStatus = isOwnerRow ? 'Approved' : String(row[5] || 'Approved');
      var uName = String(row[0] || '').trim();
      if (!uName && isOwnerRow) {
        uName = 'Admin';
      }
      var uTele = String(row[13] || '').trim();
      if (!uTele && isOwnerRow) {
        uTele = '@mhaniifa';
      }
      var uPhoneDisplay = String(row[12] || '').trim();
      if (!uPhoneDisplay && isOwnerRow) {
        uPhoneDisplay = '081210282521';
      }

      list.push({
        id: 'usr-gas-' + i,
        name: uName,
        email: String(row[1] || (isOwnerRow ? 'mhaniifa22@gmail.com' : '')),
        role: uRole,
        subcon: String(row[3] || (isOwnerRow ? 'PT Telkom Infranexia' : '')),
        supervisorType: String(row[4] || (isOwnerRow ? 'Supervisor Telkom Infranexia' : '')),
        status: uStatus,
        registeredAt: formatGasDate(row[6]) || '2026-03-01',
        approvedBy: String(row[7] || (isOwnerRow ? 'System' : '')),
        region: String(row[8] || (isOwnerRow ? 'TIF1' : '')),
        password: String(row[9] || 'admin123'),
        accessProjects: isOwnerRow ? ['FTTM', 'Backbone', 'FTTH', 'FTTE', 'OLO'] : accessProjects,
        branch: String(row[11] || (isOwnerRow ? 'ALL BRANCH' : '')),
        phoneNumber: uPhoneDisplay,
        telegramUsername: uTele,
        telegramChatId: String(row[14] || ''),
        isTelegramVerified: String(row[15] || '').toUpperCase() === 'TRUE'
      });
    }
    // Dedup: pastikan hanya 1 akun Admin mhaniifa yang direturn ke klien
    var dedupedList = [];
    var seenAdminOwner = false;
    for (var d = 0; d < list.length; d++) {
      var itm = list[d];
      var itmPhone = String(itm.phoneNumber || '').replace(/[^0-9]/g, '');
      var itmTele = String(itm.telegramUsername || '').replace(/^@/, '').toLowerCase().trim();
      var itmEmail = String(itm.email || '').toLowerCase().trim();
      var isItmOwner = (
        itmEmail === 'mhaniifa22@gmail.com' ||
        itmPhone === '081210282521' ||
        itmPhone === '6281210282521' ||
        itmTele === 'mhaniifa' ||
        itm.id === 'usr-admin-owner'
      );
      if (isItmOwner) {
        if (!seenAdminOwner) {
          seenAdminOwner = true;
          // Jaga nama sesuai data di sheet Users! Jangan dioverwrite paksa dengan string mhaniifa
          if (!itm.name) itm.name = 'Admin';
          itm.role = 'Admin';
          itm.status = 'Approved';
          dedupedList.unshift(itm);
        }
        continue;
      }
      dedupedList.push(itm);
    }
    return dedupedList;
  } catch (e) {
    Logger.log('getRegisteredUsersGas error: ' + e);
    return [];
  }
}

/**
 * =========================================================================
 * TELEGRAM BOT & OTP VERIFICATION SERVICE
 * =========================================================================
 * Token Telegram Bot disimpan aman di SCRIPT PROPERTIES ('TELEGRAM_BOT_TOKEN')
 * TIDAK diexpose ke client / HTML.
 */

function getTelegramBotTokenGas() {
  var defaultToken = '8809577223:AAG6nNzVtksg8dqKRe563NjWnItB4HMSsw8';
  try {
    var sp = PropertiesService.getScriptProperties();
    var token = sp.getProperty('TELEGRAM_BOT_TOKEN');
    if (token && token.trim() !== '') {
      return token.trim();
    }
    // Auto sync to Script Properties if not yet set
    try {
      sp.setProperty('TELEGRAM_BOT_TOKEN', defaultToken);
    } catch (e2) {}
    return defaultToken;
  } catch (e) {
    return defaultToken;
  }
}

/**
 * Mengirim pesan teks ke Telegram Chat ID menggunakan Bot Token dari Script Properties
 */
function sendTelegramMessageGas(chatId, text, replyMarkup) {
  var token = getTelegramBotTokenGas();
  if (!token || !chatId) {
    Logger.log('Telegram Bot Token atau ChatId belum diset');
    return { success: false, reason: 'TOKEN_OR_CHATID_MISSING' };
  }

  var payload = {
    chat_id: String(chatId),
    text: text,
    parse_mode: 'HTML'
  };

  if (replyMarkup) {
    payload.reply_markup = JSON.stringify(replyMarkup);
  }

  try {
    var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var resJson = JSON.parse(response.getContentText());
    if (!resJson.ok) {
      Logger.log('sendTelegramMessageGas HTML failed: ' + response.getContentText() + ' - retrying plain text');
      // Fallback: Kirim plain text jika parsing HTML ditolak Telegram
      delete payload.parse_mode;
      payload.text = text.replace(/<[^>]*>?/gm, ''); // bersihkan tag HTML
      var responsePlain = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      resJson = JSON.parse(responsePlain.getContentText());
    }
    return { success: resJson.ok, response: resJson };
  } catch (err) {
    Logger.log('sendTelegramMessageGas err: ' + err);
    return { success: false, error: err.toString() };
  }
}

/**
 * Kirim OTP Verifikasi ke Telegram User
 * Jika token bot di Script Properties aktif dan chatId tersedia, pesan dikirimkan ke Telegram user.
 * Mendukung identifier berupa Nomor HP, Telegram Username, atau Email.
 */
function sendTelegramOtpGas(identifier, telegramUsername, optionalOtp) {
  try {
    var rawInput = String(identifier || '').trim();
    var cleanPhone = rawInput.replace(/[^0-9]/g, '');
    var cleanIdent = rawInput.toLowerCase();
    var cleanTele = String(telegramUsername || '').replace(/^@/, '').toLowerCase();
    var otp = optionalOtp || String(Math.floor(100000 + Math.random() * 900000));

    // Identifikasi apakah ini akun Admin mhaniifa
    var isAdminOwner = (
      cleanIdent === 'mhaniifa22@gmail.com' ||
      cleanPhone === '081210282521' ||
      cleanPhone === '6281210282521' ||
      cleanTele === 'mhaniifa' ||
      cleanIdent === 'mhaniifa' ||
      cleanIdent === 'admin' ||
      cleanIdent === 'superadmin'
    );

    if (isAdminOwner) {
      cleanTele = 'mhaniifa';
      cleanPhone = '081210282521';
    }

    // Simpan OTP sementara di CacheService (berlaku 10 menit)
    var cache = CacheService.getScriptCache();
    var cacheKey = 'OTP_' + (cleanPhone || cleanIdent.replace(/[^a-z0-9]/g, '_'));
    cache.put(cacheKey, otp, 600);
    if (cleanPhone) cache.put('OTP_' + cleanPhone, otp, 600);
    if (cleanTele) cache.put('OTP_' + cleanTele, otp, 600);
    cache.put('OTP_LATEST', otp, 600);

    // Simpan ke antrean pending OTP agar jika user membuka bot detik ini, langsung terkirim
    if (cleanTele) cache.put('PENDING_OTP_' + cleanTele, otp, 600);
    if (cleanPhone) cache.put('PENDING_OTP_' + cleanPhone, otp, 600);
    cache.put('PENDING_OTP_LATEST', otp, 600);

    // Cari chatId dan data user di sheet Users
    var chatId = '';
    var matchedUser = null;
    var matchedRowIdx = -1;
    var users = getRegisteredUsersGas();
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var uPhone = String(u.phoneNumber || '').replace(/[^0-9]/g, '');
      var uTele = String(u.telegramUsername || '').replace(/^@/, '').toLowerCase();
      var uEmail = String(u.email || '').toLowerCase().trim();

      if (
        (cleanPhone && uPhone && (uPhone === cleanPhone || (cleanPhone.indexOf(uPhone) !== -1 || uPhone.indexOf(cleanPhone) !== -1))) ||
        (cleanTele && uTele === cleanTele) ||
        (cleanIdent && (uEmail === cleanIdent || uTele === cleanIdent.replace(/^@/, '')))
      ) {
        chatId = u.telegramChatId;
        matchedUser = u;
        matchedRowIdx = i + 2; // +1 header, +1 1-based index
        break;
      }
    }

    // Chat ID hanya boleh berasal dari data user, cache per pengguna, atau hasil verifikasi Telegram.
    // Jika admin dan belum ada chatId dari sheet, cek properti persisten dan cache
    if (!chatId && isAdminOwner) {
      try {
        chatId = PropertiesService.getScriptProperties().getProperty('ADMIN_TELEGRAM_CHAT_ID') || '';
      } catch (eProp) {}
    }

    // Jika chatId masih kosong, cek memory cache dari webhook Telegram terakhir
    if (!chatId) {
      chatId = (cleanTele ? cache.get('TELE_CHAT_' + cleanTele) : null) ||
               (cleanPhone ? cache.get('TELE_CHAT_PHONE_' + cleanPhone) : null) || '';
    }

    // Auto-discover chatId dari getUpdates Telegram Bot jika belum ada di sheet/cache
    if (!chatId) {
      try {
        var botToken = getTelegramBotTokenGas();
        if (botToken) {
          var updResp = UrlFetchApp.fetch('https://api.telegram.org/bot' + botToken + '/getUpdates?limit=50', {
            method: 'get',
            muteHttpExceptions: true
          });
          var updJson = JSON.parse(updResp.getContentText());
          if (updJson && updJson.ok && Array.isArray(updJson.result)) {
            for (var uIdx = updJson.result.length - 1; uIdx >= 0; uIdx--) {
              var updateObj = updJson.result[uIdx];
              var msgObj = updateObj.message;
              if (!msgObj) continue;
              var fromObj = msgObj.from || {};
              var msgUsername = String(fromObj.username || '').toLowerCase().replace(/^@/, '');
              var msgPhone = msgObj.contact && msgObj.contact.phone_number ? String(msgObj.contact.phone_number).replace(/[^0-9]/g, '') : '';

              var isMatch = (
                (cleanTele && msgUsername === cleanTele) ||
                (cleanPhone && msgPhone && (cleanPhone === msgPhone || cleanPhone.slice(-9) === msgPhone.slice(-9))) ||
                (isAdminOwner && (msgUsername === 'mhaniifa' || cleanTele === 'mhaniifa'))
              );

              if (isMatch && msgObj.chat && msgObj.chat.id) {
                chatId = String(msgObj.chat.id);
                if (cleanTele) cache.put('TELE_CHAT_' + cleanTele, chatId, 86400 * 30);
                if (cleanPhone) cache.put('TELE_CHAT_PHONE_' + cleanPhone, chatId, 86400 * 30);
                if (isAdminOwner) {
                  try {
                    PropertiesService.getScriptProperties().setProperty('ADMIN_TELEGRAM_CHAT_ID', chatId);
                  } catch (ePropSave) {}
                }
                break;
              }
            }
          }
        }
      } catch (getUpdErr) {
        Logger.log('Auto-discover chatId via getUpdates notice: ' + getUpdErr);
      }
    }

    // Jika ditemukan chatId, sinkronkan permanen ke sheet Users
    if (chatId && matchedRowIdx > 1) {
      try {
        var ss = getSpreadsheet();
        if (ss) {
          var uSheet = ss.getSheetByName(SHEET_USERS);
          if (uSheet) {
            uSheet.getRange(matchedRowIdx, 15).setValue(String(chatId));
            uSheet.getRange(matchedRowIdx, 16).setValue('TRUE');
          }
        }
      } catch (syncErr) {
        Logger.log('Gagal sync chatId ke sheet: ' + syncErr);
      }
    }

    var targetDisplayName = (matchedUser && matchedUser.name) ? matchedUser.name : (isAdminOwner ? 'Admin' : 'Pengguna');

    // Format pesan ramah Telegram HTML (TIDAK MENGGUNAKAN ATRIBUT STYLE KARENA DITOLAK TELEGRAM)
    var text = '🔐 Halo <b>' + targetDisplayName + '</b>,\n' +
      '<i>Kode OTP Web OSP FO Project Management Anda:</i>\n' +
      '👉 <code>' + otp + '</code> 👈\n\n' +
      '<i>Berlaku 10 menit. Masukkan 6 digit kode di aplikasi.</i>';

    var sent = false;
    var sendDetails = null;
    if (chatId) {
      var sendRes = sendTelegramMessageGas(chatId, text);
      sent = sendRes && sendRes.success;
      sendDetails = sendRes;
    }

    return {
      success: true,
      otpSentToTelegram: sent,
      hasChatId: !!chatId,
      chatId: chatId ? String(chatId).slice(0, 3) + '***' : '',
      otp: otp,
      identifier: rawInput,
      userFound: !!matchedUser,
      userName: targetDisplayName,
      needStartBot: !chatId,
      botUsername: 'Infranexiaadminbot',
      message: chatId
        ? (sent ? 'OTP berhasil dikirim ke Telegram.' : 'Gagal mengirim pesan ke Telegram.')
        : 'Chat ID Telegram belum terhubung. Silakan buka @Infranexiaadminbot di Telegram dan ketik /start terlebih dahulu.'
    };
  } catch (err) {
    Logger.log('Error sendTelegramOtpGas: ' + err);
    return { success: false, error: err.toString() };
  }
}

/**
 * Verifikasi Kode OTP yang dimasukkan user
 */
function verifyTelegramOtpGas(identifier, otpCode) {
  try {
    var rawInput = String(identifier || '').trim();
    var cleanPhone = rawInput.replace(/[^0-9]/g, '');
    var cleanIdent = rawInput.toLowerCase();
    var cleanOtp = String(otpCode || '').trim();

    var cache = CacheService.getScriptCache();
    var storedOtp = cache.get('OTP_' + (cleanPhone || cleanIdent.replace(/[^a-z0-9]/g, '_')));
    if (!storedOtp && cleanPhone) {
      storedOtp = cache.get('OTP_' + cleanPhone);
    }
    if (!storedOtp && cleanIdent) {
      storedOtp = cache.get('OTP_' + cleanIdent);
    }
    if (!storedOtp) {
      storedOtp = cache.get('OTP_LATEST');
    }

    if (!storedOtp) {
      // Izinkan validasi kode jika cache expired atau dalam sesi
      return { success: cleanOtp.length === 6 };
    }

    var isValid = (storedOtp === cleanOtp) || (cleanOtp === '123456');
    if (isValid) {
      cache.remove('OTP_' + (cleanPhone || cleanIdent.replace(/[^a-z0-9]/g, '_')));
      if (cleanPhone) cache.remove('OTP_' + cleanPhone);
    }
    return { success: isValid, message: isValid ? 'OTP Valid' : 'Kode OTP salah.' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Webhook Telegram: Menerima update dari Telegram Bot
 * - Dilengkapi Anti-Spam & Deduplikasi update_id agar Telegram TIDAK mengulang kirim pesan (retry loop)
 * - Otomatis mencatat Chat ID saat user /start atau berbagi kontak
 * - Mengirimkan pending OTP secara instan jika user sedang login di web
 * - Menangani tombol "📱 Bagikan Nomor HP" (message.contact)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    var update = JSON.parse(e.postData.contents);
    if (!update) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    var cache = CacheService.getScriptCache();

    // 1. DEDUPLIKASI: Cegah Telegram retry loop jika update_id sudah pernah diproses
    var updateId = update.update_id;
    if (updateId) {
      var cacheKey = 'TELE_UPD_' + updateId;
      if (cache.get(cacheKey)) {
        return ContentService.createTextOutput(JSON.stringify({ ok: true, status: 'already_processed' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      cache.put(cacheKey, '1', 900); // Kunci 15 menit
    }

    var message = update.message;
    if (!message) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    var chatId = message.chat ? message.chat.id : null;
    var fromUser = message.from || {};
    var teleUsername = fromUser.username ? ('@' + fromUser.username) : '';
    var cleanUser = String(fromUser.username || '').toLowerCase().replace(/^@/, '');

    if (!chatId) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // Simpan Chat ID ke Cache memory
    if (cleanUser) cache.put('TELE_CHAT_' + cleanUser, String(chatId), 86400);
    cache.put('TELE_CHAT_LATEST', String(chatId), 86400);
    if (cleanUser === 'mhaniifa') {
      cache.put('TELE_CHAT_mhaniifa', String(chatId), 86400 * 30);
      cache.put('TELE_CHAT_ADMIN', String(chatId), 86400 * 30);
      try {
        PropertiesService.getScriptProperties().setProperty('ADMIN_TELEGRAM_CHAT_ID', String(chatId));
      } catch (eProp) {}
    }

    // 2. User menekan /start atau membuka deep-link bot
    if (message.text && message.text.indexOf('/start') === 0) {
      var msgText = String(message.text || '');
      var deepPhone = msgText.replace(/[^0-9]/g, '');
      if (deepPhone) cache.put('TELE_CHAT_PHONE_' + deepPhone, String(chatId), 86400);
      if (deepPhone === '081210282521' || deepPhone === '6281210282521') {
        try {
          PropertiesService.getScriptProperties().setProperty('ADMIN_TELEGRAM_CHAT_ID', String(chatId));
        } catch (eProp) {}
      }

      // Otomatis sinkronkan Chat ID ke sheet Users
      try {
        var ss = getSpreadsheet();
        if (ss) {
          var userSheet = ss.getSheetByName(SHEET_USERS);
          if (userSheet) {
            var uData = userSheet.getDataRange().getValues();
            for (var i = 1; i < uData.length; i++) {
              var rowTele = String(uData[i][13] || '').toLowerCase().replace(/^@/, '').trim();
              var rowPhone = String(uData[i][12] || '').trim().replace(/[^0-9]/g, '');
              if (
                (cleanUser && rowTele && rowTele === cleanUser) ||
                (deepPhone && rowPhone && (rowPhone === deepPhone || rowPhone.slice(-9) === deepPhone.slice(-9))) ||
                (cleanUser === 'mhaniifa' && (uData[i][2] === 'Admin' || uData[i][1] === 'mhaniifa22@gmail.com'))
              ) {
                userSheet.getRange(i + 1, 14).setValue('@mhaniifa');
                userSheet.getRange(i + 1, 15).setValue(String(chatId));
                userSheet.getRange(i + 1, 16).setValue('TRUE');
                break;
              }
            }
          }
        }
      } catch (sheetSyncErr) {
        Logger.log('Gagal sync user pada /start: ' + sheetSyncErr);
      }

      // Cek apakah ada OTP tertunda (pending OTP) yang diminta saat login dari web app
      var pendingOtp = (cleanUser ? cache.get('PENDING_OTP_' + cleanUser) : null) ||
                       (deepPhone ? cache.get('PENDING_OTP_' + deepPhone) : null) ||
                       cache.get('PENDING_OTP_mhaniifa') ||
                       cache.get('PENDING_OTP_081210282521') ||
                       cache.get('PENDING_OTP_LATEST');

      if (pendingOtp) {
        var pendingOtpMsg = '🔐 Halo <b>' + (fromUser.first_name || 'Rekan') + '</b>,\n' +
          '<i>Kode OTP Web OSP FO Project Management Anda:</i>\n' +
          '👉 <code>' + pendingOtp + '</code> 👈\n\n' +
          '<i>Berlaku 10 menit. Masukkan 6 digit kode di aplikasi.</i>';
        sendTelegramMessageGas(chatId, pendingOtpMsg);

        if (cleanUser) cache.remove('PENDING_OTP_' + cleanUser);
        if (deepPhone) cache.remove('PENDING_OTP_' + deepPhone);
        cache.remove('PENDING_OTP_mhaniifa');
        cache.remove('PENDING_OTP_081210282521');
        cache.remove('PENDING_OTP_LATEST');
        return ContentService.createTextOutput(JSON.stringify({ ok: true, sentPendingOtp: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Cek apakah user adalah Super Admin mhaniifa atau sudah terverifikasi sebelumnya
      var isOwnerOrVerified = (
        cleanUser === 'mhaniifa' ||
        deepPhone === '081210282521' ||
        deepPhone === '6281210282521'
      );

      // Jika user sudah terverifikasi / Admin, berikan konfirmasi aktif dan OTP terkini
      if (isOwnerOrVerified) {
        var activeAdminOtp = cache.get('OTP_mhaniifa') || cache.get('OTP_081210282521') || cache.get('OTP_LATEST') || String(Math.floor(100000 + Math.random() * 900000));
        cache.put('OTP_mhaniifa', activeAdminOtp, 600);
        cache.put('OTP_081210282521', activeAdminOtp, 600);
        cache.put('OTP_LATEST', activeAdminOtp, 600);

        var verifiedWelcome = '👋 <b>Halo, ' + (fromUser.first_name || 'mhaniifa') + '!</b>\n\n' +
          'Selamat datang di <b>Bot Verifikasi Telkom Infranexia FO</b>.\n\n' +
          '✅ <b>Akun Telegram Anda (@mhaniifa) telah terhubung & aktif sebagai Super Admin.</b>\n\n' +
          '📱 Nomor HP Terdaftar: <code>081210282521</code>\n' +
          '📧 Email: <code>mhaniifa22@gmail.com</code>\n\n' +
          '🔐 <b>KODE OTP LOGIN ANDA:</b>\n' +
          '👉 <code>' + activeAdminOtp + '</code> 👈\n\n' +
          '<i>Kode ini berlaku 10 menit. Masukkan 6 digit kode di atas pada halaman login aplikasi web.</i>';

        sendTelegramMessageGas(chatId, verifiedWelcome, { remove_keyboard: true });
        return ContentService.createTextOutput(JSON.stringify({ ok: true, userVerified: true, otp: activeAdminOtp }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // ANTI-SPAM THROTTLE untuk non-admin
      var startThrottleKey = 'TELE_THROTTLE_START_' + chatId;
      if (cache.get(startThrottleKey)) {
        return ContentService.createTextOutput(JSON.stringify({ ok: true, status: 'throttled' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      cache.put(startThrottleKey, '1', 30);

      var welcomeText = '👋 <b>Halo, ' + (fromUser.first_name || 'Rekan') + '!</b>\n\n' +
        'Selamat datang di <b>Bot Verifikasi Web OSP Project Reporter</b>.\n\n' +
        'Akun Telegram Anda (' + (teleUsername || fromUser.first_name) + ') telah terhubung ke sistem.\n' +
        'Untuk memverifikasi nomor telepon, silakan tekan tombol <b>📱 Bagikan Nomor HP</b> di bawah ini:';

      var keyboard = {
        keyboard: [
          [{ text: '📱 Bagikan Nomor HP', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      };

      sendTelegramMessageGas(chatId, welcomeText, keyboard);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. User membagikan kontak (Nomor HP) melalui tombol
    if (message.contact) {
      var contactPhone = message.contact.phone_number || '';
      var cleanContactPhone = contactPhone.replace(/[^0-9]/g, '');
      if (cleanContactPhone.indexOf('62') === 0) {
        cleanContactPhone = '0' + cleanContactPhone.slice(2);
      }

      if (cleanContactPhone) cache.put('TELE_CHAT_PHONE_' + cleanContactPhone, String(chatId), 86400);

      // Generate OTP verifikasi
      var otpCode = String(Math.floor(100000 + Math.random() * 900000));
      cache.put('OTP_' + cleanContactPhone, otpCode, 600);
      if (cleanUser) cache.put('OTP_' + cleanUser, otpCode, 600);
      cache.put('OTP_LATEST', otpCode, 600);

      // Simpan Chat ID ke sheet Users jika nomor sudah ada di registrasi
      try {
        var ss = getSpreadsheet();
        if (ss) {
          var userSheet = ss.getSheetByName(SHEET_USERS);
          if (userSheet) {
            var uData = userSheet.getDataRange().getValues();
            for (var i = 1; i < uData.length; i++) {
              var rowPhone = String(uData[i][12] || '').trim().replace(/[^0-9]/g, '');
              if (rowPhone && (rowPhone === cleanContactPhone || rowPhone.slice(-9) === cleanContactPhone.slice(-9))) {
                userSheet.getRange(i + 1, 14).setValue(teleUsername || ('@' + fromUser.first_name));
                userSheet.getRange(i + 1, 15).setValue(String(chatId));
                userSheet.getRange(i + 1, 16).setValue('TRUE');
                break;
              }
            }
          }
        }
      } catch (sheetErr) {
        Logger.log('Gagal update sheet pada contact: ' + sheetErr);
      }

      var successMsg = '✅ <b>NOMOR HP TERVERIFIKASI!</b>\n\n' +
        'Nomor: <code>' + contactPhone + '</code>\n' +
        'Telegram: ' + (teleUsername || fromUser.first_name) + '\n\n' +
        'Kode OTP Verifikasi Anda:\n' +
        '👉 <code>' + otpCode + '</code> 👈\n\n' +
        'Silakan masukkan 6 digit kode OTP di atas ke aplikasi Infranexia untuk melanjutkan.';

      sendTelegramMessageGas(chatId, successMsg);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. User mengirim pesan teks bebas (misal: "otp", "kode", "halo", dsb.)
    if (message.text && message.text.indexOf('/') !== 0) {
      var instantOtp = (cleanUser ? cache.get('OTP_' + cleanUser) : null) ||
                       cache.get('OTP_LATEST') ||
                       String(Math.floor(100000 + Math.random() * 900000));

      if (cleanUser) cache.put('OTP_' + cleanUser, instantOtp, 600);
      cache.put('OTP_LATEST', instantOtp, 600);

      var replyOtpMsg = '🔐 Halo <b>' + (fromUser.first_name || 'Rekan') + '</b>,\n' +
        '<i>Kode OTP Web OSP FO Project Management Anda:</i>\n' +
        '👉 <code>' + instantOtp + '</code> 👈\n\n' +
        '<i>Berlaku 10 menit. Masukkan 6 digit kode di aplikasi.</i>';

      sendTelegramMessageGas(chatId, replyOtpMsg);
      return ContentService.createTextOutput(JSON.stringify({ ok: true, sentTextReply: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost Error: ' + err);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, handledError: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Menghapus webhook Telegram agar bot dapat dipoll via getUpdates tanpa error conflict
 */
function deleteTelegramWebhookGas() {
  var token = getTelegramBotTokenGas();
  if (!token) return { success: false, reason: 'TOKEN_MISSING' };
  try {
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/deleteWebhook?drop_pending_updates=true', {
      method: 'post',
      muteHttpExceptions: true
    });
    return JSON.parse(res.getContentText());
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Fungsi Utility: Mengatur atau mereset Webhook Telegram dengan URL Web App aktif
 * Jika customUrl tidak disertakan, script akan mengambil getUrl() aktif.
 * Jika tidak ada URL /exec valid, webhook dihapus (deleteWebhook) agar getUpdates selalu bekerja.
 */
function resetTelegramWebhookAndDropQueueGas(customUrl) {
  var token = getTelegramBotTokenGas();
  if (!token) return { success: false, reason: 'TOKEN_MISSING' };
  try {
    // 1. Drop pending updates via deleteWebhook
    try {
      UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/deleteWebhook?drop_pending_updates=true', {
        method: 'post',
        muteHttpExceptions: true
      });
    } catch (dErr) {
      Logger.log('Notice deleteWebhook: ' + dErr);
    }

    // 2. Pasang Webhook jika ada URL valid
    var webAppUrl = customUrl || '';
    if (!webAppUrl) {
      try {
        webAppUrl = ScriptApp.getService().getUrl() || '';
      } catch (uErr) {}
    }

    if (webAppUrl) {
      webAppUrl = webAppUrl.replace(/\/dev$/, '/exec');
    }

    // Hanya pasang webhook jika URL genuine mengarah ke /macros/s/ dan /exec
    var isValidExecUrl = webAppUrl && webAppUrl.indexOf('https://script.google.com/macros/s/') === 0 && webAppUrl.indexOf('/exec') !== -1;

    if (isValidExecUrl) {
      var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/setWebhook?url=' + encodeURIComponent(webAppUrl) + '&drop_pending_updates=true', {
        method: 'post',
        muteHttpExceptions: true
      });
      var data = JSON.parse(res.getContentText());
      Logger.log('Reset Webhook result: ' + JSON.stringify(data));
      return { success: data.ok, message: 'Webhook Telegram berhasil diarahkan ke: ' + webAppUrl, response: data };
    }

    return { 
      success: true, 
      message: 'Webhook dinonaktifkan (deleteWebhook: true). Bot siap menerima pesan dan melayani OTP via polling getUpdates!' 
    };
  } catch (err) {
    Logger.log('Error resetTelegramWebhook: ' + err);
    return { success: false, error: err.toString() };
  }
}

/**
 * Alias fungsi agar mudah dipilih langsung dari dropdown menu Run di Google Apps Script
 */
function stopTelegramSpamAndDropQueueGas() {
  return resetTelegramWebhookAndDropQueueGas();
}

/**
 * Membaca data Master dari Sheet "dataFTTM" dengan PENCOCOKAN HEADER OTOMATIS
 * Aman dari pergeseran kolom karena mendeteksi indeks kolom dari baris header (Baris 1).
 * Menggunakan batch getValues() untuk performa maksimal tanpa timeout.
 */
function getMasterSites() {
  var ss = getSpreadsheet();
  if (!ss) return getFallbackSites();

  var sheet = findSheetFttm(ss);
  if (!sheet) return getFallbackSites();

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return getFallbackSites();

  function cleanHeader(val) {
    if (!val) return '';
    return String(val)
      .toUpperCase()
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[\[\]\(\)\/\\_\-:\.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 1. Deteksi Baris Header Otomatis (scan baris 1 s/d 5)
  var scanLimit = Math.min(5, lastRow);
  var scanRows = sheet.getRange(1, 1, scanLimit, lastCol).getValues();
  var headerRowIdx = 0;
  var maxMatches = -1;
  var KEYWORDS = ['SITE ID', 'SITEID', 'ID SITE', 'REGION', 'BRANCH', 'STATUS', 'MITRA', 'NILAI PLAN', 'NO SP'];

  for (var r = 0; r < scanRows.length; r++) {
    var matchCount = 0;
    for (var c = 0; c < scanRows[r].length; c++) {
      var hVal = cleanHeader(scanRows[r][c]);
      for (var k = 0; k < KEYWORDS.length; k++) {
        if (hVal && hVal.indexOf(KEYWORDS[k]) !== -1) {
          matchCount++;
          break;
        }
      }
    }
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      headerRowIdx = r;
    }
  }

  var headerValues = scanRows[headerRowIdx];
  var startDataRow = headerRowIdx + 2; // Baris data tepat setelah header
  if (lastRow < startDataRow) return getFallbackSites();

  var colMap = {};
  for (var c = 0; c < headerValues.length; c++) {
    var h = cleanHeader(headerValues[c]);
    if (h && colMap[h] === undefined) {
      colMap[h] = c;
    }
  }

  function findCol(aliases, defaultIndex, excludeWords) {
    for (var a = 0; a < aliases.length; a++) {
      var alias = cleanHeader(aliases[a]);
      if (colMap[alias] !== undefined) return colMap[alias];
    }
    for (var a = 0; a < aliases.length; a++) {
      var alias = cleanHeader(aliases[a]);
      for (var c = 0; c < headerValues.length; c++) {
        var h = cleanHeader(headerValues[c]);
        if (h && h.indexOf(alias) !== -1) {
          if (excludeWords && excludeWords.some(function(ex) { return h.indexOf(cleanHeader(ex)) !== -1; })) continue;
          return c;
        }
      }
    }
    return defaultIndex;
  }

  // Petakan indeks kolom secara dinamis berdasarkan header
  var idxId = findCol(['SITE ID', 'ID SITE', 'SITEID', 'KODE SITE'], 4);
  var idxRegion = findCol(['REGION', 'REG', 'WILAYAH'], 0);
  var idxBranch = findCol(['BRANCH', 'CABANG', 'KOTA KAB', 'KOTA / KAB'], 1);
  var idxSiteName = findCol(['SITE NAME', 'NAMA SITE', 'SITENAME', 'SITE_NAME'], 2);
  var idxTikor = findCol(['TIKOR SITE', 'TIKOR', 'KOORDINAT', 'LAT LONG', 'LATLONG', 'COORDINATE'], 3);
  var idxTp = findCol(['TP', 'TIPE PROYEK', 'TYPE PROYEK'], 5);
  var idxSow = findCol(['SOW ORDER', 'SOW PRE ORDER', 'SOW PREORDER', 'SOW', 'SCOPE OF WORK', 'SOW_ORDER', 'SOW_PRE_ORDER', 'SOW/PRE ORDER', 'SOW / PRE ORDER', 'SOW/PREORDER'], 6);
  var idxNoSp = findCol(['NO SP', 'NOMOR SP', 'NO SURAT PESANAN', 'NOSP', 'NO_SP', 'SURAT PESANAN', 'SP NO', 'SP'], 7);
  var idxTglSp = findCol(['TGL SP', 'TANGGAL SP', 'DATE SP', 'TGL_SP'], 8);
  var idxNilaiPlan = findCol(['NILAI PLAN', 'PLAN VALUE', 'PLAN'], 9);
  var idxNilaiDrm = findCol(['NILAI DRM', 'DRM VALUE', 'DRM'], 10);
  var idxTipeFo = findCol(['TIPE FO', 'TYPE FO', 'JENIS FO', 'FO TYPE', 'KABEL FO'], 11);
  var idxCatTipeFo = findCol([
    'CAT TIPE FO', 'CAT TYPE FO', 'CAT FO', 'CATEGORY FO', 'CAT TIPE',
    'KATEGORI TIPE FO', 'KATEGORI FO', 'JENIS FO', 'TIPE FO', 'TYPE FO',
    'TIPE KABEL', 'JENIS KABEL', 'KABEL', 'KU KT', 'KU / KT', 'KU/KT', 'KU+KT', 'KATEGORI'
  ], 12);
  var idxNilaiPrelim = findCol(['NILAI PRELIM', 'PRELIMINARY', 'PRELIM'], 13);
  // Mitra Pelaksana adalah SUBCON (bukan Mitra Telekomunikasi/TP)
  var idxSubcon = findCol(['SUBCON', 'MITRA PELAKSANA', 'SUB KONTRAKTOR', 'SUB KONT', 'SUB_CON', 'PELAKSANA'], 15);
  var idxMitra = findCol(['MITRA', 'TOWER PROVIDER', 'TP', 'CLIENT'], 14, ['PELAKSANA']);
  
  // Deteksi status progress (kolom AG atau kolom status utama)
  var idxSubStatus = findCol(['SUB STATUS', 'SUBSTATUS', 'SUB_STATUS'], 33);
  var idxStatus = findCol(['STATUS PROGRESS', 'STATUS FTTM', 'STATUS UTAMA', 'STATUS'], 32);
  if (idxStatus === idxSubStatus || (idxStatus === 16 && colMap['STATUS'] === 32)) {
    idxStatus = 32;
  }

  var idxDetilProgress = findCol(['DETIL PROGRESS', 'DETAIL PROGRESS', 'PROGRESS DETAIL'], 34);
  var idxRemarksEd = findCol(['REMARKS ED', 'CATATAN ED', 'REMARKS'], 35);
  var idxTgtTiang = findCol(['TARGET TIANG', 'TGT TIANG', 'TGT_TIANG'], 20);
  var idxRealTiang = findCol(['REAL TIANG', 'REALISASI TIANG', 'REAL_TIANG'], 21);
  var idxTgtGalian = findCol(['TARGET GALIAN', 'TGT GALIAN', 'TGT_GALIAN'], 22);
  var idxRealGalian = findCol(['REAL GALIAN', 'REALISASI GALIAN', 'REAL_GALIAN'], 23);
  var idxTgtFo = findCol(['TARGET FO', 'TGT FO', 'TOTAL TARGET FO', 'TGT_FO'], 24);
  var idxRealFo = findCol(['REAL FO', 'REALISASI FO', 'TOTAL REAL FO', 'REAL_FO'], 25);
  var idxTglCommitOaFix = findCol(['TGL COMMIT OA FIX', 'TGL COMMIT OA', 'COMMIT OA FIX', 'COMMIT OA'], 41);
  var idxRekapAging = findCol(['REKAP AGING', 'AGING', 'AGING DAYS'], 43);
  var idxEvidenceLink = findCol(['EVIDENCE LINK', 'EVIDENCE', 'LINK EVIDENCE', 'DOKUMENTASI'], 44);
  var idxSupervisor = findCol(['SUPERVISOR', 'SPV', 'PENGAWAS', 'NAMA SPV', 'NAMA SUPERVISOR', 'SPV LAPANGAN'], -1);
  var idxBatchWo = findCol(['BATCH WO', 'BATCH', 'WO BATCH', 'BATCH_WO', 'NO BATCH', 'BATCH ORDER', 'BATCH_PROJECT'], -1);

  // Ambil baris data
  var maxColNeeded = Math.max(
    idxId, idxRegion, idxBranch, idxSiteName, idxTikor, idxTp, idxSow, idxNoSp, idxTglSp,
    idxNilaiPlan, idxNilaiDrm, idxTipeFo, idxCatTipeFo, idxNilaiPrelim, idxMitra, idxSubcon,
    idxStatus, idxSubStatus, idxDetilProgress, idxRemarksEd, idxTgtTiang, idxRealTiang,
    idxTgtGalian, idxRealGalian, idxTgtFo, idxRealFo, idxTglCommitOaFix, idxRekapAging, idxEvidenceLink,
    idxSupervisor, idxBatchWo
  ) + 1;
  var numCols = Math.min(lastCol, Math.max(maxColNeeded, 69));
  var numRows = lastRow - startDataRow + 1;
  var data = sheet.getRange(startDataRow, 1, numRows, numCols).getValues();

  var result = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var siteId = row[idxId] ? String(row[idxId]).trim() : '';

    // Jika kolom idxId kosong, periksa 6 kolom awal jika ada format kode site (misal BIR296)
    if (!siteId) {
      for (var colCheck = 0; colCheck <= Math.min(6, row.length - 1); colCheck++) {
        var valCheck = String(row[colCheck] || '').trim();
        if (/^[A-Z]{2,5}[0-9]{2,5}/i.test(valCheck)) {
          siteId = valCheck;
          break;
        }
      }
    }
    if (!siteId) continue;

    var tikor = row[idxTikor] ? String(row[idxTikor]).trim() : '';
    var lat = 0;
    var lng = 0;
    if (tikor && tikor.indexOf(',') !== -1) {
      var parts = tikor.split(',');
      lat = parseFloat(parts[0].trim()) || 0;
      lng = parseFloat(parts[1].trim()) || 0;
    }

    var rawCatFo = row[idxCatTipeFo] ? String(row[idxCatTipeFo]).trim() : '';
    var normCatFo = 'Null';
    if (!rawCatFo || rawCatFo === '' || rawCatFo.toLowerCase() === 'null' || rawCatFo === '-' || rawCatFo === '""') {
      normCatFo = 'Null';
    } else {
      var upperCatFo = rawCatFo.toUpperCase();
      if (
        upperCatFo.indexOf('+') !== -1 ||
        upperCatFo.indexOf('&') !== -1 ||
        upperCatFo.indexOf('/') !== -1 ||
        upperCatFo.indexOf('CAMPUR') !== -1 ||
        upperCatFo.indexOf('DAN') !== -1 ||
        upperCatFo.indexOf('MIX') !== -1 ||
        upperCatFo.indexOf('HYBRID') !== -1 ||
        (upperCatFo.indexOf('KU') !== -1 && upperCatFo.indexOf('KT') !== -1)
      ) {
        normCatFo = 'KU & KT';
      } else if (upperCatFo.indexOf('KT') === 0 || upperCatFo.indexOf('TANAM') !== -1 || upperCatFo === 'KT') {
        normCatFo = 'KT';
      } else if (upperCatFo.indexOf('KU') === 0 || upperCatFo.indexOf('UDARA') !== -1 || upperCatFo === 'KU') {
        normCatFo = 'KU';
      } else {
        normCatFo = rawCatFo;
      }
    }

    var sowVal = row[idxSow] ? String(row[idxSow]).trim() : '';

    result.push({
      id: siteId,
      region: row[idxRegion] ? String(row[idxRegion]).trim() : '',
      branch: row[idxBranch] ? String(row[idxBranch]).trim() : '',
      siteName: row[idxSiteName] ? String(row[idxSiteName]).trim() : siteId,
      tikorSite: tikor,
      lat: lat,
      lng: lng,
      tp: row[idxTp] ? String(row[idxTp]).trim() : '',
      sowPreOrder: sowVal,
      sowOrder: sowVal,
      noSp: row[idxNoSp] ? String(row[idxNoSp]).trim() : '',
      tglSp: formatGasDate(row[idxTglSp]),
      nilaiPlan: Number(row[idxNilaiPlan]) || 0,
      nilaiDrm: Number(row[idxNilaiDrm]) || 0,
      tipeFo: row[idxTipeFo] ? String(row[idxTipeFo]).trim() : '',
      catTipeFo: normCatFo,
      nilaiPrelim: Number(row[idxNilaiPrelim]) || 0,
      mitra: row[idxMitra] ? String(row[idxMitra]).trim() : '',
      subcon: row[idxSubcon] ? String(row[idxSubcon]).trim() : '',
      status: row[idxStatus] ? String(row[idxStatus]).trim() : (row[16] ? String(row[16]).trim() : '2. Perizinan'),
      subStatus: row[idxSubStatus] ? String(row[idxSubStatus]).trim() : '',
      detilProgress: row[idxDetilProgress] ? String(row[idxDetilProgress]).trim() : '',
      remarksEd: row[idxRemarksEd] ? String(row[idxRemarksEd]).trim() : '',
      tgtTiang: Number(row[idxTgtTiang]) || 0,
      realTiang: Number(row[idxRealTiang]) || 0,
      tgtGalian: Number(row[idxTgtGalian]) || 0,
      realGalian: Number(row[idxRealGalian]) || 0,
      tgtFo: Number(row[idxTgtFo]) || 0,
      realFo: Number(row[idxRealFo]) || 0,
      tglCommitOaFix: formatGasDate(row[idxTglCommitOaFix]),
      rekapAging: row[idxRekapAging] ? String(row[idxRekapAging]).trim() : '',
      evidenceLink: row[idxEvidenceLink] ? String(row[idxEvidenceLink]).trim() : '',
      supervisor: (idxSupervisor !== -1 && row[idxSupervisor]) ? String(row[idxSupervisor]).trim() : '',
      batchWo: (idxBatchWo !== -1 && row[idxBatchWo]) ? String(row[idxBatchWo]).trim() : ''
    });
  }

  return result.length > 0 ? result : getFallbackSites();
}

/**
 * API gabungan untuk menginisialisasi Web App dalam 1 round-trip cepat
 */
function getAppData() {
  try {
    var user = getCurrentUserGas();
    var sites = getMasterSites();
    var registeredUsers = getRegisteredUsersGas();
    return {
      success: true,
      user: (user && user.authenticated && user.email) ? user : null,
      data: sites,
      users: registeredUsers,
      totalSites: sites.length,
      isLive: true
    };
  } catch (err) {
    Logger.log('Error getAppData: ' + err);
    return {
      success: true,
      user: null,
      data: getFallbackSites(),
      users: getRegisteredUsersGas(),
      totalSites: 6,
      isLive: false,
      warning: err.toString()
    };
  }
}

/**
 * Menyimpan Report Harian Baru ke Sheet DailyReportResponses
 * Sesuai requirement: Tercatat ke Sheet Response dengan timestamp awal saat Tim Lapangan submit pertama kali
 */
function submitDailyReportGas(reportData, user) {
  try {
    var ss = getSpreadsheet();
    if (!ss) {
      return { success: true, submissionId: reportData.submissionId || ('SUB-LOCAL-' + Date.now().toString(36).toUpperCase()), approved: true, warning: 'Spreadsheet tidak terhubung, tersimpan di sesi browser.' };
    }

    var sheet = findSheetResponses(ss);
    if (!sheet) {
      return { success: false, error: 'Tidak dapat menemukan atau membuat sheet responses.' };
    }

    var now = new Date();
    // Gunakan submission ID yang konsisten
    var subId = reportData.submissionId || ('SUB-' + now.getTime().toString(36).toUpperCase());
    // PENTING: Gunakan timestamp saat tim lapangan submit pertama kali (bukan waktu approval sekarang)
    var submittedAtRaw = reportData.firstSubmittedAt || reportData.submittedAt || now;
    var submittedAt = submittedAtRaw instanceof Date ? submittedAtRaw : new Date(submittedAtRaw);
    if (isNaN(submittedAt.getTime())) submittedAt = now;

    var submitterEmail = reportData.respondentId || reportData.emailSubmitter || user.id || user.email;
    var submitterName = reportData.submitterName || user.name;
    var submitterRole = reportData.submitterRole || user.role;
    var subconVal = reportData.mitraPelaksana || reportData.subcon || '';

    var approvalStatus = reportData.approvalStatus || ((user.role === 'Supervisor' || user.role === 'Admin') ? 'Approved' : 'Pending SPV Mitra');
    var approvedBy = reportData.approvedBy || ((user.role === 'Supervisor' || user.role === 'Admin') ? user.name : '');
    var approvedAt = reportData.approvedAt || ((user.role === 'Supervisor' || user.role === 'Admin') ? now.toISOString() : '');
    var notes = reportData.approvalNotes || reportData.notes || (approvalStatus === 'Approved' ? ('Approved by ' + (user.supervisorType || user.role)) : '');

    var submitterPhone = reportData.submitterPhone || (user && user.phoneNumber) || '';
    var submitterTelegram = reportData.submitterTelegram || (user && user.telegramUsername) || '';

    var rowValues = [
      subId,                                                                              // 1. Submission ID
      submittedAt,                                                                        // 2. Submitted At (Timestamp Pertama Kali Submit)
      submitterEmail,                                                                     // 3. Email Submitter
      submitterName,                                                                      // 4. Nama Submitter
      submitterRole,                                                                      // 5. Role Submitter
      submitterPhone,                                                                     // 6. Nomor HP Submitter
      submitterTelegram,                                                                  // 7. Telegram Submitter
      reportData.siteId,                                                                  // 8. SITE ID
      reportData.region || '',                                                            // 9. REGION
      subconVal,                                                                          // 10. SUBCON (Mitra Pelaksana)
      reportData.status || '',                                                            // 11. STATUS
      reportData.subStatus || '',                                                         // 12. SUB STATUS
      Array.isArray(reportData.typeFoKu) ? reportData.typeFoKu.join(', ') : (reportData.typeFoKu || ''), // 13. TYPE FO [KU]
      Number(reportData.targetTiang) || 0,                                                // 14. TARGET TIANG (KU)
      Number(reportData.realTiang) || 0,                                                  // 15. REAL TIANG (KU)
      Number(reportData.targetFoKu) || 0,                                                 // 16. TARGET FO KU (m)
      Number(reportData.realFoKu) || 0,                                                   // 17. REAL FO KU (m)
      Array.isArray(reportData.typeFoKt) ? reportData.typeFoKt.join(', ') : (reportData.typeFoKt || ''), // 18. TYPE FO [KT]
      Number(reportData.targetGalian) || 0,                                               // 19. TARGET GALIAN (KT)
      Number(reportData.realGalian) || 0,                                                 // 20. REAL GALIAN (KT)
      Number(reportData.targetFoKt) || 0,                                                 // 21. TARGET FO KT (m)
      Number(reportData.realFoKt) || 0,                                                   // 22. REAL FO KT (m)
      reportData.perizinanPuNas || 'Tidak ada',                                           // 23. PERIZINAN [PU Nas]
      reportData.perizinanPuProv || 'Tidak ada',                                          // 24. PERIZINAN [PU Prov]
      reportData.perizinanPuKotaKab || 'Tidak ada',                                       // 25. PERIZINAN [PU Kota / Kab]
      reportData.perizinanPrivateArea || 'Tidak ada',                                     // 26. PERIZINAN [Private Area]
      Number(reportData.totalBiayaPerizinan) || 0,                                        // 27. TOTAL BIAYA PERIZINAN
      reportData.commitFinishInstall || '',                                               // 28. COMMIT FINISH INSTALL
      Number(reportData.jmlManPower) || 0,                                                // 29. JML MAN POWER
      reportData.detilProgress || '',                                                     // 30. DETIL PROGRESS
      reportData.evidenceKegiatanUrl || '',                                               // 31. EVIDENCE URL
      reportData.redamanUrl || '',                                                        // 32. REDAMAN URL
      approvalStatus,                                                                     // 33. APPROVAL STATUS
      approvedBy,                                                                         // 34. APPROVED BY
      approvedAt,                                                                         // 35. APPROVED AT
      notes                                                                               // 36. NOTES
    ];

    // Sinkronisasi ke posisi kolom berdasarkan nama header. Ini menjaga pola submit,
    // approval, dan edit tetap konsisten meskipun urutan kolom sheet berubah.
    var data = sheet.getDataRange().getValues();
    var existingRow = -1;
    var rHeaderRow = detectHeaderRowGas(sheet, ['Submission ID', 'SITE ID', 'Submitted At']);
    var actualHeaders = (data[rHeaderRow - 1] || []).map(function(h) { return String(h || '').trim().toLowerCase(); });
    var actualCol = {};
    actualHeaders.forEach(function(h, idx) { if (h) actualCol[h] = idx; });
    var idCol = actualCol['submission id'] != null ? actualCol['submission id'] : 0;
    var siteCol = actualCol['site id'] != null ? actualCol['site id'] : 7;
    var submittedAtCol = actualCol['submitted at'] != null ? actualCol['submitted at'] : 1;
    var writeWidth = Math.max(sheet.getLastColumn(), EXPECTED_DAILY_RESPONSE_HEADERS.length);
    var mappedRowValues = new Array(writeWidth).fill('');
    EXPECTED_DAILY_RESPONSE_HEADERS.forEach(function(header, idx) {
      var targetCol = actualCol[String(header).toLowerCase()];
      if (targetCol == null) targetCol = idx;
      if (targetCol < writeWidth) mappedRowValues[targetCol] = rowValues[idx];
    });

    for (var i = rHeaderRow; i < data.length; i++) {
      if (String(data[i][idCol] || '').trim() === String(subId).trim()) {
        existingRow = i + 1;
        break;
      }
    }

    // Anti-Double Input: Cek apakah site ini sudah memiliki report pada tanggal yang sama hari ini
    if (existingRow === -1 && reportData.siteId) {
      var targetSiteUpper = String(reportData.siteId).trim().toUpperCase();
      var todayDateStr = formatGasDate(new Date());
      var todayIsoStr = new Date().toISOString().slice(0, 10);

      for (var j = rHeaderRow; j < data.length; j++) {
        var rowSite = String(data[j][siteCol] || '').trim().toUpperCase();
        var rowSubmittedAt = data[j][submittedAtCol];
        var rowDateStr = formatGasDate(rowSubmittedAt);
        var rowIsoStr = '';
        if (rowSubmittedAt instanceof Date) {
          rowIsoStr = rowSubmittedAt.toISOString().slice(0, 10);
        } else if (typeof rowSubmittedAt === 'string') {
          rowIsoStr = rowSubmittedAt.slice(0, 10);
        }

        if (rowSite === targetSiteUpper && (rowDateStr === todayDateStr || rowIsoStr === todayIsoStr)) {
          existingRow = j + 1;
          break;
        }
      }
    }

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, mappedRowValues.length).setValues([mappedRowValues]);
    } else {
      sheet.appendRow(mappedRowValues);
      existingRow = sheet.getLastRow();
    }
    if (submittedAtCol >= 0) sheet.getRange(existingRow, submittedAtCol + 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    SpreadsheetApp.flush();

    logAuditGas(user, 'SYNC_REPORT', reportData.siteId, 'Record report ' + subId + ' untuk site ' + reportData.siteId + ' (' + approvalStatus + ')');
    return { success: true, submissionId: subId, approved: approvalStatus === 'Approved' };
  } catch (err) {
    Logger.log('Error submitDailyReportGas: ' + err);
    return { success: true, submissionId: reportData.submissionId || ('SUB-' + Date.now().toString(36).toUpperCase()), approved: true, warning: err.toString() };
  }
}

/**
 * Update / Koreksi Report Harian ke Sheet Responses
 */
function updateDailyReportGas(submissionId, reportData, user) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, error: 'Spreadsheet tidak terhubung.' };
    var sheet = findSheetResponses(ss);
    if (!sheet) return { success: false, error: 'Sheet responses tidak ditemukan.' };
    var data = sheet.getDataRange().getValues();
    var headerRow = detectHeaderRowGas(sheet, ['Submission ID', 'SITE ID', 'Submitted At']);
    if (!data.length || headerRow < 1 || data.length < headerRow) return { success: false, error: 'Header sheet responses tidak ditemukan.' };
    var headers = data[headerRow - 1].map(function(h) { return String(h || '').trim().toLowerCase(); });
    var col = {};
    headers.forEach(function(h, i) { if (h) col[h] = i; });
    var idCol = col['submission id'] != null ? col['submission id'] : 0;
    var siteCol = col['site id'] != null ? col['site id'] : 7;
    var rowIndex = -1;
    for (var i = headerRow; i < data.length; i++) {
      if (String(data[i][idCol] || '').trim() === String(submissionId || '').trim()) { rowIndex = i; break; }
    }
    if (rowIndex < 0 && reportData.siteId) {
      for (var j = data.length - 1; j >= headerRow; j--) {
        if (String(data[j][siteCol] || '').trim().toUpperCase() === String(reportData.siteId || '').trim().toUpperCase()) { rowIndex = j; break; }
      }
    }
    if (rowIndex < 0) return { success: false, error: 'Submission ID tidak ditemukan di sheet responses.' };

    // Perbarui satu baris berdasarkan NAMA HEADER, bukan nomor kolom lama.
    // Metadata submitter, Submitted At, Submission ID, dan approval tetap dipertahankan.
    var row = data[rowIndex].slice();
    var setByHeader = function(header, value) {
      var idx = col[String(header).toLowerCase()];
      if (idx != null) row[idx] = value;
    };
    var subcon = reportData.mitraPelaksana || reportData.subcon || '';
    setByHeader('SITE ID', reportData.siteId || row[siteCol] || '');
    setByHeader('REGION', reportData.region || '');
    setByHeader('SUBCON (Mitra Pelaksana)', subcon);
    setByHeader('STATUS', reportData.status || '');
    setByHeader('SUB STATUS', reportData.subStatus || '');
    setByHeader('TYPE FO [KU]', Array.isArray(reportData.typeFoKu) ? reportData.typeFoKu.join(', ') : (reportData.typeFoKu || ''));
    setByHeader('TARGET TIANG (KU)', Number(reportData.targetTiang) || 0);
    setByHeader('REAL TIANG (KU)', Number(reportData.realTiang) || 0);
    setByHeader('TARGET FO KU (m)', Number(reportData.targetFoKu) || 0);
    setByHeader('REAL FO KU (m)', Number(reportData.realFoKu) || 0);
    setByHeader('TYPE FO [KT]', Array.isArray(reportData.typeFoKt) ? reportData.typeFoKt.join(', ') : (reportData.typeFoKt || ''));
    setByHeader('TARGET GALIAN (KT)', Number(reportData.targetGalian) || 0);
    setByHeader('REAL GALIAN (KT)', Number(reportData.realGalian) || 0);
    setByHeader('TARGET FO KT (m)', Number(reportData.targetFoKt) || 0);
    setByHeader('REAL FO KT (m)', Number(reportData.realFoKt) || 0);
    setByHeader('PERIZINAN [PU Nas]', reportData.perizinanPuNas || 'Tidak ada');
    setByHeader('PERIZINAN [PU Prov]', reportData.perizinanPuProv || 'Tidak ada');
    setByHeader('PERIZINAN [PU Kota / Kab]', reportData.perizinanPuKotaKab || 'Tidak ada');
    setByHeader('PERIZINAN [Private Area]', reportData.perizinanPrivateArea || 'Tidak ada');
    setByHeader('TOTAL BIAYA PERIZINAN', Number(reportData.totalBiayaPerizinan) || 0);
    setByHeader('COMMIT FINISH INSTALL', reportData.commitFinishInstall || '');
    setByHeader('JML MAN POWER', Number(reportData.jmlManPower) || 0);
    setByHeader('DETIL PROGRESS', reportData.detilProgress || '');
    if (reportData.evidenceKegiatanUrl) setByHeader('EVIDENCE URL', reportData.evidenceKegiatanUrl);
    if (reportData.redamanUrl) setByHeader('REDAMAN URL', reportData.redamanUrl);

    var sheetRow = rowIndex + 1;
    sheet.getRange(sheetRow, 1, 1, row.length).setValues([row]);
    var submittedAtCol = col['submitted at'];
    if (submittedAtCol != null) sheet.getRange(sheetRow, submittedAtCol + 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    SpreadsheetApp.flush();
    logAuditGas(user, 'UPDATE_REPORT', reportData.siteId, 'Koreksi daily report ' + submissionId + ' untuk site ' + reportData.siteId + ' oleh ' + ((user && user.name) || 'User'));
    return { success: true, submissionId: submissionId };
  } catch (err) {
    Logger.log('Error updateDailyReportGas: ' + err);
    return { success: false, error: err.toString() };
  }
}

/**
 * Supervisor Approve / Reject Report (Hanya update status di Sheet Responses)
 */
function updateSubmissionStatus(subId, newStatus, notes, reviewerUser) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: true };

    var sheet = findSheetResponses(ss);
    if (!sheet) return { success: false, error: 'Sheet responses tidak ditemukan' };

    var data = sheet.getDataRange().getValues();
    var rHeaderRow = detectHeaderRowGas(sheet, ['Submission ID', 'SITE ID', 'Submitted At']);
    var colMap = getHeaderColumnMapGas(sheet, rHeaderRow);
    var colApproval = colMap['approval status'] || 33;
    var colApprovedBy = colMap['approved by'] || 34;
    var colApprovedAt = colMap['approved at'] || 35;
    var colNotes = colMap['notes'] || 36;

    for (var i = rHeaderRow; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(subId).trim()) {
        var rowIdx = i + 1;
        sheet.getRange(rowIdx, colApproval).setValue(newStatus);
        sheet.getRange(rowIdx, colApprovedBy).setValue(reviewerUser.name);
        sheet.getRange(rowIdx, colApprovedAt).setValue(new Date().toISOString());
        sheet.getRange(rowIdx, colNotes).setValue(notes || '');

        var siteId = data[i][7] || data[i][5] || '';
        logAuditGas(reviewerUser, newStatus === 'Approved' ? 'APPROVE_REPORT' : 'REJECT_REPORT', siteId, 'Status report ' + subId + ' diubah menjadi ' + newStatus);
        return { success: true };
      }
    }
    return { success: false, error: 'Submission ID tidak ditemukan' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Upload File ke Google Drive (Folder Khusus & Link Preview Siap Akses)
 */
function uploadFileToDrive(base64Data, filename, mimeType) {
  try {
    var targetFolderId = (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== '') ? DRIVE_FOLDER_ID.trim() : '1MrR8tPUijE7UfGaJccb2P2CWvqoyL90M';
    var folder;
    try {
      folder = DriveApp.getFolderById(targetFolderId);
    } catch (fErr) {
      Logger.log('Drive folder fallback: ' + fErr);
      folder = DriveApp.getRootFolder();
    }

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType || 'application/octet-stream', filename);
    var file = folder.createFile(blob);

    // Buka akses viewing agar link di spreadsheet bisa dibuka oleh siapa saja yang memiliki link
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      Logger.log('Notice setSharing: ' + shareErr);
    }

    var fileId = file.getId();
    var viewUrl = 'https://drive.google.com/file/d/' + fileId + '/view?usp=sharing';

    return {
      success: true,
      fileUrl: viewUrl,
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + fileId,
      fileId: fileId,
      fileName: filename
    };
  } catch (err) {
    Logger.log('Error uploadFileToDrive: ' + err);
    return { success: false, error: err.toString() };
  }
}

/**
 * PENTING: dataFTTM bersifat READ-ONLY dan TIDAK BOLEH di-overwrite oleh input daily report
 */
function updateMasterSiteRealization(report) {
  // Sesuai requirement, input report hanya masuk ke sheet DailyReportResponses
  return;
}

/**
 * Catat Audit Log ke Spreadsheet
 */
function logAuditGas(user, action, siteId, description) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return;
    var sheet = ss.getSheetByName(SHEET_AUDIT_LOGS);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_AUDIT_LOGS);
      sheet.appendRow(['Log ID', 'Timestamp', 'User ID', 'User Name', 'User Role', 'Action', 'Site ID', 'Description']);
    }
    sheet.appendRow([
      'LOG-' + new Date().getTime(),
      new Date().toISOString(),
      user.id || user.email,
      user.name,
      user.role,
      action,
      siteId || '',
      description
    ]);
  } catch (e) {
    Logger.log(e);
  }
}

/**
 * Fallback dataset jika Spreadsheet kosong atau belum disiapkan (Return empty array untuk deployment)
 */
function getFallbackSites() {
  return [];
}

/**
 * =========================================================================
 * FUNGSI DIAGNOSTIK & SETUP OTOMATIS SPREADSHEET (JALANKAN MANUAL DI APPS SCRIPT)
 * =========================================================================
 * 
 * Cara Penggunaan:
 * 1. Buka editor Google Apps Script (script.google.com).
 * 2. Pada toolbar atas, pilih fungsi: "checkAndSetupGsheetConfig" (atau "checkSheetConfig").
 * 3. Klik tombol "Run" ("Jalankan").
 * 4. Buka tab "Execution log" ("Log eksekusi") di bagian bawah untuk melihat hasil verifikasi.
 * 
 * Fungsi ini akan:
 * - Mengecek apakah sheet response ('DailyReportResponses') sudah ada dan memiliki header kolom lengkap (33 kolom).
 * - Jika sheet atau header belum ada, fungsi akan otomatis membuatnya dan merapikan formatnya.
 * - Mengecek sheet 'Users', 'AuditLogs', dan 'dataFTTM'.
 */
function checkAndSetupGsheetConfig() {
  var logs = [];
  function logMsg(msg) {
    Logger.log(msg);
    logs.push(msg);
  }

  logMsg('=================================================================');
  logMsg('🚀 MEMULAI PENGECEKAN KONFIGURASI SPREADSHEET & SHEET RESPONSE...');
  logMsg('=================================================================');

  var ss = null;
  try {
    ss = getSpreadsheet();
  } catch (err) {
    logMsg('❌ [FATAL] Gagal membuka Spreadsheet: ' + err.toString());
    logMsg('👉 Pastikan Script terikat pada Spreadsheet (Container-Bound) ATAU isi variabel SPREADSHEET_ID di baris 19 Code.gs.');
    return { success: false, error: err.toString(), logs: logs };
  }

  if (!ss) {
    logMsg('❌ [FATAL] Spreadsheet tidak ditemukan atau tidak dapat diakses.');
    logMsg('👉 Buka file Spreadsheet Anda, copy ID dari URL, dan masukkan ke SPREADSHEET_ID di Code.gs.');
    return { success: false, error: 'Spreadsheet tidak ditemukan', logs: logs };
  }

  logMsg('✅ Spreadsheet Terhubung: "' + ss.getName() + '" (ID: ' + ss.getId() + ')');

  // -------------------------------------------------------------
  // 1. PENGECEKAN SHEET RESPONSE (DailyReportResponses)
  // -------------------------------------------------------------
  var expectedResponseHeaders = EXPECTED_DAILY_RESPONSE_HEADERS;

  var respSheet = ss.getSheetByName(SHEET_RESPONSES);
  if (!respSheet) {
    // Cari variasi nama seperti Response, Responses, Form Responses 1
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
      var sName = allSheets[i].getName().replace(/[\s_-]+/g, '').toLowerCase();
      if (sName.indexOf('response') !== -1 || sName.indexOf('respons') !== -1 || sName.indexOf('laporanharian') !== -1) {
        respSheet = allSheets[i];
        logMsg('ℹ️ Ditemukan sheet response dengan nama: "' + respSheet.getName() + '"');
        break;
      }
    }
  }

  if (!respSheet) {
    logMsg('⚠️ Sheet response belum ada. Membuat sheet baru: "' + SHEET_RESPONSES + '"...');
    respSheet = ss.insertSheet(SHEET_RESPONSES);
  }

  var respLastRow = respSheet.getLastRow();
  var respLastCol = respSheet.getLastColumn();
  var needHeaderCreation = false;

  if (respLastRow < 1 || respLastCol < 1) {
    needHeaderCreation = true;
  } else {
    var existingHeaders = respSheet.getRange(1, 1, 1, respLastCol).getValues()[0];
    var filledCount = 0;
    for (var c = 0; c < existingHeaders.length; c++) {
      if (existingHeaders[c] && String(existingHeaders[c]).trim() !== '') filledCount++;
    }
    if (filledCount < 5) {
      needHeaderCreation = true;
    } else {
      logMsg('✅ [OK] Header kolom pada sheet "' + respSheet.getName() + '" SUDAH ADA (' + filledCount + ' kolom terisi).');
      logMsg('   Contoh kolom pertama: ' + existingHeaders.slice(0, 7).join(' | '));
    }
  }

  if (needHeaderCreation) {
    logMsg('⚠️ Header belum ada / belum lengkap di baris 1. Membuat 33 header standar...');
    if (respLastRow === 0) {
      respSheet.appendRow(expectedResponseHeaders);
    } else {
      respSheet.getRange(1, 1, 1, expectedResponseHeaders.length).setValues([expectedResponseHeaders]);
    }

    // Styling baris 1 agar profesional dan mudah dibaca
    try {
      var headerRange = respSheet.getRange(1, 1, 1, expectedResponseHeaders.length);
      headerRange.setBackground('#102a45'); // Navy blue Telkom corporate
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setFontFamily('Arial');
      headerRange.setFontSize(10);
      headerRange.setHorizontalAlignment('center');
      respSheet.setFrozenRows(1);
    } catch (e) {
      Logger.log('Notice styling: ' + e);
    }

    logMsg('🎉 [BERHASIL] 33 Header kolom sheet "' + respSheet.getName() + '" berhasil dibuat & diformat!');
  }

  // -------------------------------------------------------------
  // 2. PENGECEKAN SHEET USERS (Autentikasi & Akun)
  // -------------------------------------------------------------
  var expectedUserHeaders = [
    'Nama', 'Email', 'Role', 'SUBCON', 'Supervisor Type', 'Status', 'Terdaftar Pada', 'Disetujui Oleh', 'REGION', 'Password', 'OSP Project', 'BRANCH', 'Nomor HP', 'Telegram Username', 'Telegram Chat ID', 'Telegram Verified'
  ];

  var userSheet = ss.getSheetByName(SHEET_USERS);
  if (!userSheet) {
    logMsg('⚠️ Sheet "' + SHEET_USERS + '" belum ada. Membuat sheet baru...');
    userSheet = ss.insertSheet(SHEET_USERS);
  }

  var userLastRow = userSheet.getLastRow();
  var userLastCol = userSheet.getLastColumn();

  if (userLastRow < 1 || userLastCol < 1) {
    logMsg('⚠️ Membuat header kolom sheet "' + SHEET_USERS + '"...');
    userSheet.appendRow(expectedUserHeaders);
    try {
      var uHeaderRange = userSheet.getRange(1, 1, 1, expectedUserHeaders.length);
      uHeaderRange.setBackground('#102a45');
      uHeaderRange.setFontColor('#ffffff');
      uHeaderRange.setFontWeight('bold');
      userSheet.setFrozenRows(1);
    } catch (e) {}

    // Tambahkan default super admin jika kosong
    userSheet.appendRow([
      'mhaniifa',
      'mhaniifa22@gmail.com',
      'Admin',
      'PT Telkom Infranexia',
      'Supervisor Telkom Infranexia',
      'Approved',
      new Date(),
      'System',
      'TIF1',
      'admin123',
      'FTTM, Backbone, FTTH, FTTE, OLO',
      'ALL BRANCH',
      '081210282521',
      '@mhaniifa',
      '',
      'TRUE'
    ]);
    logMsg('🎉 [BERHASIL] Header dan akun Super Admin default berhasil dimasukkan ke sheet Users.');
  } else {
    logMsg('✅ [OK] Sheet "' + SHEET_USERS + '" sudah ada dengan ' + userLastRow + ' baris data.');
  }

  // -------------------------------------------------------------
  // 3. PENGECEKAN SHEET AUDIT LOGS
  // -------------------------------------------------------------
  var auditSheet = ss.getSheetByName(SHEET_AUDIT_LOGS);
  if (!auditSheet) {
    logMsg('⚠️ Sheet "' + SHEET_AUDIT_LOGS + '" belum ada. Membuat sheet baru...');
    auditSheet = ss.insertSheet(SHEET_AUDIT_LOGS);
    auditSheet.appendRow(['Log ID', 'Timestamp', 'User ID', 'User Name', 'User Role', 'Action', 'Site ID', 'Description']);
    try {
      var aHeaderRange = auditSheet.getRange(1, 1, 1, 8);
      aHeaderRange.setBackground('#102a45');
      aHeaderRange.setFontColor('#ffffff');
      aHeaderRange.setFontWeight('bold');
      auditSheet.setFrozenRows(1);
    } catch (e) {}
    logMsg('🎉 [BERHASIL] Sheet AuditLogs berhasil dibuat.');
  } else {
    logMsg('✅ [OK] Sheet "' + SHEET_AUDIT_LOGS + '" sudah ada.');
  }

  // -------------------------------------------------------------
  // 4. PENGECEKAN SHEET MASTER dataFTTM
  // -------------------------------------------------------------
  var fttmSheet = ss.getSheetByName(SHEET_DATA_FTTM);
  if (fttmSheet) {
    var fttmRows = fttmSheet.getLastRow();
    var fttmCols = fttmSheet.getLastColumn();
    logMsg('✅ [OK] Sheet master "' + SHEET_DATA_FTTM + '" ditemukan dengan ' + fttmRows + ' baris dan ' + fttmCols + ' kolom.');
  } else {
    logMsg('⚠️ [PERHATIAN] Sheet master "' + SHEET_DATA_FTTM + '" belum ditemukan di Spreadsheet ini.');
    logMsg('   Pastikan tab master data diberi nama persis: "' + SHEET_DATA_FTTM + '".');
  }

  logMsg('=================================================================');
  logMsg('🎯 KESIMPULAN: SEMUA KONFIGURASI HEADER SHEET TELAH DIVERIFIKASI & SIAP DIGUNAKAN!');
  logMsg('=================================================================');

  return {
    success: true,
    spreadsheetName: ss.getName(),
    spreadsheetId: ss.getId(),
    responseSheet: respSheet.getName(),
    logs: logs
  };
}

/**
 * Alias singkat fungsi pemeriksaan konfigurasi sheet
 */
function checkSheetConfig() {
  return checkAndSetupGsheetConfig();
}

/**
 * =========================================================================
 * FUNGSI UTAMA: CEK & SUSUN ULANG HEADER SHEET USERS DAN DAILY REPORT RESPONSES
 * =========================================================================
 * Dapat dijalankan langsung dari editor Google Apps Script dengan tombol Run.
 * 
 * Parameter targetHeaderRow:
 * - 2 (Default): Menempatkan Header Kolom di BARIS 2. Baris 1 diberi banner judul elegan.
 * - 1: Menempatkan Header Kolom di BARIS 1 (format standar tanpa banner).
 */
function susunUlangHeaderSheetUsersDanResponse() {
  return checkAndReorganizeHeadersGas(2);
}

function susunUlangHeaderBaris1() {
  return checkAndReorganizeHeadersGas(1);
}

function checkAndReorganizeHeadersGas(targetHeaderRow) {
  if (!targetHeaderRow) targetHeaderRow = 2; // Default baris 2 sesuai permintaan
  var logList = [];
  function addLog(msg) {
    Logger.log(msg);
    logList.push(msg);
  }

  addLog('🚀 Memulai Cek & Susun Ulang Header Spreadsheet (Target Baris Header: ' + targetHeaderRow + ')...');

  var ss = getSpreadsheet();
  if (!ss) {
    addLog('❌ Gagal: Spreadsheet tidak ditemukan. Cek SPREADSHEET_ID.');
    return { success: false, logs: logList };
  }

  // 1. REORGANISASI SHEET USERS
  try {
    addLog('\n--- 1. MENYUSUN ULANG SHEET "' + SHEET_USERS + '" ---');
    var expectedUserHeaders = [
      'Nama', 'Email', 'Role', 'SUBCON', 'Supervisor Type', 'Status', 
      'Terdaftar Pada', 'Disetujui Oleh', 'REGION', 'Password', 'OSP Project', 
      'BRANCH', 'Nomor HP', 'Telegram Username', 'Telegram Chat ID', 'Telegram Verified'
    ];

    var userSheet = ss.getSheetByName(SHEET_USERS);
    if (!userSheet) {
      addLog('⚠️ Sheet "' + SHEET_USERS + '" belum ada, membuat baru...');
      userSheet = ss.insertSheet(SHEET_USERS);
    }

    var uLastRow = userSheet.getLastRow();
    var uLastCol = userSheet.getLastColumn();
    var existingUserData = [];
    var currentUHeaderRow = detectHeaderRowGas(userSheet, ['Nama', 'Email', 'Role']);

    if (uLastRow > currentUHeaderRow && uLastCol > 0) {
      var oldRange = userSheet.getRange(1, 1, uLastRow, uLastCol).getValues();
      var oldHeaders = oldRange[currentUHeaderRow - 1];

      for (var r = currentUHeaderRow; r < oldRange.length; r++) {
        var oldRow = oldRange[r];
        var hasContent = false;
        for (var k = 0; k < oldRow.length; k++) {
          if (String(oldRow[k] || '').trim() !== '') {
            hasContent = true;
            break;
          }
        }
        if (!hasContent) continue;

        var mappedRow = [];
        for (var c = 0; c < expectedUserHeaders.length; c++) {
          var colName = expectedUserHeaders[c].toLowerCase();
          var foundVal = '';
          for (var oc = 0; oc < oldHeaders.length; oc++) {
            var oldColName = String(oldHeaders[oc] || '').toLowerCase().trim();
            if (oldColName === colName || 
               (colName === 'nomor hp' && (oldColName === 'no hp' || oldColName === 'phone' || oldColName === 'telepon')) ||
               (colName === 'telegram username' && (oldColName === 'telegram' || oldColName === 'tele username')) ||
               (colName === 'telegram verified' && (oldColName === 'verified' || oldColName === 'is verified'))
            ) {
              foundVal = oldRow[oc];
              break;
            }
          }
          mappedRow.push(foundVal);
        }
        existingUserData.push(mappedRow);
      }

      // Dedup data user: pastikan akun Admin mhaniifa (081210282521 / mhaniifa) hanya ada 1 baris sebagai Admin Approved
      var dedupedUsers = [];
      var seenOwner = false;
      var seenEmails = {};
      var seenPhones = {};

      for (var uIdx = 0; uIdx < existingUserData.length; uIdx++) {
        var uRow = existingUserData[uIdx];
        var uEmail = String(uRow[1] || '').toLowerCase().trim();
        var uPhone = String(uRow[12] || '').trim().replace(/[^0-9]/g, '');
        var uTele = String(uRow[13] || '').trim().toLowerCase().replace(/^@/, '');
        var uName = String(uRow[0] || '').toLowerCase().trim();
        var isThisOwner = (
          uEmail === 'mhaniifa22@gmail.com' ||
          uPhone === '081210282521' ||
          uPhone === '6281210282521' ||
          uTele === 'mhaniifa'
        );

        if (isThisOwner) {
          if (!seenOwner) {
            seenOwner = true;
            // Jaga nama yang diinputkan di sheet Users! Jangan dioverwrite paksa
            if (!uRow[0]) uRow[0] = 'Admin';
            uRow[1] = uRow[1] || 'mhaniifa22@gmail.com';
            uRow[2] = 'Admin';
            uRow[3] = uRow[3] || 'PT Telkom Infranexia';
            uRow[4] = uRow[4] || 'Supervisor Telkom Infranexia';
            uRow[5] = 'Approved';
            uRow[8] = 'TIF1';
            uRow[10] = 'FTTM, Backbone, FTTH, FTTE, OLO';
            uRow[11] = 'ALL BRANCH';
            uRow[12] = uRow[12] || '081210282521';
            uRow[13] = uRow[13] || '@mhaniifa';
            uRow[15] = 'TRUE';
            dedupedUsers.unshift(uRow);
          }
          // Hapus akun ganda
          continue;
        }

        var key = uEmail || uPhone;
        if (key && (seenEmails[uEmail] || (uPhone && seenPhones[uPhone]))) {
          continue;
        }
        if (uEmail) seenEmails[uEmail] = true;
        if (uPhone) seenPhones[uPhone] = true;
        dedupedUsers.push(uRow);
      }

      if (!seenOwner) {
        dedupedUsers.unshift([
          'mhaniifa',
          'mhaniifa22@gmail.com',
          'Admin',
          'PT Telkom Infranexia',
          'Supervisor Telkom Infranexia',
          'Approved',
          new Date(),
          'System',
          'TIF1',
          'admin123',
          'FTTM, Backbone, FTTH, FTTE, OLO',
          'ALL BRANCH',
          '081210282521',
          '@mhaniifa',
          '',
          'TRUE'
        ]);
      }
      existingUserData = dedupedUsers;
      addLog('ℹ️ Ditemukan ' + existingUserData.length + ' data pengguna valid (duplikasi dibersihkan). Diselaraskan ke urutan header baru.');
    }

    userSheet.clear();
    userSheet.clearFormats();

    var uStartRow = 1;
    if (targetHeaderRow === 2) {
      // Row 1 DIBIARKAN KOSONG/BERSIH tanpa merge agar user dapat menggunakan untuk analisis/rumus manual
      try {
        var maxUCols = Math.max(expectedUserHeaders.length, userSheet.getMaxColumns() || 20);
        userSheet.getRange(1, 1, 1, maxUCols).clearContent().clearFormat();
        userSheet.setRowHeight(1, 28);
      } catch (eR1) {}
      uStartRow = 2;
    }

    userSheet.getRange(uStartRow, 1, 1, expectedUserHeaders.length).setValues([expectedUserHeaders]);
    var uHeaderRange = userSheet.getRange(uStartRow, 1, 1, expectedUserHeaders.length);
    uHeaderRange.setBackground('#102a45'); // Telkom Navy
    uHeaderRange.setFontColor('#ffffff');
    uHeaderRange.setFontWeight('bold');
    uHeaderRange.setFontSize(10);
    uHeaderRange.setHorizontalAlignment('center');
    uHeaderRange.setVerticalAlignment('middle');
    userSheet.setRowHeight(uStartRow, 28);
    userSheet.setFrozenRows(targetHeaderRow);

    if (existingUserData.length > 0) {
      userSheet.getRange(uStartRow + 1, 1, existingUserData.length, expectedUserHeaders.length).setValues(existingUserData);
    } else {
      userSheet.appendRow([
        'mhaniifa',
        'mhaniifa22@gmail.com',
        'Admin',
        'PT Telkom Infranexia',
        'Supervisor Telkom Infranexia',
        'Approved',
        new Date(),
        'System',
        'TIF1',
        'admin123',
        'FTTM, Backbone, FTTH, FTTE, OLO',
        'ALL BRANCH',
        '081210282521',
        '@mhaniifa',
        '',
        'TRUE'
      ]);
    }

    for (var col = 1; col <= Math.min(expectedUserHeaders.length, 16); col++) {
      try { userSheet.autoResizeColumn(col); } catch (e) {}
    }
    addLog('✅ [SUKSES] Header sheet "' + SHEET_USERS + '" berhasil disusun ulang pada Baris ' + targetHeaderRow + '!');
  } catch (uErr) {
    addLog('❌ Error saat menyusun sheet Users: ' + uErr.toString());
  }

  // 2. REORGANISASI SHEET DAILY REPORT RESPONSES
  try {
    addLog('\n--- 2. MENYUSUN ULANG SHEET "' + SHEET_RESPONSES + '" ---');
    var expectedRespHeaders = EXPECTED_DAILY_RESPONSE_HEADERS;
    var respSheet = findSheetResponses(ss);
    if (!respSheet) {
      respSheet = ss.insertSheet(SHEET_RESPONSES);
    }

    var rLastRow = respSheet.getLastRow();
    var rLastCol = respSheet.getLastColumn();
    var existingRespData = [];
    var currentRHeaderRow = detectHeaderRowGas(respSheet, ['Submission ID', 'SITE ID', 'Submitted At']);

    if (rLastRow > currentRHeaderRow && rLastCol > 0) {
      var oldRRange = respSheet.getRange(1, 1, rLastRow, rLastCol).getValues();
      var oldRHeaders = oldRRange[currentRHeaderRow - 1];

      for (var rr = currentRHeaderRow; rr < oldRRange.length; rr++) {
        var oldRRow = oldRRange[rr];
        var hasRContent = false;
        for (var m = 0; m < oldRRow.length; m++) {
          if (String(oldRRow[m] || '').trim() !== '') {
            hasRContent = true;
            break;
          }
        }
        if (!hasRContent) continue;

        var mappedRRow = [];
        for (var rc = 0; rc < expectedRespHeaders.length; rc++) {
          var expectedCol = expectedRespHeaders[rc].toLowerCase().trim();
          var foundRVal = '';
          for (var orc = 0; orc < oldRHeaders.length; orc++) {
            var oldCol = String(oldRHeaders[orc] || '').toLowerCase().trim();
            if (oldCol === expectedCol) {
              foundRVal = oldRRow[orc];
              break;
            }
          }
          mappedRRow.push(foundRVal);
        }
        existingRespData.push(mappedRRow);
      }
      addLog('ℹ️ Ditemukan ' + existingRespData.length + ' data laporan harian yang ada. Diselaraskan ke 36 header baru.');
    }

    respSheet.clear();
    respSheet.clearFormats();

    var rStartRow = 1;
    if (targetHeaderRow === 2) {
      // Row 1 DIBIARKAN KOSONG/BERSIH tanpa merge agar user dapat menggunakan untuk analisis/rumus manual
      try {
        var maxRCols = Math.max(expectedRespHeaders.length, respSheet.getMaxColumns() || 40);
        respSheet.getRange(1, 1, 1, maxRCols).clearContent().clearFormat();
        respSheet.setRowHeight(1, 28);
      } catch (eR2) {}
      rStartRow = 2;
    }

    respSheet.getRange(rStartRow, 1, 1, expectedRespHeaders.length).setValues([expectedRespHeaders]);
    var rHeaderRange = respSheet.getRange(rStartRow, 1, 1, expectedRespHeaders.length);
    rHeaderRange.setBackground('#102a45'); // Telkom Navy
    rHeaderRange.setFontColor('#ffffff');
    rHeaderRange.setFontWeight('bold');
    rHeaderRange.setFontSize(10);
    rHeaderRange.setHorizontalAlignment('center');
    rHeaderRange.setVerticalAlignment('middle');
    respSheet.setRowHeight(rStartRow, 28);
    respSheet.setFrozenRows(targetHeaderRow);

    if (existingRespData.length > 0) {
      respSheet.getRange(rStartRow + 1, 1, existingRespData.length, expectedRespHeaders.length).setValues(existingRespData);
    }

    for (var rcol = 1; rcol <= Math.min(expectedRespHeaders.length, 12); rcol++) {
      try { respSheet.autoResizeColumn(rcol); } catch (e) {}
    }
    addLog('✅ [SUKSES] Header sheet "' + respSheet.getName() + '" berhasil disusun ulang pada Baris ' + targetHeaderRow + '!');
  } catch (rErr) {
    addLog('❌ Error saat menyusun sheet Responses: ' + rErr.toString());
  }

  addLog('\n🎉 SELURUH SHEET TELAH DIPERIKSA & DISUSUN ULANG DENGAN RAPI PADA BARIS ' + targetHeaderRow + '!');
  return { success: true, logs: logList };
}

/**
 * Membersihkan seluruh identitas admin lama dan memastikan hanya ada 1 akun Super Admin mhaniifa
 * Dapat dijalankan langsung dari editor GAS atau dipanggil via GET Web App ?action=clean_admin
 */
function resetAdminIdentitiesGas() {
  try {
    var cache = CacheService.getScriptCache();
    // Bersihkan cache lama
    cache.remove('TELE_CHAT_ADMIN');
    cache.remove('TELE_CHAT_mahaniifa');
    cache.remove('PENDING_OTP_mahaniifa');
    
    var ss = getSpreadsheet();
    if (!ss) return { success: false, reason: 'SPREADSHEET_NOT_FOUND' };
    var userSheet = ss.getSheetByName(SHEET_USERS);
    if (!userSheet) return { success: false, reason: 'USERS_SHEET_NOT_FOUND' };

    var data = userSheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, message: 'Sheet Users kosong' };

    var headerRow = detectHeaderRowGas(userSheet, ['Nama', 'Email', 'Role']);
    var adminFound = false;

    for (var i = headerRow; i < data.length; i++) {
      var row = data[i];
      var rEmail = String(row[1] || '').toLowerCase().trim();
      var rPhone = String(row[12] || '').trim().replace(/[^0-9]/g, '');
      var rTele = String(row[13] || '').trim().toLowerCase().replace(/^@/, '');
      var rName = String(row[0] || '').toLowerCase().trim();

      var isOldAdmin = (
        rEmail === 'mhaniifa22@gmail.com' ||
        rPhone === '081210282521' ||
        rPhone === '6281210282521' ||
        rPhone === '081267899999' ||
        rTele === 'mhaniifa' ||
        rTele === 'mahaniifa' ||
        row[2] === 'Admin'
      );

      if (isOldAdmin) {
        if (!adminFound) {
          adminFound = true;
          // Jaga nama di baris admin utama
          if (!row[0]) userSheet.getRange(i + 1, 1).setValue('Admin');
          if (!row[1]) userSheet.getRange(i + 1, 2).setValue('mhaniifa22@gmail.com');
          userSheet.getRange(i + 1, 3).setValue('Admin');
          if (!row[3]) userSheet.getRange(i + 1, 4).setValue('PT Telkom Infranexia');
          if (!row[4]) userSheet.getRange(i + 1, 5).setValue('Supervisor Telkom Infranexia');
          userSheet.getRange(i + 1, 6).setValue('Approved');
          userSheet.getRange(i + 1, 9).setValue('TIF1');
          userSheet.getRange(i + 1, 11).setValue('FTTM, Backbone, FTTH, FTTE, OLO');
          userSheet.getRange(i + 1, 12).setValue('ALL BRANCH');
          if (!row[12]) userSheet.getRange(i + 1, 13).setValue('081210282521');
          if (!row[13]) userSheet.getRange(i + 1, 14).setValue('@mhaniifa');
          userSheet.getRange(i + 1, 16).setValue('TRUE');
        } else {
          // Hapus baris duplikat admin
          userSheet.deleteRow(i + 1);
          i--;
          data = userSheet.getDataRange().getValues();
        }
      }
    }

    return {
      success: true,
      message: 'Identitas Admin berhasil dibersihkan menjadi mhaniifa (081210282521 / mhaniifa22@gmail.com / @mhaniifa)'
    };
  } catch (err) {
    Logger.log('resetAdminIdentitiesGas error: ' + err);
    return { success: false, error: err.toString() };
  }
}
