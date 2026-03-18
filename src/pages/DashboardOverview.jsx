import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, Camera, CheckCircle, Bell, 
  Activity, Filter, RefreshCw, Video, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

// --- Sub components ---

const StatCard = ({ title, value, trend, isUp, icon: Icon, color, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-6 rounded-2xl border border-white/5 hover:-translate-y-1 hover:bg-white/[0.02] transition-all relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${color.replace('text', 'bg')}/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-500`} />
    
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-col gap-1">
        <span className="text-white/60 text-sm font-medium">{title}</span>
        {isLoading ? (
          <div className="h-9 w-24 bg-white/5 animate-pulse rounded mt-1" />
        ) : (
          <span className="text-3xl font-bold font-logo text-white tracking-tight">{value}</span>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${color} shadow-lg backdrop-blur-md`}>
         <Icon className="w-5 h-5" />
      </div>
    </div>
    
    <div className="flex items-center gap-2 mt-4 text-xs font-mono h-4">
       {!isLoading && (
          <span className="text-white/20 uppercase tracking-widest text-[9px]">Live Data Verified</span>
       )}
    </div>
  </motion.div>
);

const ChartWidget = ({ title, children, isLoading, isEmpty }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-panel p-6 rounded-2xl border border-white/5 min-h-[350px] flex flex-col"
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-logo font-semibold text-white/90">{title}</h3>
      <button className="text-white/40 hover:text-white transition-colors">
         <Filter className="w-4 h-4" />
      </button>
    </div>
    <div className="flex-1 w-full relative flex items-center justify-center">
       {isLoading ? (
         <Loader2 className="w-8 h-8 text-accent-blue animate-spin opacity-20" />
       ) : isEmpty ? (
         <div className="text-white/20 font-mono text-xs uppercase tracking-widest">No matching telemetry data</div>
       ) : (
         children
       )}
    </div>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'resolved': 'text-accent-green bg-accent-green/10 border-accent-green/20',
    'pending': 'text-accent-red bg-accent-red/10 border-accent-red/20 box-glow',
    'false_positive': 'text-white/40 bg-white/5 border-white/10',
  };
  const style = styles[status] || 'text-white/60 bg-white/5 border-white/10';
  
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${style}`}>
      {status}
    </span>
  );
};

// --- Main Page Component ---

const DashboardOverview = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentViolations, setRecentViolations] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, trendsRes, violationsRes, camerasRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/trends?range=7d'),
        api.get('/violations?limit=5'),
        api.get('/cameras')
      ]);

      setSummary(summaryRes.data.data);
      setTrends(trendsRes.data.data);
      setRecentViolations(violationsRes.data.data);
      setCameras(camerasRes.data.data.slice(0, 2)); // Only show top 2 in priority view

    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
      toast.error('Failed to sync dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { title: 'Total Violations', value: summary?.totalViolations || 0, trend: 'Lifetime', isUp: true, icon: AlertTriangle, color: 'text-accent-red' },
    { title: 'Active Cameras', value: summary?.activeCameras || 0, trend: '100% Online', isUp: true, icon: Camera, color: 'text-accent-blue' },
    { title: 'Compliance Rate', value: `${summary?.complianceRate || 0}%`, trend: 'System Wide', isUp: true, icon: CheckCircle, color: 'text-accent-green' },
    { title: 'Pending Alerts', value: summary?.pending || 0, trend: 'Action Required', isUp: false, icon: Bell, color: 'text-yellow-400' }
  ];

  const pieData = [
    { name: 'Compliant', value: summary?.complianceRate || 0, color: '#00FF9C' },
    { name: 'Non-Compliant', value: 100 - (summary?.complianceRate || 0), color: '#FF3B3B' }
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-32">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="text-3xl font-bold font-logo bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Overview</h2>
           <p className="text-white/50 text-sm mt-1">Real-time metrics synchronized with AI-engine nodes.</p>
         </div>
         <div className="flex gap-3">
           <button 
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors font-mono disabled:opacity-50"
           >
              <RefreshCw className={`w-4 h-4 text-accent-blue ${isLoading ? 'animate-spin' : ''}`} /> Sync Data
           </button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <StatCard key={stat.title} {...stat} isLoading={isLoading} />
         ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Line Chart */}
         <div className="lg:col-span-2">
            <ChartWidget title="Recent Violations Trend (7 Days)" isLoading={isLoading} isEmpty={trends.length === 0}>
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                       itemStyle={{ color: '#00D1FF' }}
                    />
                    <Line 
                       type="monotone" 
                       dataKey="count" 
                       stroke="#00D1FF" 
                       strokeWidth={3}
                       dot={{ fill: '#0B0F19', stroke: '#00D1FF', strokeWidth: 2, r: 4 }}
                       activeDot={{ r: 6, fill: '#00D1FF', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
               </ResponsiveContainer>
            </ChartWidget>
         </div>

         {/* Pie Chart */}
         <div className="lg:col-span-1">
            <ChartWidget title="Compliance Overview" isLoading={isLoading} isEmpty={!summary}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                       itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="32" fontWeight="bold" fontFamily="Outfit">
                       {summary?.complianceRate || 0}%
                    </text>
                  </PieChart>
                </ResponsiveContainer>
            </ChartWidget>
         </div>
      </div>

      {/* Bottom Section: Tables & Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Recent Violations Table */}
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col"
         >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="text-lg font-logo font-semibold flex items-center gap-2">
                   <Activity className="w-5 h-5 text-accent-red" /> Recent Violations
                </h3>
            </div>
            
            <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap">
                   <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40 font-mono">
                         <th className="px-6 py-4 font-medium">Time</th>
                         <th className="px-6 py-4 font-medium">Camera</th>
                         <th className="px-6 py-4 font-medium">Violation</th>
                         <th className="px-6 py-4 font-medium">Severity</th>
                         <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-sm font-inter">
                      {isLoading ? (
                        [1,2,3,4,5].map(i => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-full" /></td>
                          </tr>
                        ))
                      ) : recentViolations.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-white/20 font-mono uppercase tracking-widest">No violations recorded</td>
                        </tr>
                      ) : recentViolations.map((event) => (
                         <tr key={event._id} className="hover:bg-white/[0.03] transition-colors cursor-pointer group">
                             <td className="px-6 py-4 text-white/60">{new Date(event.timestamp).toLocaleTimeString()}</td>
                             <td className="px-6 py-4 flex items-center gap-2 uppercase font-mono text-xs">
                                <Camera className="w-4 h-4 text-white/30" />
                                {event.cameraId}
                             </td>
                             <td className="px-6 py-4 text-white font-medium capitalize">
                                {event.type.replace('_', ' ')}
                             </td>
                             <td className="px-6 py-4">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                                  event.severity === 'critical' ? 'border-accent-red/50 text-accent-red bg-accent-red/5' :
                                  event.severity === 'high' ? 'border-orange-500/50 text-orange-500 bg-orange-500/5' :
                                  'border-accent-blue/50 text-accent-blue bg-accent-blue/5'
                                }`}>
                                  {event.severity}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <StatusBadge status={event.status} />
                             </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
            </div>
         </motion.div>

         {/* Mini Live Previews */}
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-1 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col"
         >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-logo font-semibold flex items-center gap-2 text-white/90">
                   <Video className="w-5 h-5 text-accent-green" /> Priority Streams
                </h3>
            </div>
            
            <div className="flex flex-col gap-4 flex-1">
                {isLoading ? (
                  [1, 2].map(i => <div key={i} className="aspect-video rounded-lg bg-white/5 animate-pulse border border-white/5" />)
                ) : summary?.activeCameras === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg p-6 text-center">
                      <Camera className="w-8 h-8 text-white/10 mb-2" />
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">No active hardware nodes detected</p>
                  </div>
                ) : (
                  cameras.map((cam) => (
                    <div key={cam._id} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group cursor-pointer bg-black/60 shadow-inner">
                        <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md rounded px-2 py-1 border border-white/10 text-[9px] font-mono text-white/90 uppercase tracking-tighter">
                           <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'active' ? 'bg-accent-green' : 'bg-accent-red'} animate-pulse`} /> 
                           {cam.name} // {cam.location}
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Loader2 className="w-5 h-5 text-white/10 animate-spin" />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-accent-blue/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <button className="bg-black/80 border border-accent-blue/40 text-accent-blue px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-widest hover:bg-accent-blue hover:text-black transition-all">
                                Open Viewport
                            </button>
                        </div>
                    </div>
                  ))
                )}

            </div>
         </motion.div>

      </div>
    </div>
  );
};

export default DashboardOverview;
