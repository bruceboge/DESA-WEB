
export interface OfflineNewsPost {
  slug: string;
  title: string;
  date: string;
  type: "news" | "event";
  location?: string;
  eventDate?: string;
  coverImage?: string;
  excerpt: string;
  content: string;
  recapPhotos?: string[];
  isPast?: boolean;
}

export interface OfflineNewsData {
  posts: OfflineNewsPost[];
  updatedAt: string;
}

const DB_NAME = "desa-offline";
const DB_VERSION = 1;
const STORE_NAME = "content";
const NEWS_KEY = "news-events";

function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineNews(
  data: OfflineNewsData
): Promise<void> {
  const db = await openOfflineDB();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).put(data, NEWS_KEY);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function getOfflineNews(): Promise<OfflineNewsData | null> {
  const db = await openOfflineDB();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(NEWS_KEY);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function clearOfflineNews(): Promise<void> {
  const db = await openOfflineDB();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).delete(NEWS_KEY);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}
