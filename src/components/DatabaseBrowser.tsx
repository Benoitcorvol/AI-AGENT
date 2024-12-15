import React, { useEffect, useState } from 'react';
import { openDB, StoreNames } from '../db/dbSetup';
import { Database, RefreshCw, X, ChevronRight, Search, Table, FileJson, AlertCircle } from 'lucide-react';

interface ColumnDef {
  key: string;
  label: string;
}

interface DataRow {
  [key: string]: unknown;
}

interface ModalData {
  title: string;
  content: unknown;
}

const DatabaseBrowser: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<StoreNames>('agents');
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const stores: StoreNames[] = ['agents', 'tools', 'workflows', 'model_configs'];

  const openModal = (title: string, content: unknown) => {
    setModalData({ title, content });
  };

  const refreshData = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
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
        setIsRefreshing(false);
        setIsLoading(false);
      };

      request.onerror = () => {
        throw new Error(request.error?.message || 'Failed to fetch data');
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
      setColumns([]);
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedStore]);

  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatValue = (value: unknown, colKey: string): JSX.Element => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (typeof value === 'object') {
      const preview = JSON.stringify(value).slice(0, 20) + '...';
      return (
        <button
          onClick={() => openModal(colKey, value)}
          className="text-left px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-[#DCF8C6] focus:outline-none focus:ring-2 focus:ring-[#128C7E]/40 transition-all duration-200 group flex items-center gap-1 sm:gap-2 w-full"
        >
          <FileJson className="w-3 h-3 sm:w-4 sm:h-4 text-[#128C7E] shrink-0" />
          <code className="text-xs sm:text-sm font-mono text-gray-600 truncate">{preview}</code>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#128C7E] opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-auto" />
        </button>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-[#DCF8C6] text-[#075E54]' : 'bg-red-100 text-red-800'
        }`}>
          {value.toString()}
        </span>
      );
    }

    const stringValue = String(value);
    if (stringValue.length > 30) {
      return (
        <button
          onClick={() => openModal(colKey, stringValue)}
          className="text-left hover:bg-[#DCF8C6] px-2 sm:px-3 py-1 sm:py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#128C7E]/40 transition-all duration-200 group flex items-center gap-1 sm:gap-2 w-full"
        >
          <span className="text-xs sm:text-sm text-gray-600 truncate">{stringValue.slice(0, 30)}...</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#128C7E] opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-auto" />
        </button>
      );
    }

    return <span className="text-xs sm:text-sm text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5">{stringValue}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-[#075E54] text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Browser
            </h2>
            <p className="text-xs sm:text-sm text-green-100 mt-1">Browse and inspect database records</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#128C7E] rounded-full text-xs sm:text-sm">
              {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Search Records
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#128C7E] focus:border-transparent transition-shadow"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 sm:flex-none">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Database Store
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value as StoreNames)}
                className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#128C7E] focus:border-transparent transition-shadow"
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
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#128C7E] text-white text-sm rounded-lg hover:bg-[#075E54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:ring-offset-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#128C7E]"></div>
            <p className="text-sm text-gray-500">Loading records...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#DCF8C6] flex items-center justify-center mb-4">
              <Table className="w-6 h-6 sm:w-8 sm:h-8 text-[#128C7E]" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms or selecting a different store'
                : 'This database store is currently empty'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row: DataRow, rowIndex: number) => (
                  <tr 
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className="whitespace-nowrap"
                      >
                        {formatValue(row[col.key], col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-[#075E54] flex items-center gap-2">
                <FileJson className="w-4 h-4 sm:w-5 sm:h-5" />
                {modalData.title}
              </h3>
              <button
                onClick={() => setModalData(null)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#128C7E] rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-auto flex-1">
              <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap break-words bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                {typeof modalData.content === 'object'
                  ? JSON.stringify(modalData.content, null, 2)
                  : String(modalData.content)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseBrowser;
