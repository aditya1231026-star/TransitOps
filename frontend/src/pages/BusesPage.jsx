import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bus, Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  
  // Form Fields State
  const [busNumber, setBusNumber] = useState('');
  const [busName, setBusName] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [status, setStatus] = useState('Active');
  const [lat, setLat] = useState('0');
  const [lng, setLng] = useState('0');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [busesData, routesData] = await Promise.all([
        api.get('/buses'),
        api.get('/routes'),
      ]);
      setBuses(busesData.data);
      setRoutes(routesData.data);
    } catch (err) {
      setError('Failed to fetch buses or routes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBus(null);
    setBusNumber('');
    setBusName('');
    setCapacity('35');
    setDriverName('');
    setDriverPhone('');
    setSelectedRoute('');
    setStatus('Active');
    setLat('18.5204');
    setLng('73.8567');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setBusNumber(bus.busNumber);
    setBusName(bus.busName);
    setCapacity(bus.capacity.toString());
    setDriverName(bus.driverName);
    setDriverPhone(bus.driverPhone);
    setSelectedRoute(bus.route || '');
    setStatus(bus.status);
    setLat(bus.currentLocation?.latitude?.toString() || '0');
    setLng(bus.currentLocation?.longitude?.toString() || '0');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      busNumber,
      busName,
      capacity: parseInt(capacity, 10),
      driverName,
      driverPhone,
      route: selectedRoute || null,
      status,
      currentLocation: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
    };

    try {
      if (editingBus) {
        // Update Bus
        await api.put(`/buses/${editingBus._id}`, payload);
        setSuccess('Bus updated successfully');
      } else {
        // Create Bus
        await api.post('/buses', payload);
        setSuccess('Bus created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    
    setError('');
    setSuccess('');
    try {
      await api.delete(`/buses/${id}`);
      setSuccess('Bus deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message || 'Deletion failed');
    }
  };

  if (loading && buses.length === 0) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading buses…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Bus <span className="gradient-text">Fleet</span></h1>
          <p className="page-subtitle">Manage transit buses, routing assignments and status.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" id="add-bus-btn">
          <Plus size={16} />
          <span>Add Bus</span>
        </button>
      </div>

      {/* Alert Banners */}
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Grid List Table */}
      <div className="glass-panel" style={{ padding: '8px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Bus Name</th>
                <th>Capacity</th>
                <th>Driver Details</th>
                <th>Assigned Route</th>
                <th>Status</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={24} />
                      <span>No buses registered. Click "Add Bus" to register one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                buses.map((bus) => {
                  const assignedRoute = routes.find(r => r._id === bus.route);
                  return (
                    <tr key={bus._id}>
                      <td style={{ fontWeight: '700', color: '#fff' }}>{bus.busNumber}</td>
                      <td>{bus.busName}</td>
                      <td>{bus.capacity} seats</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500' }}>{bus.driverName}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{bus.driverPhone}</span>
                        </div>
                      </td>
                      <td>
                        {assignedRoute ? (
                          <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
                            {assignedRoute.routeNumber} ({assignedRoute.routeName})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          bus.status === 'Active' ? 'badge-success' : 
                          bus.status === 'Maintenance' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {bus.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {bus.currentLocation?.latitude?.toFixed(4)}, {bus.currentLocation?.longitude?.toFixed(4)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => openEditModal(bus)} 
                            className="btn btn-secondary" 
                            style={{ padding: '8px', borderRadius: '6px' }}
                            title="Edit Bus"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(bus._id)} 
                            className="btn btn-danger" 
                            style={{ padding: '8px', borderRadius: '6px' }}
                            title="Delete Bus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {editingBus ? 'Modify Bus Details' : 'Register New Bus'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Bus Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12-AB-1234"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bus Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Express"
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fleet Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="form-input"
                    style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9988776655"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Route</label>
                <select 
                  value={selectedRoute} 
                  onChange={(e) => setSelectedRoute(e.target.value)} 
                  className="form-input"
                  style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                >
                  <option value="">-- Select Route (None) --</option>
                  {routes.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.routeNumber} - {r.routeName} ({r.source} ➔ {r.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Initial Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBus ? 'Save Changes' : 'Create Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusesPage;
