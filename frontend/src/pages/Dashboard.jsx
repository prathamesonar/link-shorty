import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Trash2, BarChart2, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/links`);
      if (res.ok) setLinks(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customCode: customCode || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchLinks(); setUrl(''); setCustomCode('');
    } catch (err) { setError(err.message); } finally { setCreating(false); }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`${API_URL}/api/links/${code}`, { method: 'DELETE' });
    fetchLinks();
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(`${API_URL}/${code}`);
    alert(`Copied!`);
  };

  const filteredLinks = links.filter(l => l.short_code.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Create Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Create New Link</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <input
              type="url" placeholder="https://example.com/very-long-url"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
              required value={url} onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <input
              type="text" placeholder="Custom code (opt)"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
              maxLength={8} value={customCode} onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>
          <button 
            disabled={creating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {creating ? 'Shortening...' : 'Shorten'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {/* List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Your Links</h3>
          <input 
            type="text" placeholder="Filter links..." 
            className="p-1.5 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md dark:text-white"
            value={filter} onChange={e => setFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600"/></div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No links found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Short Code</th>
                  <th className="px-6 py-3">Original URL</th>
                  <th className="px-6 py-3 text-center">Clicks</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">
                      <a href={`${API_URL}/${link.short_code}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {link.short_code}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={link.original_url}>
                      {link.original_url}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                        {link.clicks}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => copyToClipboard(link.short_code)} title="Copy" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Copy size={18} /></button>
                            <Link to={`/code/${link.short_code}`} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50"><BarChart2 size={16} /> Stats</Link>
                            <button onClick={() => handleDelete(link.short_code)} title="Delete" className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}