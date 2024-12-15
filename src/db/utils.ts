export async function executeTransaction<T>(
  store: IDBObjectStore,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    try {
      const request = operation(store);
      request.onerror = () => {
        console.error('Transaction failed:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => resolve(request.result);
    } catch (error) {
      console.error('Transaction execution failed:', error);
      reject(error);
    }
  });
}

export async function getStoreData<T>(
  store: IDBObjectStore,
  query?: IDBValidKey | IDBKeyRange
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      const request = query ? store.getAll(query) : store.getAll();
      request.onerror = () => {
        console.error('Failed to get data:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        console.log(`Retrieved ${request.result?.length || 0} items from ${store.name}`);
        resolve(request.result || []);
      };
    } catch (error) {
      console.error('Failed to execute getStoreData:', error);
      reject(error);
    }
  });
}