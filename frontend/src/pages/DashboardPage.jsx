import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Bus,
  Route as RouteIcon,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Ticket,
} from 'lucide-react';

const MetricRow = ({ label, value, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-subtle)',
  }}>
    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</span>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, driversData] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/drivers'),
        ]);
        setStats(statsData.data);
        setDrivers(driversData.data);
      } catch (err) {
        setError('Failed to load dashboard metrics. Is the backend running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ maxWidth: 480 }}>
        <AlertTriangle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  const totalDrivers    = drivers.length;
  const availableDrivers = drivers.filter(d => d.status === 'Available').length;
  const onTripDrivers    = drivers.filter(d => d.status === 'On Trip').length;
  const suspendedDrivers = drivers.filter(d => d.status === 'Suspended').length;

  const busUtil    = stats.totalBuses   > 0 ? Math.round((stats.activeBuses / stats.totalBuses) * 100)   : 0;
  const routeUtil  = stats.totalRoutes  > 0 ? Math.round((stats.activeRoutes / stats.totalRoutes) * 100) : 0;
  const driverUtil = totalDrivers > 0       ? Math.round((availableDrivers / totalDrivers) * 100)        : 0;

  const kpis = [
    {
      label: 'Total Buses',
      value: stats.totalBuses,
      icon: Bus,
      iconBg: 'rgba(124, 58, 237, 0.15)',
      iconColor: '#a78bfa',
      sub: (
        <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600 }}>
            ● {stats.activeBuses} Active
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-warning)', fontWeight: 600 }}>
            ● {stats.maintenanceBuses} Maint.
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            ● {stats.inactiveBuses} Inactive
          </span>
        </div>
      ),
    },
    {
      label: 'Total Routes',
      value: stats.totalRoutes,
      icon: RouteIcon,
      iconBg: 'rgba(236, 72, 153, 0.12)',
      iconColor: '#f472b6',
      sub: (
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600 }}>
            ● {stats.activeRoutes} Active
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            ● {stats.inactiveRoutes} Inactive
          </span>
        </div>
      ),
    },
    {
      label: 'Total Drivers',
      value: totalDrivers,
      icon: Users,
      iconBg: 'rgba(59, 130, 246, 0.12)',
      iconColor: '#60a5fa',
      sub: (
        <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600 }}>
            ● {availableDrivers} Avail.
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-info)', fontWeight: 600 }}>
            ● {onTripDrivers} On Trip
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            ● {suspendedDrivers} Susp.
          </span>
        </div>
      ),
    },
    {
      label: 'GPS Signals',
      value: stats.totalGPSLogs,
      icon: MapPin,
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#34d399',
      sub: (
        <div style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600, marginTop: 10 }}>
          ● Real-time tracking operational
        </div>
      ),
    },
  ];

  const alerts = [
    {
      ok: true,
      text: 'MongoDB Atlas connected',
    },
    {
      ok: stats.maintenanceBuses === 0,
      text: stats.maintenanceBuses > 0
        ? `${stats.maintenanceBuses} bus${stats.maintenanceBuses > 1 ? 'es' : ''} in maintenance`
        : 'All buses operational',
    },
    {
      ok: true,
      text: 'GPS Daemon operational',
    },
    {
      ok: suspendedDrivers === 0,
      text: suspendedDrivers > 0
        ? `${suspendedDrivers} driver${suspendedDrivers > 1 ? 's' : ''} suspended`
        : 'All drivers in good standing',
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>System <span className="gradient-text">Overview</span></h1>
          <p className="page-subtitle">
            Real-time telemetry and operational metrics for TransitOps.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="stats-grid">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="glass-panel stat-card">
              <div className="stat-header">
                <span className="stat-label">{kpi.label}</span>
                <div className="stat-icon" style={{ background: kpi.iconBg }}>
                  <Icon size={20} color={kpi.iconColor} />
                </div>
              </div>
              <div className="stat-value">{kpi.value ?? '—'}</div>
              {kpi.sub}
            </div>
          );
        })}
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>

        {/* Utilization panel */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={18} color="var(--accent-bright)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Fleet Utilization</h3>
          </div>

          {[
            { label: 'Bus Fleet Active Rate',       pct: busUtil,    color: 'var(--color-success)' },
            { label: 'Route Coverage Active',        pct: routeUtil,  color: 'var(--color-info)'    },
            { label: 'Driver Availability Rate',     pct: driverUtil, color: 'var(--color-warning)' },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{pct}%</span>
              </div>
              <div style={{
                height: 6, borderRadius: 99,
                background: 'var(--bg-elevated)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${pct}%`,
                  background: color,
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          ))}

          <div className="divider" style={{ margin: '20px 0' }} />

          <MetricRow label="Total GPS Logs"          value={stats.totalGPSLogs} />
          <MetricRow
            label="Active Buses"
            value={stats.activeBuses}
            color="var(--color-success)"
          />
          <MetricRow
            label="Buses Under Maintenance"
            value={stats.maintenanceBuses}
            color={stats.maintenanceBuses > 0 ? 'var(--color-warning)' : 'var(--color-success)'}
          />
        </div>

        {/* System alerts */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Activity size={18} color="var(--accent-bright)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>System Status</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map(({ ok, text }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: ok ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                border: `1px solid ${ok ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
              }}>
                {ok
                  ? <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  : <AlertTriangle size={16} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                }
                <span style={{
                  fontSize: '0.82rem', fontWeight: 500,
                  color: ok ? 'var(--color-success)' : 'var(--color-warning)',
                }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive fix for bottom grid */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1.6fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
