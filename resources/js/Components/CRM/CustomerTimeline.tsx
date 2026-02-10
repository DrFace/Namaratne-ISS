import React, { useEffect, useState } from 'react';
import { 
    ShoppingBag, 
    DollarSign, 
    RotateCcw, 
    StickyNote, 
    Activity, 
    Clock, 
    User as UserIcon,
    Plus,
    X,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface TimelineEvent {
    id: string;
    type: 'sale' | 'payment' | 'return' | 'note' | 'activity';
    title: string;
    description: string;
    timestamp: string;
    amount?: number;
    meta: any;
}

interface CustomerTimelineProps {
    customer: any;
    isOpen: boolean;
    onClose: () => void;
}

const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ customer, isOpen, onClose }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState('general');

    const fetchTimeline = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/customer/${customer.id}/timeline`);
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching timeline:', error);
            toast.error('Failed to load activity timeline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && customer?.id) {
            fetchTimeline();
        }
    }, [isOpen, customer?.id]);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            await axios.post('/customer-notes', {
                customer_id: customer.id,
                note: newNote,
                type: noteType
            });
            toast.success('Note added successfully');
            setNewNote('');
            setShowNoteForm(false);
            fetchTimeline(); // Refresh
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'sale': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
            case 'payment': return <DollarSign className="w-4 h-4 text-green-500" />;
            case 'return': return <RotateCcw className="w-4 h-4 text-red-500" />;
            case 'note': return <StickyNote className="w-4 h-4 text-yellow-500" />;
            case 'activity': return <Activity className="w-4 h-4 text-indigo-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'sale': return 'bg-blue-50';
            case 'payment': return 'bg-green-50';
            case 'return': return 'bg-red-50';
            case 'note': return 'bg-yellow-50';
            case 'activity': return 'bg-indigo-50';
            default: return 'bg-gray-50';
        }
    };

    const filteredEvents = filter === 'all' 
        ? events 
        : events.filter(e => e.type === filter);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                        <p className="text-sm text-gray-500">Activity & Transaction History</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Filters & Actions */}
                <div className="p-4 border-b flex items-center justify-between gap-4 overflow-x-auto">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {['all', 'sale', 'payment', 'return', 'note'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowNoteForm(!showNoteForm)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Plus className="w-4 h-4" /> Add Note
                    </button>
                </div>

                {/* New Note Form */}
                {showNoteForm && (
                    <div className="p-4 bg-indigo-50 border-b animate-fade-in">
                        <form onSubmit={handleAddNote} className="space-y-3">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Writre internal note about this customer..."
                                className="w-full p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm h-24"
                                autoFocus
                            />
                            <div className="flex justify-between items-center">
                                <select 
                                    value={noteType} 
                                    onChange={(e) => setNoteType(e.target.value)}
                                    className="text-xs border-none bg-transparent font-bold text-indigo-600 focus:ring-0"
                                >
                                    <option value="general">General</option>
                                    <option value="follow-up">Follow-up</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="vip">VIP Note</option>
                                </select>
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNoteForm(false)}
                                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                                    >
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse flex gap-4">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

                            <div className="space-y-8">
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="relative flex gap-6">
                                        {/* Icon Node */}
                                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-white ${getBgColor(event.type)}`}>
                                            {getTypeIcon(event.type)}
                                        </div>

                                        {/* Content Card */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm font-bold text-gray-900">{event.title}</h3>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {format(new Date(event.timestamp), 'MMM dd, yyyy · HH:mm')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                                {event.description}
                                            </p>
                                            
                                            {/* Meta Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {event.meta.user && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        <UserIcon className="w-2.5 h-2.5" />
                                                        {event.meta.user}
                                                    </span>
                                                )}
                                                {event.type === 'sale' && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        event.meta.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {event.meta.status}
                                                    </span>
                                                )}
                                                {event.amount !== undefined && (
                                                    <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        Rs. {event.amount.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No events found</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                There are no activities matching your current filter in this customer's history.
                            </p>
                            <button 
                                onClick={() => setFilter('all')}
                                className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer / Summary Info */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</div>
                            <div className="text-lg font-black text-indigo-600">
                                Rs. {(events.filter(e => e.type === 'sale').reduce((acc, curr) => acc + (curr.amount || 0), 0)).toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</div>
                            <div className="text-lg font-black text-green-600">
                                Rs. {(events.filter(e => e.type === 'payment').reduce((acc, curr) => acc + (curr.amount || 0), 0)).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerTimeline;
