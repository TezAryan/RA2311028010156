import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  unreadCount: number;
}

export const Navbar: React.FC<Props> = ({ unreadCount }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">N</div>
        <span className="navbar-title">NotifierApp</span>
      </div>

      <div className="navbar-nav">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          <span className="nav-link-icon">📋</span>
          <span>All Notifications</span>
        </Link>
        <Link 
          to="/priority" 
          className={`nav-link ${location.pathname === '/priority' ? 'active' : ''}`}
        >
          <span className="nav-link-icon">⚡</span>
          <span>Priority Inbox</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="notification-bell">
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
      </div>
    </nav>
  );
};
