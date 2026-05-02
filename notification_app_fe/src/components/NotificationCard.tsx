import React from 'react';
import { NotificationItem } from '../api/notifications';

interface Props {
  notification: NotificationItem;
  isRead: boolean;
  onClick?: () => void;
  rank?: number;
}

export function timeAgo(dateParam: string | Date): string {
  if (!dateParam) return '';
  const date = new Date(dateParam);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  return Math.floor(interval) + "m ago";
}

const getTypeClass = (type?: string): string => {
  const t = (type || '').toLowerCase();
  if (t === 'placement') return 'placement';
  if (t === 'result') return 'result';
  if (t === 'event') return 'event';
  return 'unknown';
};

export const NotificationCard: React.FC<Props> = ({ notification, isRead, onClick, rank }) => {
  const t = notification.Type || 'unknown';
  const timestampStr = notification.Timestamp || '';
  const typeClass = getTypeClass(t);

  return (
    <div 
      className={`notification-card ${isRead ? 'is-read' : ''}`}
      onClick={onClick}
      style={{ animationDelay: `${(rank || 0) * 0.04}s` }}
    >
      {!isRead && <div className="unread-dot" />}
      
      <div className="card-left">
        {rank !== undefined && (
          <div className="rank-badge">#{rank}</div>
        )}
        <span className={`type-chip ${typeClass}`}>
          {t.toUpperCase()}
        </span>
      </div>

      <div className="card-center">
        <span className="card-message">{notification.Message}</span>
      </div>

      <div className="card-right">
        {notification._score !== undefined && (
          <span className="card-score">{notification._score.toFixed(2)}</span>
        )}
        <span className="card-time">{timeAgo(timestampStr)}</span>
      </div>
    </div>
  );
};
