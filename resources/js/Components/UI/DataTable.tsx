import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Input from './Input';
import Button from './Button';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  itemsPerPage?: number;
  enableSelection?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  bulkActions?: (selectedIds: (string | number)[]) => React.ReactNode;
}

const DataTable = <T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  actions,
  onRowClick,
  itemsPerPage = 10,
  enableSelection = false,
  onSelectionChange,
  bulkActions,
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
      onSelectionChange?.([]);
    } else {
      const allIds = paginatedData.map(i => i.id);
      setSelectedIds(allIds);
      onSelectionChange?.(allIds);
    }
  };

  const toggleSelect = (id: string | number) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleSort = (key: any) => {
    if (!key) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchStr = searchQuery.toLowerCase();
      return Object.values(item).some((val) => 
        String(val).toLowerCase().includes(searchStr)
      );
    });
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        
        {enableSelection && selectedIds.length > 0 && bulkActions && (
          <div className="flex-1 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-center justify-between animate-in slide-in-from-left-4">
             <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
               {selectedIds.length} items selected
             </span>
             <div className="flex gap-2">
                {bulkActions(selectedIds)}
             </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto glass-morphism rounded-2xl border border-white/20 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
            <tr>
              {enableSelection && (
                <th className="px-6 py-4 w-10">
                   <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                   />
                </th>
              )}
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 font-semibold uppercase tracking-wider ${column.className || ''}`}
                >
                  <div 
                    className={`flex items-center gap-2 ${column.sortable ? 'cursor-pointer select-none' : ''}`}
                    onClick={() => column.sortable && column.accessor && handleSort(column.accessor)}
                  >
                    {column.header}
                    {column.sortable && sortConfig.key === column.accessor && (
                      sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-900 bg-transparent">
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors group hover:bg-white/40 dark:hover:bg-white/5 ${onRowClick ? 'cursor-pointer' : ''} ${selectedIds.includes(item.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
              >
                {enableSelection && (
                   <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                   </td>
                )}
                {columns.map((column, idx) => (
                  <td key={idx} className={`px-6 py-4 dark:text-gray-300 font-medium ${column.className || ''}`}>
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-400 italic">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-bold">{sortedData.length}</span> results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
