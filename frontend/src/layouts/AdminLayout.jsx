import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Route as RouteIcon,
  Users,
  MapPin,
  LogOut,
  Radio,
  Contact,
  Ticket,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',          label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/buses',     label: 'Buses',        icon: Bus },
  { to: '/routes',    label: 'Routes',       icon: RouteIcon },
  { to: '/drivers',   label: 'Drivers',      icon: Users },
  { to: '/passengers',label: 'Passengers',   icon: Contact },
  { to: '/tickets',   label: 'Tickets',      icon: Ticket },
  { to: '/gps',       label: 'GPS Tracking', icon: MapPin },
];

const PAGE_LABELS = {
  '/':           'Dashboard',
  '/buses':      'Fleet Management',
  '/routes':     'Route Management',
  '/drivers':    'Driver Management',
  '/passengers': 'Passenger Management',
  '/tickets':    'Ticket Management',
  '/gps':        'GPS Tracking',
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentLabel = PAGE_LABELS[location.pathname] || 'TransitOps';
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 39,
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Radio size={18} color="white" />
          </div>
          <span>TransitOps</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `sidebar-link${isActive ? ' active' : ''}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{initials}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name || 'Admin'}</div>
                <div className="sidebar-user-role">Administrator</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          {/* Mobile hamburger */}
          <button
            className="btn-ghost"
            style={{ display: 'none', padding: '8px' }}
            id="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-title">TransitOps</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentLabel}
            </span>
          </div>

          {/* Right side */}
          <div className="header-right">
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '5px 12px 5px 7px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <span style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: 'var(--color-success)',
                boxShadow: '0 0 6px var(--color-success)',
                display: 'inline-block',
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>
                Live
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="content-body">
          <Outlet />
        </div>
      </main>

      {/* Mobile hamburger fix — show on small screens via CSS */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
