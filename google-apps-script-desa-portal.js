/**
 * =====================================================================
 * DESA UNIFIED PORTAL - GOOGLE APPS SCRIPT WEB APP
 * =====================================================================
 * Idempotent Google Sheets mirror for records stored in Supabase.
 * All application reads and writes go through the Supabase database.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your master Google Sheet (e.g. "DESA - Unified Master Database").
 * 2. Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this script.
 * 4. Project Settings (gear icon) > Script Properties > Add property:
 *      Property: SHARED_SECRET
 *      Value: a newly generated, high-entropy secret matching the Supabase Edge Function secret
 * 5. Deploy > New deployment (or Manage Deployments > Edit > New version):
 *      - Select type: Web app
 *      - Execute as: Me (<your email>)
 *      - Who has access: Anyone
 * 6. Store the published /exec URL and same secret in Supabase Edge Function secrets:
 *      APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
 *      APPS_SCRIPT_SECRET="<same high-entropy secret>"
 * =====================================================================
 */

var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

// ─────────────────────────────────────────────────────────────────────
// GET is a health check only. All application reads come from Supabase.
function doGet() {
  return jsonResponse({ status: "success", service: "DESA Supabase Sheets mirror" });
}

// POST accepts only database outbox events dispatched by the Supabase Edge Function.
function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return jsonResponse({ status: "error", error: "Server busy. Retry shortly." }, 503);
  }

  try {
    var expectedSecret = SCRIPT_PROPERTIES.getProperty("SHARED_SECRET") || "";
    if (!expectedSecret) {
      return jsonResponse({ status: "error", error: "Write access is not configured." }, 503);
    }

    var payload = JSON.parse(e && e.postData && e.postData.contents || "{}");
    if (payload.action !== "syncRecord" || payload.secret !== expectedSecret) {
      return jsonResponse({ status: "error", error: "Unauthorized sync request." }, 401);
    }

    var result = syncSupabaseRecord(SpreadsheetApp.getActiveSpreadsheet(), payload);
    return jsonResponse({ status: "success", result: result });
  } catch (error) {
    console.error("Supabase outbox delivery failed: " + error);
    return jsonResponse({ status: "error", error: "Could not mirror database record." }, 500);
  } finally {
    lock.releaseLock();
  }
}

// Helpers: Sheet Initializer & JSON Formatter
// ─────────────────────────────────────────────────────────────────────
function syncSupabaseRecord(ss, payload) {
  var recordType = String(payload.recordType || "");
  var recordId = String(payload.recordId || "");
  var operation = String(payload.operation || "");
  var record = payload.record || {};
  var sheetConfig = getSupabaseSheetConfig(recordType, record);

  if (!recordId || !sheetConfig || (operation !== "upsert" && operation !== "delete")) {
    throw new Error("Invalid Supabase sync event.");
  }

  var sheet = getOrCreateSheet(ss, sheetConfig.name, sheetConfig.headers);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idHeader = "SupabaseRecordID";
  var idColumn = headers.indexOf(idHeader) + 1;

  if (idColumn === 0) {
    idColumn = sheet.getLastColumn() + 1;
    sheet.getRange(1, idColumn).setValue(idHeader);
  }

  var lastRow = sheet.getLastRow();
  var matchingRow = 0;
  if (lastRow > 1) {
    var ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === recordId) {
        matchingRow = i + 2;
        break;
      }
    }
  }

  if (operation === "delete") {
    if (matchingRow) sheet.deleteRow(matchingRow);
    return { operation: "delete", recordId: recordId, deleted: Boolean(matchingRow) };
  }

  var values = new Array(sheet.getLastColumn()).fill("");
  Object.keys(sheetConfig.values).forEach(function(header) {
    var column = headers.indexOf(header);
    if (column >= 0) {
      values[column] = safeSheetValue(sheetConfig.values[header]);
    }
  });
  values[idColumn - 1] = safeSheetValue(recordId);

  if (matchingRow) {
    sheet.getRange(matchingRow, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }

  return { operation: "upsert", recordId: recordId, sheet: sheetConfig.name };
}

function safeSheetValue(value) {
  if (typeof value !== "string") return value;
  return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
}

