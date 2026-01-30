import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Camera, Upload, MapPin, Clock, AlertTriangle, Activity } from 'lucide-react';

export default function Analytics({ detectionHistory = [] }) {
  const [liveDetectionHistory, setLiveDetectionHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [dataType, setDataType] = useState('all'); // 'all', 'live', 'upload'

  // Load live detection data from localStorage
  useEffect(() => {
    const liveData = JSON.parse(localStorage.getItem('liveDetectionHistory') || '[]');
    setLiveDetectionHistory(liveData);
  }, []);

  // Filter data by time range
  const filterByTimeRange = (data, hours) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return data.filter(item => new Date(item.timestamp) > cutoff);
  };

  // Get filtered data based on time range and type
  const getFilteredData = () => {
    const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '24h' ? 24 : 168; // 7 days
    
    let uploadData = filterByTimeRange(detectionHistory, hours);
    let liveData = filterByTimeRange(liveDetectionHistory, hours);
    
    // Add type to distinguish data
    uploadData = uploadData.map(item => ({ ...item, type: 'upload' }));
    liveData = liveData.map(item => ({ ...item, type: 'live_camera' }));
    
    switch (dataType) {
      case 'live':
        return liveData;
      case 'upload':
        return uploadData;
      default:
        return [...uploadData, ...liveData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  };

  const filteredData = getFilteredData();

  // Calculate statistics
  const stats = {
    totalDetections: filteredData.reduce((sum, item) => sum + (item.detections?.count || item.boxes?.length || 0), 0),
    totalScans: filteredData.length,
    liveScans: filteredData.filter(item => item.type === 'live_camera').length,
    uploadScans: filteredData.filter(item => item.type === 'upload').length,
    avgDetectionsPerScan: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + (item.detections?.count || item.boxes?.length || 0), 0) / filteredData.length).toFixed(1) : 0,
    locationsTracked: filteredData.filter(item => item.location).length
  };

  // Prepare hourly data for charts
  const hourlyData = () => {
    const hours = {};
    const now = new Date();
    
    // Initialize hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = hour.getHours();
      hours[key] = { 
        hour: key, 
        live: 0, 
        upload: 0, 
        total: 0,
        detections: 0,
        time: `${key.toString().padStart(2, '0')}:00`
      };
    }
    
    // Fill with actual data
    filteredData.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      if (hours[hour]) {
        const detectionCount = item.detections?.count || item.boxes?.length || 0;
        hours[hour].detections += detectionCount;
        hours[hour].total += 1;
        
        if (item.type === 'live_camera') {
          hours[hour].live += 1;
        } else {
          hours[hour].upload += 1;
        }
      }
    });
    
    return Object.values(hours);
  };

  // Detection type distribution
  const detectionTypeData = [
    { name: 'Live Camera', value: stats.liveScans, color: '#10b981' },
    { name: 'Upload', value: stats.uploadScans, color: '#3b82f6' }
  ];

  // Threat level distribution
  const threatLevelData = () => {
    const levels = { low: 0, medium: 0, high: 0, critical: 0 };
    
    filteredData.forEach(item => {
      const count = item.detections?.count || item.boxes?.length || 0;
      if (count === 0) levels.low++;
      else if (count <= 2) levels.medium++;
      else if (count <= 5) levels.high++;
      else levels.critical++;
    });
    
    return [
      { name: 'Low (0)', value: levels.low, color: '#10b981' },
      { name: 'Medium (1-2)', value: levels.medium, color: '#f59e0b' },
      { name: 'High (3-5)', value: levels.high, color: '#ef4444' },
      { name: 'Critical (6+)', value: levels.critical, color: '#dc2626' }
    ];
  };

  // Recent activity
  const recentActivity = filteredData
    .slice(-10)
    .reverse()
    .map((item, index) => ({
      id: index,
      type: item.type,
      timestamp: item.timestamp,
      detections: item.detections?.count || item.boxes?.length || 0,
      location: item.location,
      confidence: item.detections?.confidences || item.confidence_scores || []
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-500/20 rounded-full border border-blue-400/30">
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Detection Analytics</h1>
        <p className="text-slate-400">Comprehensive analysis of live camera and upload detections</p>
      </div>

      {/* Controls */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Time Range</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
            
            <div>
              <label className="text-slate-400 text-sm block mb-2">Data Type</label>
              <select 
                value={dataType} 
                onChange={(e) => setDataType(e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
              >
                <option value="all">All Data</option>
                <option value="live">Live Camera Only</option>
                <option value="upload">Upload Only</option>
              </select>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-slate-400 text-sm">Total Data Points</p>
            <p className="text-white font-bold text-lg">{filteredData.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-blue-400 font-bold text-2xl">{stats.totalScans}</div>
          <div className="text-slate-400 text-sm">Total Scans</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-emerald-400 font-bold text-2xl">{stats.liveScans}</div>
          <div className="text-slate-400 text-sm">Live Camera</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-purple-400 font-bold text-2xl">{stats.uploadScans}</div>
          <div className="text-slate-400 text-sm">Uploads</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-red-400 font-bold text-2xl">{stats.totalDetections}</div>
          <div className="text-slate-400 text-sm">Total Threats</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-yellow-400 font-bold text-2xl">{stats.avgDetectionsPerScan}</div>
          <div className="text-slate-400 text-sm">Avg/Scan</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-orange-400 font-bold text-2xl">{stats.locationsTracked}</div>
          <div className="text-slate-400 text-sm">GPS Tracked</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Hourly Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Area type="monotone" dataKey="live" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="upload" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Detection Distribution */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            Detection Source
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={detectionTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {detectionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Levels */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Threat Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={threatLevelData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detection Timeline */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Detection Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line type="monotone" dataKey="detections" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Recent Activity
        </h3>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === 'live_camera' ? (
                    <Camera className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Upload className="w-4 h-4 text-blue-400" />
                  )}
                  <div>
                    <span className="text-white font-medium">
                      {activity.type === 'live_camera' ? 'Live Camera' : 'Upload'} Detection
                    </span>
                    <div className="text-slate-400 text-sm">
                      {new Date(activity.timestamp).toLocaleString()}
                      {activity.location && (
                        <span className="ml-2 text-blue-400">
                          📍 GPS: {activity.location.latitude.toFixed(4)}, {activity.location.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activity.detections > 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium">
                        {activity.detections} Target{activity.detections > 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                      <span className="text-emerald-400 font-medium">Clear</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No recent activity in selected time range</p>
          </div>
        )}
      </div>
    </div>
  );
}