import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Plus, Globe, Edit, Trash2, Search, RefreshCw, Loader2, Camera as CameraIcon, X
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/SocketContext';

// --- Add/Edit Camera Modal ---
const AddCameraModal = ({ onClose, onRefresh, editingCamera = null }) => {
  const [formData, setFormData] = useState({
    name: editingCamera?.name || '',
    location: editingCamera?.location || '',
    streamUrl: editingCamera?.streamUrl || 'rtsp://'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCamera) {
          await api.patch(`/cameras/${editingCamera._id}`, formData);
          toast.success('Hardware profile updated');
      } else {
          await api.post('/cameras', formData);
          toast.success('New camera registered');
      }
      onRefresh();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md glass-panel rounded-2xl border border-white/10 p-6 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-logo text-white">{editingCamera ? 'Modify Hardware' : 'Register Camera'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest pl-1">Hardware Label</label>
            <input 
               required
               value={formData.name}
               onChange={e => setFormData({...formData, name: e.target.value})}
               placeholder="Camera 01 / Gate-Alpha"
               className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-accent-blue/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest pl-1">Geographic Location</label>
            <input 
               required
               value={formData.location}
               onChange={e => setFormData({...formData, location: e.target.value})}
               placeholder="Factory Floor - Sector B"
               className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-accent-blue/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest pl-1">Streaming Endpoint (RTSP/HTTP)</label>
            <input 
               required
               value={formData.streamUrl}
               onChange={e => setFormData({...formData, streamUrl: e.target.value})}
               className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-accent-blue/50"
            />
          </div>
          
          <button 
             disabled={isSubmitting}
             className="w-full btn-primary py-3 font-mono text-xs tracking-[0.2em] uppercase mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCamera ? 'Commit Changes' : 'Initialize Feed'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [search, setSearch] = useState('');
  
  const { socket } = useSocket();

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cameras');
      setCameras(response.data.data);
    } catch (error) {
      toast.error('Sync failed with hardware registry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
     if (!socket) return;
     socket.on('cameraUpdate', fetchCameras);
     return () => socket.off('cameraUpdate');
  }, [socket]);

  const handleDelete = async (id) => {
     if (!window.confirm('Erase hardware profile permanently?')) return;
     try {
        await api.delete(`/cameras/${id}`);
        toast.success('Hardware purged from registry');
        fetchCameras();
     } catch (error) {
        toast.error('Purge failed');
     }
  };

  const filteredCameras = cameras.filter(cam => 
    cam.name.toLowerCase().includes(search.toLowerCase()) || 
    cam.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto overflow-y-auto custom-scrollbar relative z-10 pb-32">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold font-logo bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
               <CameraIcon className="w-8 h-8 text-accent-blue" />
               Camera Management
            </h1>
            <p className="text-white/50 text-sm mt-1 font-inter">
               Register and configure safety monitoring hardware nodes across terminal sectors.
            </p>
         </div>
         <div className="flex gap-3">
            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus-within:border-accent-blue/40 transition-all">
                <Search className="w-4 h-4 text-white/30 mr-2" />
                <input 
                    type="text" 
                    placeholder="Search nodes..." 
                    className="bg-transparent border-none outline-none text-xs text-white"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button 
                onClick={() => { setEditingCamera(null); setShowModal(true); }}
                className="btn-primary py-2 px-6 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2"
            >
                <Plus className="w-3 h-3" /> Register Node
            </button>
         </div>
      </div>

      {/* Camera Table Wrapper */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col bg-black/40 shadow-2xl">
         <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-xs font-logo font-semibold text-white/80 flex items-center gap-2 uppercase tracking-widest">
                <Video className="w-4 h-4 text-accent-blue" /> Network Topology
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
                <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green" /> {cameras.filter(c => c.status === 'active').length} Online
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-red" /> {cameras.filter(c => c.status !== 'active').length} Offline
                </span>
            </div>
         </div>
         
         <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
               <thead>
                  <tr className="text-[10px] uppercase tracking-wider font-mono text-white/30 border-b border-white/5 bg-white/[0.01]">
                     <th className="px-6 py-4 font-normal">Hardware ID</th>
                     <th className="px-6 py-4 font-normal">Label</th>
                     <th className="px-6 py-4 font-normal">Geographic Sector</th>
                     <th className="px-6 py-4 font-normal">Stream Channel</th>
                     <th className="px-6 py-4 font-normal">Health</th>
                     <th className="px-6 py-4 font-normal text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03] text-sm">
                  {isLoading ? (
                    [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-4"><div className="h-10 bg-white/5 rounded w-full" /></td></tr>)
                  ) : filteredCameras.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-20 text-center text-white/20 font-mono text-xs uppercase tracking-[0.3em]">No registry entries found</td></tr>
                  ) : filteredCameras.map((cam) => (
                    <tr key={cam._id} className="hover:bg-white/[0.02] transition-colors group">
                       <td className="px-6 py-4 font-mono text-[10px] text-accent-blue/60">{cam._id.slice(-8).toUpperCase()}</td>
                       <td className="px-6 py-4 font-medium text-white/90">{cam.name}</td>
                       <td className="px-6 py-4 flex items-center gap-2 text-white/60">
                          <Globe className="w-3 h-3 text-white/30" />
                          {cam.location}
                       </td>
                       <td className="px-6 py-4 font-mono text-[10px] text-white/40 max-w-[250px] truncate">{cam.streamUrl}</td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[10px] font-mono">
                             <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'active' ? 'bg-accent-green' : 'bg-accent-red'} group-hover:animate-pulse`} />
                             <span className={cam.status === 'active' ? 'text-accent-green' : 'text-accent-red'}>{cam.status.toUpperCase()}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => { setEditingCamera(cam); setShowModal(true); }}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-accent-blue transition-colors"
                             >
                                <Edit className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => handleDelete(cam._id)}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-accent-red transition-colors"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <AnimatePresence>
         {showModal && (
            <AddCameraModal 
               editingCamera={editingCamera}
               onClose={() => { setShowModal(false); setEditingCamera(null); }}
               onRefresh={fetchCameras}
            />
         )}
      </AnimatePresence>
      
    </div>
  );
};

export default CameraManagement;
