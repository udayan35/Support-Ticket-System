import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';
import './App.css';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([api.getTickets(), api.getStats()]);
      setTickets(t);
      setStats(s);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreated = useCallback((ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    api.getStats().then(setStats).catch(() => {});
  }, []);

  const handleUpdate = useCallback((updated) => {
    setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    api.getStats().then(setStats).catch(() => {});
  }, []);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎫 Support Ticket System</h1>
        <span className="subtitle">AI-powered categorization</span>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <StatsDashboard stats={stats} />
          <TicketForm onCreated={handleCreated} />
        </aside>
        <main className="main">
          <TicketList tickets={tickets} onUpdate={handleUpdate} />
        </main>
      </div>
    </div>
  );
}
