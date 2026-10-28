import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before seeding.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function loadJson(filename) {
  const contents = await fs.readFile(path.join(root, "content", "data", filename), "utf8");
  return JSON.parse(contents);
}

const seedRecords = [
  ...(await loadJson("articles.json")).map((data) => ({
    id: data.id,
    record_type: "article",
    data,
  })),
  ...(await loadJson("gallery.json")).map((data) => ({
    id: data.id,
    record_type: "gallery",
    data,
  })),
  ...(await loadJson("news.json")).map((data) => ({
    id: data.id || `news-${data.slug}`,
    record_type: "news",
    data: { ...data, id: data.id || `news-${data.slug}` },
  })),
];

const ids = seedRecords.map((record) => record.id);
const { data: existing, error: lookupError } = await supabase
  .from("portal_records")
  .select("id")
  .in("id", ids);

if (lookupError) throw new Error(`Could not check existing records: ${lookupError.message}`);

const existingIds = new Set((existing || []).map((row) => row.id));
const missingRecords = seedRecords.filter((record) => !existingIds.has(record.id));

if (missingRecords.length) {
  const { error } = await supabase.from("portal_records").insert(missingRecords);
  if (error) throw new Error(`Could not seed initial content: ${error.message}`);
}

console.log(`Seed complete: inserted ${missingRecords.length} initial records; left existing records unchanged.`);
