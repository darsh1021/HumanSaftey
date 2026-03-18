import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, Filter, Download, FileText, ChevronLeft, ChevronRight,
  AlertTriangle, AlertCircle, ShieldCheck, X, Camera, Eye, MapPin, Activity, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

// --- Sub components ---

const StatusBadge = ({ status }) => {
  const styles = {
    'resolved': 'bg-accent-green/10 text-accent-green border-accent-green/20',
    'pending': 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20 box-glow-yellow',
    'false_positive': 'bg-white/5 text-white/60 border-white/10',
  };
  const style = styles[status] || 'bg-white/5 text-white/60 border-white/10';
  
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${style}`}>
      {status}
    </span>
  );
};

const ReportModal = ({ violation, onClose, onUpdate }) => {
  const [notes, setNotes] = useState(violation.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!violation) return null;

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await api.patch(`/violations/${violation._id}`, { status: newStatus, notes });
      toast.success(`Incident ${newStatus} successfully`);
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update violation');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
           <div>
              <h3 className="text-xl font-bold font-logo flex items-center gap-2 text-white">
                 Incident Report <span className="text-accent-blue font-mono text-xs ml-2 uppercase">Camera: {violation.cameraId}</span>
              </h3>
              <p className="text-white/50 text-xs font-mono mt-1">{new Date(violation.timestamp).toLocaleString()}</p>
           </div>
           <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0B0F19]">
           <div className="flex flex-col gap-4">
              <div className="w-full aspect-video rounded-xl bg-black border border-white/10 relative overflow-hidden flex items-center justify-center bg-scanline">
                 <Camera className="w-12 h-12 text-white/5 opacity-20" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Inference Snapshot Empty</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] uppercase font-mono text-white/40 block mb-1">Confidence</span>
                    <span className="text-sm font-medium text-white/90">{(violation.confidence * 100).toFixed(1)}%</span>
                 </div>
                 <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] uppercase font-mono text-white/40 block mb-1">Severity</span>
                    <span className={`text-sm font-medium uppercase font-mono ${violation.severity === 'critical' ? 'text-accent-red' : 'text-white/90'}`}>
                      {violation.severity}
                    </span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-6">
              <div>
                 <h4 className="text-sm font-semibold text-white/80 mb-3 border-b border-white/10 pb-2">AI Analysis</h4>
                 <ul className="space-y-3">
                    <li className="flex justify-between items-center text-sm">
                       <span className="text-white/50">Primary Label</span>
                       <span className="text-accent-red font-medium flex items-center gap-1 capitalize">{violation.type.replace('_', ' ')}</span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                       <span className="text-white/50">Timestamp</span>
                       <span className="text-white/90 font-mono text-xs">{new Date(violation.timestamp).toLocaleTimeString()}</span>
                    </li>
                 </ul>
              </div>

              <div className="flex-1">
                 <h4 className="text-sm font-semibold text-white/80 mb-2 border-b border-white/10 pb-2">Resolution Notes</h4>
                 <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-accent-blue/50 outline-none resize-none"
                    placeholder="Input investigation results..."
                 ></textarea>
              </div>

              <div className="flex gap-3 justify-end mt-auto">
                 <button 
                  onClick={() => handleStatusUpdate('false_positive')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-colors text-white/70 disabled:opacity-50"
                 >
                    False Positive
                 </button>
                 <button 
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-accent-blue/20 border border-accent-blue/50 text-accent-blue text-sm hover:bg-accent-blue/30 transition-colors font-medium disabled:opacity-50"
                 >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mark Resolved'}
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

const ViolationsReports = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [dist, setDist] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ type: '', search: '', status: '' });
  const [selectedViolation, setSelectedViolation] = useState(null);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const { type, search, status } = filters;
      const response = await api.get('/violations', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          type,
          search,
          status
        }
      });
      setViolations(response.data.data);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch (error) {
      toast.error('Failed to load violation records');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const [sumRes, trendRes, typeRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/trends?range=7d'),
        api.get('/reports/types')
      ]);
      setStats(sumRes.data.data);
      setTrends(trendRes.data.data);
      setDist(typeRes.data.data);
    } catch (error) {
      console.error('Reports Error:', error);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto relative z-10 space-y-8 pb-32">
      
      {/* Header Area */}
      <div>
         <h1 className="text-3xl font-bold font-logo bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Violations & Reports
         </h1>
         <p className="text-white/50 text-sm mt-1 font-inter">
            Analyze safety trends, review incidents, and generate compliance reports.
         </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between z-20 relative">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-3 py-2 w-full max-w-xs focus-within:border-accent-blue/50 transition-colors">
            <Search className="w-4 h-4 text-white/40 mr-2" />
            <input 
              type="text" 
              placeholder="Search Camera ID..." 
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full"
            />
          </div>

          <select 
            className="bg-black/40 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 outline-none"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="no_helmet">No Helmet</option>
            <option value="no_vest">No Vest</option>
            <option value="intrusion">Intrusion</option>
            <option value="fall_detection">Fall Detection</option>
          </select>

          <select 
            className="bg-black/40 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 outline-none"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <button className="btn-primary py-2 px-4 text-sm font-mono tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4" /> Export logs
        </button>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-xl border border-white/5 overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40 font-mono bg-white/[0.01]">
                <th className="px-6 py-4 font-medium">Event Snapshot</th>
                <th className="px-6 py-4 font-medium">Time / Hardware</th>
                <th className="px-6 py-4 font-medium">Violation Type</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-inter">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-4"><div className="h-6 bg-white/5 rounded w-full" /></td></tr>
                ))
              ) : violations.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-white/20 font-mono uppercase">Empty violation matrix</td></tr>
              ) : violations.map((v) => (
                <tr 
                  key={v._id} 
                  className={`hover:bg-white/[0.04] transition-colors cursor-pointer group ${v.status === 'pending' ? 'bg-accent-red/[0.01]' : ''}`}
                  onClick={() => setSelectedViolation(v)}
                >
                  <td className="px-6 py-3">
                    <div className="w-12 h-8 rounded border border-white/10 bg-black/60 relative overflow-hidden flex items-center justify-center">
                       <Camera className="w-4 h-4 text-white/5" />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                     <div className="flex flex-col">
                        <span className="font-mono text-xs text-white/90 group-hover:text-accent-blue transition-colors">CAM: {v.cameraId}</span>
                        <span className="text-[10px] text-white/40">{new Date(v.timestamp).toLocaleString()}</span>
                     </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-white/90 capitalize">{v.type.replace('_', ' ')}</td>
                  <td className="px-6 py-3">
                    <span className={`uppercase font-mono text-[10px] ${v.severity === 'critical' ? 'text-accent-red font-bold animate-pulse' : 'text-white/60'}`}>
                      {v.severity}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                     <StatusBadge status={v.status} />
                  </td>
                  <td className="px-6 py-3 text-right">
                     <div className="p-2 inline-flex hover:bg-white/10 rounded-lg text-white/50 transition-colors">
                       <Eye className="w-4 h-4" />
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Logic */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm bg-white/[0.01]">
          <span className="text-white/30 font-mono text-xs">Total Incidents: {pagination.total}</span>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1.5 rounded border border-white/10 hover:bg-white/5 disabled:opacity-20"
            >
              Prev
            </button>
            <button 
               disabled={pagination.page * pagination.limit >= pagination.total}
               onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
               className="px-3 py-1.5 rounded border border-white/10 hover:bg-white/5 disabled:opacity-20"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Aggregate Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/5">
             <h3 className="text-sm font-logo font-semibold text-white/80 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-blue" /> Telemetry Density (7d)
             </h3>
             <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={trends} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#0B1120', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-white/5">
             <h3 className="text-sm font-logo font-semibold text-white/80 mb-6 flex items-center gap-2 font-logo uppercase tracking-widest text-xs">
                 Classification Spread
             </h3>
             <div className="space-y-4">
                {dist.length === 0 ? (
                  <div className="text-white/20 text-[10px] text-center py-20 uppercase font-mono tracking-widest">No mapping found</div>
                ) : dist.map(d => (
                   <div key={d.type} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                         <span className="text-white/60">{d.type.replace('_', ' ')}</span>
                         <span className="text-white/30">{d.count} hit(s)</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(d.count / (stats?.totalViolations || 1)) * 100}%` }}
                           className="h-full bg-accent-blue/50"
                         />
                      </div>
                   </div>
                ))}
             </div>
          </div>
      </div>

      {/* Modal Integration */}
      <AnimatePresence>
         {selectedViolation && (
            <ReportModal 
               violation={selectedViolation} 
               onUpdate={fetchViolations}
               onClose={() => setSelectedViolation(null)} 
            />
         )}
      </AnimatePresence>

    </div>
  );
};

export default ViolationsReports;
