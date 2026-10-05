/**
 * =====================================================================
 * DESA ANNUAL ENGINEERING GALA REGISTRATION - GOOGLE APPS SCRIPT
 * =====================================================================
 * 
 * Target Sheet Columns (matching the Gala Form):
 * 1.  Name                  - Full name of attendee
 * 2.  Reg Number            - Student Registration Number (e.g. E020-01-1234/2023)
 * 3.  Year of Study         - Academic level (Year 1 to 5, Alumni/Staff)
 * 4.  CONTACT               - Phone number / WhatsApp contact
 * 5.  COURSE                - Engineering program or manual course entered
 * 6.  MEMBERSHIP            - DESA Membership Status (DESA Member / Non-Member)
 * 7.  DIETARY               - Food allergies / special dietary requirements
 * 8.  Presentation Showcase - Summary status ("YES: [Category] - Desc" or "No")
 * 9.  Presentation Category - Category if showcasing on stage
 * 10. Presentation Details  - Description of talent / presentation
 * 11. Payment Commitment    - Reservation status (Deposit: Ksh 500 / Full: Ksh 1,300)
 * 12. Date                  - Registration date (YYYY-MM-DD, Africa/Nairobi)
 * 13. RegTime               - Registration time (hh:mm a, Africa/Nairobi)
 * 
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO UPDATE YOUR EXISTING GOOGLE SHEET (Takes 30 seconds):
 * ─────────────────────────────────────────────────────────────────────
 * 1. In Google Sheets, click:
 *    Extensions > Apps Script
 * 
 * 2. Replace all code in Code.gs with this entire script and click Save (💾).
 * 
 * 3. RUN ONE-CLICK SETUP:
 *    In the toolbar at the top of Apps Script, select "setupGalaHeaders" 
 *    from the dropdown next to "Debug" and click "▶ Run".
 *    -> Check your Google Sheet: All 13 columns are instantly formatted!
 * 
 * 4. UPDATE WEB APP DEPLOYMENT (Crucial!):
 *    - Click "Deploy" (top right) > "Manage deployments".
 *    - Click the ✏️ Edit icon next to your active deployment.
 *    - Change "Version" to: "New version".
 *    - Click "Deploy".
 *    *(If you don't select "New version", Google keeps running the old 6-column script!)*
 * =====================================================================
 */

var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

// Master canonical headers matching all fields from the Gala page form
var GALA_HEADERS = [
  "Name",
  "Reg Number",
  "Year of Study",
  "CONTACT",
  "COURSE",
  "MEMBERSHIP",
  "DIETARY",
  "Presentation Showcase",
  "Presentation Category",
  "Presentation Details",
  "Payment Commitment",
  "Date",
  "RegTime"
];

// Column widths for optimal presentation
var COLUMN_WIDTHS = {
  "name": 220,
  "regnumber": 180,
  "yearofstudy": 130,
  "contact": 190,
  "course": 260,
  "membership": 200,
  "dietary": 200,
  "presentationshowcase": 260,
  "presentationcategory": 200,
  "presentationdetails": 280,
  "paymentcommitment": 220,
  "date": 130,
  "regtime": 120
};

/**
 * Normalizes header string for robust matching (e.g. "Reg Number" -> "regnumber")
 */
function normalizeKey(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Automatically adds a "🏆 DESA Gala" menu to Google Sheets toolbar upon opening
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("🏆 DESA Gala")
      .addItem("✨ Format & Update Columns (13 Columns)", "setupGalaHeaders")
      .addToUi();
  } catch (e) {
    // onOpen may be called in non-UI context, safe to ignore
  }
}

/**
 * ONE-CLICK SETUP FUNCTION
 * Run this function directly inside Apps Script editor:
 * Select "setupGalaHeaders" in the dropdown and click "▶ Run".
 * It will instantly format and set the 13 columns on your active sheet!
 */
function setupGalaHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getGalaSheet(ss);

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  // If there is existing data under the old 6 columns, migrate rows gracefully
  if (lastRow > 1 && lastCol > 0) {
    var oldHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var oldNorms = oldHeaders.map(normalizeKey);

    // Read all data rows
    var numDataRows = lastRow - 1;
    var oldData = sheet.getRange(2, 1, numDataRows, lastCol).getValues();

    // Map each existing row into the new 13-column schema
    var newData = [];
    for (var r = 0; r < oldData.length; r++) {
      var oldRow = oldData[r];
      var newRow = [];

      for (var c = 0; c < GALA_HEADERS.length; c++) {
        var canonicalNorm = normalizeKey(GALA_HEADERS[c]);
        var matchedVal = "";

        for (var o = 0; o < oldNorms.length; o++) {
          if (oldNorms[o] === canonicalNorm ||
              (canonicalNorm === "regnumber" && (oldNorms[o] === "regno" || oldNorms[o] === "registration")) ||
              (canonicalNorm === "yearofstudy" && oldNorms[o] === "year") ||
              (canonicalNorm === "presentationshowcase" && oldNorms[o] === "presentation") ||
              (canonicalNorm === "paymentcommitment" && (oldNorms[o] === "paymentstatus" || oldNorms[o] === "seatreservation"))) {
            matchedVal = oldRow[o];
            break;
          }
        }

        // Fill sensible defaults for new columns on migrated rows
        if (!matchedVal) {
          if (canonicalNorm === "dietary") matchedVal = "Standard / None";
          else if (canonicalNorm === "presentationshowcase") matchedVal = "No";
          else if (canonicalNorm === "presentationcategory") matchedVal = "-";
          else if (canonicalNorm === "presentationdetails") matchedVal = "-";
          else if (canonicalNorm === "paymentcommitment") matchedVal = "Deposit: Ksh 500 (Early Bird: Ksh 1,300)";
        }

        newRow.push(matchedVal);
      }
      newData.push(newRow);
    }

    // Clear old sheet contents and write new schema
    sheet.clearContents();
    sheet.getRange(1, 1, 1, GALA_HEADERS.length).setValues([GALA_HEADERS]);
    sheet.getRange(2, 1, newData.length, GALA_HEADERS.length).setValues(newData);

  } else {
    // Fresh sheet or row 1 only: simply write the 13 headers
    if (lastCol > 0) {
      sheet.getRange(1, 1, 1, Math.max(lastCol, GALA_HEADERS.length)).clearContent();
    }
    sheet.getRange(1, 1, 1, GALA_HEADERS.length).setValues([GALA_HEADERS]);
  }

  // Apply styling and widths
  styleHeaderRange(sheet, 1, 1, 1, GALA_HEADERS.length);
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  for (var i = 0; i < GALA_HEADERS.length; i++) {
    var norm = normalizeKey(GALA_HEADERS[i]);
    var width = COLUMN_WIDTHS[norm] || 180;
    sheet.setColumnWidth(i + 1, width);
  }

  Logger.log("✅ Successfully updated sheet '" + sheet.getName() + "' to 13 Gala columns!");
  return "Successfully updated sheet to 13 Gala columns!";
}

