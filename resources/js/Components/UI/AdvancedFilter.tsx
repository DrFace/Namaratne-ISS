import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search, Calendar, RefreshCw, Bookmark, BookmarkPlus, History } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import classNames from 'classnames';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: any }[];
}

interface AdvancedFilterProps {
  options: FilterOption[];
  onFilter: (filters: Record<string, any>) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  moduleId: string; // Used for unique storage of saved filters
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  onFilter,
  onSearch,
  isLoading,
  moduleId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFilters, setSavedFilters] = useState<any[]>(() => {
    const saved = localStorage.getItem(`saved_filters_${moduleId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value || value === '') {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const saveCurrentFilter = () => {
    if (Object.keys(activeFilters).length === 0 && !searchQuery) return;
    
    const name = prompt("Name this filter:", `Filter ${new Date().toLocaleDateString()}`);
    if (!name) return;

    const newSaved = [...savedFilters, { name, filters: activeFilters, query: searchQuery, id: Date.now() }];
    setSavedFilters(newSaved);
    localStorage.setItem(`saved_filters_${moduleId}`, JSON.stringify(newSaved));
  };

  const applySavedFilter = (saved: any) => {
    setActiveFilters(saved.filters);
    setSearchQuery(saved.query);
    onFilter(saved.filters);
    onSearch(saved.query);
  };

  const deleteSavedFilter = (id: number) => {
    const newSaved = savedFilters.filter(s => s.id !== id);
    setSavedFilters(newSaved);
    localStorage.setItem(`saved_filters_${moduleId}`, JSON.stringify(newSaved));
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* GLOBAL SEARCH */}
        <div className="relative flex-1 group">
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search everything..."
            className="pl-12 h-12 rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          {isLoading && (
            <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
          )}
        </div>

        {/* TOGGLE BUTTON */}
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={classNames(
            "h-12 px-6 rounded-2xl gap-2 font-bold transition-all",
            {
              "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800": isOpen || Object.keys(activeFilters).length > 0
            }
          )}
        >
          <Filter className="w-5 h-5" />
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {Object.keys(activeFilters).length > 0 && (
            <span className="ml-1 bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </Button>
      </div>

      {/* FILTER PANEL */}
      {isOpen && (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((option) => (
              <div key={option.key} className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {option.label}
                </label>
                
                {option.type === 'text' && (
                  <Input
                    value={activeFilters[option.key] || ''}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    placeholder={`Filter by ${option.label.toLowerCase()}`}
                    className="h-10 text-sm rounded-xl"
                  />
                )}

                {option.type === 'select' && (
                   <select
                    value={activeFilters[option.key] || ''}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    className="w-full h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                   >
                     <option value="">Any {option.label}</option>
                     {option.options?.map((opt) => (
                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                     ))}
                   </select>
                )}

                {option.type === 'date' && (
                   <div className="relative">
                      <Input
                        type="date"
                        value={activeFilters[option.key] || ''}
                        onChange={(e) => handleFilterChange(option.key, e.target.value)}
                        className="h-10 text-sm rounded-xl pl-10"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   </div>
                )}
              </div>
            ))}
          </div>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex flex-col md:flex-row justify-between gap-4">
             <div className="flex gap-2 items-center text-xs font-bold text-gray-400">
                <History className="w-4 h-4" />
                SAVED SEARCHES:
                <div className="flex flex-wrap gap-2">
                   {savedFilters.length === 0 && <span className="font-normal italic">None yet</span>}
                   {savedFilters.map(saved => (
                      <div key={saved.id} className="flex items-center gap-1">
                         <button 
                            onClick={() => applySavedFilter(saved)}
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded-lg transition-colors"
                         >
                            {saved.name}
                         </button>
                         <button onClick={() => deleteSavedFilter(saved.id)} className="text-gray-300 hover:text-red-500">
                            <X className="w-3 h-3" />
                         </button>
                      </div>
                   ))}
                </div>
             </div>
             <div className="flex gap-3">
                <Button variant="ghost" onClick={saveCurrentFilter} className="gap-2 text-indigo-600">
                  <BookmarkPlus className="w-4 h-4" /> Save
                </Button>
                <Button variant="ghost" onClick={clearFilters} className="text-gray-500 font-bold">
                  Clear All
                </Button>
                <Button onClick={() => setIsOpen(false)} className="px-8 rounded-xl font-bold">
                  Apply Filters
                </Button>
             </div>
          </div>
        </div>
      )}

      {/* ACTIVE FILTER BADGES */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in duration-500">
          {Object.entries(activeFilters).map(([key, value]) => {
            const option = options.find(o => o.key === key);
            if (!option) return null;
            
            let displayValue = value;
            if (option.type === 'select') {
              displayValue = option.options?.find(o => o.value === value)?.label || value;
            }

            return (
              <div 
                key={key}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20 text-xs font-bold"
              >
                <span>{option.label}:</span>
                <span className="opacity-80 font-medium">{displayValue}</span>
                <button 
                  onClick={() => removeFilter(key)}
                  className="hover:bg-indigo-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
