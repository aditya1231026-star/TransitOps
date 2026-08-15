import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket as TicketIcon, Plus, Edit, Trash2, X, AlertTriangle, Calendar, DollarSign } from 'lucide-react';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // Form Fields State
  const [ticketNo, setTicketNo] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [fare, setFare] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [status, setStatus] = useState('Booked');
  const [paymentStatus, setPaymentStatus] = useState('Pending');

  // Seat Picker states
  const [bookedSeats, setBookedSeats] = useState([]);
  const [busCapacity, setBusCapacity] = useState(0);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Fetch seat availability when bus or date changes
  useEffect(() => {
    const fetchSeatAvailability = async () => {
      if (!selectedBus || !travelDate) {
        setBookedSeats([]);
        setBusCapacity(0);
        return;
      }
      try {
        setLoadingSeats(true);
        const res = await api.get(`/buses/${selectedBus}/seats?date=${travelDate}`);
        setBookedSeats(res.data.bookedSeats || []);
        setBusCapacity(res.data.capacity || 0);
      } catch (err) {
        console.error('Failed to load seat layout:', err);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeatAvailability();
  }, [selectedBus, travelDate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsData, passengersData, busesData, routesData] = await Promise.all([
        api.get('/tickets'),
        api.get('/passengers'),
        api.get('/buses'),
        api.get('/routes'),
      ]);
      setTickets(ticketsData.data);
      setPassengers(passengersData.data);
      setBuses(busesData.data);
      setRoutes(routesData.data);
    } catch (err) {
      setError('Failed to fetch operational database resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTicket(null);
    setTicketNo('');
    setSelectedPassenger(passengers.length > 0 ? passengers[0]._id : '');
    setSelectedBus(buses.length > 0 ? buses[0]._id : '');
    setSelectedRoute(routes.length > 0 ? routes[0]._id : '');
    setSeatNumber('');
    setFare('15');
    setTravelDate('');
    setStatus('Booked');
    setPaymentStatus('Pending');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (tkt) => {
    setEditingTicket(tkt);
    setTicketNo(tkt.ticketNo);
    setSelectedPassenger(tkt.passenger?._id || '');
    setSelectedBus(tkt.bus?._id || '');
    setSelectedRoute(tkt.route?._id || '');
    setSeatNumber(tkt.seatNumber);
    setFare(tkt.fare.toString());
    const tDate = tkt.travelDate ? new Date(tkt.travelDate).toISOString().split('T')[0] : '';
    setTravelDate(tDate);
    setStatus(tkt.status);
    setPaymentStatus(tkt.paymentStatus);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPassenger || !selectedBus || !selectedRoute || !travelDate) {
      setError('Please fill in all required relationships and date');
      return;
    }

    const payload = {
      ticketNo: ticketNo || undefined, // Let backend generate if empty
      passenger: selectedPassenger,
      bus: selectedBus,
      route: selectedRoute,
      seatNumber,
      fare: parseFloat(fare),
      travelDate,
      status,
      paymentStatus,
    };

    try {
      if (editingTicket) {
        // Update Ticket
        await api.put(`/tickets/${editingTicket._id}`, payload);
        setSuccess('Ticket updated successfully');
      } else {
        // Create Ticket
        await api.post('/tickets', payload);
        setSuccess('Ticket created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    setError('');
    setSuccess('');
    try {
      await api.delete(`/tickets/${id}`);
      setSuccess('Ticket deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.message || 'Deletion failed');
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading tickets…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Ticket <span className="gradient-text">Bookings</span></h1>
          <p className="page-subtitle">Manage reservations, seat assignments, payments and booking statuses.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" id="book-ticket-btn">
          <Plus size={16} />
          <span>Book Ticket</span>
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
                <th>Ticket No</th>
                <th>Passenger</th>
                <th>Bus / Fleet</th>
                <th>Route Stops</th>
                <th>Seat</th>
                <th>Fare</th>
                <th>Travel Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={24} />
                      <span>No ticket bookings found. Click "Book Ticket" to register a booking.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((tkt) => (
                  <tr key={tkt._id}>
                    <td style={{ fontWeight: '700', color: '#fff', fontFamily: 'monospace' }}>{tkt.ticketNo}</td>
                    <td>
                      {tkt.passenger ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{tkt.passenger.name}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tkt.passenger.phone}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Passenger</span>
                      )}
                    </td>
                    <td>
                      {tkt.bus ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500' }}>{tkt.bus.busNumber}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tkt.bus.busName}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Bus</span>
                      )}
                    </td>
                    <td>
                      {tkt.route ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{tkt.route.routeNumber}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {tkt.route.source} ➔ {tkt.route.destination}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Route</span>
                      )}
                    </td>
                    <td style={{ fontWeight: '700' }}>{tkt.seatNumber}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', fontWeight: '600' }}>
                        <DollarSign size={14} color="var(--text-secondary)" />
                        {tkt.fare}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Calendar size={14} color="var(--text-secondary)" />
                        <span>{new Date(tkt.travelDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        tkt.status === 'Completed' ? 'badge-success' : 
                        tkt.status === 'Booked' ? 'badge-info' : 'badge-danger'
                      }`}>
                        {tkt.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        tkt.paymentStatus === 'Paid' ? 'badge-success' : 
                        tkt.paymentStatus === 'Pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {tkt.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(tkt)}
                          className="btn btn-secondary"
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Edit Booking"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tkt._id)}
                          className="btn btn-danger"
                          style={{ padding: '8px', borderRadius: '6px' }}
                          title="Cancel/Delete Booking"
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

      {/* Booking Dialog Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {editingTicket ? 'Modify Reservation details' : 'Dispatch New Seat Reservation'}
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
                <label className="form-label">Ticket Number (Leave blank to generate automatically)</label>
                <input
                  type="text"
                  placeholder="e.g. TKT-12345678"
                  value={ticketNo}
                  onChange={(e) => setTicketNo(e.target.value)}
                  className="form-input"
                  disabled={!!editingTicket}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Associate Passenger *</label>
                <select
                  value={selectedPassenger}
                  onChange={(e) => setSelectedPassenger(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                  required
                >
                  <option value="">-- Choose Passenger --</option>
                  {passengers.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone} | {p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Assigned Bus *</label>
                  <select
                    value={selectedBus}
                    onChange={(e) => setSelectedBus(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                    required
                  >
                    <option value="">-- Select Bus Fleet --</option>
                    {buses.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.busNumber} ({b.busName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Route *</label>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                    required
                  >
                    <option value="">-- Select Route --</option>
                    {routes.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.routeNumber} ({r.source} ➔ {r.destination})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Seat Number *</label>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Click a seat below..."
                    value={seatNumber}
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fare Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 24.50"
                    value={fare}
                    onChange={(e) => setFare(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Visual Seat Picker */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Select Available Seat *</label>
                {!selectedBus || !travelDate ? (
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px dashed var(--border-glass)',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    fontSize: '0.85rem'
                  }}>
                    Please select a Bus and Travel Date to display seat picker.
                  </div>
                ) : loadingSeats ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(139, 92, 246, 0.15)',
                      borderTop: '2px solid #8b5cf6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-glass)',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}>
                    {Array.from({ length: busCapacity || 30 }, (_, index) => {
                      const seatNum = (index + 1).toString();
                      const isBooked = bookedSeats.includes(seatNum);
                      const isSelected = seatNumber === seatNum;
                      const isBookedByOther = isBooked && (!editingTicket || editingTicket.seatNumber !== seatNum);

                      return (
                        <button
                          key={seatNum}
                          type="button"
                          disabled={isBookedByOther}
                          onClick={() => setSeatNumber(seatNum)}
                          style={{
                            padding: '8px 0',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--accent-primary)' : isBookedByOther ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-glass)',
                            background: isSelected ? 'var(--accent-gradient)' : isBookedByOther ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            color: isSelected ? '#fff' : isBookedByOther ? 'var(--color-danger)' : 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: isBookedByOther ? 'not-allowed' : 'pointer',
                            opacity: isBookedByOther ? 0.5 : 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Travel Date *</label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                  >
                    <option value="Booked">Booked</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(7, 9, 19, 0.9)' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTicket ? 'Save Changes' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