/**
 * GET Handler - Health check & diagnostic status & setup trigger
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "status";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // URL-triggered setup (e.g. ?action=setup)
    if (action === "setup" || action === "updateHeaders") {
      var msg = setupGalaHeaders();
      return jsonResponse({
        status: "success",
        message: msg,
        columns: GALA_HEADERS,
        timestamp: new Date().toISOString()
      }, 200);
    }

    var sheet = getGalaSheet(ss);
    var totalRows = Math.max(0, sheet.getLastRow() - 1);

    if (action === "stats") {
      var data = totalRows > 0 ? sheet.getRange(2, 1, totalRows, sheet.getLastColumn()).getValues() : [];
      var membersCount = 0;
      var presentationCount = 0;

      for (var i = 0; i < data.length; i++) {
        var rowText = data[i].join(" ").toLowerCase();
        if (rowText.indexOf("desa member") !== -1) membersCount++;
        if (rowText.indexOf("yes:") !== -1 || rowText.indexOf("showcase") !== -1) presentationCount++;
      }

      return jsonResponse({
        status: "active",
        service: "DESA Gala Registration Webhook",
        sheetName: sheet.getName(),
        totalRegistrations: totalRows,
        desaMembers: membersCount,
        nonMembers: totalRows - membersCount,
        presentationsRegistered: presentationCount,
        timestamp: new Date().toISOString()
      }, 200);
    }

    return jsonResponse({
      status: "active",
      service: "DESA Gala Registration Webhook",
      message: "Ready to accept Gala registrations via POST requests.",
      columns: GALA_HEADERS,
      totalRegistrations: totalRows,
      timestamp: new Date().toISOString()
    }, 200);
  } catch (err) {
    return jsonResponse({ status: "error", error: err.toString() }, 500);
  }
}

/**
 * POST Handler - Appends a new Gala registration row matching all form fields
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000); // 30-second lock to prevent concurrency race conditions

  if (!hasLock) {
    return jsonResponse({
      status: "error",
      error: "Registration server is busy. Please retry in a few moments."
    }, 503);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = {};

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return jsonResponse({ status: "error", error: "Malformed JSON payload: " + parseErr.message }, 400);
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    // 1. Verify GALA_SCRIPT_SECRET
    var expectedSecret = SCRIPT_PROPERTIES.getProperty("GALA_SCRIPT_SECRET") || 
                         SCRIPT_PROPERTIES.getProperty("SHARED_SECRET") || "";
    
    if (expectedSecret) {
      var providedSecret = payload.secret || 
                           payload.GALA_SCRIPT_SECRET || 
                           (e.parameter && (e.parameter.secret || e.parameter.GALA_SCRIPT_SECRET)) || "";
      
      if (providedSecret !== expectedSecret) {
        return jsonResponse({
          status: "error",
          error: "Unauthorized: Invalid or missing GALA_SCRIPT_SECRET"
        }, 401);
      }
    }

    // 2. Resolve target sheet and ensure all 13 columns exist
    var sheet = getGalaSheet(ss);
    var activeHeaders = ensureCompleteHeaders(sheet);

    // 3. Extract and normalize fields from Gala page form
    var now = new Date();
    var defaultDate = Utilities.formatDate(now, "Africa/Nairobi", "yyyy-MM-dd");
    var defaultTime = Utilities.formatDate(now, "Africa/Nairobi", "hh:mm a");

    var rowName = String(payload.name || payload.Name || payload.fullName || "").trim();
    var rowRegNo = String(payload.regNumber || payload.regNo || payload.REG_NO || payload["Reg Number"] || payload.ticketCode || "").trim().toUpperCase();
    var rowYear = String(payload.yearOfStudy || payload.year || payload.YEAR || payload["Year of Study"] || "").trim();
    var rowContact = String(payload.contact || payload.CONTACT || payload.phone || "").trim();
    var rowCourse = String(payload.course || payload.COURSE || payload.department || payload["Course / Program"] || "").trim();
    var rowMembership = String(payload.membership || payload.MEMBERSHIP || payload.membershipStatus || "Non-Member / Guest").trim();
    var rowDietary = String(payload.dietary || payload.DIETARY || payload.dietaryNotes || payload["Dietary Notes"] || "Standard / None").trim();

    // Presentation & Talent details
    var hasPresentation = Boolean(
      payload.hasPresentation === true ||
      payload.hasPresentation === "true" ||
      payload.hasPresentation === "Yes" ||
      (payload.presentation && String(payload.presentation).toLowerCase().indexOf("yes") === 0)
    );
    var rowPresentationCat = String(payload.presentationCategory || payload.PRESENTATION_CATEGORY || "").trim();
    var rowPresentationDesc = String(payload.presentationDesc || payload.PRESENTATION_DESC || "").trim();

    var rowPresentationSummary = "";
    if (payload.presentation || payload.PRESENTATION || payload["Presentation Showcase"]) {
      rowPresentationSummary = String(payload.presentation || payload.PRESENTATION || payload["Presentation Showcase"]).trim();
    } else if (hasPresentation) {
      rowPresentationSummary = "YES: [" + (rowPresentationCat || "Talent Showcase") + "] - " + (rowPresentationDesc || "Details on file");
    } else {
      rowPresentationSummary = "No";
    }

    if (!rowPresentationCat) {
      rowPresentationCat = hasPresentation ? "Talent / Presentation" : "-";
    }
    if (!rowPresentationDesc) {
      rowPresentationDesc = hasPresentation ? "Pending Stage Coordination" : "-";
    }

    var rowPaymentStatus = String(
      payload.paymentStatus ||
      payload.PAYMENT_STATUS ||
      payload.SEAT_RESERVATION ||
      "Deposit: Ksh 500 (Early Bird: Ksh 1,300)"
    ).trim();

    var rowDate = String(payload.date || payload.Date || defaultDate).trim();
    var rowRegTime = String(payload.regTime || payload.RegTime || payload.timestamp || defaultTime).trim();

    // Append email to contact if provided separately and not already present
    var extraEmail = String(payload.email || "").trim();
    if (extraEmail && rowContact.indexOf(extraEmail) === -1) {
      rowContact = rowContact ? (rowContact + " | " + extraEmail) : extraEmail;
    }

    // Required field validation
    if (!rowName) {
      return jsonResponse({ status: "error", error: "Missing required field: Name" }, 400);
    }
    if (!rowContact) {
      return jsonResponse({ status: "error", error: "Missing required field: CONTACT" }, 400);
    }

    // Build map of normalized values
    var valueMap = {
      name: rowName,
      fullname: rowName,
      regnumber: rowRegNo,
      regno: rowRegNo,
      studentregno: rowRegNo,
      yearofstudy: rowYear,
      year: rowYear,
      academicstage: rowYear,
      contact: rowContact,
      phone: rowContact,
      whatsapp: rowContact,
      course: rowCourse || "Engineering General",
      program: rowCourse || "Engineering General",
      department: rowCourse || "Engineering General",
      membership: rowMembership,
      membershipstatus: rowMembership,
      dietary: rowDietary,
      dietarynotes: rowDietary,
      allergies: rowDietary,
      presentationshowcase: rowPresentationSummary,
      presentation: rowPresentationSummary,
      talent: rowPresentationSummary,
      presentationcategory: rowPresentationCat,
      category: rowPresentationCat,
      presentationdetails: rowPresentationDesc,
      presentationdesc: rowPresentationDesc,
      paymentcommitment: rowPaymentStatus,
      paymentstatus: rowPaymentStatus,
      seatreservation: rowPaymentStatus,
      deposit: rowPaymentStatus,
      date: rowDate,
      regtime: rowRegTime,
      time: rowRegTime,
      timestamp: rowRegTime
    };

    // 4. Assemble row according to active column order in the Google Sheet
    var rowData = [];
    for (var col = 0; col < activeHeaders.length; col++) {
      var normHeader = normalizeKey(activeHeaders[col]);
      var cellValue = "";

      if (valueMap.hasOwnProperty(normHeader)) {
        cellValue = valueMap[normHeader];
      } else if (normHeader.indexOf("name") !== -1) {
        cellValue = rowName;
      } else if (normHeader.indexOf("regno") !== -1 || normHeader.indexOf("regnumber") !== -1) {
        cellValue = rowRegNo;
      } else if (normHeader.indexOf("year") !== -1) {
        cellValue = rowYear;
      } else if (normHeader.indexOf("contact") !== -1 || normHeader.indexOf("phone") !== -1) {
        cellValue = rowContact;
      } else if (normHeader.indexOf("course") !== -1 || normHeader.indexOf("program") !== -1) {
        cellValue = rowCourse || "Engineering General";
      } else if (normHeader.indexOf("member") !== -1) {
        cellValue = rowMembership;
      } else if (normHeader.indexOf("diet") !== -1 || normHeader.indexOf("allergy") !== -1) {
        cellValue = rowDietary;
      } else if (normHeader.indexOf("cat") !== -1) {
        cellValue = rowPresentationCat;
      } else if (normHeader.indexOf("detail") !== -1 || normHeader.indexOf("desc") !== -1) {
        cellValue = rowPresentationDesc;
      } else if (normHeader.indexOf("present") !== -1 || normHeader.indexOf("showcase") !== -1) {
        cellValue = rowPresentationSummary;
      } else if (normHeader.indexOf("pay") !== -1 || normHeader.indexOf("seat") !== -1 || normHeader.indexOf("deposit") !== -1) {
        cellValue = rowPaymentStatus;
      } else if (normHeader.indexOf("time") !== -1) {
        cellValue = rowRegTime;
      } else if (normHeader.indexOf("date") !== -1) {
        cellValue = rowDate;
      }

      rowData.push(cellValue);
    }

    // Append the row
    sheet.appendRow(rowData);
    var lastRow = sheet.getLastRow();

    return jsonResponse({
      status: "success",
      message: "Gala attendee registered successfully",
      rowNumber: lastRow,
      entry: {
        Name: rowName,
        "Reg Number": rowRegNo,
        "Year of Study": rowYear,
        CONTACT: rowContact,
        COURSE: rowCourse,
        MEMBERSHIP: rowMembership,
        DIETARY: rowDietary,
        "Presentation Showcase": rowPresentationSummary,
        "Presentation Category": rowPresentationCat,
        "Presentation Details": rowPresentationDesc,
        "Payment Commitment": rowPaymentStatus,
        Date: rowDate,
        RegTime: rowRegTime
      }
    }, 200);

  } catch (err) {
    return jsonResponse({
      status: "error",
      error: "Execution failed: " + err.toString()
    }, 500);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

/**
 * Finds or creates the Gala sheet.
 * Intelligently targets the user's current sheet whether it's named
 * "GalaRegistrations", "Gala", "Sheet1", or active sheet.
 */
