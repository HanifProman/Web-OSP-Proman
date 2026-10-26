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
  var lastCol = sheet.getLastColumn();
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
  var avatar = role === 'Admin'
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

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
            var userHeaderMap = getHeaderColumnMapGas(userSheet, detectHeaderRowGas(userSheet, ['Nama', 'Email', 'Role']));
            var avatarCol = userHeaderMap['avatar url'] || userHeaderMap['avatar'] || userHeaderMap['foto profil'];
            if (avatarCol && data[i][avatarCol - 1]) avatar = String(data[i][avatarCol - 1]);
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
    avatar: avatar
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
    var uHeaderRow = detectHeaderRowGas(userSheet, ['Nama', 'Email', 'Role']);
    var userHeaderMap = getHeaderColumnMapGas(userSheet, uHeaderRow);
    var avatarCol = userHeaderMap['avatar url'] || userHeaderMap['avatar'] || userHeaderMap['foto profil'];
    if (!avatarCol) {
      avatarCol = userSheet.getLastColumn() + 1;
      userSheet.getRange(uHeaderRow, avatarCol).setValue('Avatar URL');
      userHeaderMap['avatar url'] = avatarCol;
    }
    var email = String(userData.email || '').toLowerCase().trim();
    var phone = String(userData.phoneNumber || '').trim();
    var normalizedPhone = normalizeUserPhoneGas_(phone);
    var rowFound = -1;
    var existingPassword = '';
    var existingAccess = '';
    var existingBranch = '';
    var existingStatus = '';
    var existingRegisteredAt = '';

    for (var i = uHeaderRow; i < data.length; i++) {
      var rowEmail = String(data[i][1] || '').toLowerCase().trim();
      var rowPhone = String(data[i][12] || '').trim();
      var normalizedRowPhone = normalizeUserPhoneGas_(rowPhone);
      if ((email && rowEmail === email) || (normalizedPhone && normalizedRowPhone && normalizedRowPhone === normalizedPhone)) {
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
    var phoneVal = userData.phoneNumber || (rowFound > 0 ? String(data[rowFound - 1][12] || '') : '');
    var teleUserVal = userData.telegramUsername || (rowFound > 0 ? String(data[rowFound - 1][13] || '') : '');
    var teleChatIdVal = userData.telegramChatId || (rowFound > 0 ? String(data[rowFound - 1][14] || '') : '');
    var existingVerified = rowFound > 0 ? String(data[rowFound - 1][15] || '').toUpperCase() === 'TRUE' : false;
    var teleVerifiedVal = (userData.isTelegramVerified || existingVerified) ? 'TRUE' : 'FALSE';

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
      rowFound = userSheet.getLastRow();
    }
    // Foto profil disimpan di kolom terpisah dan dipertahankan jika payload update tidak menyertakan avatar.
    if (userData.avatar) {
      var avatarValue = String(userData.avatar).trim();
      if (avatarValue.length > 45000) return { success: false, message: 'Data foto profil terlalu besar. Coba pilih foto lain yang lebih kecil.' };
      if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(avatarValue) || /^https?:\/\//i.test(avatarValue)) {
        userSheet.getRange(rowFound, avatarCol).setValue(avatarValue);
      } else {
        return { success: false, message: 'Format foto profil tidak valid.' };
      }
    }
    return { success: true, avatar: userData.avatar || (rowFound > 0 ? userSheet.getRange(rowFound, avatarCol).getValue() : '') };
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
    // Chat ID placeholder ("tg-...") dari client tidak boleh tersimpan; pakai Chat ID asli dari bot bila sudah /start.
    userData.telegramChatId = resolveTelegramChatIdGas_(userData);
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

