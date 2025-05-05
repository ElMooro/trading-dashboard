// InteractiveTradingViewChart.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createChart } from 'lightweight-charts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HexColorPicker } from 'react-colorful';
import WatchlistContext from '../contexts/WatchlistContext';

const InteractiveTradingViewChart = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const resizeObserver = useRef(null);
  
  // State for the chart data and settings
  const [seriesData, setSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartInstance, setChartInstance] = useState(null);
  const [mainSeries, setMainSeries] = useState(null);
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('value'); // value, percentChange, yearChange, yearPercentChange
  const [chartStyle, setChartStyle] = useState('line'); // line, area, candle
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [lineColor, setLineColor] = useState('#3b82f6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // AI prediction state
  const [aiPrediction, setAiPrediction] = useState(null);
  
  // Comparison mode state
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonSeries, setComparisonSeries] = useState([]);
  const [showCompareForm, setShowCompareForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Drawing tools and annotations state
  const [activeDrawingTool, setActiveDrawingTool] = useState(null);
  const [drawingTools, setDrawingTools] = useState([
    { id: 'horizontalLine', name: 'Horizontal Line', icon: 'M3 12h18' },
    { id: 'verticalLine', name: 'Vertical Line', icon: 'M12 3v18' },
    { id: 'trendLine', name: 'Trend Line', icon: 'M7 14l9-9 9 9' },
    { id: 'rectangle', name: 'Rectangle', icon: 'M3 3h18v18H3z' },
  ]);
  const [annotations, setAnnotations] = useState([]);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({ text: '', price: '', date: new Date() });
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showDataTable, setShowDataTable] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Watchlist context
  const { watchlist, addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);
  const isInWatchlist = watchlist.some(item => item.seriesId === seriesId);
  
  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main series data
        const response = await axios.get(`http://localhost:5000/api/series/${seriesId}`);
        
        // Set initial date range based on timeframe
        setDateRangeByTimeframe('1M');
        
        // Format data for chart library
        const formattedData = response.data.observations.map(obs => ({
          time: new Date(obs.date).getTime() / 1000,
          value: obs.value
        }));
        
        setSeriesData({
          ...response.data,
          formattedData
        });
        
        // Get AI prediction if available
        try {
          const predictionResponse = await axios.get(`http://localhost:5000/api/prediction/${seriesId}`);
          setAiPrediction(predictionResponse.data);
        } catch (error) {
          console.error("Error fetching prediction:", error);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching series data:", error);
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
  }, [seriesId]);
  
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
  }, [chartType, chartStyle, startDate, endDate, lineColor, zoomLevel, timeframe]);
  
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
      height: 500,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: '#d1d5db',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
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
          precision: 2,
          minMove: 0.01,
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
          precision: 2,
          minMove: 0.01,
        },
      });
    } else {
      series = chart.addLineSeries({
        color: lineColor,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
    }
    
    // Set main series data
    if (seriesData.formattedData && seriesData.formattedData.length > 0) {
      series.setData(seriesData.formattedData);
      
      // Add price line for current value
      series.createPriceLine({
        price: seriesData.formattedData[0].value,
        color: lineColor,
        lineWidth: 1,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: 'Current',
      });
    }
    
    setMainSeries(series);
    
    // Add existing annotations
    annotations.forEach(annotation => {
      series.createPriceLine({
        price: annotation.price,
        color: '#ff0000',
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
              precision: 2,
              minMove: 0.01,
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
    
    // Set visible range based on date filters
    if (startDate && endDate) {
      chart.timeScale().setVisibleRange({
        from: Math.floor(startDate.getTime() / 1000),
        to: Math.floor(endDate.getTime() / 1000),
      });
    }
    
    // Setup drawing tools
    setupDrawingTools(chart, series);
  };
  
  // Update chart data based on current settings
  const updateChartData = () => {
    if (!chartInstance || !mainSeries || !seriesData) return;
    
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
    
    // Format data for chart
    const formattedData = data.map(item => ({
      time: new Date(item.date).getTime() / 1000,
      value: item.value
    }));
    
    // Update main series data
    mainSeries.setData(formattedData);
    
    // Update main series type
    if (chartStyle === 'area' && mainSeries.type !== 'Area') {
      // Need to recreate the series as changing type isn't supported
      chartInstance.removeSeries(mainSeries);
      
      const newSeries = chartInstance.addAreaSeries({
        lineColor: lineColor,
        topColor: `${lineColor}40`,
        bottomColor: `${lineColor}00`,
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
      
      newSeries.setData(formattedData);
      setMainSeries(newSeries);
    } else if (chartStyle === 'line' && mainSeries.type !== 'Line') {
      chartInstance.removeSeries(mainSeries);
      
      const newSeries = chartInstance.addLineSeries({
        color: lineColor,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
      
      newSeries.setData(formattedData);
      setMainSeries(newSeries);
    } else if (chartStyle === 'candle' && mainSeries.type !== 'Candlestick') {
      chartInstance.removeSeries(mainSeries);
      
      const newSeries = chartInstance.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
      
      // Need to convert data to OHLC format
      const ohlcData = formattedData.map(item => ({
        time: item.time,
        open: item.value * 0.99, // Simulated values
        high: item.value * 1.01,
        low: item.value * 0.98,
        close: item.value
      }));
      
      newSeries.setData(ohlcData);
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
    
    // Reapply annotations
    annotations.forEach(annotation => {
      mainSeries.createPriceLine({
        price: annotation.price,
        color: '#ff0000',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: annotation.text,
      });
    });
    
    // Update comparison series
    updateComparisonSeries();
  };
  
  // Setup drawing tools
  const setupDrawingTools = (chart, series) => {
    // This would be a complex implementation of drawing tools
    // For simplicity, we'll just implement horizontal lines for now
    
    chart.subscribeCrosshairMove(param => {
      if (!param.point || !activeDrawingTool) return;
      
      const { price } = param.point;
      
      if (activeDrawingTool === 'horizontalLine') {
        // Create horizontal line on click
        chartContainerRef.current.onclick = () => {
          series.createPriceLine({
            price: price,
            color: '#ff0000',
            lineWidth: 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: `Level: ${price.toFixed(2)}`,
          });
          
          // Add to annotations
          setAnnotations([
            ...annotations,
            {
              text: `Level: ${price.toFixed(2)}`,
              price: price,
              date: new Date()
            }
          ]);
          
          // Disable drawing tool after use
          setActiveDrawingTool(null);
          chartContainerRef.current.onclick = null;
        };
      }
    });
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
      case '5Y':
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 5);
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
  
  // Watchlist controls
  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(seriesId);
    } else if (seriesData) {
      addToWatchlist({
        seriesId,
        title: seriesData.title,
        description: seriesData.description,
        latestValue: seriesData.latestValue,
        change: seriesData.change
      });
    }
  };
  
  // Annotation controls
  const handleAddAnnotation = () => {
    if (newAnnotation.text && newAnnotation.price) {
      const price = parseFloat(newAnnotation.price);
      
      setAnnotations([
        ...annotations,
        {
          text: newAnnotation.text,
          price: price,
          date: newAnnotation.date
        }
      ]);
      
      setNewAnnotation({ text: '', price: '', date: new Date() });
      setShowAnnotationForm(false);
      
      // Update chart with new annotation
      if (mainSeries) {
        mainSeries.createPriceLine({
          price: price,
          color: '#ff0000',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: newAnnotation.text,
        });
      }
    }
  };
  
  // Comparison mode
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/indicators/search?q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching indicators:", error);
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
        color: randomColor,
        data: null,
        instance: null
      };
      
      setComparisonSeries([...comparisonSeries, newSeries]);
      
      // Fetch data for this series
      const response = await axios.get(`http://localhost:5000/api/series/${indicator.seriesId}`);
      
      // Format data
      let data;
      switch(chartType) {
        case 'percentChange':
          data = response.data.percentChange || [];
          break;
        case 'yearChange':
          data = response.data.yearChange || [];
          break;
        case 'yearPercentChange':
          data = response.data.yearPercentChange || [];
          break;
        default:
          data = response.data.observations;
      }
      
      // Filter by date range
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
      
      // Format for chart
      const formattedData = data.map(item => ({
        time: new Date(item.date).getTime() / 1000,
        value: item.value
      }));
      
      // Update with actual data
      setComparisonSeries(prev =>
        prev.map(s =>
          s.seriesId === indicator.seriesId
            ? { ...s, data: formattedData }
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
            precision: 2,
            minMove: 0.01,
          },
        });
        
        compSeries.setData(formattedData);
        
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
    } catch (error) {
      console.error("Error adding comparison:", error);
    }
  };
  
  const updateComparisonSeries = () => {
    if (!chartInstance) return;
    
    // Remove existing comparison series from chart
    comparisonSeries.forEach(series => {
      if (series.instance) {
        chartInstance.removeSeries(series.instance);
      }
    });
    
    // Add updated comparison series
    const updatedComparisons = comparisonSeries.map(series => {
      if (!series.data) return series;
      
      const compSeries = chartInstance.addLineSeries({
        color: series.color,
        lineWidth: 1.5,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
      
      compSeries.setData(series.data);
      
      return { ...series, instance: compSeries };
    });
    
    setComparisonSeries(updatedComparisons);
  };
  
  const handleRemoveComparison = (seriesId) => {
    // Find and remove the series from chart
    const seriesToRemove = comparisonSeries.find(s => s.seriesId === seriesId);
    
    if (seriesToRemove && seriesToRemove.instance && chartInstance) {
      chartInstance.removeSeries(seriesToRemove.instance);
    }
    
    // Update state
    setComparisonSeries(comparisonSeries.filter(s => s.seriesId !== seriesId));
    
    // If no comparison series left, exit compare mode
    if (comparisonSeries.length <= 1) {
      setCompareMode(false);
    }
  };
  
  // Drawing tool selector
  const handleDrawingToolSelect = (toolId) => {
    if (toolId === activeDrawingTool) {
      // Deselect if already active
      setActiveDrawingTool(null);
      
      if (chartContainerRef.current) {
        chartContainerRef.current.onclick = null;
      }
    } else {
      setActiveDrawingTool(toolId);
    }
  };
  
  // Render AI Alert
  const renderAiAlert = () => {
    if (!aiPrediction) return null;
    
    const { signal, confidence } = aiPrediction;
    
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
    }
    
    return (
      <div className={`${bgColor} ${textColor} p-4 rounded-lg mb-4 flex items-center`}>
        <span className="text-2xl mr-2">{icon}</span>
        <div>
          <h3 className="font-bold text-lg">{signal} Signal</h3>
          <p>Confidence: {confidence}%</p>
          <p>{aiPrediction.message}</p>
        </div>
      </div>
    );
  };
  
  // Render comparison legend
  const renderComparisonLegend = () => {
    if (!compareMode || comparisonSeries.length === 0) return null;
    
    return (
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">Comparison</h3>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center px-3 py-1 bg-white rounded border border-gray-200">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: lineColor }}></div>
            <span className="font-medium">{seriesData.title}</span>
          </div>
          
          {comparisonSeries.map(series => (
            <div key={series.seriesId} className="flex items-center px-3 py-1 bg-white rounded border border-gray-200">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: series.color }}></div>
              <span className="font-medium mr-2">{series.title}</span>
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
            className="px-3 py-1 bg-blue-600 text-white rounded flex items-center"
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
  
  // Main render
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }
  
  if (!seriesData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No data available for this indicator</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Watchlist Sidebar */}
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
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: item.change >= 0 ? '#10b981' : '#ef4444' }}>
                    <span className="text-xs font-bold">{item.seriesId.charAt(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.seriesId}</div>
                  </div>
                  <div className={`text-sm font-bold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
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
      
      {/* Main Chart Area */}
      <div className="flex-grow p-4 overflow-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <button
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
              onClick={() => navigate('/')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold mb-1">{seriesData.title}</h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600">{seriesData.description}</span>
              <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs font-semibold text-gray-700">
                {seriesData.category || 'Uncategorized'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {seriesData.latestValue}
              </span>
              <span className={`px-2 py-1 rounded ${
                seriesData.change > 0 
                  ? 'bg-green-100 text-green-800' 
                  : seriesData.change < 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {seriesData.change > 0 ? '+' : ''}{seriesData.change}%
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
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
                >
                  Search
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
                      <div className="text-sm text-gray-600">{indicator.seriesId}</div>
                    </div>
                    <button 
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      onClick={() => handleAddComparison(indicator)}
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : searchQuery ? (
                <p className="text-gray-600">No results found. Try a different search term.</p>
              ) : (
                <p className="text-gray-600">Type to search for indicators to compare</p>
              )}
            </div>
          </div>
        )}
        
        {/* Comparison Legend */}
        {renderComparisonLegend()}
        
        {/* AI Alert */}
        {renderAiAlert()}
        
        {/* Chart Panel */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          {/* Timeframe Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'All'].map(tf => (
              <button
                key={tf}
                className={`px-3 py-1 rounded-full ${
                  timeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => handleTimeframeChange(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
          
          {/* Chart Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded ${chartType === 'value' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleChartTypeChange('value')}
              >
                Value
              </button>
              <button 
                className={`px-3 py-1 rounded ${chartType === 'percentChange' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleChartTypeChange('percentChange')}
              >
                % Change
              </button>
              <button 
                className={`px-3 py-1 rounded ${chartType === 'yearChange' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleChartTypeChange('yearChange')}
              >
                YoY Change
              </button>
              <button 
                className={`px-3 py-1 rounded ${chartType === 'yearPercentChange' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => handleChartTypeChange('yearPercentChange')}
              >
                YoY % Change
              </button>
            </div>
            
            <div className="flex gap-2">
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
                  onClick={() => setActiveDrawingTool(activeDrawingTool ? null : 'horizontalLine')}
                  title="Drawing Tools"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                
                {activeDrawingTool && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg p-2 z-10 w-40">
                    {drawingTools.map(tool => (
                      <button
                        key={tool.id}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center ${activeDrawingTool === tool.id ? 'bg-blue-50 text-blue-600' : ''}`}
                        onClick={() => handleDrawingToolSelect(tool.id)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tool.icon} />
                        </svg>
                        {tool.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                className={`px-3 py-1 rounded ${showAnnotationForm ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setShowAnnotationForm(!showAnnotationForm)}
                title="Add annotation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>
              
              <button
                className={`px-3 py-1 rounded ${showDataTable ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setShowDataTable(!showDataTable)}
                title="Toggle data table"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Chart Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chart Style</label>
                  <div className="flex gap-2">
                    <button 
                      className={`px-3 py-1 rounded ${chartStyle === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleChartStyleChange('line')}
                    >
                      Line
                    </button>
                    <button 
                      className={`px-3 py-1 rounded ${chartStyle === 'area' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleChartStyleChange('area')}
                    >
                      Area
                    </button>
                    <button 
                      className={`px-3 py-1 rounded ${chartStyle === 'candle' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleChartStyleChange('candle')}
                    >
                      Candle
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex gap-2">
                    <DatePicker
                      selected={startDate}
                      onChange={date => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="px-2 py-1 border border-gray-300 rounded w-full"
                      placeholderText="Start Date"
                      maxDate={new Date()}
                    />
                    <DatePicker
                      selected={endDate}
                      onChange={date => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      maxDate={new Date()}
                      className="px-2 py-1 border border-gray-300 rounded w-full"
                      placeholderText="End Date"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Line Color</label>
                  <div className="relative">
                    <button 
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: lineColor }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                    {showColorPicker && (
                      <div className="absolute z-10 mt-2">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                        <div className="relative">
                          <HexColorPicker color={lineColor} onChange={setLineColor} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Annotation Form */}
          {showAnnotationForm && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Add Annotation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    value={newAnnotation.text}
                    onChange={(e) => setNewAnnotation({...newAnnotation, text: e.target.value})}
                    placeholder="Support level"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Level</label>
                  <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    value={newAnnotation.price}
                    onChange={(e) => setNewAnnotation({...newAnnotation, price: e.target.value})}
                    placeholder="3.75"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleAddAnnotation}
                  >
                    Add Annotation
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Actual Chart Container - This is where the interactive chart will render */}
          <div ref={chartContainerRef} className="h-96 bg-white rounded-lg border border-gray-200" />
          
          {/* Active Tool Info */}
          {activeDrawingTool && (
            <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {activeDrawingTool === 'horizontalLine' && 'Click on the chart to add a horizontal line'}
              {activeDrawingTool === 'verticalLine' && 'Click on the chart to add a vertical line'}
              {activeDrawingTool === 'trendLine' && 'Click and drag on the chart to draw a trend line'}
              {activeDrawingTool === 'rectangle' && 'Click and drag on the chart to draw a rectangle'}
            </div>
          )}
        </div>
        
        {/* Data Table */}
        {showDataTable && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Data Details</h2>
              <button className="px-3 py-1 rounded bg-gray-200 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-right">Value</th>
                    <th className="py-2 px-4 border-b text-right">Change</th>
                    <th className="py-2 px-4 border-b text-right">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().slice(0, 20).map((obs, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-left">
                        {typeof obs.date === 'string' ? obs.date : obs.date.toISOString().split('T')[0]}
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {typeof obs.value === 'number' ? obs.value.toFixed(2) : obs.value}
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {index < getFilteredData().length - 1 
                          ? (obs.value - getFilteredData()[index + 1].value).toFixed(2) 
                          : '-'}
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {index < getFilteredData().length - 1 && getFilteredData()[index + 1].value !== 0
                          ? ((obs.value / getFilteredData()[index + 1].value - 1) * 100).toFixed(2) + '%'
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTradingViewChart;