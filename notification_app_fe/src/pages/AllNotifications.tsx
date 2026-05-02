import React, { useEffect, useState, useCallback } from 'react';
import { fetchAllNotifications, NotificationItem } from '../api/notifications';
import { NotificationCard } from '../components/NotificationCard';
import { log } from '../utils/logger';

interface Props {
  readIds: string[];
  markAsRead: (id: string) => void;
  setUnreadCount: (count: number) => void;
}

export const AllNotifications: React.FC<Props> = ({ readIds, markAsRead, setUnreadCount }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');
  const limit = 10;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = typeFilter === 'All' ? undefined : typeFilter;
      const data = await fetchAllNotifications({ page, limit, notification_type: typeParam });
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    log("info", "page", "AllNotifications page mounted or filters changed");
    loadNotifications();
  }, [loadNotifications]);

  // Compute unread count for current view
  useEffect(() => {
    const unread = notifications.filter((n, idx) => {
      const id = n.ID || String(idx);
      return !readIds.includes(id);
    }).length;
    setUnreadCount(unread);
  }, [notifications, readIds, setUnreadCount]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(event.target.value);
    setPage(1);
    log("info", "page", `User changed type filter to ${event.target.value}`);
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = new Date(a.Timestamp || 0).getTime();
    const timeB = new Date(b.Timestamp || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">All Notifications</h1>
          <p className="page-subtitle">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · Page {page}
          </p>
        </div>
        <div className="page-filters">
          <div className="custom-select-wrapper">
            <label className="select-label">Filter by type</label>
            <select 
              className="custom-select" 
              value={typeFilter} 
              onChange={handleTypeChange}
            >
              <option value="All">All Types</option>
              <option value="Placement">Placement</option>
              <option value="Result">Result</option>
              <option value="Event">Event</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
        ))
      ) : sortedNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No notifications found</div>
          <div className="empty-state-text">Try changing your filter or check back later.</div>
        </div>
      ) : (
        sortedNotifications.map((notif, idx) => {
          const id = notif.ID || String(idx);
          const isRead = readIds.includes(id);
          return (
            <NotificationCard 
              key={id}
              notification={notif} 
              isRead={isRead} 
              onClick={() => {
                if (!isRead) {
                  markAsRead(id);
                  log("info", "component", `User marked notification ${id} as read`);
                }
              }}
            />
          );
        })
      )}

      <div className="pagination">
        <button 
          className="pagination-btn"
          disabled={page === 1 || loading}
          onClick={() => {
            setPage(p => p - 1);
            log("info", "page", `User navigated to previous page`);
          }}
        >
          ← Previous
        </button>
        <span className="pagination-info">Page {page}</span>
        <button 
          className="pagination-btn"
          disabled={notifications.length < limit || loading}
          onClick={() => {
            setPage(p => p + 1);
            log("info", "page", `User navigated to next page`);
          }}
        >
          Next →
        </button>
      </div>

      {error && (
        <div className="error-toast">
          ⚠️ {error}
          <button className="error-toast-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  );
};
