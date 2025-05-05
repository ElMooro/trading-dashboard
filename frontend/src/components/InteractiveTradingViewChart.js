// Render statistics panel
const renderStatisticsPanel = () => {
  if (!showStatistics || !statistics) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Statistics</h3>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => setShowStatistics(false)}
          title="Hide statistics"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Min</div>
          <div className="font-medium">{formatValue(statistics.min, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Max</div>
          <div className="font-medium">{formatValue(statistics.max, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Average</div>
          <div className="font-medium">{formatValue(statistics.avg, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Median</div>
          <div className="font-medium">{formatValue(statistics.median, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Std Dev</div>
          <div className="font-medium">{formatValue(statistics.stdDev, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Count</div>
          <div className="font-medium">{statistics.count}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">First Value</div>
          <div className="font-medium">{formatValue(statistics.first, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Last Value</div>
          <div className="font-medium">{formatValue(statistics.last, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Total Change</div>
          <div className="font-medium">{formatValue(statistics.changeFromFirst, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Total % Change</div>
          <div className="font-medium">{statistics.percentChangeFromFirst ? `${statistics.percentChangeFromFirst.toFixed(2)}%` : '-'}</div>
        </div>
      </div>
    </div>
  );
};

// Main render
if (loading) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading chart data...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-lg">
        <h3 className="font-bold text-lg mb-2">Error Loading Chart</h3>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

if (!seriesData) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg max-w-lg">
        <h3 className="font-bold text-lg mb-2">No Data Available</h3>
        <p>Could not find data for this indicator. It may have been removed or is unavailable.</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

return (
  <div className={`flex h-screen bg-gray-100 ${fullscreen ? 'fullscreen-mode' : ''}`}>
    {/* Toast notifications */}
    <ToastContainer position="top-right" autoClose={3000} />
    
    {/* Watchlist Sidebar - collapsed in fullscreen mode */}
    {!fullscreen && (
      <div className={`bg-gray-800 text-white ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 pt-4 flex flex-col`}>
        <div className="px-4 mb-4 flex justify-between items-center">
          <h3 className={`font-bold ${sidebarCollapsed ? 'hidden' : 'block'}`}>Watchlist</h3>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {watchlist.map((item) => (
            <div 
              key={item.seriesId}
              className={`px-4 py-2 hover:bg-gray-700 cursor-pointer ${seriesId === item.seriesId ? 'bg-gray-700' : ''}`}
              onClick={() => navigate(`/chart/${item.seriesId}`)}
            >
              {sidebarCollapsed ? (
                <div className="flex justify-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: parseFloat(item.change) >= 0 ? '#10b981' : '#ef4444' }}>
                    <span className="text-xs font-bold">{item.title.charAt(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.source}</div>
                  </div>
                  <div className={`text-sm font-bold ${parseFloat(item.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(item.change) > 0 ? '+' : ''}{item.change}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <button 
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
              onClick={() => navigate('/watchlist')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Manage Watchlist
            </button>
          </div>
        )}
      </div>
    )}
    
    {/* Main Chart Area */}
    <div className="flex-grow p-4 overflow-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          {!fullscreen && (
            <button
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
              onClick={() => navigate('/')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          )}
          
          {showChartTitle && (
            <>
              <h1 className="text-2xl font-bold mb-1">{seriesData.title}</h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-600">{seriesData.description}</span>
                <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs font-semibold text-gray-700">
                  {seriesData.category || dataSource.toUpperCase()}
                </span>
                <span className="text-gray-500 text-sm">
                  {seriesData.frequency && `Frequency: ${seriesData.frequency}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {formatValue(seriesData.latestValue, 'value')}
                </span>
                <span className={`px-2 py-1 rounded ${
                  parseFloat(seriesData.change) > 0 
                    ? 'bg-green-100 text-green-800' 
                    : parseFloat(seriesData.change) < 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {parseFloat(seriesData.change) > 0 ? '+' : ''}{seriesData.change}%
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap justify-end">
          <button 
            className={`flex items-center gap-1 px-3 py-2 rounded ${
              isInWatchlist 
                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={handleWatchlistToggle}
          >
            <svg className="w-5 h-5" fill={isInWatchlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
          
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded ${
              compareMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setShowCompareForm(!showCompareForm)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare
          </button>
          
          <button
            className="flex items-center gap-1 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setShowIndicatorForm(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Indicators
          </button>
          
          <button
            className="flex items-center gap-1 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setShowAlertForm(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Alerts
          </button>
          
          <div className="relative">
            <button
              className="flex items-center gap-1 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            
            {showDownloadOptions && (
              <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg p-2 z-10 w-48">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                  onClick={() => {
                    exportChartAsImage();
                    setShowDownloadOptions(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Export as PNG
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                  onClick={() => {
                    exportDataAsCSV();
                    setShowDownloadOptions(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as CSV
                </button>
              </div>
            )}
          </div>
          
          <button
            className="flex items-center gap-1 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={toggleFullscreen}
            title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                fullscreen 
                  ? "M9 9h6v6H9z" 
                  : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              } />
            </svg>
            {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>
      
      {/* Comparison Search Panel */}
      {showCompareForm && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Add Comparison</h3>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowCompareForm(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded"
                placeholder="Search indicators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Search'}
              </button>
            </div>
          </form>
          
          <div className="max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map(indicator => (
                <div 
                  key={indicator.seriesId}
                  className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{indicator.title}</div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">{indicator.seriesId}</span>
                      <span className="bg-gray-200 px-1.5 py-0.5 rounded-full text-xs font-semibold text-gray-700">
                        {indicator.source}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    onClick={() => handleAddComparison(indicator)}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Add'}
                  </button>
                </div>
              ))
            ) : searchQuery ? (
              <p className="text-gray-600 p-2">No results found. Try a different search term.</p>
            ) : (
              <p className="text-gray-600 p-2">Type to search for indicators to compare. You can search across FRED, ECB, NY Fed, Finnworlds, and custom sources.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Technical Indicator Form */}
      {showIndicatorForm && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Add Technical Indicator</h3>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowIndicatorForm(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indicator Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded"
                value={newIndicator.type}
                onChange={(e) => {
                  const selectedType = e.target.value;
                  const indicatorDef = TECHNICAL_INDICATORS.find(i => i.id === selectedType);
                  
                  let period = 20;
                  let params = {};
                  
                  if (indicatorDef) {
                    if (indicatorDef.defaultPeriod) {
                      period = indicatorDef.defaultPeriod;
                    }
                    if (indicatorDef.params) {
                      params = { ...indicatorDef.params };
                    }
                  }
                  
                  setNewIndicator({
                    type: selectedType,
                    period,
                    params,
                    color: getRandomColor()
                  });
                }}
              >
                {TECHNICAL_INDICATORS.map(indicator => (
                  <option key={indicator.id} value={indicator.id}>{indicator.name}</option>
                ))}
              </select>
            </div>
            
            {(newIndicator.type === 'sma' || newIndicator.type === 'ema' || newIndicator.type === 'rsi') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={newIndicator.period}
                  onChange={(e) => setNewIndicator({...newIndicator, period: parseInt(e.target.value, 10)})}
                  min="1"
                  max="200"
                />
              </div>
            )}
            
            {newIndicator.type === 'macd' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fast Period</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={newIndicator.params.fast}
                    onChange={(e) => setNewIndicator({
                      ...newIndicator, 
                      params: {...newIndicator.params, fast: parseInt(e.target.value, 10)}
                    })}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slow Period</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={newIndicator.params.slow}
                    onChange={(e) => setNewIndicator({
                      ...newIndicator, 
                      params: {...newIndicator.params, slow: parseInt(e.target.value, 10)}
                    })}
                    min="1"
                    max="100"
                  />
                </div>
              </>
            )}
            
            {newIndicator.type === 'bollinger' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={newIndicator.params.period}
                    onChange={(e) => setNewIndicator({
                      ...newIndicator, 
                      params: {...newIndicator.params, period: parseInt(e.target.value, 10)}
                    })}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standard Deviation</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={newIndicator.params.stdDev}
                    onChange={(e) => setNewIndicator({
                      ...newIndicator, 
                      params: {...newIndicator.params, stdDev: parseFloat(e.target.value)}
                    })}
                    min="0.1"
                    max="5"
                    step="0.1"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded border border-gray-300 mr-2 cursor-pointer"
                  style={{ backgroundColor: newIndicator.color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded"
                  value={newIndicator.color}
                  onChange={(e) => setNewIndicator({...newIndicator, color: e.target.value})}
                />
              </div>
              {showColorPicker && (
                <div className="absolute z-10 mt-1">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="relative">
                    <HexColorPicker 
                      color={newIndicator.color} 
                      onChange={(color) => setNewIndicator({...newIndicator, color})}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAddIndicator}
          >
            Add Indicator
          </button>
        </div>
      )}
      
      {/* Comparison Legend */}
      {renderComparisonLegend()}
      
      {/* AI Alert */}
      {renderAiAlert()}
      
      {/* Technical Indicators Panel */}
      {renderIndicatorsPanel()}
      
      {/* Alerts Panel */}
      {renderAlertsPanel()}
      
      {/* Statistics Panel */}
      {renderStatisticsPanel()}
      
      {/* Chart Panel */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        {/* Timeframe Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.id}
              className={`px-3 py-1 rounded-full ${
                timeframe === tf.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => handleTimeframeChange(tf.id)}
            >
              {tf.label}
            </button>
          ))}
        </div>
        
        {/* Chart Types Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
          {CHART_TYPES.map(type => (
            <button 
              key={type.id}
              className={`px-3 py-1 rounded-md ${chartType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => handleChartTypeChange(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
        
        {/* Chart Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {CHART_STYLES.map(style => (
              <button 
                key={style.id}
                className={`px-3 py-1 rounded-md ${chartStyle === style.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => handleChartStyleChange(style.id)}
              >
                {style.label}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 rounded ${showSettings ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            
            <div className="relative">
              <button
                className={`px-3 py-1 rounded ${activeDrawingTool ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setShowDrawingPanel(!showDrawingPanel)}
                title="Drawing Tools"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              
              {showDrawingPanel && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg p-2 z-10 w-44">
                  {drawingTools.map(tool => (
                    <button
                      key={tool.id}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center ${activeDrawingTool === tool.id ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => handleDrawingToolSelect(tool.id)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        // InteractiveTradingViewChart.js
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createChart } from 'lightweight-charts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HexColorPicker } from 'react-colorful';
import { format } from 'date-fns';
import { createClient } from '@supabase/supabase-js';
import WatchlistContext from '../contexts/WatchlistContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API Service imports
import { 
fetchFredData, 
fetchFredSeriesInfo 
} from '../services/fredApiService';
import { 
fetchEcbData, 
fetchEcbSeriesInfo 
} from '../services/ecbApiService';
import { 
fetchFinnworldsData, 
fetchFinnworldsSeriesInfo 
} from '../services/finnworldsApiService';
import { 
fetchNyFedData, 
fetchNyFedSeriesInfo 
} from '../services/nyFedApiService';
import { sendAlertEmail } from '../services/sendGridService';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Technical analysis indicators
import {
sma, ema, rsi, macd, bollingerBands, 
atr, ichimokuCloud, stochasticOscillator, 
obv, fibonacciRetracement, pivotPoints
} from '../utils/technicalIndicators';

// Constants for data sources and frequencies
const DATA_SOURCES = {
FRED: 'fred',
ECB: 'ecb',
FINNWORLDS: 'finnworlds',
NY_FED: 'nyfed',
CUSTOM: 'custom'
};

const TIMEFRAMES = [
{ id: '1D', label: '1 Day' },
{ id: '1W', label: '1 Week' },
{ id: '1M', label: '1 Month' },
{ id: '3M', label: '3 Months' },
{ id: '6M', label: '6 Months' },
{ id: '1Y', label: '1 Year' },
{ id: '2Y', label: '2 Years' },
{ id: '5Y', label: '5 Years' },
{ id: '10Y', label: '10 Years' },
{ id: 'All', label: 'All Data' }
];

const CHART_TYPES = [
{ id: 'value', label: 'Value' },
{ id: 'percentChange', label: '% Change' },
{ id: 'yearChange', label: 'YoY Change' },
{ id: 'yearPercentChange', label: 'YoY % Change' },
{ id: 'qoqChange', label: 'QoQ Change' },
{ id: 'qoqPercentChange', label: 'QoQ % Change' },
{ id: 'momChange', label: 'MoM Change' },
{ id: 'momPercentChange', label: 'MoM % Change' },
{ id: 'indexedToValue', label: 'Indexed to Value' },
{ id: 'compoundGrowth', label: 'Compound Growth' }
];

const CHART_STYLES = [
{ id: 'line', label: 'Line' },
{ id: 'area', label: 'Area' },
{ id: 'candle', label: 'Candlestick' },
{ id: 'bar', label: 'Bar' },
{ id: 'histogram', label: 'Histogram' },
{ id: 'heikinashi', label: 'Heikin-Ashi' },
{ id: 'scatter', label: 'Scatter Plot' }
];

const AGGREGATION_METHODS = [
{ id: 'none', label: 'None' },
{ id: 'avg', label: 'Average' },
{ id: 'sum', label: 'Sum' },
{ id: 'min', label: 'Minimum' },
{ id: 'max', label: 'Maximum' },
{ id: 'first', label: 'First Value' },
{ id: 'last', label: 'Last Value' }
];

// Available technical indicators
const TECHNICAL_INDICATORS = [
{ id: 'sma', name: 'Simple Moving Average (SMA)', defaultPeriod: 20 },
{ id: 'ema', name: 'Exponential Moving Average (EMA)', defaultPeriod: 20 },
{ id: 'rsi', name: 'Relative Strength Index (RSI)', defaultPeriod: 14 },
{ id: 'macd', name: 'MACD', params: { fast: 12, slow: 26, signal: 9 } },
{ id: 'bollinger', name: 'Bollinger Bands', params: { period: 20, stdDev: 2 } },
{ id: 'atr', name: 'Average True Range (ATR)', defaultPeriod: 14 },
{ id: 'ichimoku', name: 'Ichimoku Cloud', params: { conversionPeriod: 9, basePeriod: 26, laggingSpanPeriod: 52, displacement: 26 } },
{ id: 'stochastic', name: 'Stochastic Oscillator', params: { kPeriod: 14, dPeriod: 3, smooth: 3 } },
{ id: 'obv', name: 'On-Balance Volume (OBV)' },
{ id: 'fibonacci', name: 'Fibonacci Retracement' },
{ id: 'pivotPoints', name: 'Pivot Points' }
];

// Drawing tools and annotations
const DRAWING_TOOLS = [
{ id: 'horizontalLine', name: 'Horizontal Line', icon: 'M3 12h18' },
{ id: 'verticalLine', name: 'Vertical Line', icon: 'M12 3v18' },
{ id: 'trendLine', name: 'Trend Line', icon: 'M7 14l9-9 9 9' },
{ id: 'rectangle', name: 'Rectangle', icon: 'M3 3h18v18H3z' },
{ id: 'ellipse', name: 'Ellipse', icon: 'M12 4a9 9 0 100 18 9 9 0 000-18z' },
{ id: 'fibonacciRetracement', name: 'Fibonacci Retracement', icon: 'M2 12h20M7 5v14M17 5v14' },
{ id: 'text', name: 'Text', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
{ id: 'arrow', name: 'Arrow', icon: 'M5 12h14M12 5l7 7-7 7' },
{ id: 'channel', name: 'Channel', icon: 'M4 6h16M4 12h16M4 18h16' },
{ id: 'pitchfork', name: 'Andrews Pitchfork', icon: 'M3 10h18M3 14h18M3 18h18' }
];

const InteractiveTradingViewChart = () => {
const { seriesId } = useParams();
const navigate = useNavigate();
const chartContainerRef = useRef(null);
const resizeObserver = useRef(null);

// Source info
const [dataSource, setDataSource] = useState(null);
const [sourceId, setSourceId] = useState(null);

// State for the chart data and settings
const [seriesData, setSeriesData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [chartInstance, setChartInstance] = useState(null);
const [mainSeries, setMainSeries] = useState(null);

// Chart display options
const [timeframe, setTimeframe] = useState('1M');
const [chartType, setChartType] = useState('value');
const [chartStyle, setChartStyle] = useState('line');
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);
const [lineColor, setLineColor] = useState('#3b82f6');
const [showColorPicker, setShowColorPicker] = useState(false);
const [zoomLevel, setZoomLevel] = useState(1);
const [aggregationMethod, setAggregationMethod] = useState('none');
const [aggregationPeriod, setAggregationPeriod] = useState('monthly');
const [showGrid, setShowGrid] = useState(true);
const [showAxisLabels, setShowAxisLabels] = useState(true);
const [logScale, setLogScale] = useState(false);
const [showVolume, setShowVolume] = useState(false);
const [indexTo100, setIndexTo100] = useState(false);
const [indexBaseDate, setIndexBaseDate] = useState(null);
const [invertYAxis, setInvertYAxis] = useState(false);
const [showInflationAdjusted, setShowInflationAdjusted] = useState(false);
const [currencyDisplay, setCurrencyDisplay] = useState('USD');
const [unitMultiplier, setUnitMultiplier] = useState(1);
const [numberOfDecimals, setNumberOfDecimals] = useState(2);
const [autoscaleChart, setAutoscaleChart] = useState(true);

// AI prediction state
const [aiPrediction, setAiPrediction] = useState(null);
const [showAiPrediction, setShowAiPrediction] = useState(true);

// Comparison mode state
const [compareMode, setCompareMode] = useState(false);
const [comparisonSeries, setComparisonSeries] = useState([]);
const [showCompareForm, setShowCompareForm] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [normalizeComparison, setNormalizeComparison] = useState(true);

// Technical indicators state
const [activeIndicators, setActiveIndicators] = useState([]);
const [showIndicatorForm, setShowIndicatorForm] = useState(false);
const [newIndicator, setNewIndicator] = useState({ type: 'sma', period: 20, params: {} });
const [showIndicatorPanel, setShowIndicatorPanel] = useState(true);

// Drawing tools and annotations state
const [activeDrawingTool, setActiveDrawingTool] = useState(null);
const [drawingTools, setDrawingTools] = useState(DRAWING_TOOLS);
const [annotations, setAnnotations] = useState([]);
const [showAnnotationForm, setShowAnnotationForm] = useState(false);
const [newAnnotation, setNewAnnotation] = useState({ text: '', price: '', date: new Date() });
const [drawings, setDrawings] = useState([]);
const [showDrawingPanel, setShowDrawingPanel] = useState(false);

// Alert state
const [alerts, setAlerts] = useState([]);
const [showAlertForm, setShowAlertForm] = useState(false);
const [newAlert, setNewAlert] = useState({ condition: 'above', value: '', email: '', message: '' });

// UI state
const [showSettings, setShowSettings] = useState(false);
const [showDataTable, setShowDataTable] = useState(true);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [dataTablePage, setDataTablePage] = useState(1);
const [dataTableRowsPerPage, setDataTableRowsPerPage] = useState(20);
const [fullscreen, setFullscreen] = useState(false);
const [showStatistics, setShowStatistics] = useState(true);
const [showChartTitle, setShowChartTitle] = useState(true);
const [exportFormat, setExportFormat] = useState('csv');
const [showDownloadOptions, setShowDownloadOptions] = useState(false);
const [chartHeight, setChartHeight] = useState(500);

// Watchlist context
const { watchlist, addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);
const isInWatchlist = watchlist.some(item => item.seriesId === seriesId);

// User preferences
const [userPreferences, setUserPreferences] = useState(null);

// Stats and analytics
const [statistics, setStatistics] = useState(null);

// Seasonal adjustment
const [seasonalAdjustment, setSeasonalAdjustment] = useState('none');

// Save historical views in user history
useEffect(() => {
  const saveToHistory = async () => {
    if (seriesData && userPreferences?.userId) {
      try {
        await supabase.from('user_history').insert([{
          user_id: userPreferences.userId,
          series_id: seriesId,
          title: seriesData.title,
          source: dataSource,
          viewed_at: new Date().toISOString()
        }]);
      } catch (error) {
        console.error("Error saving to history:", error);
      }
    }
  };
  
  saveToHistory();
}, [seriesData, seriesId, userPreferences, dataSource]);

// Load user preferences
useEffect(() => {
  const loadPreferences = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (preferences) {
          setUserPreferences({
            ...preferences,
            userId: session.user.id
          });
          
          // Apply preferences to chart settings
          if (preferences.default_chart_style) setChartStyle(preferences.default_chart_style);
          if (preferences.default_timeframe) setTimeframe(preferences.default_timeframe);
          if (preferences.default_chart_color) setLineColor(preferences.default_chart_color);
          if (preferences.show_volume !== undefined) setShowVolume(preferences.show_volume);
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };
  
  loadPreferences();
}, []);

// Determine data source and ID from the seriesId
useEffect(() => {
  if (seriesId) {
    const [source, id] = seriesId.split(':');
    setDataSource(source.toLowerCase());
    setSourceId(id);
  }
}, [seriesId]);

// Load initial data
useEffect(() => {
  const fetchData = async () => {
    if (!dataSource || !sourceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      let seriesInfo;
      
      // Get series information and data from the appropriate API service
      switch(dataSource) {
        case DATA_SOURCES.FRED:
          seriesInfo = await fetchFredSeriesInfo(sourceId);
          response = await fetchFredData(sourceId);
          break;
        case DATA_SOURCES.ECB:
          seriesInfo = await fetchEcbSeriesInfo(sourceId);
          response = await fetchEcbData(sourceId);
          break;
        case DATA_SOURCES.FINNWORLDS:
          seriesInfo = await fetchFinnworldsSeriesInfo(sourceId);
          response = await fetchFinnworldsData(sourceId);
          break;
        case DATA_SOURCES.NY_FED:
          seriesInfo = await fetchNyFedSeriesInfo(sourceId);
          response = await fetchNyFedData(sourceId);
          break;
        case DATA_SOURCES.CUSTOM:
          // For custom data from Supabase
          const { data, error } = await supabase
            .from('custom_series')
            .select('*')
            .eq('id', sourceId)
            .single();
            
          if (error) throw error;
          
          seriesInfo = {
            title: data.title,
            description: data.description,
            frequency: data.frequency,
            units: data.units,
            source: data.source,
            notes: data.notes,
            category: data.category
          };
          
          const { data: observations, error: obsError } = await supabase
            .from('custom_series_observations')
            .select('*')
            .eq('series_id', sourceId)
            .order('date', { ascending: false });
            
          if (obsError) throw obsError;
          
          response = {
            observations: observations.map(obs => ({
              date: obs.date,
              value: obs.value
            }))
          };
          
          break;
        default:
          throw new Error(`Unknown data source: ${dataSource}`);
      }
      
      // Set initial date range based on timeframe
      setDateRangeByTimeframe(timeframe);
      
      // Calculate additional derived data
      const processedData = processSeriesData(response.observations);
      
      // Calculate basic statistics
      const stats = calculateStatistics(processedData.observations);
      
      setSeriesData({
        ...seriesInfo,
        ...processedData,
        latestValue: processedData.observations[0]?.value || 0,
        change: processedData.observations.length > 1 
          ? ((processedData.observations[0].value / processedData.observations[1].value - 1) * 100).toFixed(2)
          : 0
      });
      
      setStatistics(stats);
      
      // Get AI prediction if available
      try {
        const predictionResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/prediction/${seriesId}`);
        setAiPrediction(predictionResponse.data);
      } catch (predictionError) {
        console.error("Error fetching prediction:", predictionError);
      }
      
      // Load user's saved annotations for this series
      if (userPreferences?.userId) {
        const { data: userAnnotations, error: annotationError } = await supabase
          .from('user_annotations')
          .select('*')
          .eq('user_id', userPreferences.userId)
          .eq('series_id', seriesId);
          
        if (!annotationError && userAnnotations) {
          setAnnotations(userAnnotations.map(ann => ({
            id: ann.id,
            text: ann.text,
            price: ann.price,
            date: new Date(ann.date),
            color: ann.color || '#ff0000'
          })));
        }
        
        // Load user's saved alerts for this series
        const { data: userAlerts, error: alertError } = await supabase
          .from('user_alerts')
          .select('*')
          .eq('user_id', userPreferences.userId)
          .eq('series_id', seriesId);
          
        if (!alertError && userAlerts) {
          setAlerts(userAlerts.map(alert => ({
            id: alert.id,
            condition: alert.condition,
            value: alert.value,
            email: alert.email,
            message: alert.message,
            active: alert.active
          })));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching series data:", error);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
  };

  fetchData();
  
  // Cleanup function
  return () => {
    if (chartInstance) {
      chartInstance.remove();
    }
    
    if (resizeObserver.current) {
      resizeObserver.current.disconnect();
    }
  };
}, [dataSource, sourceId, timeframe, userPreferences]);

// Process raw data to calculate derived series
const processSeriesData = (observations) => {
  if (!observations || observations.length === 0) {
    return { observations: [], percentChange: [], yearChange: [], yearPercentChange: [] };
  }
  
  // Sort by date in descending order (most recent first)
  const sortedObs = [...observations].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Calculate various derived series
  const percentChange = [];
  const yearChange = [];
  const yearPercentChange = [];
  const qoqChange = [];
  const qoqPercentChange = [];
  const momChange = [];
  const momPercentChange = [];
  const indexedValues = [];
  const compoundGrowth = [];
  
  // First observation has no previous to compare to
  for (let i = 0; i < sortedObs.length; i++) {
    const currentObs = sortedObs[i];
    const currentDate = new Date(currentObs.date);
    
    // For percent change (from previous period)
    if (i < sortedObs.length - 1) {
      const prevValue = sortedObs[i + 1].value;
      const pctChange = prevValue !== 0 ? ((currentObs.value / prevValue - 1) * 100) : 0;
      percentChange.push({
        date: currentObs.date,
        value: pctChange
      });
    } else {
      percentChange.push({
        date: currentObs.date,
        value: 0
      });
    }
    
    // For year-over-year change
    const yearAgoDate = new Date(currentDate);
    yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
    
    const yearAgoObs = sortedObs.find(obs => {
      const obsDate = new Date(obs.date);
      // Approximate match within a few days
      return Math.abs(obsDate - yearAgoDate) < 1000 * 60 * 60 * 24 * 15;
    });
    
    if (yearAgoObs) {
      yearChange.push({
        date: currentObs.date,
        value: currentObs.value - yearAgoObs.value
      });
      
      yearPercentChange.push({
        date: currentObs.date,
        value: yearAgoObs.value !== 0 ? ((currentObs.value / yearAgoObs.value - 1) * 100) : 0
      });
    } else {
      yearChange.push({
        date: currentObs.date,
        value: null
      });
      
      yearPercentChange.push({
        date: currentObs.date,
        value: null
      });
    }
    
    // For quarter-over-quarter change
    const quarterAgoDate = new Date(currentDate);
    quarterAgoDate.setMonth(quarterAgoDate.getMonth() - 3);
    
    const quarterAgoObs = sortedObs.find(obs => {
      const obsDate = new Date(obs.date);
      return Math.abs(obsDate - quarterAgoDate) < 1000 * 60 * 60 * 24 * 15;
    });
    
    if (quarterAgoObs) {
      qoqChange.push({
        date: currentObs.date,
        value: currentObs.value - quarterAgoObs.value
      });
      
      qoqPercentChange.push({
        date: currentObs.date,
        value: quarterAgoObs.value !== 0 ? ((currentObs.value / quarterAgoObs.value - 1) * 100) : 0
      });
    } else {
      qoqChange.push({
        date: currentObs.date,
        value: null
      });
      
      qoqPercentChange.push({
        date: currentObs.date,
        value: null
      });
    }
    
    // For month-over-month change
    const monthAgoDate = new Date(currentDate);
    monthAgoDate.setMonth(monthAgoDate.getMonth() - 1);
    
    const monthAgoObs = sortedObs.find(obs => {
      const obsDate = new Date(obs.date);
      return Math.abs(obsDate - monthAgoDate) < 1000 * 60 * 60 * 24 * 15;
    });
    
    if (monthAgoObs) {
      momChange.push({
        date: currentObs.date,
        value: currentObs.value - monthAgoObs.value
      });
      
      momPercentChange.push({
        date: currentObs.date,
        value: monthAgoObs.value !== 0 ? ((currentObs.value / monthAgoObs.value - 1) * 100) : 0
      });
    } else {
      momChange.push({
        date: currentObs.date,
        value: null
      });
      
      momPercentChange.push({
        date: currentObs.date,
        value: null
      });
    }
    
    // For indexed values (first value = 100)
    if (sortedObs.length > 0) {
      const baseValue = sortedObs[sortedObs.length - 1].value;
      indexedValues.push({
        date: currentObs.date,
        value: baseValue !== 0 ? (currentObs.value / baseValue * 100) : 0
      });
    }
    
    // Compound growth rate from earliest date
    if (i < sortedObs.length - 1) {
      const earliestValue = sortedObs[sortedObs.length - 1].value;
      const earliestDate = new Date(sortedObs[sortedObs.length - 1].date);
      const yearDiff = (currentDate - earliestDate) / (1000 * 60 * 60 * 24 * 365);
      
      if (yearDiff > 0 && earliestValue !== 0) {
        const cagr = (Math.pow(currentObs.value / earliestValue, 1 / yearDiff) - 1) * 100;
        compoundGrowth.push({
          date: currentObs.date,
          value: cagr
        });
      } else {
        compoundGrowth.push({
          date: currentObs.date,
          value: 0
        });
      }
    }
  }
  
  // Format all data for chart library
  const observationsFormatted = sortedObs.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const percentChangeFormatted = percentChange.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const yearChangeFormatted = yearChange.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const yearPercentChangeFormatted = yearPercentChange.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const qoqChangeFormatted = qoqChange.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const qoqPercentChangeFormatted = qoqPercentChange.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const momChangeFormatted = momChange.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const momPercentChangeFormatted = momPercentChange.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const indexedValuesFormatted = indexedValues.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  const compoundGrowthFormatted = compoundGrowth.map(obs => ({
    time: new Date(obs.date).getTime() / 1000,
    value: obs.value
  }));
  
  return {
    observations: sortedObs,
    percentChange,
    yearChange,
    yearPercentChange,
    qoqChange,
    qoqPercentChange,
    momChange,
    momPercentChange,
    indexedValues,
    compoundGrowth,
    formattedData: {
      value: observationsFormatted,
      percentChange: percentChangeFormatted,
      yearChange: yearChangeFormatted,
      yearPercentChange: yearPercentChangeFormatted,
      qoqChange: qoqChangeFormatted,
      qoqPercentChange: qoqPercentChangeFormatted,
      momChange: momChangeFormatted,
      momPercentChange: momPercentChangeFormatted,
      indexedToValue: indexedValuesFormatted,
      compoundGrowth: compoundGrowthFormatted
    }
  };
};

// Calculate basic statistics for the series
const calculateStatistics = (observations) => {
  if (!observations || observations.length === 0) {
    return {
      min: null,
      max: null,
      avg: null,
      median: null,
      stdDev: null,
      variance: null,
      changeFromFirst: null,
      percentChangeFromFirst: null,
      changeFromLast: null,
      percentChangeFromLast: null
    };
  }
  
  const values = observations.map(o => o.value).filter(v => v !== null && !isNaN(v));
  
  if (values.length === 0) return null;
  
  // Sort values for median and percentiles
  const sortedValues = [...values].sort((a, b) => a - b);
  
  // Calculate statistics
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  // Median
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];
  
  // Standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Changes
  const first = observations[observations.length - 1].value;
  const last = observations[0].value;
  const changeFromFirst = last - first;
  const percentChangeFromFirst = first !== 0 ? (last / first - 1) * 100 : null;
  
  const secondLast = observations.length > 1 ? observations[1].value : null;
  const changeFromLast = secondLast !== null ? last - secondLast : null;
  const percentChangeFromLast = secondLast !== null && secondLast !== 0 
    ? (last / secondLast - 1) * 100 
    : null;
  
  return {
    min,
    max,
    avg,
    median,
    stdDev,
    variance,
    changeFromFirst,
    percentChangeFromFirst,
    changeFromLast,
    percentChangeFromLast,
    count: values.length,
    first,
    last
  };
};

// Initialize chart when data is loaded
useEffect(() => {
  if (!loading && seriesData && chartContainerRef.current) {
    initializeChart();
  }
}, [loading, seriesData]);

// Update chart when settings change
useEffect(() => {
  if (chartInstance && mainSeries) {
    updateChartData();
  }
}, [
  chartType, chartStyle, startDate, endDate, lineColor, zoomLevel, 
  showGrid, logScale, showVolume, showAxisLabels, indexTo100, 
  indexBaseDate, invertYAxis, showInflationAdjusted, currencyDisplay,
  unitMultiplier, aggregationMethod, aggregationPeriod, numberOfDecimals,
  autoscaleChart, seasonalAdjustment
]);

// Initialize the chart
const initializeChart = () => {
  if (!chartContainerRef.current) return;
  
  // Clear previous chart if exists
  if (chartInstance) {
    chartInstance.remove();
  }
  
  // Create new chart
  const chart = createChart(chartContainerRef.current, {
    width: chartContainerRef.current.clientWidth,
    height: chartHeight,
    layout: {
      background: { color: '#ffffff' },
      textColor: '#333333',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    },
    grid: {
      vertLines: { 
        color: showGrid ? '#f0f0f0' : 'transparent',
        style: 1
      },
      horzLines: { 
        color: showGrid ? '#f0f0f0' : 'transparent',
        style: 1
      },
    },
    crosshair: {
      mode: 1, // CrosshairMode.Normal
      vertLine: {
        color: '#9ca3af',
        width: 1,
        style: 1,
        visible: true,
        labelVisible: true,
      },
      horzLine: {
        color: '#9ca3af',
        width: 1,
        style: 1,
        visible: true,
        labelVisible: true,
      }
    },
    rightPriceScale: {
      borderColor: '#d1d5db',
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
      visible: showAxisLabels,
      invertScale: invertYAxis,
      mode: logScale ? 1 : 0 // LogScale: 1, Normal: 0
    },
    leftPriceScale: {
      visible: false
    },
    timeScale: {
      borderColor: '#d1d5db',
      timeVisible: true,
      secondsVisible: false,
      visible: showAxisLabels
    },
    handleScroll: true,
    handleScale: true,
    autoSize: true,
    watermark: {
      color: 'rgba(0, 0, 0, 0.05)',
      visible: true,
      text: `Source: ${seriesData.source || dataSource.toUpperCase()}`,
      fontSize: 13,
      horzAlign: 'left',
      vertAlign: 'bottom',
    }
  });
  
  // Setup resize observer
  if (resizeObserver.current) {
    resizeObserver.current.disconnect();
  }
  
  resizeObserver.current = new ResizeObserver(entries => {
    const { width } = entries[0].contentRect;
    chart.applyOptions({ width });
  });
  
  resizeObserver.current.observe(chartContainerRef.current);
  
  // Save chart instance
  setChartInstance(chart);
  
  // Now create and add the main series
  let series;
  
  if (chartStyle === 'area') {
    series = chart.addAreaSeries({
      lineColor: lineColor,
      topColor: `${lineColor}40`, // 25% opacity
      bottomColor: `${lineColor}00`, // 0% opacity
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
  } else if (chartStyle === 'candle') {
    series = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
  } else if (chartStyle === 'bar') {
    series = chart.addBarSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
  } else if (chartStyle === 'histogram') {
    series = chart.addHistogramSeries({
      color: lineColor,
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
  } else {
    series = chart.addLineSeries({
      color: lineColor,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      lastValueVisible: true,
      priceLineVisible: true,
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
  }
  
  // Get appropriate data based on chart type
  const formattedData = seriesData.formattedData[chartType] || seriesData.formattedData.value;
  
  // Set main series data
  if (formattedData && formattedData.length > 0) {
    series.setData(formattedData);
    
    // Add price line for current value
    const currentValue = formattedData[0]?.value;
    if (currentValue !== undefined) {
      series.createPriceLine({
        price: currentValue,
        color: lineColor,
        lineWidth: 1,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: 'Current',
      });
    }
  }
  
  setMainSeries(series);
  
  // Add volume if enabled and available
  if (showVolume && seriesData.volume) {
    const volumeSeries = chart.addHistogramSeries({
      color: '#64748b',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    
    volumeSeries.setData(seriesData.volume.map(v => ({
      time: new Date(v.date).getTime() / 1000,
      value: v.value,
      color: v.change >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
    })));
  }
  
  // Add existing annotations
  annotations.forEach(annotation => {
    series.createPriceLine({
      price: annotation.price,
      color: annotation.color || '#ff0000',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: annotation.text,
    });
  });
  
  // Add comparison series if any
  if (compareMode && comparisonSeries.length > 0) {
    comparisonSeries.forEach(series => {
      if (series.data && series.data.length > 0) {
        const compSeries = chart.addLineSeries({
          color: series.color,
          lineWidth: 1.5,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          priceFormat: {
            type: 'price',
            precision: numberOfDecimals,
            minMove: Math.pow(10, -numberOfDecimals),
          },
        });
        
        compSeries.setData(series.data);
        
        // Update the series instance in the state
        setComparisonSeries(prev => 
          prev.map(s => 
            s.seriesId === series.seriesId 
              ? { ...s, instance: compSeries } 
              : s
          )
        );
      }
    });
  }
  
  // Add technical indicators
  activeIndicators.forEach(indicator => {
    addIndicatorToChart(chart, indicator, formattedData);
  });
  
  // Set visible range based on date filters
  if (startDate && endDate) {
    chart.timeScale().setVisibleRange({
      from: Math.floor(startDate.getTime() / 1000),
      to: Math.floor(endDate.getTime() / 1000),
    });
  }
  
  // Setup drawing tools
  setupDrawingTools(chart, series);
  
  // Add AI prediction if available
  if (showAiPrediction && aiPrediction && aiPrediction.forecast) {
    addAiPredictionToChart(chart, aiPrediction);
  }
};

// Add AI prediction to chart
const addAiPredictionToChart = (chart, prediction) => {
  if (!prediction.forecast || !prediction.forecast.length) return;
  
  // Create prediction series
  const predictionSeries = chart.addLineSeries({
    color: '#9333ea', // Purple
    lineWidth: 2,
    lineStyle: 1, // Dashed
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
    lastValueVisible: true,
    priceLineVisible: false,
    priceFormat: {
      type: 'price',
      precision: numberOfDecimals,
      minMove: Math.pow(10, -numberOfDecimals),
    },
  });
  
  // Format prediction data
  const predictionData = prediction.forecast.map(point => ({
    time: new Date(point.date).getTime() / 1000,
    value: point.value
  }));
  
  predictionSeries.setData(predictionData);
  
  // Add confidence interval if available
  if (prediction.confidenceInterval) {
    const areaSeries = chart.addAreaSeries({
      lastValueVisible: false,
      lineWidth: 0,
      priceLineVisible: false,
      topColor: 'rgba(147, 51, 234, 0.2)',
      bottomColor: 'rgba(147, 51, 234, 0.02)',
      lineColor: 'rgba(147, 51, 234, 0.5)',
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    const areaData = prediction.confidenceInterval.map(point => ({
      time: new Date(point.date).getTime() / 1000,
      value: point.upper
    }));
    
    const lowerAreaSeries = chart.addAreaSeries({
      lastValueVisible: false,
      lineWidth: 0,
      priceLineVisible: false,
      topColor: 'rgba(147, 51, 234, 0.05)',
      bottomColor: 'rgba(147, 51, 234, 0.2)',
      lineColor: 'rgba(147, 51, 234, 0.5)',
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    const lowerAreaData = prediction.confidenceInterval.map(point => ({
      time: new Date(point.date).getTime() / 1000,
      value: point.lower
    }));
    
    areaSeries.setData(areaData);
    lowerAreaSeries.setData(lowerAreaData);
  }
};

// Add a technical indicator to the chart
const addIndicatorToChart = (chart, indicatorConfig, priceData) => {
  if (!chart || !priceData || priceData.length === 0) return;
  
  let indicatorData = [];
  let indicatorSeries;
  
  switch(indicatorConfig.type) {
    case 'sma':
      indicatorData = sma(priceData, indicatorConfig.period);
      indicatorSeries = chart.addLineSeries({
        color: indicatorConfig.color || '#2563eb',
        lineWidth: 1,
        lineStyle: 1, // Dashed
        crosshairMarkerVisible: false,
        lastValueVisible: true,
        title: `SMA(${indicatorConfig.period})`,
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      break;
      
    case 'ema':
      indicatorData = ema(priceData, indicatorConfig.period);
      indicatorSeries = chart.addLineSeries({
        color: indicatorConfig.color || '#16a34a',
        lineWidth: 1,
        lineStyle: 1, // Dashed
        crosshairMarkerVisible: false,
        lastValueVisible: true,
        title: `EMA(${indicatorConfig.period})`,
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      break;
      
    case 'rsi':
      indicatorData = rsi(priceData, indicatorConfig.period);
      indicatorSeries = chart.addLineSeries({
        color: indicatorConfig.color || '#f59e0b',
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: true,
        title: `RSI(${indicatorConfig.period})`,
        priceScaleId: 'rsi',
        priceFormat: {
          type: 'price',
          precision: 0,
          minMove: 1,
        },
      });
      
      chart.priceScale('rsi').applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        visible: true,
        drawTicks: false,
        autoScale: true,
      });
      
      // Add overbought/oversold lines
      indicatorSeries.createPriceLine({
        price: 70,
        color: '#ef4444',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'Overbought',
      });
      
      indicatorSeries.createPriceLine({
        price: 30,
        color: '#22c55e',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'Oversold',
      });
      break;
      
    case 'macd':
      const macdData = macd(
        priceData, 
        indicatorConfig.params.fast,
        indicatorConfig.params.slow,
        indicatorConfig.params.signal
      );
      
      // MACD Line
      const macdLineSeries = chart.addLineSeries({
        color: indicatorConfig.color || '#2563eb',
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: true,
        title: `MACD(${indicatorConfig.params.fast},${indicatorConfig.params.slow},${indicatorConfig.params.signal})`,
        priceScaleId: 'macd',
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      
      // Signal Line
      const signalLineSeries = chart.addLineSeries({
        color: '#f59e0b',
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: true,
        priceScaleId: 'macd',
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      
      // Histogram
      const histogramSeries = chart.addHistogramSeries({
        priceScaleId: 'macd',
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      
      chart.priceScale('macd').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
        visible: true,
        drawTicks: false,
        autoScale: true,
      });
      
      macdLineSeries.setData(macdData.macdLine);
      signalLineSeries.setData(macdData.signalLine);
      histogramSeries.setData(macdData.histogram);
      return; // Skip the common setData at the end
      
    case 'bollinger':
      const bbands = bollingerBands(
        priceData, 
        indicatorConfig.params.period,
        indicatorConfig.params.stdDev
      );
      
      // Middle band (SMA)
      const middleBandSeries = chart.addLineSeries({
        color: indicatorConfig.color || '#2563eb',
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: true,
        title: `BB(${indicatorConfig.params.period},${indicatorConfig.params.stdDev})`,
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      
      // Upper band
      const upperBandSeries = chart.addLineSeries({
        color: '#9ca3af',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      
      // Lower band
      const lowerBandSeries = chart.addLineSeries({
        color: '#9ca3af',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      
      middleBandSeries.setData(bbands.middle);
      upperBandSeries.setData(bbands.upper);
      lowerBandSeries.setData(bbands.lower);
      return; // Skip the common setData at the end
      
    default:
      return; // Unsupported indicator
  }
  
  if (indicatorSeries && indicatorData.length > 0) {
    indicatorSeries.setData(indicatorData);
  }
};

// Update chart data based on current settings
const updateChartData = () => {
  if (!chartInstance || !mainSeries || !seriesData) return;
  
  // Get data based on chart type
  const formattedData = seriesData.formattedData[chartType] || seriesData.formattedData.value;
  
  if (!formattedData) return;
  
  // Filter by date range if set
  let filteredData = formattedData;
  if (startDate || endDate) {
    filteredData = formattedData.filter(item => {
      const itemTime = item.time * 1000; // Convert back to milliseconds
      if (startDate && endDate) {
        return itemTime >= startDate.getTime() && itemTime <= endDate.getTime();
      } else if (startDate) {
        return itemTime >= startDate.getTime();
      } else if (endDate) {
        return itemTime <= endDate.getTime();
      }
      return true;
    });
  }
  
  // Apply unit multiplier if needed
  let processedData = [...filteredData];
  if (unitMultiplier !== 1) {
    processedData = processedData.map(item => ({
      ...item,
      value: item.value !== null ? item.value * unitMultiplier : null
    }));
  }
  
  // Apply seasonal adjustment if selected
  if (seasonalAdjustment === 'x12' && seriesData.x12Adjusted) {
    processedData = processedData.map(item => {
      const originalTime = new Date(item.time * 1000);
      const matchingAdjusted = seriesData.x12Adjusted.find(adj => {
        const adjDate = new Date(adj.date);
        return adjDate.getFullYear() === originalTime.getFullYear() && 
               adjDate.getMonth() === originalTime.getMonth() &&
               adjDate.getDate() === originalTime.getDate();
      });
      
      return {
        ...item,
        value: matchingAdjusted ? matchingAdjusted.value : item.value
      };
    });
  }
  
  // Apply data aggregation if selected
  if (aggregationMethod !== 'none') {
    processedData = aggregateData(processedData, aggregationMethod, aggregationPeriod);
  }
  
  // Update main series data
  if (chartStyle === 'candle' || chartStyle === 'bar') {
    // For candlestick/bar charts, convert to OHLC format
    const ohlcData = convertToOhlc(processedData);
    mainSeries.setData(ohlcData);
  } else {
    mainSeries.setData(processedData);
  }
  
  // Update main series type if needed
  updateChartStyle();
  
  // Update visible range
  if (startDate && endDate) {
    chartInstance.timeScale().setVisibleRange({
      from: Math.floor(startDate.getTime() / 1000),
      to: Math.floor(endDate.getTime() / 1000),
    });
  }
  
  // Apply zoom level
  chartInstance.timeScale().applyOptions({
    barSpacing: 10 * zoomLevel,
  });
  
  // Update grid visibility
  chartInstance.applyOptions({
    grid: {
      vertLines: { 
        color: showGrid ? '#f0f0f0' : 'transparent'
      },
      horzLines: { 
        color: showGrid ? '#f0f0f0' : 'transparent'
      },
    }
  });
  
  // Update Y axis options
  chartInstance.priceScale('right').applyOptions({
    visible: showAxisLabels,
    invertScale: invertYAxis,
    mode: logScale ? 1 : 0, // LogScale: 1, Normal: 0
    autoScale: autoscaleChart
  });
  
  // Update X axis options
  chartInstance.timeScale().applyOptions({
    visible: showAxisLabels
  });
  
  // Reapply annotations
  annotations.forEach(annotation => {
    mainSeries.createPriceLine({
      price: annotation.price,
      color: annotation.color || '#ff0000',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: annotation.text,
    });
  });
  
  // Update comparison series
  updateComparisonSeries();
  
  // Update technical indicators
  updateTechnicalIndicators(processedData);
  
  // Update AI prediction if available
  if (showAiPrediction && aiPrediction && aiPrediction.forecast) {
    addAiPredictionToChart(chartInstance, aiPrediction);
  }
};

// Update chart style when changed
const updateChartStyle = () => {
  if (!chartInstance || !mainSeries) return;
  
  const formattedData = seriesData.formattedData[chartType] || seriesData.formattedData.value;
  
  if (chartStyle === 'area' && mainSeries.seriesType() !== 'Area') {
    // Need to recreate the series as changing type isn't supported
    chartInstance.removeSeries(mainSeries);
    
    const newSeries = chartInstance.addAreaSeries({
      lineColor: lineColor,
      topColor: `${lineColor}40`,
      bottomColor: `${lineColor}00`,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    newSeries.setData(formattedData);
    setMainSeries(newSeries);
  } else if (chartStyle === 'line' && mainSeries.seriesType() !== 'Line') {
    chartInstance.removeSeries(mainSeries);
    
    const newSeries = chartInstance.addLineSeries({
      color: lineColor,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    newSeries.setData(formattedData);
    setMainSeries(newSeries);
  } else if (chartStyle === 'candle' && mainSeries.seriesType() !== 'Candlestick') {
    chartInstance.removeSeries(mainSeries);
    
    const newSeries = chartInstance.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    // Need to convert data to OHLC format
    const ohlcData = convertToOhlc(formattedData);
    
    newSeries.setData(ohlcData);
    setMainSeries(newSeries);
  } else if (chartStyle === 'bar' && mainSeries.seriesType() !== 'Bar') {
    chartInstance.removeSeries(mainSeries);
    
    const newSeries = chartInstance.addBarSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    // Need to convert data to OHLC format
    const ohlcData = convertToOhlc(formattedData);
    
    newSeries.setData(ohlcData);
    setMainSeries(newSeries);
  } else if (chartStyle === 'histogram' && mainSeries.seriesType() !== 'Histogram') {
    chartInstance.removeSeries(mainSeries);
    
    const newSeries = chartInstance.addHistogramSeries({
      color: lineColor,
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    newSeries.setData(formattedData);
    setMainSeries(newSeries);
  } else {
    // Just update the color if needed
    mainSeries.applyOptions({
      color: lineColor,
      lineColor: lineColor,
      topColor: chartStyle === 'area' ? `${lineColor}40` : undefined,
      bottomColor: chartStyle === 'area' ? `${lineColor}00` : undefined,
    });
  }
};

// Convert line data to OHLC format for candlestick/bar charts
const convertToOhlc = (lineData) => {
  if (!lineData || lineData.length === 0) return [];
  
  return lineData.map((item, index) => {
    // Basic approach - for actual OHLC data you would load real values
    // This is just a simulation based on the line data
    const prevValue = index < lineData.length - 1 ? lineData[index + 1].value : item.value * 0.99;
    const changePercent = 0.01; // 1% simulated change
    
    const open = prevValue;
    const close = item.value;
    const high = Math.max(open, close) * (1 + changePercent);
    const low = Math.min(open, close) * (1 - changePercent);
    
    return {
      time: item.time,
      open,
      high,
      low,
      close
    };
  });
};

// Aggregate data based on selected method and period
const aggregateData = (data, method, period) => {
  if (!data || data.length === 0 || method === 'none') return data;
  
  // Group data by the specified period
  const groupedData = {};
  
  data.forEach(item => {
    const date = new Date(item.time * 1000);
    let key;
    
    switch (period) {
      case 'daily':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'weekly':
        // Get the start of the week (Monday)
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
        key = format(startOfWeek, 'yyyy-MM-dd');
        break;
      case 'monthly':
        key = format(date, 'yyyy-MM');
        break;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'yearly':
        key = date.getFullYear().toString();
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }
    
    if (!groupedData[key]) {
      groupedData[key] = {
        time: item.time, // Use the first timestamp for this group
        values: []
      };
    }
    
    if (item.value !== null && !isNaN(item.value)) {
      groupedData[key].values.push(item.value);
    }
  });
  
  // Apply aggregation method to each group
  return Object.values(groupedData).map(group => {
    if (group.values.length === 0) {
      return {
        time: group.time,
        value: null
      };
    }
    
    let value;
    
    switch (method) {
      case 'avg':
        value = group.values.reduce((sum, v) => sum + v, 0) / group.values.length;
        break;
      case 'sum':
        value = group.values.reduce((sum, v) => sum + v, 0);
        break;
      case 'min':
        value = Math.min(...group.values);
        break;
      case 'max':
        value = Math.max(...group.values);
        break;
      case 'first':
        value = group.values[0];
        break;
      case 'last':
        value = group.values[group.values.length - 1];
        break;
      default:
        value = group.values[0];
    }
    
    return {
      time: group.time,
      value
    };
  });
};

// Update technical indicators when data or settings change
const updateTechnicalIndicators = (priceData) => {
  if (!chartInstance || !priceData || priceData.length === 0) return;
  
  // First remove all existing indicators
  activeIndicators.forEach(indicator => {
    if (indicator.series) {
      chartInstance.removeSeries(indicator.series);
    }
    
    if (indicator.secondarySeries) {
      chartInstance.removeSeries(indicator.secondarySeries);
    }
    
    if (indicator.tertiarySeries) {
      chartInstance.removeSeries(indicator.tertiarySeries);
    }
  });
  
  // Now add them back with updated data
  activeIndicators.forEach(indicator => {
    addIndicatorToChart(chartInstance, indicator, priceData);
  });
};

// Setup drawing tools
const setupDrawingTools = (chart, series) => {
  if (!chart || !series) return;
  
  let drawingPoints = [];
  let currentDrawing = null;
  
  const handleMouseMove = (param) => {
    if (!param.point || !activeDrawingTool || !currentDrawing) return;
    
    const { time, price } = param.point;
    
    switch (activeDrawingTool) {
      case 'horizontalLine':
        // Update the price line as the mouse moves
        if (currentDrawing) {
          chart.removePriceLine(currentDrawing);
        }
        
        currentDrawing = series.createPriceLine({
          price,
          color: '#ff0000',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `Level: ${price.toFixed(2)}`,
        });
        break;
        
      case 'trendLine':
        // For trend line, we need at least two points
        if (drawingPoints.length === 1) {
          // Update temporary line
          if (currentDrawing) {
            chart.removeLineToolInstance(currentDrawing);
          }
          
          // Show temporary trend line
          const startPoint = drawingPoints[0];
          currentDrawing = {
            startTime: startPoint.time,
            startPrice: startPoint.price,
            endTime: time,
            endPrice: price
          };
          
          // This would be implemented in a full drawing tool system
          // Here we're just simulating
        }
        break;
        
      case 'rectangle':
        // Similar to trend line, update temporary rectangle
        if (drawingPoints.length === 1) {
          // Update temporary rectangle
        }
        break;
        
      default:
        break;
    }
  };
  
  const handleClick = (param) => {
    if (!param.point || !activeDrawingTool) return;
    
    const { time, price } = param.point;
    
    switch (activeDrawingTool) {
      case 'horizontalLine':
        // Create horizontal line
        const hLine = series.createPriceLine({
          price,
          color: '#ff0000',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `Level: ${price.toFixed(2)}`,
        });
        
        // Add to annotations
        setAnnotations(prev => [
          ...prev,
          {
            id: `hl-${Date.now()}`,
            text: `Level: ${price.toFixed(2)}`,
            price,
            date: new Date(time * 1000),
            color: '#ff0000',
            tool: 'horizontalLine'
          }
        ]);
        
        // Save to database if user is logged in
        saveAnnotationToDatabase({
          text: `Level: ${price.toFixed(2)}`,
          price,
          date: new Date(time * 1000),
          color: '#ff0000',
          tool: 'horizontalLine'
        });
        
        // Disable drawing tool after use
        setActiveDrawingTool(null);
        break;
        
      case 'verticalLine':
        // Create vertical line (this would require extending lightweight-charts)
        // For simplicity, we'll just add it to our annotations
        setAnnotations(prev => [
          ...prev,
          {
            id: `vl-${Date.now()}`,
            text: `Date: ${format(new Date(time * 1000), 'yyyy-MM-dd')}`,
            time,
            date: new Date(time * 1000),
            color: '#ff0000',
            tool: 'verticalLine'
          }
        ]);
        
        // Save to database
        saveAnnotationToDatabase({
          text: `Date: ${format(new Date(time * 1000), 'yyyy-MM-dd')}`,
          time,
          date: new Date(time * 1000),
          color: '#ff0000',
          tool: 'verticalLine'
        });
        
        setActiveDrawingTool(null);
        break;
        
      case 'trendLine':
      case 'rectangle':
      case 'ellipse':
      case 'fibonacciRetracement':
        // For multi-point tools, collect points
        drawingPoints.push({ time, price });
        
        // If we have enough points, create the drawing
        if (
          (activeDrawingTool === 'trendLine' && drawingPoints.length === 2) ||
          (activeDrawingTool === 'rectangle' && drawingPoints.length === 2) ||
          (activeDrawingTool === 'ellipse' && drawingPoints.length === 2) ||
          (activeDrawingTool === 'fibonacciRetracement' && drawingPoints.length === 2)
        ) {
          // Create the drawing (this would require extending lightweight-charts)
          // For simplicity, we'll just add it to our drawings
          setDrawings(prev => [
            ...prev,
            {
              id: `drawing-${Date.now()}`,
              type: activeDrawingTool,
              points: [...drawingPoints],
              color: '#ff0000'
            }
          ]);
          
          // Save to database
          saveDrawingToDatabase({
            type: activeDrawingTool,
            points: [...drawingPoints],
            color: '#ff0000'
          });
          
          // Reset
          drawingPoints = [];
          if (currentDrawing) {
            // Remove temporary drawing
          }
          currentDrawing = null;
          setActiveDrawingTool(null);
        }
        break;
        
      case 'text':
        // For text, open a dialog to enter text
        setNewAnnotation({
          text: '',
          price,
          date: new Date(time * 1000),
          color: '#ff0000'
        });
        setShowAnnotationForm(true);
        setActiveDrawingTool(null);
        break;
        
      default:
        break;
    }
  };
  
  // Set up event handlers on chart
  chart.subscribeClick(handleClick);
  chart.subscribeCrosshairMove(handleMouseMove);
  
  // Cleanup function to remove event handlers
  return () => {
    chart.unsubscribeClick(handleClick);
    chart.unsubscribeCrosshairMove(handleMouseMove);
  };
};

// Save annotation to database
const saveAnnotationToDatabase = async (annotation) => {
  if (!userPreferences?.userId) return;
  
  try {
    const { data, error } = await supabase.from('user_annotations').insert([{
      user_id: userPreferences.userId,
      series_id: seriesId,
      text: annotation.text,
      price: annotation.price,
      date: annotation.date.toISOString(),
      color: annotation.color,
      tool: annotation.tool
    }]);
    
    if (error) throw error;
    
    // Show success notification
    toast.success('Annotation saved');
  } catch (error) {
    console.error('Error saving annotation:', error);
    toast.error('Failed to save annotation');
  }
};

// Save drawing to database
const saveDrawingToDatabase = async (drawing) => {
  if (!userPreferences?.userId) return;
  
  try {
    const { data, error } = await supabase.from('user_drawings').insert([{
      user_id: userPreferences.userId,
      series_id: seriesId,
      type: drawing.type,
      points: drawing.points,
      color: drawing.color
    }]);
    
    if (error) throw error;
    
    // Show success notification
    toast.success('Drawing saved');
  } catch (error) {
    console.error('Error saving drawing:', error);
    toast.error('Failed to save drawing');
  }
};

// Update comparison series when settings change
const updateComparisonSeries = () => {
  if (!chartInstance) return;
  
  // Remove existing comparison series from chart
  comparisonSeries.forEach(series => {
    if (series.instance) {
      chartInstance.removeSeries(series.instance);
    }
  });
  
  if (!compareMode || comparisonSeries.length === 0) return;
  
  // Add updated comparison series
  const updatedComparisons = comparisonSeries.map(series => {
    if (!series.data) return series;
    
    let seriesData = [...series.data];
    
    // Apply normalization if enabled
    if (normalizeComparison) {
      // Find the first valid values
      const mainFirst = seriesData.formattedData?.[chartType]?.[0]?.value || 
                        seriesData.formattedData?.value?.[0]?.value;
      const compFirst = seriesData[0]?.value;
      
      if (mainFirst && compFirst && mainFirst !== 0 && compFirst !== 0) {
        // Normalize all values to match the same scale
        seriesData = seriesData.map(point => ({
          time: point.time,
          value: point.value * (mainFirst / compFirst)
        }));
      }
    }
    
    // Filter by date range if set
    if (startDate || endDate) {
      seriesData = seriesData.filter(item => {
        const itemTime = item.time * 1000; // Convert back to milliseconds
        if (startDate && endDate) {
          return itemTime >= startDate.getTime() && itemTime <= endDate.getTime();
        } else if (startDate) {
          return itemTime >= startDate.getTime();
        } else if (endDate) {
          return itemTime <= endDate.getTime();
        }
        return true;
      });
    }
    
    // Create the series with updated data
    const compSeries = chartInstance.addLineSeries({
      color: series.color,
      lineWidth: 1.5,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceFormat: {
        type: 'price',
        precision: numberOfDecimals,
        minMove: Math.pow(10, -numberOfDecimals),
      },
    });
    
    compSeries.setData(seriesData);
    
    return { ...series, instance: compSeries };
  });
  
  setComparisonSeries(updatedComparisons);
};

// Date range helpers
const setDateRangeByTimeframe = (timeframe) => {
  const currentDate = new Date();
  let startDate;
  
  switch(timeframe) {
    case '1D':
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
      break;
    case '1W':
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 7);
      break;
    case '1M':
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 1);
      break;
    case '3M':
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 3);
      break;
    case '6M':
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 6);
      break;
    case '1Y':
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 1);
      break;
    case '2Y':
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 2);
      break;
    case '5Y':
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 5);
      break;
    case '10Y':
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 10);
      break;
    case 'All':
      startDate = null;
      break;
    default:
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 1);
  }
  
  setStartDate(startDate);
  setEndDate(currentDate);
};

const handleTimeframeChange = (tf) => {
  setTimeframe(tf);
  setDateRangeByTimeframe(tf);
};

// Zoom controls
const handleZoomIn = () => {
  setZoomLevel(prev => Math.min(prev + 0.2, 3));
};

const handleZoomOut = () => {
  setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
};

// Chart style and type controls
const handleChartTypeChange = (type) => {
  setChartType(type);
};

const handleChartStyleChange = (style) => {
  setChartStyle(style);
};

// Toggle fullscreen mode
const toggleFullscreen = () => {
  if (!chartContainerRef.current) return;
  
  if (!fullscreen) {
    // Go fullscreen
    if (chartContainerRef.current.requestFullscreen) {
      chartContainerRef.current.requestFullscreen();
    } else if (chartContainerRef.current.mozRequestFullScreen) {
      chartContainerRef.current.mozRequestFullScreen();
    } else if (chartContainerRef.current.webkitRequestFullscreen) {
      chartContainerRef.current.webkitRequestFullscreen();
    } else if (chartContainerRef.current.msRequestFullscreen) {
      chartContainerRef.current.msRequestFullscreen();
    }
    setFullscreen(true);
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setFullscreen(false);
  }
};

// Watchlist controls
const handleWatchlistToggle = () => {
  if (isInWatchlist) {
    removeFromWatchlist(seriesId);
    toast.success('Removed from watchlist');
  } else if (seriesData) {
    addToWatchlist({
      seriesId,
      title: seriesData.title,
      description: seriesData.description,
      source: dataSource,
      latestValue: seriesData.latestValue,
      change: seriesData.change
    });
    toast.success('Added to watchlist');
  }
};

// Annotation controls
const handleAddAnnotation = () => {
  if (newAnnotation.text && newAnnotation.price) {
    const price = parseFloat(newAnnotation.price);
    const newAnnotationObject = {
      id: `annotation-${Date.now()}`,
      text: newAnnotation.text,
      price: price,
      date: newAnnotation.date,
      color: newAnnotation.color || '#ff0000'
    };
    
    setAnnotations(prev => [...prev, newAnnotationObject]);
    setNewAnnotation({ text: '', price: '', date: new Date(), color: '#ff0000' });
    setShowAnnotationForm(false);
    
    // Save to database
    saveAnnotationToDatabase(newAnnotationObject);
    
    // Update chart with new annotation
    if (mainSeries) {
      mainSeries.createPriceLine({
        price: price,
        color: newAnnotationObject.color,
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: newAnnotation.text,
      });
    }
  }
};

// Alert controls
const handleAddAlert = () => {
  if (newAlert.condition && newAlert.value) {
    const value = parseFloat(newAlert.value);
    
    const newAlertObject = {
      id: `alert-${Date.now()}`,
      condition: newAlert.condition,
      value: value,
      email: newAlert.email,
      message: newAlert.message,
      active: true
    };
    
    setAlerts(prev => [...prev, newAlertObject]);
    setNewAlert({ condition: 'above', value: '', email: '', message: '' });
    setShowAlertForm(false);
    
    // Save to database
    saveAlertToDatabase(newAlertObject);
    
    // Add to chart as a reference line
    if (mainSeries) {
      const color = newAlert.condition === 'above' ? '#22c55e' : '#ef4444';
      mainSeries.createPriceLine({
        price: value,
        color: color,
        lineWidth: 1,
        lineStyle: 3, // Dotted
        axisLabelVisible: true,
        title: `Alert: ${newAlert.condition} ${value}`,
      });
    }
    
    // Show success notification
    toast.success('Alert added successfully');
  }
};

// Save alert to database
const saveAlertToDatabase = async (alert) => {
  if (!userPreferences?.userId) return;
  
  try {
    const { data, error } = await supabase.from('user_alerts').insert([{
      user_id: userPreferences.userId,
      series_id: seriesId,
      condition: alert.condition,
      value: alert.value,
      email: alert.email,
      message: alert.message,
      active: alert.active
    }]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error saving alert:', error);
    toast.error('Failed to save alert');
  }
};

// Email alert configuration
const configureEmailAlert = async () => {
  if (!userPreferences?.userId) {
    toast.error('Please log in to set up email alerts');
    return;
  }
  
  try {
    // Check if user has email set up
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, email_alerts_enabled')
      .eq('id', userPreferences.userId)
      .single();
      
    if (profileError) throw profileError;
    
    if (!profile.email) {
      toast.error('Please add an email address to your profile first');
      navigate('/profile');
      return;
    }
    
    // Toggle email alerts
    const { data, error } = await supabase
      .from('profiles')
      .update({ email_alerts_enabled: !profile.email_alerts_enabled })
      .eq('id', userPreferences.userId);
      
    if (error) throw error;
    
    toast.success(`Email alerts ${profile.email_alerts_enabled ? 'disabled' : 'enabled'}`);
    
    // Update user preferences
    setUserPreferences(prev => ({
      ...prev,
      emailAlertsEnabled: !profile.email_alerts_enabled
    }));
  } catch (error) {
    console.error('Error configuring email alerts:', error);
    toast.error('Failed to configure email alerts');
  }
};

// Comparison mode
const handleSearchSubmit = async (e) => {
  e.preventDefault();
  
  if (!searchQuery.trim()) return;
  
  setLoading(true);
  
  try {
    let results = [];
    
    // Search across all data sources
    const fredPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/fred/search?q=${searchQuery}`);
    const ecbPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/ecb/search?q=${searchQuery}`);
    const finnworldsPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/finnworlds/search?q=${searchQuery}`);
    const nyFedPromise = axios.get(`${process.env.REACT_APP_API_URL}/api/nyfed/search?q=${searchQuery}`);
    
    // Also search in Supabase for custom series
    const supabasePromise = supabase
      .from('custom_series')
      .select('id, title, description, category')
      .ilike('title', `%${searchQuery}%`)
      .limit(10);
    
    const [fredResponse, ecbResponse, finnworldsResponse, nyFedResponse, supabaseResponse] = 
      await Promise.all([fredPromise, ecbPromise, finnworldsPromise, nyFedPromise, supabasePromise]);
    
    // Process results from all sources
    if (fredResponse.data) {
      results = [
        ...results,
        ...fredResponse.data.map(item => ({
          seriesId: `fred:${item.id}`,
          title: item.title,
          description: item.description || '',
          source: 'FRED',
          category: item.category || ''
        }))
      ];
    }
    
    if (ecbResponse.data) {
      results = [
        ...results,
        ...ecbResponse.data.map(item => ({
          seriesId: `ecb:${item.id}`,
          title: item.title,
          description: item.description || '',
          source: 'ECB',
          category: item.category || ''
        }))
      ];
    }
    
    if (finnworldsResponse.data) {
      results = [
        ...results,
        ...finnworldsResponse.data.map(item => ({
          seriesId: `finnworlds:${item.id}`,
          title: item.title,
          description: item.description || '',
          source: 'Finnworlds',
          category: item.category || ''
        }))
      ];
    }
    
    if (nyFedResponse.data) {
      results = [
        ...results,
        ...nyFedResponse.data.map(item => ({
          seriesId: `nyfed:${item.id}`,
          title: item.title,
          description: item.description || '',
          source: 'NY Fed',
          category: item.category || ''
        }))
      ];
    }
    
    if (supabaseResponse.data) {
      results = [
        ...results,
        ...supabaseResponse.data.map(item => ({
          seriesId: `custom:${item.id}`,
          title: item.title,
          description: item.description || '',
          source: 'Custom',
          category: item.category || ''
        }))
      ];
    }
    
    setSearchResults(results);
  } catch (error) {
    console.error("Error searching indicators:", error);
    toast.error('Error searching for indicators');
  } finally {
    setLoading(false);
  }
};

const handleAddComparison = async (indicator) => {
  try {
    // Generate a random color
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    // Add to comparison series state
    const newSeries = {
      seriesId: indicator.seriesId,
      title: indicator.title,
      source: indicator.source,
      color: randomColor,
      data: null,
      instance: null
    };
    
    setComparisonSeries(prev => [...prev, newSeries]);
    setLoading(true);
    
    // Extract source and id
    const [source, id] = indicator.seriesId.split(':');
    
    // Fetch data for this series from the appropriate API
    let seriesData;
    
    switch(source.toLowerCase()) {
      case DATA_SOURCES.FRED:
        seriesData = await fetchFredData(id);
        break;
      case DATA_SOURCES.ECB:
        seriesData = await fetchEcbData(id);
        break;
      case DATA_SOURCES.FINNWORLDS:
        seriesData = await fetchFinnworldsData(id);
        break;
      case DATA_SOURCES.NY_FED:
        seriesData = await fetchNyFedData(id);
        break;
      case DATA_SOURCES.CUSTOM:
        const { data, error } = await supabase
          .from('custom_series_observations')
          .select('date, value')
          .eq('series_id', id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        seriesData = { observations: data };
        break;
      default:
        throw new Error(`Unknown data source: ${source}`);
    }
    
    // Process the data
    const processedData = processSeriesData(seriesData.observations);
    
    // Get data based on chart type
    const formattedData = processedData.formattedData[chartType] || processedData.formattedData.value;
    
    // Filter by date range
    let filteredData = formattedData;
    if (startDate || endDate) {
      filteredData = formattedData.filter(item => {
        const itemTime = item.time * 1000; // Convert back to milliseconds
        if (startDate && endDate) {
          return itemTime >= startDate.getTime() && itemTime <= endDate.getTime();
        } else if (startDate) {
          return itemTime >= startDate.getTime();
        } else if (endDate) {
          return itemTime <= endDate.getTime();
        }
        return true;
      });
    }
    
    // Update with actual data
    setComparisonSeries(prev =>
      prev.map(s =>
        s.seriesId === indicator.seriesId
          ? { ...s, data: filteredData }
          : s
      )
    );
    
    // Add to chart if it's initialized
    if (chartInstance) {
      const compSeries = chartInstance.addLineSeries({
        color: randomColor,
        lineWidth: 1.5,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: {
          type: 'price',
          precision: numberOfDecimals,
          minMove: Math.pow(10, -numberOfDecimals),
        },
      });
      
      compSeries.setData(filteredData);
      
      // Update with series instance
      setComparisonSeries(prev =>
        prev.map(s =>
          s.seriesId === indicator.seriesId
            ? { ...s, instance: compSeries }
            : s
        )
      );
    }
    
    setCompareMode(true);
    setShowCompareForm(false);
    setSearchQuery('');
    setLoading(false);
    toast.success(`Added ${indicator.title} for comparison`);
  } catch (error) {
    console.error("Error adding comparison:", error);
    toast.error('Failed to add comparison');
    setLoading(false);
  }
};

const handleRemoveComparison = (seriesId) => {
  // Find and remove the series from chart
  const seriesToRemove = comparisonSeries.find(s => s.seriesId === seriesId);
  
  if (seriesToRemove && seriesToRemove.instance && chartInstance) {
    chartInstance.removeSeries(seriesToRemove.instance);
  }
  
  // Update state
  setComparisonSeries(prev => prev.filter(s => s.seriesId !== seriesId));
  
  // If no comparison series left, exit compare mode
  if (comparisonSeries.length <= 1) {
    setCompareMode(false);
  }
  
  toast.info('Comparison removed');
};

// Drawing tool selector
const handleDrawingToolSelect = (toolId) => {
  if (toolId === activeDrawingTool) {
    // Deselect if already active
    setActiveDrawingTool(null);
  } else {
    setActiveDrawingTool(toolId);
    toast.info(`${drawingTools.find(t => t.id === toolId)?.name} tool selected`);
  }
};

// Technical indicator controls
const handleAddIndicator = () => {
  if (!newIndicator.type) return;
  
  // Find the indicator definition
  const indicatorDef = TECHNICAL_INDICATORS.find(i => i.id === newIndicator.type);
  if (!indicatorDef) return;
  
  // Generate a unique ID
  const id = `${newIndicator.type}-${Date.now()}`;
  
  // Get default parameters
  let params = {};
  if (indicatorDef.params) {
    params = { ...indicatorDef.params };
  } else if (indicatorDef.defaultPeriod) {
    params = { period: indicatorDef.defaultPeriod };
  }
  
  // Override with user values if provided
  if (newIndicator.period) {
    params.period = parseInt(newIndicator.period, 10);
  }
  
  if (newIndicator.params) {
    params = { ...params, ...newIndicator.params };
  }
  
  // Create the indicator configuration
  const indicatorConfig = {
    id,
    type: newIndicator.type,
    name: indicatorDef.name,
    params,
    color: newIndicator.color || getRandomColor(),
    visible: true
  };
  
  // Add to active indicators
  setActiveIndicators(prev => [...prev, indicatorConfig]);
  
  // Reset form
  setNewIndicator({ type: 'sma', period: 20, params: {} });
  setShowIndicatorForm(false);
  
  // Update chart if initialized
  if (chartInstance && mainSeries) {
    const formattedData = seriesData.formattedData[chartType] || seriesData.formattedData.value;
    addIndicatorToChart(chartInstance, indicatorConfig, formattedData);
  }
  
  toast.success(`Added ${indicatorDef.name}`);
};

const handleRemoveIndicator = (indicatorId) => {
  // Find the indicator
  const indicator = activeIndicators.find(i => i.id === indicatorId);
  
  if (indicator && chartInstance) {
    // Remove from chart
    if (indicator.series) {
      chartInstance.removeSeries(indicator.series);
    }
    
    if (indicator.secondarySeries) {
      chartInstance.removeSeries(indicator.secondarySeries);
    }
    
    if (indicator.tertiarySeries) {
      chartInstance.removeSeries(indicator.tertiarySeries);
    }
  }
  
  // Update state
  setActiveIndicators(prev => prev.filter(i => i.id !== indicatorId));
  
  toast.info('Indicator removed');
};

// Export chart as image
const exportChartAsImage = () => {
  if (!chartInstance) return;
  
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set dimensions
    const width = chartContainerRef.current.clientWidth;
    const height = chartContainerRef.current.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Draw the chart
    const chartCanvas = chartContainerRef.current.querySelector('canvas');
    ctx.drawImage(chartCanvas, 0, 0, width, height);
    
    // Add metadata
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(10, height - 60, 300, 50);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`${seriesData.title}`, 20, height - 40);
    ctx.fillText(`Source: ${seriesData.source || dataSource.toUpperCase()}`, 20, height - 25);
    ctx.fillText(`Generated on: ${format(new Date(), 'yyyy-MM-dd')}`, 20, height - 10);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${seriesData.title || 'chart'}_${format(new Date(), 'yyyyMMdd')}.png`;
    a.click();
    
    toast.success('Chart exported as PNG');
  } catch (error) {
    console.error('Error exporting chart:', error);
    toast.error('Failed to export chart');
  }
};

// Export data as CSV
const exportDataAsCSV = () => {
  if (!seriesData || !seriesData.observations) return;
  
  try {
    // Get the appropriate data based on the chart type
    let data;
    switch(chartType) {
      case 'percentChange':
        data = seriesData.percentChange || [];
        break;
      case 'yearChange':
        data = seriesData.yearChange || [];
        break;
      case 'yearPercentChange':
        data = seriesData.yearPercentChange || [];
        break;
      case 'qoqChange':
        data = seriesData.qoqChange || [];
        break;
      case 'qoqPercentChange':
        data = seriesData.qoqPercentChange || [];
        break;
      case 'momChange':
        data = seriesData.momChange || [];
        break;
      case 'momPercentChange':
        data = seriesData.momPercentChange || [];
        break;
      case 'indexedToValue':
        data = seriesData.indexedValues || [];
        break;
      case 'compoundGrowth':
        data = seriesData.compoundGrowth || [];
        break;
      default:
        data = seriesData.observations;
    }
    
    // Filter by date range if set
    if (startDate || endDate) {
      data = data.filter(item => {
        const itemDate = new Date(item.date);
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        return true;
      });
    }
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Value\n';
    
    data.forEach(item => {
      const date = typeof item.date === 'string' ? item.date : item.date.toISOString().split('T')[0];
      const value = item.value !== null ? item.value : '';
      csvContent += `${date},${value}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${seriesData.title || 'data'}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported as CSV');
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error('Failed to export data');
  }
};

// Generate a random color
const getRandomColor = () => {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
};

// Render AI Alert
const renderAiAlert = () => {
  if (!aiPrediction || !showAiPrediction) return null;
  
  const { signal, confidence, message, forecast } = aiPrediction;
  
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let icon = '🔍';
  
  if (signal === 'BUY') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    icon = '📈';
  } else if (signal === 'SELL') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    icon = '📉';
  } else if (signal === 'WARNING') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    icon = '⚠️';
  } else if (signal === 'NEUTRAL') {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
    icon = '🔄';
  }
  
  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg mb-4 flex items-center`}>
      <span className="text-2xl mr-2">{icon}</span>
      <div className="flex-grow">
        <h3 className="font-bold text-lg">{signal} Signal</h3>
        <p>Confidence: {confidence}%</p>
        <p>{message}</p>
        
        {forecast && forecast.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Forecast:</div>
            <div className="text-sm">
              {forecast[0].date} to {forecast[forecast.length - 1].date}
            </div>
          </div>
        )}
      </div>
      
      <div className="ml-4 flex gap-2">
        <button 
          className="p-2 rounded hover:bg-gray-200" 
          onClick={() => setShowAiPrediction(false)}
          title="Hide prediction"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-200" 
          onClick={() => sendAlertEmail(userPreferences?.email, `AI Signal: ${signal}`, message)}
          title="Send to email"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Render comparison legend
const renderComparisonLegend = () => {
  if (!compareMode || comparisonSeries.length === 0) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Comparison</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="normalizeComparison"
              checked={normalizeComparison}
              onChange={() => setNormalizeComparison(!normalizeComparison)}
              className="mr-2"
            />
            <label htmlFor="normalizeComparison" className="text-sm">Normalize</label>
          </div>
          <button 
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => setCompareMode(false)}
            title="Close comparison mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center px-3 py-1 bg-white rounded border border-gray-200">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: lineColor }}></div>
          <span className="font-medium">{seriesData.title}</span>
          <span className="text-xs text-gray-500 ml-1">({seriesData.source || dataSource})</span>
        </div>
        
        {comparisonSeries.map(series => (
          <div key={series.seriesId} className="flex items-center px-3 py-1 bg-white rounded border border-gray-200">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: series.color }}></div>
            <span className="font-medium mr-2">{series.title}</span>
            <span className="text-xs text-gray-500 mr-2">({series.source})</span>
            <button 
              className="text-gray-400 hover:text-red-500"
              onClick={() => handleRemoveComparison(series.seriesId)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700"
          onClick={() => setShowCompareForm(true)}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Comparison
        </button>
      </div>
    </div>
  );
};

// Render technical indicators panel
const renderIndicatorsPanel = () => {
  if (!showIndicatorPanel) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Technical Indicators</h3>
        <div>
          <button 
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => setShowIndicatorPanel(false)}
            title="Hide panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
        {activeIndicators.map(indicator => (
          <div key={indicator.id} className="flex items-center px-3 py-1 bg-white rounded border border-gray-200">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: indicator.color }}></div>
            <span className="font-medium mr-2">{indicator.name}</span>
            <button 
              className="text-gray-400 hover:text-red-500 ml-auto"
              onClick={() => handleRemoveIndicator(indicator.id)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <button 
        className="w-full px-3 py-1 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700"
        onClick={() => setShowIndicatorForm(true)}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Indicator
      </button>
    </div>
  );
};

// Render alerts panel
const renderAlertsPanel = () => {
  if (alerts.length === 0 && !showAlertForm) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Price Alerts</h3>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700"
          onClick={() => setShowAlertForm(!showAlertForm)}
        >
          {showAlertForm ? 'Cancel' : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Alert
            </>
          )}
        </button>
      </div>
      
      {alerts.length > 0 && (
        <div className="mb-4">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full mr-2 ${
                    alert.condition === 'above' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className="font-medium">
                  Price {alert.condition} {alert.value}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  alert.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {alert.active ? 'Active' : 'Inactive'}
                </span>
                <button 
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => {
                    const updatedAlerts = alerts.filter(a => a.id !== alert.id);
                    setAlerts(updatedAlerts);
                    
                    // Remove from database
                    if (userPreferences?.userId) {
                      supabase
                        .from('user_alerts')
                        .delete()
                        .eq('id', alert.id)
                        .then(() => toast.success('Alert removed'))
                        .catch(error => {
                          console.error('Error removing alert:', error);
                          toast.error('Failed to remove alert');
                        });
                    }
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showAlertForm && (
        <div className="bg-white p-4 rounded border border-gray-200">
          <h4 className="font-medium mb-2">New Alert</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded"
                value={newAlert.condition}
                onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
              >
                <option value="above">Price Above</option>
                <option value="below">Price Below</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                value={newAlert.value}
                onChange={(e) => setNewAlert({...newAlert, value: e.target.value})}
                placeholder="Enter price level"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={newAlert.email}
              onChange={(e) => setNewAlert({...newAlert, email: e.target.value})}
              placeholder="Your email for notifications"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={newAlert.message}
              onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
              placeholder="Custom alert message"
              rows={2}
            />
          </div>
          
          <button
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAddAlert}
          >
            Create Alert
          </button>
        </div>
      )}
    </div>
  );
};

// Get filtered data for table
const getFilteredData = () => {
  if (!seriesData) return [];
  
  // Get data based on chart type
  let data;
  switch(chartType) {
    case 'percentChange':
      data = seriesData.percentChange || [];
      break;
    case 'yearChange':
      data = seriesData.yearChange || [];
      break;
    case 'yearPercentChange':
      data = seriesData.yearPercentChange || [];
      break;
    case 'qoqChange':
      data = seriesData.qoqChange || [];
      break;
    case 'qoqPercentChange':
      data = seriesData.qoqPercentChange || [];
      break;
    case 'momChange':
      data = seriesData.momChange || [];
      break;
    case 'momPercentChange':
      data = seriesData.momPercentChange || [];
      break;
    case 'indexedToValue':
      data = seriesData.indexedValues || [];
      break;
    case 'compoundGrowth':
      data = seriesData.compoundGrowth || [];
      break;
    default:
      data = seriesData.observations;
  }
  
  // Filter by date range
  if (startDate || endDate) {
    return data.filter(item => {
      const itemDate = new Date(item.date);
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate) {
        return itemDate >= startDate;
      } else if (endDate) {
        return itemDate <= endDate;
      }
      return true;
    });
  }
  
  return data;
};

// Format the value based on the chart type
const formatValue = (value, type) => {
  if (value === null || value === undefined) return '-';
  
  const formatOptions = {
    minimumFractionDigits: Math.min(numberOfDecimals, 6),
    maximumFractionDigits: Math.min(numberOfDecimals, 6)
  };
  
  // Apply unit multiplier
  value = value * unitMultiplier;
  
  // Format based on type
  switch(type) {
    case 'percentChange':
    case 'yearPercentChange':
    case 'qoqPercentChange':
    case 'momPercentChange':
    case 'compoundGrowth':
      return `${value.toLocaleString(undefined, formatOptions)}%`;
    case 'indexedToValue':
      return `${value.toLocaleString(undefined, formatOptions)}`;
    default:
      // Apply currency if set
      if (currencyDisplay && currencyDisplay !== 'none') {
        return value.toLocaleString(undefined, {
          style: 'currency',
          currency: currencyDisplay,
          ...formatOptions
        });
      }
      return value.toLocaleString(undefined, formatOptions);
  }
};

// Render statistics panel
const renderStatisticsPanel = () => {
  if (!showStatistics || !statistics) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Statistics</h3>
        <button 
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => setShowStatistics(false)}
          title="Hide statistics"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Min</div>
          <div className="font-medium">{formatValue(statistics.min, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Max</div>
          <div className="font-medium">{formatValue(statistics.max, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Average</div>
          <div className="font-medium">{formatValue(statistics.avg, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Median</div>
          <div className="font-medium">{formatValue(statistics.median, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Std Dev</div>
          <div className="font-medium">{formatValue(statistics.stdDev, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Count</div>
          <div className="font-medium">{statistics.count}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">First Value</div>
          <div className="font-medium">{formatValue(statistics.first, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Last Value</div>
          <div className="font-medium">{formatValue(statistics.last, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Total Change</div>
          <div className="font-medium">{formatValue(statistics.changeFromFirst, chartType)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-sm text-gray-500">Total % Change</div>
          <div className="font-medium">{statistics.percentChangeFromFirst ? `${statistics.percentChangeFromFirst.toFixed(2)}%` : '-'}</div>
        </div>
      </div>
    </div>
  );
};


// Render AI Alert
const renderAiAlert = () => {
  if (!aiPrediction || !showAiPrediction) return null;
  
  const { signal, confidence, message, forecast } = aiPrediction;
  
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let icon = '🔍';
  
  if (signal === 'BUY') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    icon = '📈';
  } else if (signal === 'SELL') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    icon = '📉';
  } else if (signal === 'WARNING') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    icon = '⚠️';
  } else if (signal === 'NEUTRAL') {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
    icon = '🔄';
  }
  
  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg mb-4 flex items-center`}>
      <span className="text-2xl mr-2">{icon}</span>
      <div className="flex-grow">
        <h3 className="font-bold text-lg">{signal} Signal</h3>
        <p>Confidence: {confidence}%</p>
        <p>{message}</p>
        
        {forecast && forecast.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Forecast:</div>
            <div className="text-sm">
              {forecast[0].date} to {forecast[forecast.length - 1].date}
            </div>
          </div>
        )}
      </div>
      
      <div className="ml-4 flex gap-2">
        <button 
          className="p-2 rounded hover:bg-gray-200" 
          onClick={() => setShowAiPrediction(false)}
          title="Hide prediction"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-200" 
          onClick={() => sendAlertEmail(userPreferences?.email, `AI Signal: ${signal}`, message)}
          title="Send to email"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Render comparison legend
const renderComparisonLegend = () => {
  if (!compareMode || comparisonSeries.length === 0) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">Comparison</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="normalizeComparison"
              checked={normalizeComparison}
              onChange={() => setNormalizeComparison(!normalizeComparison)}
              className="mr-2"
            />
            <label htmlFor="normalizeComparison" className="text-sm">Normalize</label>
          </div>
          <button 
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => setCompareMode(false)}
            title="Close comparison mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center px-3 py-1 bg-white rounded border border-gray-200">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: lineColor }}></div>
          <span className="font-medium">{seriesData.title}</span>
          <span className="text-xs text-gray-500 ml-1">({seriesData.source || dataSource})</span>
        </div>
        
        {comparisonSeries.map(series => (
          <div key={series.seriesId} className="flex items-center px-3 py-1 bg-white rounded border border-gray-200">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: series.color }}></div>
            <span className="font-medium mr-2">{series.title}</span>
            <span className="text-xs text-gray-500 mr-2">({series.source})</span>
            <button 
              className="text-gray-400 hover:text-red-500"
              onClick={() => handleRemoveComparison(series.seriesId)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700"
          onClick={() => setShowCompareForm(true)}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="