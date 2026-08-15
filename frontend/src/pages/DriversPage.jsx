import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, Edit, Trash2, X, AlertTriangle, ShieldCheck } from 'lucide-react';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  
  // Form Fields State
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('Available');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/drivers');
      setDrivers(data.data);
    } catch (err) {
      setError('Failed to fetch drivers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('Heavy Commercial');
    setLicenseExpiry('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('Available');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setLicenseNumber(driver.licenseNumber);
    setLicenseCategory(driver.licenseCategory);
    // Format date string for HTML date input: YYYY-MM-DD
    const expiryDate = driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '';
    setLicenseExpiry(expiryDate);
    setContactNumber(driver.contactNumber);
    setSafetyScore(driver.safetyScore.toString());
    setStatus(driver.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      contactNumber,
      safetyScore: parseInt(safetyScore, 10),
      status,
    };

    try {
      if (editingDriver) {
        // Update Driver
        await api.put(`/drivers/${editingDriver._id}`, payload);
        setSuccess('Driver updated successfully');
      } else {
        // Create Driver
        await api.post('/drivers', payload);
        setSuccess('Driver created successfully');
      }
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    
    setError('');
    setSuccess('');
    try {
      await api.delete(`/drivers/${id}`);
      setSuccess('Driver deleted successfully');
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Deletion failed');
    }
  };

  if (loading && drivers.length === 0) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading drivers…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Driver <span className="gradient-text">Roster</span></h1>
          <p className="page-subtitle">Manage the driver registry, certifications, safety scores and statuses.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" id="add-driver-btn">
          <Plus size={16} />
          <span>Add Driver</span>
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
                <th>Driver Name</th>
                <th>License Number</th>
                <th>Category</th>
                <th>License Expiry</th>
                <th>Contact</th>
                <th>Safety Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={24} />
                      <span>No drivers registered. Click "Add Driver" to register one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver._id}>
                    <td style={{ fontWeight: '600', color: '#fff' }}>{driver.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{driver.licenseNumber}</td>
                    <td>{driver.licenseCategory}</td>
                    <td>{new Date(driver.licenseExpiry).toLocaleDateString()}</td>
                    <td>{driver.contactNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} color={driver.safetyScore >= 90 ? 'var(--color-success)' : 'var(--color-warning)'} />
                        <span style={{ fontWeight: '700' }}>{driver.safetyScore} / 100</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        driver.status === 'Available' ? 'badge-success' : 
                        driver.status === 'On Trip' ? 'badge-info' : 
                        driver.status === 'Off Duty' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => openEditModal(driver)} 
                          className="btn btn-secondary" 
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Edit Driver"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(driver._id)} 
                          className="btn btn-danger" 
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Delete Driver"
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
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {editingDriver ? 'Modify Driver Profile' : 'Register New Driver'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-987654321"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">License Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class A Commercial"
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">License Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9988776655"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Safety Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="form-input"
                    style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDriver ? 'Save Changes' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversPage;
