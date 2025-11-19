import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MousePointer, Calendar, Zap, Share2 } from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import QRCode from "react-qr-code";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function Stats() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/links/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="text-center text-red-500 p-10">Link not found.</div>;

  // --- Calculated Metrics ---
  const createdDate = new Date(data.created_at);
  const lastClicked = data.last_clicked_at ? new Date(data.last_clicked_at) : null;
  const now = new Date();
  
  // Calculate days active (minimum 1 to avoid divide by zero)
  const daysActive = Math.max(1, differenceInDays(now, createdDate));
  const clicksPerDay = (data.clicks / daysActive).toFixed(1);
  const hoursSinceClick = lastClicked ? differenceInHours(now, lastClicked) : 'N/A';
  const fullShortUrl = `${API_URL}/${data.short_code}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Navigation */}
      <Link to="/" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit">
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </Link>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">
             Active Link
           </span>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             /{data.short_code}
           </h1>
           <a href={data.original_url} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-md block mt-1">
             {data.original_url}
           </a>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => {navigator.clipboard.writeText(fullShortUrl); alert('Copied!')}}
             className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
           >
             <Share2 size={16} /> Copy Link
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Clicks Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
            <MousePointer size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.clicks}</p>
          </div>
        </div>

        {/* Frequency Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Clicks / Day</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{clicksPerDay}</p>
          </div>
        </div>

        {/* Days Active Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hours since click</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {hoursSinceClick === 'N/A' ? '-' : `${hoursSinceClick}h`}
            </p>
          </div>
        </div>
      </div>

      {/* Visuals Section: QR Code & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* QR Code Column */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
           <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">QR Code</h3>
           <div className="bg-white p-2 border rounded-lg">
             <QRCode 
                value={fullShortUrl} 
                size={128} 
                bgColor="#ffffff"
                fgColor="#000000"
                level="L"
             />
           </div>
           <p className="text-xs text-gray-400 mt-4">Scan to visit link</p>
        </div>

        {/* Timeline Column */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Activity Timeline</h3>
          
          <div className="space-y-6">
             <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                   <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-2"></div>
                   <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-700 my-1"></div>
                </div>
                <div>
                   <p className="text-sm font-medium text-gray-900 dark:text-white">Last Clicked</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                     {lastClicked ? format(lastClicked, "PPP 'at' p") : "No clicks yet"}
                   </p>
                </div>
             </div>

             <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                   <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2"></div>
                </div>
                <div>
                   <p className="text-sm font-medium text-gray-900 dark:text-white">Link Created</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                     {format(createdDate, "PPP 'at' p")}
                   </p>
                </div>
             </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Calendar size={16} />
              <span>Active for <strong>{daysActive}</strong> days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}