function getGalaSheet(ss) {
  // 1. Look for sheet named "GalaRegistrations"
  var sheet = ss.getSheetByName("GalaRegistrations");
  if (sheet) return sheet;

  // 2. Look for sheets with "gala" in the title
  var allSheets = ss.getSheets();
  for (var i = 0; i < allSheets.length; i++) {
    if (allSheets[i].getName().toLowerCase().indexOf("gala") !== -1) {
      return allSheets[i];
    }
  }

  // 3. Look for sheet whose row 1 contains "name" and "contact"
  for (var j = 0; j < allSheets.length; j++) {
    if (allSheets[j].getLastRow() > 0) {
      var row1 = allSheets[j].getRange(1, 1, 1, Math.min(10, allSheets[j].getLastColumn())).getValues()[0].join(" ").toLowerCase();
      if (row1.indexOf("name") !== -1 && (row1.indexOf("contact") !== -1 || row1.indexOf("course") !== -1)) {
        return allSheets[j];
      }
    }
  }

  // 4. Fallback to active sheet or first sheet
  sheet = ss.getActiveSheet() || allSheets[0];
  return sheet;
}

/**
 * Ensures all form columns are present on Row 1.
 * If sheet is brand new, creates complete styled headers.
 * If sheet already has older/fewer headers, appends any missing ones cleanly.
 */
