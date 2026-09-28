/**
 * =====================================================================
 * DESA MEMBER REGISTRATION - GOOGLE APPS SCRIPT WEB APP
 * =====================================================================
 * INSTRUCTIONS:
 * 1. Open or create a NEW dedicated Google Sheet (e.g. "DESA - Registered Members 2026/2027")
 * 2. Go to Extensions > Apps Script
 * 3. Replace all code in Code.gs with this script
 * 4. Click Save (disk icon)
 * 5. Click "Deploy" > "New deployment" (or "Manage deployments"):
 *      - Select type: "Web app"
 *      - Description: "DESA Member Registration Webhook"
 *      - Execute as: "Me (<your email>)"
 *      - Who has access: "Anyone"   <--- CRITICAL! Must be "Anyone" so the website can submit entries.
 * 6. Click "Deploy" and authorize permissions when prompted
 * 7. Copy the Web App URL (ends in /exec) into .env.local:
 *      GOOGLE_SHEETS_MEMBERS_URL="https://script.google.com/macros/s/.../exec"
 * =====================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // Initialize Header Row if empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Member ID",
        "Registration Date",
        "Time",
        "Full Name",
        "Registration Number",
        "Email Address",
        "Phone Number",
        "Department",
        "Year of Study",
        "Primary Interest",
        "Contribution",
        "Membership Status"
      ];
      sheet.appendRow(headers);

      // Styling the header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#071325"); // DESA Midnight Navy
      headerRange.setFontColor("#e5a93c"); // DESA Academic Gold
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Deduplication check: Avoid multiple logging if the same Member ID is re-transmitted
    var lastRow = sheet.getLastRow();
    if (lastRow > 1 && data.memberId) {
      var numRowsToCheck = Math.min(20, lastRow - 1);
      var recentValues = sheet.getRange(lastRow - numRowsToCheck + 1, 1, numRowsToCheck, 1).getValues();
      for (var i = 0; i < recentValues.length; i++) {
        if (String(recentValues[i][0]) === String(data.memberId)) {
          return ContentService
            .createTextOutput(JSON.stringify({ status: "success", message: "Member registration already recorded" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Append member registration row
    sheet.appendRow([
      data.memberId || ("DESA-DKUT-" + Math.floor(1000 + Math.random() * 9000)),
      data.registrationDate || Utilities.formatDate(new Date(), "Africa/Nairobi", "yyyy-MM-dd"),
      data.timestamp || Utilities.formatDate(new Date(), "Africa/Nairobi", "hh:mm a"),
      data.fullName || "",
      data.regNumber || "",
      data.email || "",
      data.phone || "",
      data.department || "",
      data.yearOfStudy || "",
      data.interest || "",
      data.contribution || "Ksh 200 / yr",
      data.status || "Active Registered Member"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Member registration recorded" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "active", service: "DESA Member Registration Webhook" }))
    .setMimeType(ContentService.MimeType.JSON);
}