/** Escape teks agar aman dipakai pada pesan Telegram parse_mode HTML. */
function escapeTelegramHtml_(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Chat ID Telegram yang valid hanya berupa angka (boleh diawali minus untuk grup). */
function isRealTelegramChatIdGas_(value) {
  return /^-?\d+$/.test(String(value == null ? '' : value).trim());
}

/**
 * Mencari Chat ID Telegram yang VALID untuk sebuah user.
 * Urutan: kolom Telegram Chat ID di sheet Users (abaikan placeholder "tg-..."),
 * lalu cache/properties yang diisi webhook saat user menekan /start atau mengirim pesan ke bot.
 */
function resolveTelegramChatIdGas_(user) {
  try {
    var direct = String((user && user.telegramChatId) || '').trim();
    if (isRealTelegramChatIdGas_(direct)) return direct;
    var tele = String((user && user.telegramUsername) || '').replace(/^@/, '').toLowerCase().trim();
    var phone = normalizeUserPhoneGas_((user && user.phoneNumber) || '');
    var cache = CacheService.getScriptCache();
    var props = PropertiesService.getScriptProperties();
    var candidates = [];
    if (tele) { candidates.push(cache.get('TELE_CHAT_' + tele)); candidates.push(props.getProperty('TELE_CHAT_' + tele)); }
    if (phone) { candidates.push(cache.get('TELE_CHAT_PHONE_' + phone)); candidates.push(props.getProperty('TELE_CHAT_PHONE_' + phone)); }
    for (var i = 0; i < candidates.length; i++) {
      if (isRealTelegramChatIdGas_(candidates[i])) return String(candidates[i]).trim();
    }
  } catch (err) {
    Logger.log('resolveTelegramChatIdGas_ error: ' + err);
  }
  return '';
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
    var headers = (data[uHeaderRow - 1] || []).map(function(h) { return String(h || '').trim().toLowerCase(); });
    var col = {};
    headers.forEach(function(h, idx) { if (h) col[h] = idx; });
    function ix(names, fallback) {
      for (var ni = 0; ni < names.length; ni++) {
        var found = col[String(names[ni]).toLowerCase()];
        if (found != null) return found;
      }
      return fallback;
    }
    var c = {
      name: ix(['nama', 'name', 'nama lengkap'], 0),
      email: ix(['email', 'email address'], 1),
      role: ix(['role', 'peran'], 2),
      subcon: ix(['subcon', 'mitra', 'mitra pelaksana'], 3),
      supervisorType: ix(['supervisor type', 'supervisortype', 'tipe supervisor', 'jenis supervisor'], 4),
      status: ix(['status', 'approval status'], 5),
      registeredAt: ix(['registered at', 'tanggal registrasi', 'registeredat', 'terdaftar pada'], 6),
      approvedBy: ix(['approved by', 'disetujui oleh'], 7),
      region: ix(['region', 'regional'], 8),
      password: ix(['password'], 9),
      accessProjects: ix(['access projects', 'accessprojects', 'akses project', 'akses proyek', 'osp project'], 10),
      branch: ix(['branch', 'cabang'], 11),
      phone: ix(['phone', 'phone number', 'nomor hp', 'no hp', 'nomor handphone'], 12),
      telegram: ix(['telegram username', 'telegram', 'username telegram'], 13),
      chatId: ix(['telegram chat id', 'telegramchatid', 'chat id'], 14),
      telegramVerified: ix(['telegram verified', 'istelegramverified', 'telegram verified?'], 15),
      avatar: ix(['avatar url', 'avatar', 'foto profil', 'profile photo'], -1)
    };
    function cell(row, key) { return row[c[key]] == null ? '' : row[c[key]]; }
    var list = [];
    for (var i = uHeaderRow; i < data.length; i++) {
      var row = data[i];
      if (!cell(row, 'name') && !cell(row, 'email') && !cell(row, 'phone')) continue;
      var accessProjRaw = String(cell(row, 'accessProjects') || 'FTTM');
      var accessProjects = accessProjRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
      if (accessProjects.length === 0) accessProjects = ['FTTM'];

      var rEmail = String(cell(row, 'email') || '').toLowerCase().trim();
      var rPhone = String(cell(row, 'phone') || '').trim().replace(/[^0-9]/g, '');
      var rTele = String(cell(row, 'telegram') || '').trim().toLowerCase().replace(/^@/, '');
      var isOwnerRow = (
        rEmail === 'mhaniifa22@gmail.com' ||
        rPhone === '081210282521' || rPhone === '6281210282521' ||
        rTele === 'mhaniifa'
      );
      var uRole = isOwnerRow ? 'Admin' : String(cell(row, 'role') || 'Tim Lapangan').trim();
      var rawStatus = String(cell(row, 'status') || 'Approved').trim();
      var normalizedStatusKey = rawStatus.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
      var canonicalStatus = normalizedStatusKey === 'pending' ||
                            normalizedStatusKey === 'pending approval' ||
                            normalizedStatusKey === 'waiting approval' ||
                            normalizedStatusKey === 'menunggu persetujuan' ||
                            normalizedStatusKey === 'menunggu approval'
        ? 'Pending Approval'
        : (normalizedStatusKey === 'approved' || normalizedStatusKey === 'approve' || normalizedStatusKey === 'disetujui'
            ? 'Approved'
            : (rawStatus || 'Pending Approval'));
      var uStatus = isOwnerRow ? 'Approved' : canonicalStatus;
      var uName = String(cell(row, 'name') || '').trim();
      if (!uName && isOwnerRow) uName = 'Admin';
      var uTele = String(cell(row, 'telegram') || '').trim();
      if (!uTele && isOwnerRow) uTele = '@mhaniifa';
      var uPhoneDisplay = String(cell(row, 'phone') || '').trim();
      if (!uPhoneDisplay && isOwnerRow) uPhoneDisplay = '081210282521';
      list.push({
        id: 'usr-gas-' + i,
        name: uName,
        email: String(cell(row, 'email') || (isOwnerRow ? 'mhaniifa22@gmail.com' : '')),
        role: uRole,
        subcon: String(cell(row, 'subcon') || (isOwnerRow ? 'PT Telkom Infranexia' : '')),
        supervisorType: String(cell(row, 'supervisorType') || (isOwnerRow ? 'Supervisor Telkom Infranexia' : '')).trim(),
        status: uStatus,
        registeredAt: formatGasDate(cell(row, 'registeredAt')) || '2026-03-01',
        approvedBy: String(cell(row, 'approvedBy') || (isOwnerRow ? 'System' : '')),
        region: String(cell(row, 'region') || (isOwnerRow ? 'TIF1' : '')),
        password: String(cell(row, 'password') || ''),
        accessProjects: isOwnerRow ? ['FTTM', 'Backbone', 'FTTH', 'FTTE', 'OLO'] : accessProjects,
        branch: String(cell(row, 'branch') || (isOwnerRow ? 'ALL BRANCH' : '')).trim(),
        phoneNumber: uPhoneDisplay,
        telegramUsername: uTele,
        telegramChatId: String(cell(row, 'chatId') || ''),
        isTelegramVerified: String(cell(row, 'telegramVerified') || '').toUpperCase() === 'TRUE',
        avatar: c.avatar >= 0 ? String(row[c.avatar] || '') : ''
      });
    }
    var dedupedList = [];
    var seenAdminOwner = false;
    for (var d = 0; d < list.length; d++) {
      var itm = list[d];
      var itmPhone = String(itm.phoneNumber || '').replace(/[^0-9]/g, '');
      var itmTele = String(itm.telegramUsername || '').replace(/^@/, '').toLowerCase().trim();
      var itmEmail = String(itm.email || '').toLowerCase().trim();
      var isItmOwner = itmEmail === 'mhaniifa22@gmail.com' || itmPhone === '081210282521' || itmPhone === '6281210282521' || itmTele === 'mhaniifa' || itm.id === 'usr-admin-owner';
      if (isItmOwner) {
        if (!seenAdminOwner) {
          seenAdminOwner = true;
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
  // Token wajib disimpan di Script Properties, bukan ditanam di source code.
  try {
    var token = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
    return token ? String(token).trim() : '';
  } catch (e) {
    Logger.log('Gagal membaca TELEGRAM_BOT_TOKEN dari Script Properties: ' + e);
    return '';
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
    var cleanIdent = rawInput.toLowerCase().trim();
    var normalizedPhone = normalizeUserPhoneGas_(rawInput);
    var inputTele = String(telegramUsername || '').replace(/^@/, '').toLowerCase().trim();
    if (!inputTele && cleanIdent.charAt(0) === '@') inputTele = cleanIdent.substring(1);
    if (!inputTele && cleanIdent && cleanIdent.indexOf('@') === -1 && !normalizedPhone) inputTele = cleanIdent.replace(/^@/, '');

    var users = getRegisteredUsersGas() || [];
    var matchedUser = null;
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var uPhone = normalizeUserPhoneGas_(u.phoneNumber || '');
      var uTele = String(u.telegramUsername || '').replace(/^@/, '').toLowerCase().trim();
      var uEmail = String(u.email || '').toLowerCase().trim();
      if ((normalizedPhone && uPhone && normalizedPhone === uPhone) ||
          (cleanIdent && cleanIdent.indexOf('@') > -1 && uEmail === cleanIdent) ||
          (inputTele && uTele && uTele === inputTele) ||
          (cleanIdent && cleanIdent.charAt(0) === '@' && uTele === cleanIdent.substring(1))) {
        matchedUser = u;
        break;
      }
    }

    var isAdminOwner = !!matchedUser && (
      String(matchedUser.email || '').toLowerCase().trim() === 'mhaniifa22@gmail.com' ||
      normalizeUserPhoneGas_(matchedUser.phoneNumber || '') === '081210282521' ||
      String(matchedUser.telegramUsername || '').replace(/^@/, '').toLowerCase().trim() === 'mhaniifa'
    );

    if (!matchedUser) {
      return {
        success: false,
        message: 'Identitas belum terdaftar di sistem. Periksa nomor HP, username Telegram, atau email yang digunakan.'
      };
    }

    var userPhone = normalizeUserPhoneGas_(matchedUser.phoneNumber || '');
    var userTele = String(matchedUser.telegramUsername || '').replace(/^@/, '').toLowerCase().trim();
    var userEmail = String(matchedUser.email || '').toLowerCase().trim();
    var otp = String(optionalOtp || Math.floor(100000 + Math.random() * 900000));
    var cache = CacheService.getScriptCache();
    var cacheKeys = [];
    if (userPhone) cacheKeys.push('OTP_' + userPhone);
    if (userTele) cacheKeys.push('OTP_' + userTele);
    if (userEmail) cacheKeys.push('OTP_' + userEmail.replace(/[^a-z0-9]/g, '_'));
    if (cleanIdent) cacheKeys.push('OTP_' + cleanIdent.replace(/[^a-z0-9]/g, '_'));
    cacheKeys = cacheKeys.filter(function(key, idx, arr) { return arr.indexOf(key) === idx; });
    cacheKeys.forEach(function(key) { cache.put(key, otp, 600); });

    // Pending OTP hanya ditautkan ke identitas user yang cocok, tidak memakai OTP global.
    if (userTele) cache.put('PENDING_OTP_' + userTele, otp, 600);
    if (userPhone) cache.put('PENDING_OTP_' + userPhone, otp, 600);

    var chatId = resolveTelegramChatIdGas_(matchedUser);
    if (!chatId && isAdminOwner) {
      try {
        chatId = String(PropertiesService.getScriptProperties().getProperty('ADMIN_TELEGRAM_CHAT_ID') || '');
      } catch (eProp) {}
    }

    // Bila chat ID belum tercatat, cari hanya berdasarkan username/nomor yang cocok persis.
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
              var msgObj = updJson.result[uIdx].message;
              if (!msgObj) continue;
              var fromObj = msgObj.from || {};
              var msgUsername = String(fromObj.username || '').toLowerCase().replace(/^@/, '');
              var msgPhone = normalizeUserPhoneGas_(msgObj.contact && msgObj.contact.phone_number ? msgObj.contact.phone_number : '');
              var exactMatch = (userTele && msgUsername === userTele) ||
                               (userPhone && msgPhone && msgPhone === userPhone);
              if (exactMatch && msgObj.chat && msgObj.chat.id) {
                chatId = String(msgObj.chat.id);
                if (userTele) cache.put('TELE_CHAT_' + userTele, chatId, 86400 * 30);
                if (userPhone) cache.put('TELE_CHAT_PHONE_' + userPhone, chatId, 86400 * 30);
                if (isAdminOwner) {
                  PropertiesService.getScriptProperties().setProperty('ADMIN_TELEGRAM_CHAT_ID', chatId);
                }
                break;
              }
            }
          }
        }
      } catch (getUpdatesErr) {
        Logger.log('Tidak dapat mencari chat ID Telegram: ' + getUpdatesErr);
      }
    }

    if (chatId) {
      var msg = '🔐 Halo <b>' + String(matchedUser.name || 'Rekan').replace(/[&<>]/g, '') + '</b>,\n' +
        '<i>Kode OTP Web OSP FO Project Management Anda:</i>\n' +
        '👉 <code>' + otp + '</code> 👈\n\n' +
        '<i>Berlaku 10 menit. Masukkan 6 digit kode di aplikasi.</i>';
      var sent = sendTelegramMessageGas(chatId, msg);
      if (!sent || !sent.success) {
        return { success: false, otpSentToTelegram: false, needStartBot: true, message: 'OTP dibuat, tetapi pesan Telegram gagal dikirim. Pastikan bot sudah di-/start dan username Telegram sesuai.' };
      }
      if (userTele) cache.remove('PENDING_OTP_' + userTele);
      if (userPhone) cache.remove('PENDING_OTP_' + userPhone);
      return { success: true, otpSentToTelegram: true, message: 'Kode OTP dikirim ke Telegram yang terhubung dengan akun Anda.' };
    }

    return {
      success: true,
      pending: true,
      otpSentToTelegram: false,
      needStartBot: true,
      message: 'Permintaan OTP disiapkan. Buka bot Telegram dengan akun yang terdaftar lalu ketik /start untuk menerima kode.'
    };
  } catch (err) {
    Logger.log('Error sendTelegramOtpGas: ' + err);
    return { success: false, error: err.toString() };
  }
}

