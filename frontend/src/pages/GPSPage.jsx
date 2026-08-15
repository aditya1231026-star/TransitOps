import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapPin, Navigation, Radio, Send, Compass, Gauge, AlertTriangle } from 'lucide-react';

const GPSPage = () => {
  const [gpsLogs, setGpsLogs] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [selectedBus, setSelectedBus] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [speed, setSpeed] = useState('45');
  const [heading, setHeading] = useState('90');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gpsData, busesData] = await Promise.all([
        api.get('/gps'),
        api.get('/buses'),
      ]);
      setGpsLogs(gpsData.data);
      setBuses(busesData.data);

      if (busesData.data.length > 0 && !selectedBus) {
        setSelectedBus(busesData.data[0]._id);
        setLatitude(busesData.data[0].currentLocation?.latitude?.toString() || '18.5204');
        setLongitude(busesData.data[0].currentLocation?.longitude?.toString() || '73.8567');
      }
    } catch (err) {
      setError('Failed to fetch GPS tracking logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBusChange = (busId) => {
    setSelectedBus(busId);
    const bus = buses.find(b => b._id === busId);
    if (bus) {
      setLatitude(bus.currentLocation?.latitude?.toString() || '18.5204');
      setLongitude(bus.currentLocation?.longitude?.toString() || '73.8567');
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!selectedBus || !latitude || !longitude) {
      setError('Please select a bus and enter coordinates');
      setSubmitting(false);
      return;
    }

    const payload = {
      bus: selectedBus,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      speed: parseFloat(speed) || 0,
      heading: parseInt(heading, 10) || 0,
    };

    try {
      await api.post('/gps/update', payload);
      setSuccess('GPS telemetry coordinate dispatched successfully!');
      fetchData(); // Reload logs
    } catch (err) {
      setError(err.message || 'GPS telemetry dispatch failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && gpsLogs.length === 0) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading GPS data…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1>GPS <span className="gradient-text">Telemetry</span></h1>
          <p className="page-subtitle">Real-time tracking logs, coordinate feeds and telematics dispatch.</p>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Telemetry Logs */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#8b5cf6" style={{ animation: 'pulse 1.5s infinite' }} />
            <span>Live Telemetry Feed (Newest First)</span>
            <style>{`
              @keyframes pulse {
                0% { opacity: 0.4; }
                50% { opacity: 1; }
                100% { opacity: 0.4; }
              }
            `}</style>
          </h3>

          <div className="table-container" style={{ maxHeight: '520px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bus</th>
                  <th>Coordinates</th>
                  <th>Speed</th>
                  <th>Heading</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {gpsLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={24} />
                        <span>No GPS signals logged yet.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  gpsLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontWeight: '600', color: '#fff' }}>
                        {log.bus ? `${log.bus.busNumber} (${log.bus.busName})` : 'Deleted Bus'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {log.latitude?.toFixed(5)}, {log.longitude?.toFixed(5)}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Gauge size={14} color="var(--text-secondary)" />
                          {log.speed} km/h
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Compass size={14} color="var(--text-secondary)" />
                          {log.heading}°
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* GPS Simulation Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Navigation size={18} color="#ec4899" />
            <span>Simulate Telemetry Update</span>
          </h3>

          <form onSubmit={handleSubmitUpdate}>
            <div className="form-group">
              <label className="form-label">Select Bus</label>
              <select
                value={selectedBus}
                onChange={(e) => handleBusChange(e.target.value)}
                className="form-input"
                style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                required
              >
                {buses.length === 0 && <option value="">-- No Buses Available --</option>}
                {buses.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.busNumber} ({b.busName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="0.000001"
                required
                placeholder="e.g. 19.0760"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="0.000001"
                required
                placeholder="e.g. 72.8777"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Speed (km/h)</label>
              <input
                type="number"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Heading (degrees)</label>
              <input
                type="number"
                min="0"
                max="360"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              <Send size={16} />
              <span>{submitting ? 'Dispatching...' : 'Dispatch Telemetry'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GPSPage;
