// Keeps the unlocked data key on this device until sign-out (D-021: "once per device").
// IndexedDB can store CryptoKey objects (structured clone); only non-extractable keys are saved,
// so scripts can use the key but never read its bytes.

const DB_NAME = "mindspace";
const STORE = "device-keys";

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  const open = indexedDB.open(DB_NAME, 1);
  open.onupgradeneeded = () => open.result.createObjectStore(STORE);
  return request(open);
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await request(run(db.transaction(STORE, mode).objectStore(STORE)));
  } finally {
    db.close();
  }
}

export async function saveDeviceKey(
  userId: string,
  key: CryptoKey,
): Promise<void> {
  if (key.extractable) {
    throw new Error("Only non-extractable keys may be kept on the device.");
  }
  await withStore("readwrite", (store) => store.put(key, userId));
}

export async function loadDeviceKey(userId: string): Promise<CryptoKey | null> {
  const key = await withStore<unknown>("readonly", (store) =>
    store.get(userId),
  );
  return key instanceof CryptoKey ? key : null;
}

// On sign-out: forget every key kept on this device.
export async function clearDeviceKeys(): Promise<void> {
  await withStore("readwrite", (store) => store.clear());
}