/**
 * OTP REGISTRASI untuk calon user yang BELUM ada di sheet Users.
 * (sendTelegramOtpGas menolak identitas yang belum terdaftar, sehingga user baru tidak pernah menerima OTP.)
 * - OTP dibuat di server (bukan dari client) dan diverifikasi lewat verifyTelegramOtpGas.
 * - Jika bot sudah mengenal user (pernah /start) OTP langsung dikirim; jika belum, OTP disimpan
 *   sebagai PENDING dan otomatis dikirim webhook begitu user menekan /start di bot.
 */
function sendRegistrationOtpGas(identifier, telegramUsername) {
  try {
    var phone = normalizeUserPhoneGas_(identifier);
    var tele = String(telegramUsername || '').replace(/^@/, '').toLowerCase().trim();
    if (!phone || !tele) {
      return { success: false, otpSentToTelegram: false, message: 'Nomor HP dan username Telegram wajib diisi untuk menerima OTP.' };
    }
    var otp = String(Math.floor(100000 + Math.random() * 900000));
    var cache = CacheService.getScriptCache();
    cache.put('OTP_' + phone, otp, 600);
    cache.put('OTP_' + tele, otp, 600);

    var chatId = resolveTelegramChatIdGas_({ telegramUsername: tele, phoneNumber: phone });
    if (chatId) {
      var msg = '🔐 Halo,\n' +
        '<i>Kode OTP registrasi Web OSP FO Project Management Anda:</i>\n' +
        '👉 <code>' + otp + '</code> 👈\n\n' +
        '<i>Berlaku 10 menit. Masukkan 6 digit kode di aplikasi.</i>';
      var sent = sendTelegramMessageGas(chatId, msg);
      if (sent && sent.success) {
        return { success: true, otpSentToTelegram: true, message: 'Kode OTP dikirim ke Telegram Anda.' };
      }
      // Chat ID tersimpan tetapi pengiriman gagal (mis. bot diblokir): jatuh ke jalur pending.
    }
    cache.put('PENDING_OTP_' + tele, otp, 600);
    cache.put('PENDING_OTP_' + phone, otp, 600);
    return {
      success: true,
      pending: true,
      otpSentToTelegram: false,
      needStartBot: true,
      message: 'Buka bot Telegram @Infranexiaadminbot dengan akun @' + tele + ' lalu tekan /start. Kode OTP akan dikirim otomatis. Berlaku 10 menit.'
    };
  } catch (err) {
    Logger.log('Error sendRegistrationOtpGas: ' + err);
    return { success: false, otpSentToTelegram: false, message: 'Gagal meminta OTP dari server: ' + err };
  }
}

/**
 * Verifikasi Kode OTP yang dimasukkan user
 */
