import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './App.css';

// --- SHARED SIDEBAR COMPONENT ---
const Sidebar = () => (
  <div className="sidebar">
    <div className="sidebar-brand">
      <h2 className="logo">🪐 AstroDash</h2>
    </div>
    <nav className="sidebar-nav">
      <Link to="/" className="nav-item">🏠 Dashboard</Link>
      <Link to="/" className="nav-item">🔍 Search</Link>
      <Link to="/" className="nav-item">ℹ️ About</Link>
    </nav>
  </div>
);

// --- DETAIL VIEW COMPONENT ---
const DetailView = ({ fullData }) => {
  const { dateId } = useParams();
  const day = fullData.find((item) => item.valid_date === dateId);

  if (!day) return <div className="main-content"><p>Loading forecast details...</p></div>;

  return (
    <div className="main-content">
      <div className="glass-card detail-container">
        <Link to="/" className="back-link">← Back to Dashboard</Link>
        <h1>Forecast: {day.valid_date}</h1>
        <div className="detail-grid">
          <div className="detail-item"><strong>Condition:</strong> {day.weather.description}</div>
          <div className="detail-item"><strong>Temperature:</strong> {day.temp}°C</div>
          <div className="detail-item"><strong>Wind Speed:</strong> {day.wind_spd} m/s</div>
          <div className="detail-item"><strong>Humidity:</strong> {day.rh}%</div>
          <div className="detail-item"><strong>Visibility:</strong> {day.vis} km</div>
          <div className="detail-item"><strong>UV Index:</strong> {day.uv.toFixed(1)}</div>
        </div>
        <div className="detail-description">
          <p><strong>Analysis:</strong> The atmosphere for this day shows {day.weather.description.toLowerCase()}. 
          Expect a high of {day.max_temp}°C and a low of {day.min_temp}°C.</p>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD VIEW COMPONENT ---
const DashboardView = ({ weatherData, filteredData, stats, handlers }) => (
  <div className="main-content">
    <div className="stats-row">
      <div className="stat-box glass-card"><h3>New York</h3><p>New York, USA</p></div>
      <div className="stat-box glass-card"><h3>{stats.avgTemp}°C</h3><p>Average Temp</p></div>
      <div className="stat-box glass-card"><h3>{stats.maxRain}mm</h3><p>Max Rain</p></div>
      <div className="stat-box glass-card"><h3>🌙</h3><p>Weather Phase</p></div>
    </div>

    <div className="dashboard-grid">
      <div className="table-section glass-card">
        <div className="table-controls">
          <input 
            type="text" 
            placeholder="Search conditions..." 
            className="glass-input"
            onChange={(e) => handlers.setSearch(e.target.value)} 
          />
          <select className="glass-select" onChange={(e) => handlers.setFilter(e.target.value)}>
            <option value="All">All Temperatures</option>
            <option value="Warm">Warm (&gt;15°C)</option>
            <option value="Cool">Cool (&le;15°C)</option>
          </select>
        </div>
        
        <div className="data-table">
          <div className="table-header">
            <span>Date</span><span>Temp</span><span>Condition</span><span>Details</span>
          </div>
          {filteredData.map((day, idx) => (
            <div key={idx} className="table-row">
              <span>{day.valid_date}</span>
              <span>{day.temp}°C</span>
              <span>{day.weather.description}</span>
              <Link to={`/details/${day.valid_date}`} className="detail-link">🔗</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-wrapper glass-card">
          <h4>Temperature Trend</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="valid_date" hide />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none'}} />
              <Line type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper glass-card">
          <h4>Precipitation</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="valid_date" hide />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="precip" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempFilter, setTempFilter] = useState("All");

  const API_KEY = "528c7c4579444744a29c60cba360b9dc";

  useEffect(() => {
    fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=New York,NY&key=${API_KEY}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setWeatherData(json.data);
          setFilteredData(json.data);
        }
      });
  }, []);

  useEffect(() => {
    let results = weatherData.filter(d => 
      d.weather.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (tempFilter === "Warm") results = results.filter(d => d.temp > 15);
    if (tempFilter === "Cool") results = results.filter(d => d.temp <= 15);
    setFilteredData(results);
  }, [searchQuery, tempFilter, weatherData]);

  const stats = {
    avgTemp: weatherData.length > 0 ? (weatherData.reduce((s, d) => s + d.temp, 0) / weatherData.length).toFixed(1) : 0,
    maxRain: weatherData.length > 0 ? Math.max(...weatherData.map(d => d.precip || 0)).toFixed(1) : 0
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <Routes>
          <Route path="/" element={<DashboardView weatherData={weatherData} filteredData={filteredData} stats={stats} handlers={{setSearch: setSearchQuery, setFilter: setTempFilter}} />} />
          <Route path="/details/:dateId" element={<DetailView fullData={weatherData} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;