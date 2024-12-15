import React, { useEffect, useState } from 'react';
import { openDB, StoreNames } from '../db/dbSetup';

interface ColumnDef {
  key: string;
  label: string;
}

interface DataRow {
  [key: string]: unknown;
}

const DatabaseBrowser: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<StoreNames>('agents');
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stores: StoreNames[] = ['agents', 'tools', 'workflows', 'model_configs'];

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const refreshData = async () => {
    try {
      setError(null);
      const db = await openDB();
      const transaction = db.transaction(selectedStore, 'readonly');
      const store = transaction.objectStore(selectedStore);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result;
        if (result.length > 0) {
          const sample = result[0];
          const cols = Object.keys(sample).map(key => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
          }));
          setColumns(cols);
          setData(result);
        } else {
          setColumns([]);
          setData([]);
        }
      };

      request.onerror = () => {
        throw new Error(request.error?.message || 'Failed to fetch data');
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
      setColumns([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedStore]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Database Browser</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Store:
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value as StoreNames)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {stores.map(store => (
                <option key={store} value={store}>
                  {store.charAt(0).toUpperCase() + store.slice(1).replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mt-6"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length || 1}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900"
                      >
                        {formatValue(row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatabaseBrowser;
