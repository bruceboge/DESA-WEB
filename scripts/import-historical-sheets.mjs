import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const EXPECTED_HEADERS = {
  members: [
    "RegNo",
    "FullName",
    "Department",
    "Year",
    "Phone",
    "Email",
    "MembershipStatus",
    "PaymentStatus",
    "MemberID",
    "DateRegistered",
  ],
  gala: [
    "Timestamp",
    "Full Name",
    "Attendee Type",
    "Reg Number",
    "Year of Study",
    "Phone / WhatsApp",
    "Course / Program",
    "Payment Pledge",
    "Dietary Requirements",
  ],
};

function parseArgs(args) {
  const options = { commit: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--commit") {
      options.commit = true;
      continue;
    }
    if (argument === "--members" || argument === "--gala" || argument === "--manifest") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Expected a path after ${argument}.`);
      }
      options[argument.slice(2)] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }

  if (!options.members || !options.gala) {
    throw new Error(
      'Usage: npm run supabase:import-history -- --members "<members.csv>" --gala "<gala.csv>" [--manifest "<manifest.csv>"] [--commit]'
    );
  }
  if (options.commit && !options.manifest) {
    throw new Error("--manifest is required with --commit so imported rows can be linked to their existing Sheet rows.");
  }
  return options;
}

function parseCsv(contents, filename, kind) {
  const text = contents.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (!(row.length === 1 && row[0] === "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error(`${filename}: CSV contains an unclosed quoted field.`);
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length < 2) throw new Error(`${filename}: expected a header and at least one data row.`);

  const headers = rows[0];
  if (new Set(headers).size !== headers.length) {
    throw new Error(`${filename}: duplicate column headers are not allowed.`);
  }
  const expected = EXPECTED_HEADERS[kind];
  const missing = expected.filter((header) => !headers.includes(header));
  const unexpected = headers.filter((header) => !expected.includes(header));
  if (missing.length || unexpected.length) {
    throw new Error(
      `${filename}: unexpected CSV columns. Missing: ${missing.join(", ") || "none"}; extra: ${unexpected.join(", ") || "none"}.`
    );
  }

  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`${filename}: malformed CSV row ${index + 2} has the wrong number of columns.`);
    }
    return {
      sourceRow: index + 2,
      values: Object.fromEntries(headers.map((header, column) => [header, values[column].trim()])),
    };
  });
}

function requiredValue(row, field, sourceRow, filename) {
  const value = row[field];
  if (!value) throw new Error(`${filename}: required field "${field}" is empty on row ${sourceRow}.`);
  return value;
}

function assertMaxLength(value, maximum, field, sourceRow, filename) {
  if (value.length > maximum) {
    throw new Error(`${filename}: field "${field}" exceeds ${maximum} characters on row ${sourceRow}.`);
  }
}

function validateMemberRow(row, sourceRow, filename) {
  const fullName = requiredValue(row, "FullName", sourceRow, filename);
  const regNumber = requiredValue(row, "RegNo", sourceRow, filename).toUpperCase();
  const email = requiredValue(row, "Email", sourceRow, filename).toLowerCase();
  const phone = requiredValue(row, "Phone", sourceRow, filename);
  const department = requiredValue(row, "Department", sourceRow, filename);
  const yearOfStudy = requiredValue(row, "Year", sourceRow, filename);
  const memberId = requiredValue(row, "MemberID", sourceRow, filename);
  const membershipStatus = requiredValue(row, "MembershipStatus", sourceRow, filename);
  const paymentStatus = requiredValue(row, "PaymentStatus", sourceRow, filename);
  const registrationDate = requiredValue(row, "DateRegistered", sourceRow, filename);

  assertMaxLength(fullName, 70, "FullName", sourceRow, filename);
  assertMaxLength(regNumber, 30, "RegNo", sourceRow, filename);
  assertMaxLength(email, 100, "Email", sourceRow, filename);
  assertMaxLength(phone, 20, "Phone", sourceRow, filename);
  assertMaxLength(department, 100, "Department", sourceRow, filename);
  assertMaxLength(yearOfStudy, 30, "Year", sourceRow, filename);
  assertMaxLength(memberId, 200, "MemberID", sourceRow, filename);
  assertMaxLength(membershipStatus, 100, "MembershipStatus", sourceRow, filename);
  assertMaxLength(paymentStatus, 100, "PaymentStatus", sourceRow, filename);
  assertMaxLength(registrationDate, 40, "DateRegistered", sourceRow, filename);

  if (
    fullName.length < 2 ||
    /[<>{}]/.test(fullName) ||
    /(https?:\/\/|www\.|\.com|\.org|\.ru|\.xyz)/i.test(fullName)
  ) {
    throw new Error(`${filename}: full name is invalid on row ${sourceRow}.`);
  }
  const registrationPattern =
    /^[A-Z0-9]{3,6}-[0-9]{2}-[0-9]{3,5}\/[0-9]{4}$|^[A-Z0-9/_-]{6,30}$/;
  if (!registrationPattern.test(regNumber)) {
    throw new Error(`${filename}: registration number format is invalid on row ${sourceRow}.`);
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) || /\s/.test(email)) {
    throw new Error(`${filename}: email format is invalid on row ${sourceRow}.`);
  }
  const digitCount = (phone.match(/\d/g) || []).length;
  if (
    phone.length < 9 ||
    /[a-zA-Z]/.test(phone) ||
    !/^[+0-9\s\-()]+$/.test(phone) ||
    digitCount < 9 ||
    digitCount > 15
  ) {
    throw new Error(`${filename}: phone format is invalid on row ${sourceRow}.`);
  }
  return {
    fullName,
    regNumber,
    email,
    phone,
    department,
    yearOfStudy,
    memberId,
    membershipStatus,
    paymentStatus,
    registrationDate,
  };
}

function createImportRecords(memberRows, galaRows, membersFile, galaFile) {
  const memberCandidates = [];
  const seenMemberRegNumbers = new Set();
  let duplicateMemberRowsSkipped = 0;

  for (const { sourceRow, values } of memberRows) {
    const data = validateMemberRow(values, sourceRow, membersFile);
    if (seenMemberRegNumbers.has(data.regNumber.trim().toUpperCase())) {
      duplicateMemberRowsSkipped += 1;
      continue;
    }
    seenMemberRegNumbers.add(data.regNumber.trim().toUpperCase());
    const id = `legacy-members-row-${String(sourceRow).padStart(4, "0")}`;
    memberCandidates.push({
      id,
      record_type: "membership",
      data: {
        memberId: data.memberId,
        registrationDate: data.registrationDate,
        fullName: data.fullName,
        regNumber: data.regNumber,
        email: data.email,
        phone: data.phone,
        department: data.department,
        yearOfStudy: data.yearOfStudy,
        membershipStatus: data.membershipStatus,
        paymentStatus: data.paymentStatus,
      },
      source_file: path.basename(membersFile),
      source_row: sourceRow,
    });
  }

  const galaCandidates = galaRows.map(({ sourceRow, values }) => {
    const timestamp = requiredValue(values, "Timestamp", sourceRow, galaFile);
    const id = `legacy-gala-row-${String(sourceRow).padStart(4, "0")}`;
    const data = {
      id,
      date: timestamp,
      name: requiredValue(values, "Full Name", sourceRow, galaFile),
      attendeeType: requiredValue(values, "Attendee Type", sourceRow, galaFile),
      regNumber: requiredValue(values, "Reg Number", sourceRow, galaFile).toUpperCase(),
      yearOfStudy: requiredValue(values, "Year of Study", sourceRow, galaFile),
      contact: requiredValue(values, "Phone / WhatsApp", sourceRow, galaFile),
      course: requiredValue(values, "Course / Program", sourceRow, galaFile),
      paymentPledge: values["Payment Pledge"],
      dietary: values["Dietary Requirements"],
    };

    for (const [field, maximum] of [
      ["date", 40],
      ["name", 200],
      ["attendeeType", 100],
      ["regNumber", 50],
      ["yearOfStudy", 30],
      ["contact", 300],
      ["course", 120],
      ["paymentPledge", 200],
      ["dietary", 1000],
    ]) {
      assertMaxLength(data[field], maximum, field, sourceRow, galaFile);
    }
    return {
      id,
      record_type: "gala",
      data,
      source_file: path.basename(galaFile),
      source_row: sourceRow,
    };
  });

  return {
    records: [...memberCandidates, ...galaCandidates],
    memberCount: memberCandidates.length,
    galaCount: galaCandidates.length,
    duplicateMemberRowsSkipped,
  };
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function fetchByIds(supabase, ids) {
  const existing = new Map();
  for (let index = 0; index < ids.length; index += 500) {
    const batch = ids.slice(index, index + 500);
    const { data, error } = await supabase
      .from("portal_records")
      .select("id,record_type,data")
      .in("id", batch);
    if (error) throw new Error("Could not check for existing import IDs in Supabase.");
    for (const record of data || []) existing.set(record.id, record);
  }
  return existing;
}

async function fetchExistingMembers(supabase) {
  const records = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("portal_records")
      .select("id,record_type,data")
      .in("record_type", ["membership", "registration"])
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error("Could not check existing member registrations in Supabase.");
    records.push(...(data || []));
    if (!data || data.length < pageSize) return records;
  }
}

async function writeManifest(filename, records) {
  const rows = [
    ["record_type", "source_file", "source_row", "record_id"],
    ...records.map((record) => [
      record.record_type,
      record.source_file,
      String(record.source_row),
      record.id,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const contents = `${csv}\r\n`;
  try {
    await fs.writeFile(filename, contents, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existingContents = await fs.readFile(filename, "utf8");
    if (existingContents !== contents) {
      throw new Error("The manifest path already exists with different content. Choose a new path.");
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const membersFile = path.resolve(options.members);
  const galaFile = path.resolve(options.gala);
  const [membersCsv, galaCsv] = await Promise.all([
    fs.readFile(membersFile, "utf8"),
    fs.readFile(galaFile, "utf8"),
  ]);
  const members = parseCsv(membersCsv, membersFile, "members");
  const gala = parseCsv(galaCsv, galaFile, "gala");
  const result = createImportRecords(members, gala, membersFile, galaFile);

  console.log(`Preflight: ${result.memberCount} member records; ${result.galaCount} Gala records.`);
  console.log(`Duplicate member rows skipped by policy (keep first): ${result.duplicateMemberRowsSkipped}.`);
  console.log("CSV data passed header, required-field, length, and format checks.");

  if (!options.commit) {
    console.log("Dry run only. No database connection or write was made.");
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before committing.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const ids = result.records.map((record) => record.id);
  const existingById = await fetchByIds(supabase, ids);
  const candidates = [];
  for (const record of result.records) {
    const existing = existingById.get(record.id);
    if (!existing) {
      candidates.push(record);
      continue;
    }
    if (
      existing.record_type !== record.record_type ||
      stableJson(existing.data) !== stableJson(record.data)
    ) {
      throw new Error("An import ID already exists with different data. No records were written.");
    }
  }

  const existingMembers = await fetchExistingMembers(supabase);
  const allImportedMemberIds = new Set(
    result.records.filter((record) => record.record_type === "membership").map((record) => record.id)
  );
  const existingRegistrationNumbers = new Set(
    existingMembers
      .filter((record) => !allImportedMemberIds.has(record.id))
      .map((record) => String(record.data?.regNumber || "").trim().toUpperCase())
      .filter(Boolean)
  );
  const conflicts = candidates.filter(
    (record) =>
      record.record_type === "membership" &&
      existingRegistrationNumbers.has(String(record.data.regNumber).trim().toUpperCase())
  );
  if (conflicts.length) {
    throw new Error(
      `${conflicts.length} imported member registration(s) already exist in Supabase. Resolve those conflicts before importing; no records were written.`
    );
  }

  const manifestPath = path.resolve(options.manifest);
  await writeManifest(manifestPath, result.records);
  if (candidates.length) {
    const { error } = await supabase.from("portal_records").insert(
      candidates.map(({ id, record_type, data }) => ({ id, record_type, data }))
    );
    if (error) {
      throw new Error(
        `Supabase rejected the import (error code ${error.code || "unknown"}). No existing records were overwritten.`
      );
    }
  }

  console.log(`Import complete: ${candidates.length} inserted; ${result.records.length - candidates.length} matching prior imports left unchanged.`);
  console.log(`Manifest written to ${manifestPath}.`);
  console.log("Database triggers have queued inserted records for Sheets sync.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Historical import failed.");
  process.exitCode = 1;
});