function getSupabaseSheetConfig(recordType, record) {
  if (recordType === "membership" || recordType === "registration") {
    return {
      name: "Members",
      headers: ["RegNo", "FullName", "Department", "Year", "Phone", "Email", "MembershipStatus", "PaymentStatus", "MemberID", "DateRegistered"],
      values: {
        RegNo: record.regNumber || "",
        FullName: record.fullName || "",
        Department: record.department || "",
        Year: record.yearOfStudy || "",
        Phone: record.phone || "",
        Email: record.email || "",
        MembershipStatus: record.membershipStatus || record.status || "Active",
        PaymentStatus: record.paymentStatus || record.contribution || "Unpaid",
        MemberID: record.memberId || "",
        DateRegistered: record.registrationDate || ""
      }
    };
  }

  if (recordType === "contact") {
    return {
      name: "Tickets",
      headers: ["TicketID", "Date", "Name", "RegNo", "Email", "Category", "Subject", "Message", "Status", "SecretariatReply"],
      values: {
        TicketID: record.ticketId || "",
        Date: [record.date, record.timestamp].filter(Boolean).join(" "),
        Name: record.name || "",
        RegNo: record.regNumber || "",
        Email: record.email || "",
        Category: record.category || "",
        Subject: record.subject || "",
        Message: record.message || "",
        Status: record.status || "New / Unread",
        SecretariatReply: ""
      }
    };
  }

  if (recordType === "roll_call") {
    return {
      name: "RollCall",
      headers: ["Record ID", "Meeting ID", "Date", "Timestamp", "Registration Number", "Full Name", "Department", "Year of Study", "Session / Topic"],
      values: {
        "Record ID": record.id || "",
        "Meeting ID": record.meetingId || "",
        Date: record.sessionDate || "",
        Timestamp: record.timestamp || "",
        "Registration Number": record.regNumber || "",
        "Full Name": record.fullName || "",
        Department: record.department || "",
        "Year of Study": record.yearOfStudy || "",
        "Session / Topic": record.sessionTopic || "General Assembly"
      }
    };
  }

  if (recordType === "meeting") {
    return {
      name: "Meetings",
      headers: ["Title", "Date", "Location", "Description", "Status"],
      values: {
        Title: record.title || "",
        Date: record.sessionDate || "",
        Location: record.location || "",
        Description: record.description || "",
        Status: record.status || "Draft"
      }
    };
  }

  if (recordType === "article") {
    return {
      name: "Innovations",
      headers: ["SubmissionID", "Date", "Title", "Author", "RegNo", "Department", "Category", "Summary", "Content", "Highlights", "ImageUrl", "ProjectUrl", "Status"],
      values: {
        SubmissionID: record.id || "",
        Date: record.date || "",
        Title: record.title || "",
        Author: record.author || "",
        RegNo: record.regNumber || "",
        Department: record.department || "",
        Category: record.category || "",
        Summary: record.summary || "",
        Content: record.content || "",
        Highlights: Array.isArray(record.highlights) ? record.highlights.join("; ") : "",
        ImageUrl: record.imageUrl || "",
        ProjectUrl: record.externalLink || "",
        Status: record.status || "Pending Review"
      }
    };
  }

  if (recordType === "gala") {
    return {
      name: "GalaRegistrations",
      headers: ["SubmissionID", "Timestamp", "Full Name", "Attendee Type", "Reg Number", "Year of Study", "Phone / WhatsApp", "Email", "Course / Program", "DESA Membership", "Payment Pledge", "Dietary Requirements", "Presentation Showcase", "Presentation Category", "Presentation Details", "M-Pesa Reference", "SupabaseRecordID"],
      values: {
        SubmissionID: record.id || "",
        Timestamp: [record.date, record.regTime].filter(Boolean).join(" "),
        "Full Name": record.name || "",
        "Attendee Type": record.attendeeType || "",
        "Reg Number": record.regNumber || "",
        "Year of Study": record.yearOfStudy || "",
        "Phone / WhatsApp": record.contact || "",
        Email: record.email || "",
        "Course / Program": record.course || "",
        "DESA Membership": record.membership || "",
        "Payment Pledge": record.paymentPledge || "",
        "Dietary Requirements": record.dietary || "",
        "Presentation Showcase": record.presentation || "No",
        "Presentation Category": record.presentationCategory || "",
        "Presentation Details": record.presentationDesc || "",
        "M-Pesa Reference": record.mpesaRef || ""
      }
    };
  }

  if (recordType === "news") {
    return {
      name: "NewsEvents",
      headers: ["ID", "Date", "Type", "Slug", "Title", "EventDate", "Location", "Excerpt", "Content", "CoverImage", "RecapPhotos", "IsPast"],
      values: {
        ID: record.id || "",
        Date: record.date || "",
        Type: record.type || "",
        Slug: record.slug || "",
        Title: record.title || "",
        EventDate: record.eventDate || "",
        Location: record.location || "",
        Excerpt: record.excerpt || "",
        Content: record.content || "",
        CoverImage: record.coverImage || "",
        RecapPhotos: Array.isArray(record.recapPhotos) ? record.recapPhotos.join("; ") : "",
        IsPast: record.isPast || false
      }
    };
  }

  if (recordType === "gallery") {
    return {
      name: "Gallery",
      headers: ["ID", "Title", "Category", "Department", "Location", "Date", "Description", "Image"],
      values: {
        ID: record.id || "",
        Title: record.title || "",
        Category: record.category || "",
        Department: record.department || "",
        Location: record.location || "",
        Date: record.date || "",
        Description: record.description || "",
        Image: record.image || ""
      }
    };
  }

  return null;
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0 && headers && headers.length) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#071325"); // Midnight Navy
    headerRange.setFontColor("#e5a93c"); // Gold
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  } else if (headers && headers.length) {
    var lastColumn = sheet.getLastColumn();
    var existingHeaders = lastColumn
      ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String)
      : [];
    var missingHeaders = headers.filter(function(header) {
      return existingHeaders.indexOf(header) === -1;
    });
    if (missingHeaders.length) {
      var addedHeaderRange = sheet.getRange(1, lastColumn + 1, 1, missingHeaders.length);
      addedHeaderRange.setValues([missingHeaders]);
      addedHeaderRange.setFontWeight("bold");
      addedHeaderRange.setBackground("#071325");
      addedHeaderRange.setFontColor("#e5a93c");
      addedHeaderRange.setHorizontalAlignment("center");
    }
  }
  return sheet;
}

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