function ensureCompleteHeaders(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  // Fresh sheet initialization
  if (lastRow === 0 || lastCol === 0) {
    sheet.appendRow(GALA_HEADERS);
    styleHeaderRange(sheet, 1, 1, 1, GALA_HEADERS.length);
    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1);

    for (var i = 0; i < GALA_HEADERS.length; i++) {
      var norm = normalizeKey(GALA_HEADERS[i]);
      var width = COLUMN_WIDTHS[norm] || 160;
      sheet.setColumnWidth(i + 1, width);
    }

    return GALA_HEADERS.slice();
  }

  // Existing sheet: read existing row 1 headers
  var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var existingNorms = existingHeaders.map(normalizeKey);

  // Check which canonical headers are missing
  var missingHeaders = [];
  for (var k = 0; k < GALA_HEADERS.length; k++) {
    var targetNorm = normalizeKey(GALA_HEADERS[k]);
    var found = false;

    for (var m = 0; m < existingNorms.length; m++) {
      if (existingNorms[m] === targetNorm || 
         (targetNorm === "regnumber" && (existingNorms[m] === "regno" || existingNorms[m] === "ticketcode")) ||
         (targetNorm === "yearofstudy" && existingNorms[m] === "year") ||
         (targetNorm === "dietary" && existingNorms[m] === "dietarynotes") ||
         (targetNorm === "presentationshowcase" && (existingNorms[m] === "presentation" || existingNorms[m] === "talent")) ||
         (targetNorm === "paymentcommitment" && (existingNorms[m] === "paymentstatus" || existingNorms[m] === "seatreservation"))) {
        found = true;
        break;
      }
    }

    if (!found) {
      missingHeaders.push(GALA_HEADERS[k]);
    }
  }

  // Append any missing headers to the end of Row 1
  if (missingHeaders.length > 0) {
    var startCol = lastCol + 1;
    var newRange = sheet.getRange(1, startCol, 1, missingHeaders.length);
    newRange.setValues([missingHeaders]);
    styleHeaderRange(sheet, 1, startCol, 1, missingHeaders.length);

    for (var h = 0; h < missingHeaders.length; h++) {
      var colIndex = startCol + h;
      var hNorm = normalizeKey(missingHeaders[h]);
      var colWidth = COLUMN_WIDTHS[hNorm] || 180;
      sheet.setColumnWidth(colIndex, colWidth);
    }

    // Refresh headers list
    existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  return existingHeaders;
}

/**
 * Applies DESA Midnight Navy & Gold aesthetic to header cells
 */
function styleHeaderRange(sheet, startRow, startCol, numRows, numCols) {
  var range = sheet.getRange(startRow, startCol, numRows, numCols);
  range.setFontWeight("bold");
  range.setFontFamily("Segoe UI");
  range.setFontSize(10);
  range.setBackground("#071325"); // DESA Midnight Navy
  range.setFontColor("#e5a93c"); // DESA Gold
  range.setHorizontalAlignment("center");
  range.setVerticalAlignment("middle");
  range.setWrap(true);
}

/**
 * Helper to build JSON Response
 */
function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
