/**
 * =====================================================================
 * DESA GALA REGISTRATION - GOOGLE APPS SCRIPT
 * =====================================================================
 * 
 * 12 Columns in Exact Order:
 * 1.  Timestamp              (Date & Time: YYYY-MM-DD hh:mm a)
 * 2.  Full Name              (Attendee Name)
 * 3.  Reg Number             (Student Registration Number)
 * 4.  Year of Study          (Year 1 - 5, Alumni / Staff)
 * 5.  Phone / WhatsApp       (Contact Number)
 * 6.  Course / Program       (Engineering Discipline)
 * 7.  DESA Membership        (DESA Member [RegNo] / Non-Member)
 * 8.  Dietary Requirements   (Allergies / Special Dietary Needs)
 * 9.  Has Presentation       (Yes / No)
 * 10. Presentation Category  (Music, Dance, Comedy, Innovation, etc.)
 * 11. Presentation Details   (Description of performance/talent)
 * 12. Payment Commitment     (Deposit: Ksh 500 / Full: Ksh 1,300)
 * 
 * ─────────────────────────────────────────────────────────────────────
 * 2-STEP SETUP (Takes 30 seconds):
 * ─────────────────────────────────────────────────────────────────────
 * Step 1: In your Google Sheet, click Extensions > Apps Script.
 *         Delete any existing code, paste this script, and save (Ctrl+S / 💾).
 * 
 * Step 2: In the toolbar dropdown next to "Debug", select "setupSheet" 
 *         and click "▶ Run".
 *         -> Switch to your Google Sheet: All 12 columns are ready!
 * 
 * Step 3: Deploy:
 *         Click "Deploy" > "Manage deployments" > ✏️ Edit > Version: "New version" > "Deploy".
 *         (Make sure "Who has access" is set to "Anyone").
 * =====================================================================
 */

var GALA_HEADERS = [
  "Timestamp",
  "Full Name",
  "Reg Number",
  "Year of Study",
  "Phone / WhatsApp",
  "Course / Program",
  "DESA Membership",
  "Dietary Requirements",
  "Has Presentation",
  "Presentation Category",
  "Presentation Details",
  "Payment Commitment"
];

var COLUMN_WIDTHS = [160, 200, 160, 120, 160, 220, 180, 200, 130, 200, 260, 180];

/**
 * Run this function once from Apps Script (select 'setupSheet' and click 'Run').
 * It formats Row 1 with all 12 columns in Midnight Navy & Gold.
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("GalaRegistrations") || ss.getActiveSheet();

  // Reset Row 1
  sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), GALA_HEADERS.length)).clearContent();
  sheet.getRange(1, 1, 1, GALA_HEADERS.length).setValues([GALA_HEADERS]);

  var range = sheet.getRange(1, 1, 1, GALA_HEADERS.length);
  range.setFontWeight("bold");
  range.setFontFamily("Segoe UI");
  range.setFontSize(10);
  range.setBackground("#071325"); // Midnight Navy
  range.setFontColor("#e5a93c"); // Gold
  range.setHorizontalAlignment("center");
  range.setVerticalAlignment("middle");
  range.setWrap(true);

  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  for (var i = 0; i < COLUMN_WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, COLUMN_WIDTHS[i]);
  }

  Logger.log("✅ Sheet configured with 12 Gala columns successfully!");
}

/**
 * Webhook POST handler: Directly appends attendee data
 */
function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("GalaRegistrations") || ss.getActiveSheet();

    // Auto-setup headers if row 1 is empty
    if (sheet.getLastRow() === 0) {
      setupSheet();
    }

    var now = new Date();
    var defaultDate = Utilities.formatDate(now, "Africa/Nairobi", "yyyy-MM-dd");
    var defaultTime = Utilities.formatDate(now, "Africa/Nairobi", "hh:mm a");

    // 1. EXTRACT DATA WITH DIRECT FALLBACKS
    var timestamp = String(payload.timestamp || (defaultDate + " " + defaultTime)).trim();
    var name = String(payload.name || payload.fullName || payload.Name || "").trim();
    var regNumber = String(payload.regNumber || payload.regNo || payload.REG_NO || payload["Reg Number"] || "").trim().toUpperCase();
    var yearOfStudy = String(payload.yearOfStudy || payload.year || payload.YEAR || payload["Year of Study"] || "").trim();
    var contact = String(payload.contact || payload.phone || payload.CONTACT || "").trim();
    var course = String(payload.course || payload.COURSE || payload.department || "").trim();
    var membership = String(payload.membership || payload.MEMBERSHIP || "Non-Member / Guest").trim();

    // Dietary requirements (always captured)
    var dietary = String(
      payload.dietary ||
      payload.DIETARY ||
      payload.diet ||
      payload["Dietary Requirements"] ||
      payload["Dietary Notes"] ||
      "Standard / None"
    ).trim();

    // Presentation & talent details (always captured)
    var hasPres = (
      payload.hasPresentation === true ||
      payload.hasPresentation === "true" ||
      payload.hasPresentation === "Yes" ||
      (payload.presentation && String(payload.presentation).toLowerCase().indexOf("yes") === 0)
    );
    var hasPresStr = hasPres ? "Yes" : "No";

    var presCategory = hasPres
      ? String(payload.presentationCategory || payload.PRESENTATION_CATEGORY || payload["Presentation Category"] || "Talent / Presentation").trim()
      : "None";

    var presDetails = hasPres
      ? String(payload.presentationDesc || payload.presentationDetails || payload.PRESENTATION_DESC || payload["Presentation Details"] || payload.presentation || "-").trim()
      : "None";

    var payment = String(
      payload.paymentStatus ||
      payload.PAYMENT_STATUS ||
      payload.SEAT_RESERVATION ||
      payload["Payment Commitment"] ||
      "Deposit: Ksh 500 (Early Bird: Ksh 1,300)"
    ).trim();

    if (!name) {
      name = "Attendee " + defaultTime;
    }
    if (!contact) {
      contact = "-";
    }

    // 2. DIRECT 12-COLUMN APPEND
    sheet.appendRow([
      timestamp,
      name,
      regNumber,
      yearOfStudy,
      contact,
      course,
      membership,
      dietary,
      hasPresStr,
      presCategory,
      presDetails,
      payment
    ]);

    var lastRow = sheet.getLastRow();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Gala attendee registered",
      row: lastRow,
      data: {
        timestamp: timestamp,
        name: name,
        regNumber: regNumber,
        yearOfStudy: yearOfStudy,
        contact: contact,
        course: course,
        membership: membership,
        dietary: dietary,
        hasPresentation: hasPresStr,
        presentationCategory: presCategory,
        presentationDetails: presDetails,
        payment: payment
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Health check & remote setup
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "status";
  if (action === "setup" || action === "reset") {
    setupSheet();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Sheet reset with 12 Gala columns"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "DESA Gala Registration Service",
    columns: GALA_HEADERS
  })).setMimeType(ContentService.MimeType.JSON);
}
