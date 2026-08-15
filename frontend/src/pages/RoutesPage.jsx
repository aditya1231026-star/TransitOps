import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Route as RouteIcon, Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  
  // Form Fields State
  const [routeNumber, setRouteNumber] = useState('');
  const [routeName, setRouteName] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [stopsText, setStopsText] = useState(''); // Comma separated
  const [distance, setDistance] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await api.get('/routes');
      setRoutes(data.data);
    } catch (err) {
      setError('Failed to fetch routes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoute(null);
    setRouteNumber('');
    setRouteName('');
    setSource('');
    setDestination('');
    setStopsText('');
    setDistance('10');
    setEstimatedTime('30 mins');
    setStatus('Active');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    setRouteNumber(route.routeNumber);
    setRouteName(route.routeName);
    setSource(route.source);
    setDestination(route.destination);
    setStopsText(route.stops ? route.stops.join(', ') : '');
    setDistance(route.distance.toString());
    setEstimatedTime(route.estimatedTime);
    setStatus(route.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Process stops text to array
    const stops = stopsText
      .split(',')
      .map(stop => stop.trim())
      .filter(stop => stop.length > 0);

    const payload = {
      routeNumber,
      routeName,
      source,
      destination,
      stops,
      distance: parseFloat(distance),
      estimatedTime,
      status,
    };

    try {
      if (editingRoute) {
        // Update Route
        await api.put(`/routes/${editingRoute._id}`, payload);
        setSuccess('Route updated successfully');
      } else {
        // Create Route
        await api.post('/routes', payload);
        setSuccess('Route created successfully');
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route? This will unassign it from any active buses.')) return;
    
    setError('');
    setSuccess('');
    try {
      await api.delete(`/routes/${id}`);
      setSuccess('Route deleted successfully');
      fetchRoutes();
    } catch (err) {
      setError(err.message || 'Deletion failed');
    }
  };

  if (loading && routes.length === 0) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading routes…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Route <span className="gradient-text">Management</span></h1>
          <p className="page-subtitle">Configure operational pathways, stops, distances and route status.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" id="add-route-btn">
          <Plus size={16} />
          <span>Add Route</span>
        </button>
      </div>

      {/* Alerts */}
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Table */}
      <div className="glass-panel" style={{ padding: '8px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Route Number</th>
                <th>Route Name</th>
                <th>Source ➔ Destination</th>
                <th>Stops Count</th>
                <th>Stops Detail</th>
                <th>Distance</th>
                <th>Est. Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={24} />
                      <span>No routes configured. Click "Add Route" to define one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                routes.map((route) => (
                  <tr key={route._id}>
                    <td style={{ fontWeight: '700', color: '#fff' }}>{route.routeNumber}</td>
                    <td>{route.routeName}</td>
                    <td style={{ fontWeight: '500' }}>
                      {route.source} ➔ {route.destination}
                    </td>
                    <td>
                      <span className="badge badge-info">{route.stops?.length || 0} stops</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {route.stops && route.stops.length > 0 ? route.stops.join(', ') : 'Direct Non-Stop'}
                    </td>
                    <td>{route.distance} km</td>
                    <td>{route.estimatedTime}</td>
                    <td>
                      <span className={`badge ${route.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {route.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => openEditModal(route)} 
                          className="btn btn-secondary" 
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Edit Route"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(route._id)} 
                          className="btn btn-danger" 
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Delete Route"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                {editingRoute ? 'Modify Route Details' : 'Configure New Route'}
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
                  <label className="form-label">Route Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R-101"
                    value={routeNumber}
                    onChange={(e) => setRouteNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Route Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Downtown Shuttle"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Source Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Station A"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Station B"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Intermediate Stops (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Center Mall, Hospital Road, City Park"
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Distance (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Travel Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45 mins / 1h 15m"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className="form-input"
                  style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoute ? 'Save Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