function verifyTelegramOtpGas(identifier, otpCode) {
  try {
    var rawInput = String(identifier || '').trim();
    var normalizedPhone = normalizeUserPhoneGas_(rawInput);
    var cleanIdent = rawInput.toLowerCase().trim();
    var cleanOtp = String(otpCode || '').trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return { success: false, message: 'Masukkan kode OTP 6 digit.' };
    }

    var cache = CacheService.getScriptCache();
    var keys = [];
    if (normalizedPhone) keys.push('OTP_' + normalizedPhone);
    if (cleanIdent) keys.push('OTP_' + cleanIdent.replace(/[^a-z0-9]/g, '_'));
    if (cleanIdent.charAt(0) === '@') keys.push('OTP_' + cleanIdent.substring(1));
    var storedOtp = '';
    for (var i = 0; i < keys.length; i++) {
      storedOtp = cache.get(keys[i]);
      if (storedOtp) break;
    }

    if (!storedOtp) {
      return { success: false, message: 'OTP tidak ditemukan atau sudah kedaluwarsa. Minta kode baru.' };
    }

    var isValid = storedOtp === cleanOtp;
    if (isValid) {
      keys.forEach(function(key) { cache.remove(key); });
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
    if (cleanUser) {
      cache.put('TELE_CHAT_' + cleanUser, String(chatId), 86400);
      // Cache hanya 24 jam; simpan juga permanen agar OTP/notifikasi tetap terkirim untuk user yang /start-nya sudah lama.
      try { PropertiesService.getScriptProperties().setProperty('TELE_CHAT_' + cleanUser, String(chatId)); } catch (ePropChat) {}
    }
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
      var deepPhoneRaw = msgText.replace(/[^0-9]/g, '');
      var deepPhone = normalizeUserPhoneGas_(deepPhoneRaw);
      if (deepPhone) cache.put('TELE_CHAT_PHONE_' + deepPhone, String(chatId), 86400);
      if (deepPhone === '081210282521') {
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
              var rowPhone = normalizeUserPhoneGas_(uData[i][12] || '');
              var exactTelegramMatch = !!cleanUser && !!rowTele && rowTele === cleanUser;
              var exactPhoneMatch = !!deepPhone && !!rowPhone && rowPhone === deepPhone;
              if (exactTelegramMatch || exactPhoneMatch) {
                // Simpan username Telegram yang benar; jangan pernah hardcode username admin.
                if (teleUsername) userSheet.getRange(i + 1, 14).setValue(teleUsername);
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
                       (deepPhone ? cache.get('PENDING_OTP_' + deepPhone) : null);

      if (pendingOtp) {
        var pendingOtpMsg = '🔐 Halo <b>' + (fromUser.first_name || 'Rekan') + '</b>,\n' +
          '<i>Kode OTP Web OSP FO Project Management Anda:</i>\n' +
          '👉 <code>' + pendingOtp + '</code> 👈\n\n' +
          '<i>Berlaku 10 menit. Masukkan 6 digit kode di aplikasi.</i>';
        sendTelegramMessageGas(chatId, pendingOtpMsg);

        if (cleanUser) cache.remove('PENDING_OTP_' + cleanUser);
        if (deepPhone) cache.remove('PENDING_OTP_' + deepPhone);
        return ContentService.createTextOutput(JSON.stringify({ ok: true, sentPendingOtp: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Sapaan admin tidak membuat atau membagikan OTP global.
      // OTP hanya dikirim ketika ada permintaan login yang ditautkan ke identitas akun.
      var isOwnerOrVerified = (
        cleanUser === 'mhaniifa' ||
        deepPhone === '081210282521'
      );

      if (isOwnerOrVerified) {
        var verifiedWelcome = '👋 <b>Halo, ' + (fromUser.first_name || 'Admin') + '!</b>\n\n' +
          'Selamat datang di <b>Bot Verifikasi Telkom Infranexia FO</b>.\n\n' +
          '✅ Akun Telegram terdeteksi. Untuk login, minta OTP melalui halaman login aplikasi.';
        sendTelegramMessageGas(chatId, verifiedWelcome, { remove_keyboard: true });
        return ContentService.createTextOutput(JSON.stringify({ ok: true, userVerified: true }))
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

      if (cleanContactPhone) {
        cache.put('TELE_CHAT_PHONE_' + cleanContactPhone, String(chatId), 86400);
        try { PropertiesService.getScriptProperties().setProperty('TELE_CHAT_PHONE_' + cleanContactPhone, String(chatId)); } catch (ePropPhone) {}
      }

      // Generate OTP verifikasi
      var otpCode = String(Math.floor(100000 + Math.random() * 900000));
      cache.put('OTP_' + cleanContactPhone, otpCode, 600);
      if (cleanUser) cache.put('OTP_' + cleanUser, otpCode, 600);

      // Simpan Chat ID ke sheet Users jika nomor sudah ada di registrasi
      try {
        var ss = getSpreadsheet();
        if (ss) {
          var userSheet = ss.getSheetByName(SHEET_USERS);
          if (userSheet) {
            var uData = userSheet.getDataRange().getValues();
            for (var i = 1; i < uData.length; i++) {
              var rowPhone = normalizeUserPhoneGas_(uData[i][12] || '');
              if (rowPhone && rowPhone === cleanContactPhone) {
                if (teleUsername) userSheet.getRange(i + 1, 14).setValue(teleUsername);
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
      var instantOtp = cleanUser ? cache.get('OTP_' + cleanUser) : null;
      if (!instantOtp) {
        sendTelegramMessageGas(chatId, 'Untuk keamanan, OTP hanya dikirim setelah Anda meminta kode melalui halaman login aplikasi.');
        return ContentService.createTextOutput(JSON.stringify({ ok: true, noPendingOtp: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }

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

/** Membaca report Response + antrean pending tersembunyi agar Review konsisten lintas akun/perangkat. */
function getDailyReportsGas() {
  try {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var reports = [];
    var seen = {};
    var sheet = findSheetResponses(ss);
    if (sheet && sheet.getLastRow() > 0) {
      var headerRow = detectHeaderRowGas(sheet, ['Submission ID', 'SITE ID', 'Submitted At']);
      var values = sheet.getDataRange().getValues();
      var map = getHeaderColumnMapGas(sheet, headerRow);
      function get(row, name) { var c = map[String(name).toLowerCase()]; return c ? row[c - 1] : ''; }
      function str(v) { return v == null ? '' : String(v); }
      function iso(v) {
        if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();
        var text = str(v).trim();
        if (!text) return '';
        var d = new Date(text);
        return isNaN(d.getTime()) ? text : d.toISOString();
      }
      function arr(v) { var text = str(v).trim(); return text ? text.split(/\s*,\s*/).filter(Boolean) : []; }
      for (var i = headerRow; i < values.length; i++) {
        var row = values[i];
        var id = str(get(row, 'Submission ID')).trim();
        if (!id) continue;
        var submittedAt = iso(get(row, 'Submitted At'));
        var status = str(get(row, 'APPROVAL STATUS')).trim() || 'Approved';
        var report = {
          id: id, submissionId: id,
          submittedAt: submittedAt, firstSubmittedAt: submittedAt,
          respondentId: str(get(row, 'Email Submitter')),
          emailSubmitter: str(get(row, 'Email Submitter')),
          submitterName: str(get(row, 'Nama Submitter')),
          submitterRole: str(get(row, 'Role Submitter')),
          submitterPhone: str(get(row, 'Nomor HP Submitter')),
          submitterTelegram: str(get(row, 'Telegram Submitter')),
          siteId: str(get(row, 'SITE ID')).trim(), region: str(get(row, 'REGION')).trim(),
          subcon: str(get(row, 'SUBCON (Mitra Pelaksana)'),), mitraPelaksana: str(get(row, 'SUBCON (Mitra Pelaksana)')),
          status: str(get(row, 'STATUS')), subStatus: str(get(row, 'SUB STATUS')),
          typeFoKu: arr(get(row, 'TYPE FO [KU]')),
          targetTiang: Number(get(row, 'TARGET TIANG (KU)')) || 0,
          realTiang: Number(get(row, 'REAL TIANG (KU)')) || 0,
          targetFoKu: Number(get(row, 'TARGET FO KU (m)')) || 0,
          realFoKu: Number(get(row, 'REAL FO KU (m)')) || 0,
          typeFoKt: arr(get(row, 'TYPE FO [KT]')),
          targetGalian: Number(get(row, 'TARGET GALIAN (KT)')) || 0,
          realGalian: Number(get(row, 'REAL GALIAN (KT)')) || 0,
          targetFoKt: Number(get(row, 'TARGET FO KT (m)')) || 0,
          realFoKt: Number(get(row, 'REAL FO KT (m)')) || 0,
          perizinanPuNas: str(get(row, 'PERIZINAN [PU Nas]')),
          perizinanPuProv: str(get(row, 'PERIZINAN [PU Prov]')),
          perizinanPuKotaKab: str(get(row, 'PERIZINAN [PU Kota / Kab]')),
          perizinanPrivateArea: str(get(row, 'PERIZINAN [Private Area]')),
          totalBiayaPerizinan: Number(get(row, 'TOTAL BIAYA PERIZINAN')) || 0,
          commitFinishInstall: str(get(row, 'COMMIT FINISH INSTALL')),
          jmlManPower: Number(get(row, 'JML MAN POWER')) || 0,
          detilProgress: str(get(row, 'DETIL PROGRESS')),
          evidenceKegiatanUrl: str(get(row, 'EVIDENCE URL')),
          redamanUrl: str(get(row, 'REDAMAN URL')),
          approvalStatus: status,
          approvedBy: str(get(row, 'APPROVED BY')),
          approvedAt: iso(get(row, 'APPROVED AT')),
          approvalNotes: str(get(row, 'NOTES')),
          spvMitraApprovedBy: status.toLowerCase() === 'pending final approval' ? str(get(row, 'APPROVED BY')) : '',
          spvMitraApprovedAt: status.toLowerCase() === 'pending final approval' ? iso(get(row, 'APPROVED AT')) : '',
          spvMitraNotes: status.toLowerCase() === 'pending final approval' ? str(get(row, 'NOTES')) : ''
        };
        reports.push(report); seen[id] = true;
      }
    }
    // Pending reports belum ditulis ke Response, tetapi harus terlihat oleh SPV Mitra untuk review.
    var pendingSheet = getPendingReportSheetGas_();
    if (pendingSheet && pendingSheet.getLastRow() > 1) {
      var pendingRows = pendingSheet.getRange(2, 1, pendingSheet.getLastRow() - 1, 6).getValues();
      for (var p = 0; p < pendingRows.length; p++) {
        var pendingId = String(pendingRows[p][0] || '').trim();
        if (!pendingId || seen[pendingId]) continue;
        try {
          var pendingReport = JSON.parse(String(pendingRows[p][2] || '{}'));
          if (!pendingReport || !pendingReport.submissionId) continue;
          pendingReport.approvalStatus = String(pendingRows[p][1] || pendingReport.approvalStatus || 'Pending SPV Mitra');
          pendingReport.submissionId = pendingId;
          pendingReport.id = pendingId;
          reports.push(pendingReport); seen[pendingId] = true;
        } catch (pendingParseErr) { Logger.log('Skip invalid pending report: ' + pendingId); }
      }
    }
    reports.sort(function(a, b) { return new Date(b.firstSubmittedAt || b.submittedAt || 0).getTime() - new Date(a.firstSubmittedAt || a.submittedAt || 0).getTime(); });
    return reports;
  } catch (err) {
    Logger.log('getDailyReportsGas error: ' + err);
    return [];
  }
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
      reports: getDailyReportsGas(),
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
      reports: getDailyReportsGas(),
      totalSites: 6,
      isLive: false,
      warning: err.toString()
    };
  }
}

/**
 * Kirim notifikasi Telegram ke pemeriksa (Supervisor Mitra) saat Tim Lapangan submit report.
 * Target utama: Supervisor Mitra yang dipilih pada form (designatedSpvMitraEmail).
 * Jika tidak ada/tidak ditemukan: semua Supervisor Mitra aktif dengan mitra (subcon) yang sama.
 */
function notifyPemeriksaNewReportGas_(report, submitter) {
  try {
    if (!report) return { success: false, reason: 'REPORT_EMPTY' };
    var users = getRegisteredUsersGas() || [];
    var designated = String(report.designatedSpvMitraEmail || '').trim().toLowerCase();
    var subcon = String(report.mitraPelaksana || report.subcon || '').trim().toLowerCase();
    function isSpvMitra(u) {
      return String(u.status || '').trim().toLowerCase() === 'approved' &&
        String(u.role || '').trim().toLowerCase() === 'supervisor' &&
        String(u.supervisorType || '').trim().toLowerCase() === 'supervisor mitra';
    }
    var targets = [];
    if (designated && designated !== 'skip_spv_mitra') {
      targets = users.filter(function(u) { return isSpvMitra(u) && String(u.email || '').trim().toLowerCase() === designated; });
    }
    if (!targets.length && subcon) {
      targets = users.filter(function(u) {
        if (!isSpvMitra(u)) return false;
        var us = String(u.subcon || '').trim().toLowerCase();
        return !us || us.indexOf(subcon) > -1 || subcon.indexOf(us) > -1;
      });
    }
    if (!targets.length) return { success: false, reason: 'NO_PEMERIKSA_FOUND' };

    var appUrl = '';
    try { appUrl = ScriptApp.getService().getUrl() || ''; } catch (urlErr) {}
    var directUrl = appUrl ? appUrl + '?tab=review&submissionId=' + encodeURIComponent(String(report.submissionId || '')) : '';
    var firstAt = report.firstSubmittedAt || report.submittedAt;
    var firstDate = firstAt ? new Date(firstAt) : new Date();
    if (isNaN(firstDate.getTime())) firstDate = new Date();
    var timeText = Utilities.formatDate(firstDate, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm') + ' WIB';
    var submitterName = report.submitterName || (submitter && submitter.name) || 'Tim Lapangan';
    var statusText = [report.status, report.subStatus].filter(Boolean).join(' - ');
    var message = '📝 <b>Report Baru Menunggu Review Anda</b>\n' +
      'Site: <b>' + escapeTelegramHtml_(report.siteId || '-') + '</b>\n' +
      'Mitra: ' + escapeTelegramHtml_(report.mitraPelaksana || report.subcon || '-') + '\n' +
      (statusText ? 'Status: ' + escapeTelegramHtml_(statusText) + '\n' : '') +
      'Dikirim oleh: ' + escapeTelegramHtml_(submitterName) + '\n' +
      'Waktu submit: ' + timeText + '\n\n' +
      (directUrl ? '<a href="' + directUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '">Buka & review laporan</a>' : 'Silakan buka tab Review pada aplikasi.');

    var sent = 0, noChat = 0;
    targets.forEach(function(t) {
      var chatId = resolveTelegramChatIdGas_(t);
      if (!chatId) { noChat++; return; }
      var r = sendTelegramMessageGas(chatId, message);
      if (r && r.success) sent++;
    });
    return { success: sent > 0, sent: sent, total: targets.length, withoutChatId: noChat };
  } catch (err) {
    Logger.log('notifyPemeriksaNewReportGas_ error: ' + err);
    return { success: false, error: String(err) };
  }
}

/** Kirim notifikasi Telegram ke Supervisor Branch saat laporan disetujui SPV Mitra. */
function notifyBranchReviewGas_(reportData) {
  try {
    var siteId = String(reportData.siteId || '').trim();
    if (!siteId) return { success: false, reason: 'SITE_ID_EMPTY' };
    var sites = getMasterSites() || [];
    var site = null;
    for (var i = 0; i < sites.length; i++) {
      if (String(sites[i].id || '').trim().toUpperCase() === siteId.toUpperCase()) { site = sites[i]; break; }
    }
    var branch = String((site && site.branch) || reportData.branch || '').trim();
    if (!branch) return { success: false, reason: 'BRANCH_NOT_FOUND' };
    var users = getRegisteredUsersGas() || [];
    var targets = [];
    for (var u = 0; u < users.length; u++) {
      var user = users[u];
      if (String(user.status || '').trim().toLowerCase() !== 'approved') continue;
      var role = String(user.role || '').trim().toLowerCase();
      var supervisorType = String(user.supervisorType || '').trim().toLowerCase();
      var isBranchSupervisor = role === 'spv branch' || role === 'supervisor branch' ||
        (role === 'supervisor' && (supervisorType === 'supervisor branch' || supervisorType === 'spv branch'));
      if (!isBranchSupervisor) continue;
      var userBranch = String(user.branch || '').trim();
      if (userBranch && userBranch.toLowerCase() !== 'all branch' && userBranch.toLowerCase() !== branch.toLowerCase()) continue;
      if (!resolveTelegramChatIdGas_(user)) continue;
      targets.push(user);
    }
    if (!targets.length) return { success: false, reason: 'NO_APPROVED_BRANCH_SUPERVISOR_CHAT', branch: branch };
    var appUrl = '';
    try { appUrl = ScriptApp.getService().getUrl() || ''; } catch (urlErr) {}
    var directUrl = appUrl ? appUrl + '?tab=review&submissionId=' + encodeURIComponent(String(reportData.submissionId || '')) : appUrl;
    var subcon = String(reportData.mitraPelaksana || reportData.subcon || 'mitra tidak disebutkan');
    var message = '🔔 <b>Review Laporan OSP FO</b>\n' +
      'Site <b>' + siteId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</b> telah diupdate oleh mitra <b>' + subcon.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</b> dan disetujui Supervisor Mitra.\n' +
      (directUrl ? '<a href="' + directUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '">Buka detail laporan</a>' : 'Silakan buka tab Review pada aplikasi.');
    var sent = 0;
    targets.forEach(function(target) {
      var result = sendTelegramMessageGas(resolveTelegramChatIdGas_(target), message);
      if (result && result.success) sent++;
    });
    return { success: sent > 0, sent: sent, branch: branch, total: targets.length };
  } catch (err) {
    Logger.log('notifyBranchReviewGas_ error: ' + err);
    return { success: false, error: String(err) };
  }
}

/**
 * Menyimpan Report Harian Baru ke Sheet DailyReportResponses
 * Sesuai requirement: Tercatat ke Sheet Response dengan timestamp awal saat Tim Lapangan submit pertama kali
 */
/** Sheet internal tersembunyi untuk laporan yang belum disetujui SPV Mitra. */
function getPendingReportSheetGas_() {
  var ss = getSpreadsheet();
  if (!ss) return null;
  var sheet = ss.getSheetByName('OSPPendingReports');
  if (!sheet) sheet = ss.insertSheet('OSPPendingReports');
  var headers = ['Submission ID', 'Approval Status', 'Report JSON', 'Updated At', 'Submitted By', 'SITE ID'];
  var current = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0] : [];
  var valid = headers.every(function(h, i) { return String(current[i] || '').trim().toLowerCase() === h.toLowerCase(); });
  if (!valid) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#102a45').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  try { if (!sheet.isSheetHidden()) sheet.hideSheet(); } catch (hideErr) {}
  return sheet;
}

function findPendingReportRowGas_(sheet, submissionId) {
  if (!sheet || sheet.getLastRow() < 2) return -1;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === String(submissionId || '').trim()) return i + 2;
  }
  return -1;
}

/**
 * Simpan draft/report Tim Lapangan ke antrean internal, bukan ke Response sebelum SPV Mitra approve.
 * Setelah submit PERTAMA berhasil, bot Telegram mengirim notifikasi ke Supervisor Mitra (pemeriksa).
 */
function savePendingDailyReportGas(reportData, user) {
  var result = savePendingDailyReportCore_(reportData, user);
  if (result && result.success && result.isNew) {
    try {
      result.notification = notifyPemeriksaNewReportGas_(result.report || reportData, user);
    } catch (notifErr) {
      Logger.log('Notifikasi pemeriksa gagal: ' + notifErr);
      result.notification = { success: false, error: String(notifErr) };
    }
  }
  if (result) delete result.report; // objek besar tidak perlu dikirim balik ke client
  return result;
}

function savePendingDailyReportCore_(reportData, user) {
  var lock = null;
  try {
    lock = LockService.getScriptLock(); lock.waitLock(10000);
    if (!reportData || !reportData.submissionId) return { success: false, error: 'Submission ID laporan tidak tersedia.' };
    if (String((user && user.role) || '').trim().toLowerCase() !== 'tim lapangan') return { success: false, error: 'Fungsi ini hanya untuk laporan Tim Lapangan.' };
    var sheet = getPendingReportSheetGas_();
    if (!sheet) return { success: false, error: 'Spreadsheet tidak terhubung.' };
    var row = findPendingReportRowGas_(sheet, reportData.submissionId);
    var now = new Date();
    var report = Object.assign({}, reportData);
    report.firstSubmittedAt = report.firstSubmittedAt || report.submittedAt || now.toISOString();
    report.approvalStatus = report.approvalStatus || 'Pending SPV Mitra';
    if (row > 0) {
      var old = sheet.getRange(row, 1, 1, 6).getValues()[0];
      var oldStatus = String(old[1] || '').trim().toLowerCase();
      if (oldStatus !== 'pending spv mitra' && oldStatus !== 'rejected by spv mitra') {
        return { success: false, code: 'REPORT_LOCKED_AFTER_SPV_APPROVAL', error: 'Laporan sudah disetujui Supervisor Mitra dan tidak dapat diubah Tim Lapangan.' };
      }
      report.approvalStatus = old[1] || report.approvalStatus;
      // Timestamp submit pertama tidak boleh berubah oleh edit berikutnya.
      try {
        var oldJson = JSON.parse(String(old[2] || '{}'));
        if (oldJson && oldJson.firstSubmittedAt) report.firstSubmittedAt = oldJson.firstSubmittedAt;
      } catch (oldParseErr) {}
      sheet.getRange(row, 1, 1, 6).setValues([[String(report.submissionId), report.approvalStatus, JSON.stringify(report), now, (user && user.name) || report.submitterName || '', report.siteId || '']]);
    } else {
      sheet.appendRow([String(report.submissionId), report.approvalStatus, JSON.stringify(report), now, (user && user.name) || report.submitterName || '', report.siteId || '']);
    }
    SpreadsheetApp.flush();
    return { success: true, submissionId: report.submissionId, pending: true, isNew: row <= 0, report: report };
  } catch (err) {
    Logger.log('savePendingDailyReportGas error: ' + err);
    return { success: false, error: String(err) };
  } finally { if (lock) { try { lock.releaseLock(); } catch (e) {} } }
}

/** Approve SPV Mitra: kunci draft, sinkronkan versi terbaru ke Response, lalu hapus antrean internal. */
function approvePendingDailyReportGas(submissionId, reviewerUser, notes, fallbackReport) {
  var lock = null, report = null, originalStatus = 'Pending SPV Mitra';
  try {
    lock = LockService.getScriptLock(); lock.waitLock(10000);
    var reviewerRole = String((reviewerUser && reviewerUser.role) || '').trim().toLowerCase();
    var reviewerType = String((reviewerUser && reviewerUser.supervisorType) || '').trim().toLowerCase();
    if (!(reviewerRole === 'supervisor' && reviewerType === 'supervisor mitra')) return { success: false, error: 'Hanya Supervisor Mitra yang dapat menyetujui laporan ini.' };
    var sheet = getPendingReportSheetGas_();
    if (!sheet) return { success: false, error: 'Sheet antrean laporan tidak tersedia.' };
    var row = findPendingReportRowGas_(sheet, submissionId);
    if (row > 0) {
      var values = sheet.getRange(row, 1, 1, 6).getValues()[0];
      originalStatus = String(values[1] || '').trim() || 'Pending SPV Mitra';
      if (originalStatus.toLowerCase() !== 'pending spv mitra') return { success: false, error: 'Laporan tidak lagi menunggu approval Supervisor Mitra.' };
      try { report = JSON.parse(String(values[2] || '{}')); } catch (parseErr) { return { success: false, error: 'Data laporan pending tidak valid.' }; }
      if (!report || !report.submissionId) return { success: false, error: 'Data laporan pending tidak lengkap.' };
      var assignedEmail = String(report.designatedSpvMitraEmail || '').trim().toLowerCase();
      var reviewerEmail = String((reviewerUser && reviewerUser.email) || '').trim().toLowerCase();
      if (assignedEmail && assignedEmail !== 'skip_spv_mitra' && assignedEmail !== reviewerEmail) {
        return { success: false, error: 'Laporan ini ditugaskan kepada Supervisor Mitra lain.' };
      }
      sheet.getRange(row, 2).setValue('Approving SPV Mitra'); SpreadsheetApp.flush();
    } else {
      if (!fallbackReport || String(fallbackReport.submissionId || '').trim() !== String(submissionId || '').trim()) return { success: false, error: 'Laporan pending tidak ditemukan. Muat ulang data lalu coba lagi.' };
      report = Object.assign({}, fallbackReport);
      if (String(report.approvalStatus || '').trim().toLowerCase() !== 'pending spv mitra') return { success: false, error: 'Laporan tidak lagi menunggu approval Supervisor Mitra.' };
      var fallbackAssignedEmail = String(report.designatedSpvMitraEmail || '').trim().toLowerCase();
      var fallbackReviewerEmail = String((reviewerUser && reviewerUser.email) || '').trim().toLowerCase();
      if (fallbackAssignedEmail && fallbackAssignedEmail !== 'skip_spv_mitra' && fallbackAssignedEmail !== fallbackReviewerEmail) {
        return { success: false, error: 'Laporan ini ditugaskan kepada Supervisor Mitra lain.' };
      }
      sheet.appendRow([String(submissionId), 'Approving SPV Mitra', JSON.stringify(report), new Date(), report.submitterName || '', report.siteId || '']);
      row = sheet.getLastRow();
    }
    var now = new Date();
    report.approvalStatus = 'Approved';
    report.spvMitraApprovedBy = String((reviewerUser && reviewerUser.name) || '');
    report.spvMitraApprovedAt = now.toISOString();
    report.approvedBy = String((reviewerUser && reviewerUser.name) || '');
    report.approvedAt = now.toISOString();
    report.approvalNotes = notes || 'Disetujui oleh Supervisor Mitra';
    report.spvMitraNotes = report.approvalNotes;
    sheet.getRange(row, 2, 1, 5).setValues([['Approving SPV Mitra', JSON.stringify(report), now, (reviewerUser && reviewerUser.name) || '', report.siteId || '']]);
    SpreadsheetApp.flush();
  } catch (err) {
    Logger.log('approvePendingDailyReportGas preparation error: ' + err);
    return { success: false, error: String(err) };
  } finally { if (lock) { try { lock.releaseLock(); } catch (e) {} } }

  var result = submitDailyReportGas(report, reviewerUser || {});
  if (!result || result.success !== true) {
    var restoreLock = null;
    try {
      restoreLock = LockService.getScriptLock(); restoreLock.waitLock(10000);
      var restoreSheet = getPendingReportSheetGas_(), restoreRow = findPendingReportRowGas_(restoreSheet, submissionId);
      if (restoreRow > 0) {
        report.approvalStatus = originalStatus;
        restoreSheet.getRange(restoreRow, 2, 1, 5).setValues([[originalStatus, JSON.stringify(report), new Date(), (reviewerUser && reviewerUser.name) || report.submitterName || '', report.siteId || '']]);
      }
    } catch (restoreErr) { Logger.log('Approval rollback warning: ' + restoreErr); }
    finally { if (restoreLock) { try { restoreLock.releaseLock(); } catch (e) {} } }
    return { success: false, error: (result && result.error) || 'Gagal menyimpan laporan ke Response.' };
  }
  var cleanupLock = null;
  try {
    cleanupLock = LockService.getScriptLock(); cleanupLock.waitLock(10000);
    var cleanupSheet = getPendingReportSheetGas_(), cleanupRow = findPendingReportRowGas_(cleanupSheet, submissionId);
    if (cleanupRow > 0) cleanupSheet.deleteRow(cleanupRow);
  } catch (cleanupErr) { Logger.log('approvePendingDailyReportGas cleanup warning: ' + cleanupErr); }
  finally { if (cleanupLock) { try { cleanupLock.releaseLock(); } catch (e) {} } }
  return { success: true, submissionId: submissionId, approvalStatus: 'Approved', branchNotification: result.branchNotification || null };
}

function deletePendingDailyReportGas(submissionId, reviewerUser) {
  var lock = null;
  try {
    var role = String((reviewerUser && reviewerUser.role) || '').trim().toLowerCase();
    var type = String((reviewerUser && reviewerUser.supervisorType) || '').trim().toLowerCase();
    if (!(role === 'supervisor' && type === 'supervisor mitra')) return { success: false, error: 'Hanya Supervisor Mitra yang dapat menghapus laporan pending.' };
    lock = LockService.getScriptLock(); lock.waitLock(10000);
    var sheet = getPendingReportSheetGas_(), row = findPendingReportRowGas_(sheet, submissionId);
    if (row < 0) return { success: false, error: 'Laporan pending tidak ditemukan atau sudah diproses.' };
    var status = String(sheet.getRange(row, 2).getValue() || '').trim().toLowerCase();
    if (status !== 'pending spv mitra') return { success: false, error: 'Laporan sedang diproses atau sudah tidak dapat dihapus.' };
    var pendingValues = sheet.getRange(row, 1, 1, 6).getValues()[0];
    var pendingReport = {};
    try { pendingReport = JSON.parse(String(pendingValues[2] || '{}')); } catch (parseErr) {}
    var assignedEmail = String(pendingReport.designatedSpvMitraEmail || '').trim().toLowerCase();
    var reviewerEmail = String((reviewerUser && reviewerUser.email) || '').trim().toLowerCase();
    if (assignedEmail && assignedEmail !== 'skip_spv_mitra' && assignedEmail !== reviewerEmail) {
      return { success: false, error: 'Laporan ini ditugaskan kepada Supervisor Mitra lain.' };
    }
    var siteId = String(sheet.getRange(row, 6).getValue() || '');
    sheet.deleteRow(row); SpreadsheetApp.flush();
    logAuditGas(reviewerUser, 'DELETE_PENDING_REPORT', siteId, 'Laporan pending ' + submissionId + ' dihapus oleh Supervisor Mitra.');
    return { success: true, submissionId: submissionId };
  } catch (err) {
    Logger.log('deletePendingDailyReportGas error: ' + err);
    return { success: false, error: String(err) };
  } finally { if (lock) { try { lock.releaseLock(); } catch (e) {} } }
}

function submitDailyReportGas(reportData, user) {
  var submitLock = null;
  try {
    submitLock = LockService.getScriptLock();
    submitLock.waitLock(10000);
    var ss = getSpreadsheet();
    if (!ss) {
      return { success: false, submissionId: reportData.submissionId || ('SUB-LOCAL-' + Date.now().toString(36).toUpperCase()), error: 'Spreadsheet tidak terhubung; laporan belum tersimpan.' };
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
    var previousApprovalStatus = '';
    var rHeaderRow = detectHeaderRowGas(sheet, ['Submission ID', 'SITE ID', 'Submitted At']);
    var actualHeaders = (data[rHeaderRow - 1] || []).map(function(h) { return String(h || '').trim().toLowerCase(); });
    var actualCol = {};
    actualHeaders.forEach(function(h, idx) { if (h) actualCol[h] = idx; });
    if (actualCol['submission id'] == null || actualCol['site id'] == null || actualCol['submitted at'] == null) {
      return { success: false, error: 'Header wajib Submission ID, SITE ID, atau Submitted At tidak ditemukan. Pastikan nama header tetap ada meskipun urutan kolom diubah.' };
    }
    var idCol = actualCol['submission id'];
    var siteCol = actualCol['site id'];
    var submittedAtCol = actualCol['submitted at'];
    var writeWidth = Math.max(sheet.getLastColumn(), EXPECTED_DAILY_RESPONSE_HEADERS.length);
    var mappedRowValues = new Array(writeWidth).fill('');
    EXPECTED_DAILY_RESPONSE_HEADERS.forEach(function(header, idx) {
      var targetCol = actualCol[String(header).toLowerCase()];
      if (targetCol != null && targetCol < writeWidth) mappedRowValues[targetCol] = rowValues[idx];
    });

    for (var i = rHeaderRow; i < data.length; i++) {
      if (String(data[i][idCol] || '').trim() === String(subId).trim()) {
        existingRow = i + 1;
        var oldApprovalCol = actualCol['approval status'];
        previousApprovalStatus = oldApprovalCol == null ? '' : String(data[i][oldApprovalCol] || '').trim();
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
          var duplicateApprovalCol = actualCol['approval status'];
          previousApprovalStatus = duplicateApprovalCol == null ? '' : String(data[j][duplicateApprovalCol] || '').trim();
          break;
        }
      }
    }

    if (existingRow > 0) {
      // Pertahankan kolom tambahan/nonstandar yang mungkin ada pada sheet, lalu update hanya kolom yang dikenal berdasarkan header.
      var mergedRowValues = (data[existingRow - 1] || []).slice();
      while (mergedRowValues.length < writeWidth) mergedRowValues.push('');
      EXPECTED_DAILY_RESPONSE_HEADERS.forEach(function(header, idx) {
        var targetCol = actualCol[String(header).toLowerCase()];
        if (targetCol != null && targetCol < mergedRowValues.length) mergedRowValues[targetCol] = rowValues[idx];
      });
      // Submitted At = timestamp submit PERTAMA. Jika baris sudah punya nilai, jangan ditimpa (mis. oleh waktu approval).
      var oldSubmittedAt = (data[existingRow - 1] || [])[submittedAtCol];
      var oldSubmittedValid = oldSubmittedAt instanceof Date ? !isNaN(oldSubmittedAt.getTime()) : (oldSubmittedAt !== '' && oldSubmittedAt != null);
      if (oldSubmittedValid) mergedRowValues[submittedAtCol] = oldSubmittedAt;
      sheet.getRange(existingRow, 1, 1, mergedRowValues.length).setValues([mergedRowValues]);
    } else {
      sheet.appendRow(mappedRowValues);
      existingRow = sheet.getLastRow();
    }
    if (submittedAtCol >= 0) sheet.getRange(existingRow, submittedAtCol + 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    SpreadsheetApp.flush();

    // Jika Tim Lapangan memilih melewati SPV Mitra, laporan langsung masuk antrean final review.
    // Bersihkan draft pending jika sebelumnya sudah tersimpan di antrean internal.
    if (String((user && user.role) || '').trim().toLowerCase() === 'tim lapangan' && String(approvalStatus).trim().toLowerCase() === 'pending final approval') {
      try {
        var pendingCleanupSheet = getPendingReportSheetGas_();
        var pendingCleanupRow = findPendingReportRowGas_(pendingCleanupSheet, subId);
        if (pendingCleanupRow > 0) pendingCleanupSheet.deleteRow(pendingCleanupRow);
      } catch (pendingCleanupErr) { Logger.log('Pending cleanup warning: ' + pendingCleanupErr); }
    }

    var branchNotification = null;
    var submittingRole = String((user && user.role) || '').trim().toLowerCase();
    var submittingSupervisorType = String((user && user.supervisorType) || '').trim().toLowerCase();
    if (approvalStatus.toLowerCase() === 'approved' && submittingRole === 'supervisor' &&
        submittingSupervisorType === 'supervisor mitra' && String(previousApprovalStatus).trim().toLowerCase() !== 'approved') {
      branchNotification = notifyBranchReviewGas_(Object.assign({}, reportData, { submissionId: subId, siteId: reportData.siteId, subcon: subconVal }));
    }
    logAuditGas(user, 'SYNC_REPORT', reportData.siteId, 'Record report ' + subId + ' untuk site ' + reportData.siteId + ' (' + approvalStatus + ')');
    return { success: true, submissionId: subId, approved: approvalStatus === 'Approved', branchNotification: branchNotification };
  } catch (err) {
    Logger.log('Error submitDailyReportGas: ' + err);
    return { success: false, submissionId: reportData && reportData.submissionId || ('SUB-' + Date.now().toString(36).toUpperCase()), error: err.toString() };
  } finally {
    if (submitLock) { try { submitLock.releaseLock(); } catch (releaseErr) {} }
  }
}

/**
 * Update / Koreksi Report Harian ke Sheet Responses
 */
function updateDailyReportGas(submissionId, reportData, user) {
  var editLock = null;
  try {
    editLock = LockService.getScriptLock();
    editLock.waitLock(10000);
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
    var approvalCol = col['approval status'];
    var isFieldUser = String((user && user.role) || '').trim().toLowerCase() === 'tim lapangan';
    if (isFieldUser) {
      var pendingSheet = getPendingReportSheetGas_();
      var pendingRow = findPendingReportRowGas_(pendingSheet, submissionId);
      if (pendingRow > 0) {
        var pendingValues = pendingSheet.getRange(pendingRow, 1, 1, 6).getValues()[0];
        var pendingStatus = String(pendingValues[1] || '').trim().toLowerCase();
        if (pendingStatus !== 'pending spv mitra' && pendingStatus !== 'rejected by spv mitra') {
          return { success: false, code: 'REPORT_LOCKED_AFTER_SPV_APPROVAL', error: 'Laporan sudah/barusan disetujui Supervisor Mitra. Perubahan ditolak.' };
        }
        var pendingReport;
        try { pendingReport = JSON.parse(String(pendingValues[2] || '{}')); } catch (pendingParseErr) { return { success: false, error: 'Data draft laporan tidak valid.' }; }
        var mergedPending = Object.assign({}, pendingReport, reportData);
        mergedPending.submissionId = String(submissionId);
        mergedPending.firstSubmittedAt = pendingReport.firstSubmittedAt || pendingReport.submittedAt || reportData.firstSubmittedAt || reportData.submittedAt;
        mergedPending.approvalStatus = pendingValues[1];
        mergedPending.submitterName = pendingReport.submitterName || reportData.submitterName || (user && user.name) || '';
        mergedPending.submitterRole = pendingReport.submitterRole || 'Tim Lapangan';
        pendingSheet.getRange(pendingRow, 1, 1, 6).setValues([[String(submissionId), mergedPending.approvalStatus, JSON.stringify(mergedPending), new Date(), pendingValues[4] || mergedPending.submitterName, mergedPending.siteId || pendingValues[5] || '']]);
        SpreadsheetApp.flush();
        logAuditGas(user, 'UPDATE_PENDING_REPORT', mergedPending.siteId, 'Draft report ' + submissionId + ' diperbarui sebelum approval SPV Mitra.');
        return { success: true, submissionId: submissionId, pending: true };
      }
    }
    var rowIndex = -1;
    for (var i = headerRow; i < data.length; i++) {
      if (String(data[i][idCol] || '').trim() === String(submissionId || '').trim()) { rowIndex = i; break; }
    }
    // Tim Lapangan wajib memakai Submission ID yang sama; jangan pernah fallback ke site lain.
    if (rowIndex < 0 && !isFieldUser && reportData.siteId) {
      for (var j = data.length - 1; j >= headerRow; j--) {
        if (String(data[j][siteCol] || '').trim().toUpperCase() === String(reportData.siteId || '').trim().toUpperCase()) { rowIndex = j; break; }
      }
    }
    // Jika draft belum ada di Response, Tim Lapangan harus ditemukan di antrean server tersembunyi.
    if (rowIndex < 0) {
      return { success: false, error: isFieldUser ? 'Draft laporan tidak ditemukan di antrean server. Resinkronkan laporan lalu coba lagi.' : 'Submission ID tidak ditemukan di sheet responses.' };
    }

    if (isFieldUser) {
      var currentStatus = approvalCol == null ? '' : String(data[rowIndex][approvalCol] || '').trim().toLowerCase();
      var editableStatuses = ['pending spv mitra', 'rejected by spv mitra'];
      if (editableStatuses.indexOf(currentStatus) === -1) {
        return { success: false, code: 'REPORT_LOCKED_AFTER_SPV_APPROVAL', error: 'Laporan tidak dapat diedit karena sudah disetujui Supervisor Mitra atau telah masuk tahap review berikutnya.' };
      }
    }

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
  } finally {
    if (editLock) { try { editLock.releaseLock(); } catch (releaseErr) {} }
  }
}

/**
 * Supervisor Approve / Reject Report (Hanya update status di Sheet Responses)
 */
function updateSubmissionStatus(subId, newStatus, notes, reviewerUser) {
  try {
    var reviewerRole = String((reviewerUser && reviewerUser.role) || '').trim().toLowerCase();
    var reviewerType = String((reviewerUser && reviewerUser.supervisorType) || '').trim().toLowerCase();
    if (reviewerRole === 'supervisor' && reviewerType === 'supervisor mitra' &&
        String(newStatus || '').trim().toLowerCase() !== 'approved') {
      return { success: false, error: 'Supervisor Mitra hanya dapat menyetujui atau menghapus laporan pending; laporan tidak dapat dikembalikan.' };
    }
    var ss = getSpreadsheet();
    if (!ss) return { success: true };

    var sheet = findSheetResponses(ss);
    if (!sheet) return { success: false, error: 'Sheet responses tidak ditemukan' };

    var data = sheet.getDataRange().getValues();
    var rHeaderRow = detectHeaderRowGas(sheet, ['Submission ID', 'SITE ID', 'Submitted At']);
    var colMap = getHeaderColumnMapGas(sheet, rHeaderRow);
    var colId = colMap['submission id'] || 1;
    var colApproval = colMap['approval status'] || 33;
    var colApprovedBy = colMap['approved by'] || 34;
    var colApprovedAt = colMap['approved at'] || 35;
    var colNotes = colMap['notes'] || 36;
    var colSite = colMap['site id'] || 8;

    for (var i = rHeaderRow; i < data.length; i++) {
      if (String(data[i][colId - 1] || '').trim() === String(subId).trim()) {
        var rowIdx = i + 1;
        sheet.getRange(rowIdx, colApproval).setValue(newStatus);
        sheet.getRange(rowIdx, colApprovedBy).setValue(reviewerUser.name);
        sheet.getRange(rowIdx, colApprovedAt).setValue(new Date().toISOString());
        sheet.getRange(rowIdx, colNotes).setValue(notes || '');

        var siteId = data[i][colSite - 1] || '';
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
        rTele === 'mhaniifa' ||
        rTele === 'mahaniifa'
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
