import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchPriorityNotifications, NotificationItem } from '../api/notifications';
import { NotificationCard } from '../components/NotificationCard';
import { log } from '../utils/logger';

interface Props {
  readIds: string[];
  markAsRead: (id: string) => void;
  setUnreadCount: (count: number) => void;
}

export const PriorityInbox: React.FC<Props> = ({ readIds, markAsRead, setUnreadCount }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [nLimit, setNLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('All');

  const loadPriority = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPriorityNotifications(nLimit);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load priority notifications");
    } finally {
      setLoading(false);
    }
  }, [nLimit]);

  useEffect(() => {
    log("info", "page", `PriorityInbox page mounted (fetching top ${nLimit})`);
    loadPriority();
  }, [loadPriority, nLimit]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNLimit(Number(event.target.value));
    log("info", "page", `User changed priority limit to ${event.target.value}`);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(event.target.value);
    log("info", "page", `User changed priority type filter to ${event.target.value}`);
  };

  const filteredNotifications = useMemo(() => {
    if (typeFilter === 'All') return notifications;
    return notifications.filter(n => {
      const t = n.Type || '';
      return t.toLowerCase() === typeFilter.toLowerCase();
    });
  }, [notifications, typeFilter]);

  useEffect(() => {
    const unread = filteredNotifications.filter((n, idx) => {
      const id = n.ID || String(idx);
      return !readIds.includes(id);
    }).length;
    setUnreadCount(unread);
  }, [filteredNotifications, readIds, setUnreadCount]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Priority Inbox</h1>
          <p className="page-subtitle">
            Top {nLimit} notifications ranked by importance
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
          <div className="custom-select-wrapper">
            <label className="select-label">Show top</label>
            <select 
              className="custom-select" 
              value={nLimit} 
              onChange={handleLimitChange}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
        ))
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <div className="empty-state-title">No priority notifications</div>
          <div className="empty-state-text">All caught up! No high priority items right now.</div>
        </div>
      ) : (
        filteredNotifications.map((notif, idx) => {
          const id = notif.ID || String(idx);
          const isRead = readIds.includes(id);
          return (
            <NotificationCard 
              key={id}
              notification={notif} 
              isRead={isRead} 
              rank={idx + 1}
              onClick={() => {
                if (!isRead) {
                  markAsRead(id);
                  log("info", "component", `User marked priority notification ${id} as read`);
                }
              }}
            />
          );
        })
      )}

      {error && (
        <div className="error-toast">
          ⚠️ {error}
          <button className="error-toast-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  );
};
