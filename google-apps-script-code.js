/**
 * =====================================================================
 * DESA ROLL CALL - GOOGLE APPS SCRIPT WEB APP
 * =====================================================================
 * INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace all code in Code.gs with this script
 * 4. Click Save (disk icon)
 * 5. Click "Deploy" > "Manage deployments"
 * 6. Click the pencil (Edit) icon on your deployment:
 *      - Execute as: "Me (<your email>)"
 *      - Who has access: "Anyone"   <--- CRITICAL! If set to "Only myself", submissions fail with 401.
 *      - Version: "New version"
 * 7. Click "Deploy"
 * 8. Copy the Web App URL (ends in /exec) into .env.local:
 *      GOOGLE_SHEETS_ROLL_CALL_URL="https://script.google.com/macros/s/.../exec"
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
        "Record ID",
        "Date",
        "Timestamp",
        "Registration Number",
        "Full Name",
        "Department",
        "Year of Study",
        "Session / Topic"
      ];
      sheet.appendRow(headers);
      
      // Styling the header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#071325");
      headerRange.setFontColor("#e5a93c");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Deduplication check: Avoid multiple logging if the same Record ID is re-transmitted
    var lastRow = sheet.getLastRow();
    if (lastRow > 1 && data.id) {
      var numRowsToCheck = Math.min(20, lastRow - 1);
      var recentValues = sheet.getRange(lastRow - numRowsToCheck + 1, 1, numRowsToCheck, 1).getValues();
      for (var i = 0; i < recentValues.length; i++) {
        if (String(recentValues[i][0]) === String(data.id)) {
          return ContentService
            .createTextOutput(JSON.stringify({ status: "success", message: "Check-in already recorded" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Append attendee check-in row
    sheet.appendRow([
      data.id || ("RC-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000)),
      data.sessionDate || Utilities.formatDate(new Date(), "Africa/Nairobi", "yyyy-MM-dd"),
      data.timestamp || Utilities.formatDate(new Date(), "Africa/Nairobi", "hh:mm a"),
      data.regNumber || "",
      data.fullName || "",
      data.department || "",
      data.yearOfStudy || "",
      data.sessionTopic || "General Assembly"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Check-in recorded" }))
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
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var records = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[3]) continue; // Skip empty rows

      var dateVal = row[1];
      if (dateVal instanceof Date) {
        dateVal = Utilities.formatDate(dateVal, "Africa/Nairobi", "yyyy-MM-dd");
      }

      records.push({
        id: String(row[0] || ""),
        sessionDate: String(dateVal || ""),
        timestamp: String(row[2] || ""),
        regNumber: String(row[3] || ""),
        fullName: String(row[4] || ""),
        department: String(row[5] || ""),
        yearOfStudy: String(row[6] || ""),
        sessionTopic: String(row[7] || "General Assembly")
      });
    }

    // Return newest records first
    records.reverse();

    return ContentService
      .createTextOutput(JSON.stringify(records))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
