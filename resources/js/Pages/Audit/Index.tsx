import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import DataTable from '@/Components/UI/DataTable';
import Badge from '@/Components/UI/Badge';
import { format } from 'date-fns';
import { 
  ClipboardDocumentCheckIcon, 
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface Log {
  id: number;
  description: string;
  subject_type: string;
  subject_id: number;
  causer: {
    first_name: string;
    last_name: string;
  } | null;
  properties: any;
  created_at: string;
}

interface Props {
  activities: {
    data: Log[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function Index({ activities }: Props) {
  const columns = [
    {
      header: 'Event',
      accessor: (log: Log) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white capitalize">{log.description}</span>
          <span className="text-[10px] text-gray-400 font-mono italic">
            {(log.subject_type || 'System').split('\\').pop()} #{log.subject_id}
          </span>
        </div>
      ),
    },
    {
      header: 'Performed By',
      accessor: (log: Log) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <UserCircleIcon className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {log.causer ? `${log.causer.first_name} ${log.causer.last_name}` : 'System'}
          </span>
        </div>
      ),
    },
    {
      header: 'Changes',
      accessor: (log: Log) => {
        const attributes = log.properties?.attributes || {};
        const old = log.properties?.old || {};
        const changedKeys = Object.keys(attributes);

        if (changedKeys.length === 0) return <span className="text-gray-400 italic text-xs">No detail</span>;

        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {changedKeys.map(key => (
              <Badge key={key} variant="neutral" className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                {key}: {String(old[key] ?? 'none')} → {String(attributes[key])}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Timestamp',
      accessor: (log: Log) => (
        <span className="text-xs text-gray-500 tabular-nums">
          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
        </span>
      ),
    },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Audit Trail" />

      <div className="max-w-7xl mx-auto space-y-6 animate-premium-in pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-500" />
              Audit Trail
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Complete history of all critical system mutations and user actions.
            </p>
          </div>
          <Card className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Total Entries:</span>
            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">{activities.total}</span>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden border-0 shadow-2xl shadow-slate-200/50">
          <DataTable 
            data={activities.data}
            columns={columns}
            searchPlaceholder="Search events or users..."
            itemsPerPage={20}
          />
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
