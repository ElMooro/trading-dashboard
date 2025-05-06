import React, { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Star, Edit2 } from 'lucide-react';

// Sample watchlist data - in a real app, this would come from your API
const sampleWatchlist = [
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 187.42, change: 1.22, changePercent: 0.65, region: 'North America' },
  { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', price: 412.07, change: -0.89, changePercent: -0.22, region: 'North America' },
  { id: 3, symbol: 'AMZN', name: 'Amazon.com Inc.', price: 179.83, change: 2.47, changePercent: 1.39, region: 'North America' },
  { id: 4, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 166.91, change: 0.54, changePercent: 0.32, region: 'North America' },
  { id: 5, symbol: 'META', name: 'Meta Platforms Inc.', price: 478.22, change: -2.15, changePercent: -0.45, region: 'North America' },
  { id: 6, symbol: 'TSLA', name: 'Tesla Inc.', price: 177.36, change: 4.21, changePercent: 2.43, region: 'North America' },
  { id: 7, symbol: 'NVDA', name: 'NVIDIA Corp.', price: 902.50, change: 15.32, changePercent: 1.73, region: 'North America' },
  { id: 8, symbol: 'VOD', name: 'Vodafone Group', price: 8.42, change: -0.15, changePercent: -1.75, region: 'Europe' },
  { id: 9, symbol: 'BABA', name: 'Alibaba Group', price: 73.21, change: 0.53, changePercent: 0.73, region: 'Asia' },
];

function WatchlistComponent({ selectedRegion }) {
  const [watchlist, setWatchlist] = useState(sampleWatchlist);
  const [newSymbol, setNewSymbol] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Derive displayedList directly instead of keeping it in state
  const displayedList = selectedRegion
    ? watchlist.filter(item => item.region === selectedRegion || item.region === 'Global')
    : watchlist;
  
  const handleAddSymbol = () => {
    if (newSymbol.trim() !== '') {
      // In a real app, you would look up the symbol details from an API
      const newItem = {
        id: watchlist.length + 1,
        symbol: newSymbol.toUpperCase(),
        name: `${newSymbol.toUpperCase()} Corp.`,
        price: (Math.random() * 1000).toFixed(2),
        change: (Math.random() * 10 - 5).toFixed(2),
        changePercent: (Math.random() * 5 - 2.5).toFixed(2),
        region: 'Global'
      };
      
      setWatchlist(currentWatchlist => [...currentWatchlist, newItem]);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (id) => {
    setWatchlist(currentWatchlist => currentWatchlist.filter(item => item.id !== id));
  };

  const toggleEditMode = () => {
    setEditMode(prevMode => !prevMode);
  };

  return (
    <div className="watchlist-component">
      <div className="watchlist-header">
        <div className="add-symbol">
          <input
            type="text"
            placeholder="Add symbol..."
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
            aria-label="Enter stock symbol"
          />
          <button 
            onClick={handleAddSymbol}
            aria-label="Add stock symbol"
          >
            <Plus size={16} />
          </button>
        </div>
        <button 
          className="edit-button" 
          onClick={toggleEditMode}
          aria-pressed={editMode}
        >
          <Edit2 size={16} />
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>

      <div className="watchlist-table" aria-live="polite">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price</th>
              <th>Change</th>
              {editMode && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayedList.map(item => (
              <tr key={item.id}>
                <td className="symbol-cell">
                  <Star size={14} className="favorite-icon" />
                  {item.symbol}
                </td>
                <td>{item.name}</td>
                <td className="price-cell">${item.price}</td>
                <td className={`change-cell ${item.change >= 0 ? 'positive' : 'negative'}`}>
                  {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {item.change} ({item.changePercent}%)
                </td>
                {editMode && (
                  <td className="action-cell">
                    <button 
                      className="remove-button" 
                      onClick={() => handleRemoveSymbol(item.id)}
                      aria-label={`Remove ${item.symbol} from watchlist`}
                    >
                      <X size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WatchlistComponent;import React from 'react';

function WatchlistComponent() {
  return (
    <div className="watchlist">
      <p>Market watchlist would render here</p>
    </div>
  );
}

export default WatchlistComponent;
