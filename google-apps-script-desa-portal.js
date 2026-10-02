/**
 * =====================================================================
 * DESA UNIFIED PORTAL - GOOGLE APPS SCRIPT WEB APP
 * =====================================================================
 * Single unified backend for all DESA forms & services:
 * - Members tab (Registrations & Status Lookup)
 * - Tickets tab (Support & Inquiries + Secretariat Replies)
 * - Opportunities tab (Industrial Attachments & Hackathons)
 * - Notices tab (Homepage Live Notice Ticker)
 * - RollCall tab (General Assembly & Meeting Attendance)
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your master Google Sheet (e.g. "DESA - Unified Master Database").
 * 2. Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this script.
 * 4. Project Settings (gear icon) > Script Properties > Add property:
 *      Property: SHARED_SECRET
 *      Value: (any random secret string, e.g. "desa-dekut-secret-2026")
 * 5. Deploy > New deployment (or Manage Deployments > Edit > New version):
 *      - Select type: Web app
 *      - Execute as: Me (<your email>)
 *      - Who has access: Anyone
 * 6. Copy the published Web App URL (ends in /exec) into .env.local:
 *      APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
 *      APPS_SCRIPT_SECRET="desa-dekut-secret-2026"
 * =====================================================================
 */

var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

// Mask helper: masks "Victor Mutua" -> "Victor M."
function maskFullName(fullName) {
  if (!fullName) return "Student Member";
  var parts = String(fullName).trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  var first = parts[0];
  var last = parts[parts.length - 1];
  return first + " " + last.charAt(0).toUpperCase() + ".";
}

// ─────────────────────────────────────────────────────────────────────
// GET: Read Operations (Lookup, Ticket Status, Opportunities, Notices)
// ─────────────────────────────────────────────────────────────────────
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "health";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // 1. Membership Status Lookup
    if (action === "lookup") {
      var rawReg = (e.parameter.reg || "").trim().toUpperCase();
      if (!rawReg) {
        return jsonResponse({ status: "error", error: "Missing registration number parameter 'reg'" }, 400);
      }

      var membersSheet = getOrCreateSheet(ss, "Members", [
        "RegNo", "FullName", "Department", "Year", "Phone", "Email",
        "MembershipStatus", "PaymentStatus", "MemberID", "DateRegistered"
      ]);

      var data = membersSheet.getDataRange().getValues();
      // Column indexes (0-based):
      // 0: RegNo, 1: FullName, 2: Department, 3: Year, 4: Phone, 5: Email,
      // 6: MembershipStatus, 7: PaymentStatus, 8: MemberID, 9: DateRegistered
      for (var i = data.length - 1; i >= 1; i--) {
        var rowReg = String(data[i][0] || "").trim().toUpperCase();
        if (rowReg === rawReg) {
          return jsonResponse({
            status: "success",
            found: true,
            member: {
              regNumber: rowReg,
              maskedName: maskFullName(data[i][1]),
              department: String(data[i][2] || ""),
              yearOfStudy: String(data[i][3] || ""),
              membershipStatus: String(data[i][6] || "Active"),
              paymentStatus: String(data[i][7] || "Unpaid"),
              memberId: String(data[i][8] || ""),
              dateRegistered: String(data[i][9] || "")
            }
          });
        }
      }

      return jsonResponse({
        status: "success",
        found: false,
        message: "No registered member found with this registration number."
      });
    }

    // 2. Ticket Status & Secretariat Reply Lookup
    if (action === "ticketStatus") {
      var ref = (e.parameter.ref || "").trim().toUpperCase();
      var email = (e.parameter.email || "").trim().toLowerCase();

      if (!ref || !email) {
        return jsonResponse({ status: "error", error: "Missing 'ref' or 'email' parameter" }, 400);
      }

      var ticketsSheet = getOrCreateSheet(ss, "Tickets", [
        "TicketID", "Date", "RegNo", "Email", "Category", "Message",
        "Status", "SecretariatReply"
      ]);

      var tData = ticketsSheet.getDataRange().getValues();
      // 0: TicketID, 1: Date, 2: RegNo, 3: Email, 4: Category, 5: Message, 6: Status, 7: SecretariatReply
      for (var j = tData.length - 1; j >= 1; j--) {
        var rowRef = String(tData[j][0] || "").trim().toUpperCase();
        var rowEmail = String(tData[j][3] || "").trim().toLowerCase();

        if (rowRef === ref) {
          if (rowEmail !== email) {
            return jsonResponse({
              status: "error",
              error: "Email verification failed for this ticket reference."
            }, 403);
          }

          return jsonResponse({
            status: "success",
            ticket: {
              ticketId: rowRef,
              date: String(tData[j][1] || ""),
              category: String(tData[j][4] || ""),
              status: String(tData[j][6] || "Open"),
              secretariatReply: String(tData[j][7] || "No reply posted yet. Secretariat will review shortly.")
            }
          });
        }
      }

      return jsonResponse({
        status: "error",
        error: "Ticket reference not found."
      }, 404);
    }

    // 3. Innovations & Technical Blog (Published Articles)
    if (action === "innovations") {
      var innoSheet = getOrCreateSheet(ss, "Innovations", [
        "SubmissionID", "Date", "Title", "Author", "RegNo", "Department",
        "Category", "Summary", "Content", "Highlights", "ImageUrl", "ProjectUrl", "Status"
      ]);

      var innoData = innoSheet.getDataRange().getValues();
      var innovations = [];
      for (var m = innoData.length - 1; m >= 1; m--) {
        var row = innoData[m];
        if (!row[0] && !row[2]) continue;
        var itemStatus = String(row[12] || "Published").trim().toLowerCase();
        if (itemStatus === "published" || itemStatus === "approved") {
          innovations.push({
            id: String(row[0] || ""),
            date: String(row[1] || ""),
            title: String(row[2] || ""),
            author: String(row[3] || ""),
            department: String(row[5] || ""),
            category: String(row[6] || ""),
            summary: String(row[7] || ""),
            content: String(row[8] || ""),
            highlights: String(row[9] || "").split(";").map(function(s) { return s.trim(); }).filter(Boolean),
            imageUrl: String(row[10] || ""),
            projectUrl: String(row[11] || ""),
            status: "Published"
          });
        }
      }

      return jsonResponse({ status: "success", innovations: innovations });
    }

    // 4. Secretariat Notice (Single active notice)
    if (action === "notices") {
      var noticeSheet = getOrCreateSheet(ss, "Notices", ["Message", "Active"]);
      var nData = noticeSheet.getDataRange().getValues();
      var activeNotice = null;

      for (var n = 1; n < nData.length; n++) {
        var isAct = String(nData[n][1] || "").toLowerCase();
        if (isAct === "true" || isAct === "yes" || isAct === "1") {
          activeNotice = String(nData[n][0] || "").trim();
          break;
        }
      }

      return jsonResponse({ status: "success", notice: activeNotice });
    }

    // Default Health Check
    return jsonResponse({
      status: "active",
      service: "DESA Unified Master Portal Webhook",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return jsonResponse({ status: "error", error: err.toString() }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────
// POST: Write Operations (Registration, Ticket Creation, Roll Call)
// ─────────────────────────────────────────────────────────────────────
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000);

  if (!hasLock) {
    return jsonResponse({ status: "error", error: "Server busy. Please retry in a few seconds." }, 503);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    // 1. Shared Secret Verification (protects against direct script url abuse)
    var expectedSecret = SCRIPT_PROPERTIES.getProperty("SHARED_SECRET") || "";
    if (expectedSecret) {
      var providedSecret = payload.secret || (e.parameter && e.parameter.secret) || "";
      if (providedSecret !== expectedSecret) {
        return jsonResponse({ status: "error", error: "Unauthorized: Invalid shared secret" }, 401);
      }
    }

    // Action detection with fallback auto-detection based on payload fields
    var action = payload.action || "";
    if (!action) {
      if (payload.sessionTopic || (payload.id && String(payload.id).indexOf("RC-") === 0)) {
        action = "rollCall";
      } else if (payload.ticketId || payload.message || payload.category) {
        action = "createTicket";
      } else {
        action = "register";
      }
    }

    var todayDate = Utilities.formatDate(new Date(), "Africa/Nairobi", "yyyy-MM-dd");
    var todayTime = Utilities.formatDate(new Date(), "Africa/Nairobi", "hh:mm a");

    // ─────────────────────────────────────────
    // Action A: Member Registration
    // ─────────────────────────────────────────
    if (action === "register") {
      var membersSheet = getOrCreateSheet(ss, "Members", [
        "RegNo", "FullName", "Department", "Year", "Phone", "Email",
        "MembershipStatus", "PaymentStatus", "MemberID", "DateRegistered"
      ]);

      var regNumber = String(payload.regNumber || "").trim().toUpperCase();
      var memberId = payload.memberId || ("DESA-DKUT-" + Math.floor(1000 + Math.random() * 9000));

      // Append row
      membersSheet.appendRow([
        regNumber,
        payload.fullName || "",
        payload.department || "",
        payload.yearOfStudy || "",
        payload.phone || "",
        (payload.email || "").toLowerCase(),
        payload.membershipStatus || "Active",
        payload.paymentStatus || "Unpaid",
        memberId,
        todayDate
      ]);

      return jsonResponse({
        status: "success",
        memberId: memberId,
        issuedDate: todayDate,
        message: "Member registered successfully"
      });
    }

    // ─────────────────────────────────────────
    // Action B: Create Support / Grievance Ticket
    // ─────────────────────────────────────────
    if (action === "createTicket" || action === "contact") {
      var ticketsSheet = getOrCreateSheet(ss, "Tickets", [
        "TicketID", "Date", "Name", "RegNo", "Email", "Category", "Subject", "Message",
        "Status", "SecretariatReply"
      ]);

      var currentYear = new Date().getFullYear();
      var nextNum = Math.max(1, ticketsSheet.getLastRow());
      var paddedNum = ("0000" + nextNum).slice(-4);
      var ticketId = payload.ticketId || ("DESA-" + currentYear + "-" + paddedNum);

      ticketsSheet.appendRow([
        ticketId,
        todayDate + " " + todayTime,
        payload.name || payload.fullName || "",
        (payload.regNumber || "").toUpperCase(),
        (payload.email || "").toLowerCase(),
        payload.category || "General Inquiry",
        payload.subject || "",
        payload.message || "",
        "Open",
        "" // Secretariat reply empty initially
      ]);

      return jsonResponse({
        status: "success",
        ticketId: ticketId,
        message: "Support ticket registered successfully"
      });
    }

    // ─────────────────────────────────────────
    // Action C: Roll Call Attendance Check-In
    // ─────────────────────────────────────────
    if (action === "rollCall" || action === "roll-call" || action === "rollcall") {
      var rollSheet = getOrCreateSheet(ss, "RollCall", [
        "Record ID", "Date", "Timestamp", "Registration Number", "Full Name",
        "Department", "Year of Study", "Session / Topic"
      ]);

      var recordId = payload.id || payload.recordId || ("RC-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000));

      rollSheet.appendRow([
        recordId,
        payload.sessionDate || todayDate,
        payload.timestamp || todayTime,
        (payload.regNumber || "").toUpperCase(),
        payload.fullName || "",
        payload.department || "",
        payload.yearOfStudy || "",
        payload.sessionTopic || "General Assembly"
      ]);

      return jsonResponse({
        status: "success",
        id: recordId,
        message: "Roll call check-in recorded"
      });
    }

    // 4. Student Innovation / Technical Blog Submission
    if (action === "submitInnovation") {
      var innoSheet = getOrCreateSheet(ss, "Innovations", [
        "SubmissionID", "Date", "Title", "Author", "RegNo", "Department",
        "Category", "Summary", "Content", "Highlights", "ImageUrl", "ProjectUrl", "Status"
      ]);

      var subId = payload.submissionId || ("INNOV-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000));

      innoSheet.appendRow([
        subId,
        payload.date || todayDate,
        payload.title || "",
        payload.author || "",
        (payload.regNumber || "").toUpperCase(),
        payload.department || "",
        payload.category || "General Engineering",
        payload.summary || "",
        payload.content || "",
        payload.highlights || "",
        payload.imageUrl || "",
        payload.projectUrl || "",
        "Pending Review"
      ]);

      return jsonResponse({
        status: "success",
        submissionId: subId,
        message: "Innovation submitted successfully for editorial review."
      });
    }

    return jsonResponse({ status: "error", error: "Unknown action: " + action }, 400);

  } catch (err) {
    return jsonResponse({ status: "error", error: err.toString() }, 500);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// Helpers: Sheet Initializer & JSON Formatter
// ─────────────────────────────────────────────────────────────────────
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
  }
  return sheet;
}

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
