import { useState, useEffect } from 'react';
import { 
  Activity, Database, Clock, CheckCircle, AlertCircle, 
  Server, Cpu, Zap 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHealth = () => {
    setLoading(true);
    fetch(`${API_URL}/healthz`)
      .then(res => {
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
      })
      .then(data => {
        setHealth(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'Unavailable';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  if (loading && !health) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-600 dark:text-indigo-400" /> System Status
        </h1>
        <button 
          onClick={fetchHealth}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          Refresh Status
        </button>
      </div>

      {error ? (
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-6 rounded-xl flex items-center gap-4">
            <AlertCircle size={32} />
            <div>
                <p className="font-bold text-lg">System Offline</p>
                <p>Could not connect to the backend API. Please check if the server is running.</p>
            </div>
         </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* 1. API Status Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">API Service</h3>
                    <CheckCircle className="text-green-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">Operational</p>
                <p className="text-xs text-gray-400 mt-2">Version {health?.version}</p>
            </div>

            {/* 2. Database Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Database</h3>
                    <Database className={health?.database?.status === 'connected' ? "text-green-500" : "text-red-500"} size={20} />
                </div>
                <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold capitalize ${health?.database?.status === 'connected' ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                        {health?.database?.status}
                    </p>
                </div>
                {health?.database?.status === 'connected' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                       <Zap size={12} /> Latency: {health?.database?.latency}ms
                    </p>
                )}
            </div>

            {/* 3. Uptime Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Uptime</h3>
                    <Clock className="text-indigo-500 dark:text-indigo-400" size={20} />
                </div>
                <p className="text-2xl font-mono font-medium text-gray-900 dark:text-white">{formatUptime(health?.uptime)}</p>
                <p className="text-xs text-gray-400 mt-2">
                   Server Time: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '--:--'}
                </p>
            </div>

            {/* 4. Memory Usage (New) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Memory Usage</h3>
                    <Server className="text-orange-500" size={20} />
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-300">Heap Used</span>
                            <span className="font-medium dark:text-white">{health?.system?.memoryUsage?.heapUsed} MB</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${Math.min((health?.system?.memoryUsage?.heapUsed / health?.system?.memoryUsage?.heapTotal) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Total Heap: {health?.system?.memoryUsage?.heapTotal} MB</p>
                </div>
            </div>

            {/* 5. Server Info (New) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Environment Details</h3>
                    <Cpu className="text-blue-500" size={20} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Platform</p>
                        <p className="font-mono font-medium text-gray-800 dark:text-white">{health?.system?.platform}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-center">
                         <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Node Version</p>
                         <p className="font-mono font-medium text-gray-800 dark:text-white">{health?.system?.nodeVersion}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-center">
                         <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">CPU Arch</p>
                         <p className="font-mono font-medium text-gray-800 dark:text-white">{health?.system?.cpuArch}</p>
                    </div>
                </div>
            </div>

        </div>
      )}
    </div>
  );
}