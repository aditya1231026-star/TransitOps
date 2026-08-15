import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

const PassengersPage = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/passengers');
      setPassengers(data.data);
    } catch (err) {
      setError('Failed to fetch passengers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPassenger(null);
    setName('');
    setEmail('');
    setPhone('');
    setGender('Male');
    setAge('');
    setAddress('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (passenger) => {
    setEditingPassenger(passenger);
    setName(passenger.name);
    setEmail(passenger.email);
    setPhone(passenger.phone);
    setGender(passenger.gender);
    setAge(passenger.age.toString());
    setAddress(passenger.address);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      email,
      phone,
      gender,
      age: parseInt(age, 10),
      address,
    };

    try {
      if (editingPassenger) {
        // Update Passenger
        await api.put(`/passengers/${editingPassenger._id}`, payload);
        setSuccess('Passenger updated successfully');
      } else {
        // Create Passenger
        await api.post('/passengers', payload);
        setSuccess('Passenger created successfully');
      }
      setIsModalOpen(false);
      fetchPassengers();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this passenger?')) return;

    setError('');
    setSuccess('');
    try {
      await api.delete(`/passengers/${id}`);
      setSuccess('Passenger deleted successfully');
      fetchPassengers();
    } catch (err) {
      setError(err.message || 'Deletion failed');
    }
  };

  if (loading && passengers.length === 0) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading passengers…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Passenger <span className="gradient-text">Directory</span></h1>
          <p className="page-subtitle">Manage passenger accounts, contact records and demographics.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" id="add-passenger-btn">
          <Plus size={16} />
          <span>Add Passenger</span>
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
                <th>Passenger Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {passengers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={24} />
                      <span>No passengers registered. Click "Add Passenger" to register one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                passengers.map((passenger) => (
                  <tr key={passenger._id}>
                    <td style={{ fontWeight: '600', color: '#fff' }}>{passenger.name}</td>
                    <td>{passenger.email}</td>
                    <td>{passenger.phone}</td>
                    <td>
                      <span className="badge badge-info">{passenger.gender}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{passenger.age} yrs</td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{passenger.address}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(passenger)}
                          className="btn btn-secondary"
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Edit Passenger"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(passenger._id)}
                          className="btn btn-danger"
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Delete Passenger"
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
                {editingPassenger ? 'Modify Passenger Profile' : 'Register New Passenger'}
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
                  placeholder="e.g. Alice Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alice@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Address *</label>
                <textarea
                  required
                  placeholder="e.g. 123 Main St, New York, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPassenger ? 'Save Changes' : 'Create Passenger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengersPage;
