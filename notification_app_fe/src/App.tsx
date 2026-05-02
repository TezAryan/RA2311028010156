import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AllNotifications } from './pages/AllNotifications';
import { PriorityInbox } from './pages/PriorityInbox';
import { log } from './utils/logger';
import './App.css';

function App() {
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('readNotificationIds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('readNotificationIds', JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    log("info", "component", "App root mounted");
  }, []);

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar unreadCount={unreadCount} />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route 
              path="/" 
              element={<AllNotifications readIds={readIds} markAsRead={markAsRead} setUnreadCount={setUnreadCount} />} 
            />
            <Route 
              path="/priority" 
              element={<PriorityInbox readIds={readIds} markAsRead={markAsRead} setUnreadCount={setUnreadCount} />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
