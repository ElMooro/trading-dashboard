import React, { useContext, useState, useEffect } from 'react';
import { WatchlistContext } from '../contexts/WatchlistContext';
import { Link } from 'react-router-dom';

function Watchlist() {
  const { watchlist, removeFromWatchlist } = useContext(WatchlistContext);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleRemove = (seriesId) => {
    removeFromWatchlist(seriesId);
  };

  if (loading) {
    return <div className="p-4">Loading watchlist...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Macro Intelligence Watchlist</h1>
      
      {watchlist.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-blue-700">Your watchlist is empty. Add indicators from the dashboard.</p>
          <Link to="/" className="mt-2 inline-block text-blue-500 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <div key={item.seriesId} className="bg-white border rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{item.name || item.seriesId}</h3>
                <button 
                  onClick={() => handleRemove(item.seriesId)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <span className="sr-only">Remove</span>
                  ✕
                </button>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 text-sm">Value</span>
                  <div className="font-medium">{item.value || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Change</span>
                  <div className={`font-medium ${item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : ''}`}>
                    {item.change ? `${item.change > 0 ? '+' : ''}${item.change}%` : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <Link 
                  to={`/chart/${item.seriesId}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Chart
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist;