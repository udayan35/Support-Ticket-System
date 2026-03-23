import { useState, useRef } from 'react';
import { api } from '../api';

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#7c3aed',
};

const STATUS_NEXT = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'closed',
  closed: null,
};

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function truncate(text, n = 120) {
  return text.length > n ? text.slice(0, n) + '…' : text;
}

export default function TicketList({ tickets, onUpdate }) {
  const [filters, setFilters] = useState({ category: '', priority: '', status: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const searchTimer = useRef(null);

  const handleFilter = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: val }));
    }, 400);
  };

  const advance = async (ticket) => {
    const next = STATUS_NEXT[ticket.status];
    if (!next) return;
    try {
      const updated = await api.updateTicket(ticket.id, { status: next });
      onUpdate(updated);
    } catch {
      alert('Failed to update status');
    }
  };

  const filtered = tickets.filter((t) => {
    if (filters.category && t.category !== filters.category) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="card">
      <h2>Tickets ({filtered.length})</h2>

      <div className="filters">
        <input
          placeholder="Search title or description…"
          value={searchInput}
          onChange={handleSearch}
          className="search-input"
        />
        <select name="category" value={filters.category} onChange={handleFilter}>
          <option value="">All Categories</option>
          {['billing', 'technical', 'account', 'general'].map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select name="priority" value={filters.priority} onChange={handleFilter}>
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={handleFilter}>
          <option value="">All Statuses</option>
          {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && <p className="empty">No tickets found.</p>}

      <div className="ticket-list">
        {filtered.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <h3>{ticket.title}</h3>
              <div className="badges">
                <span className="badge category">{ticket.category}</span>
                <span className="badge priority" style={{ background: PRIORITY_COLORS[ticket.priority] }}>
                  {ticket.priority}
                </span>
                <span className="badge status">{ticket.status.replace('_', ' ')}</span>
              </div>
            </div>
            <p className="ticket-desc">{truncate(ticket.description)}</p>
            <div className="ticket-footer">
              <span className="timestamp">{formatDate(ticket.created_at)}</span>
              {STATUS_NEXT[ticket.status] && (
                <button className="btn-advance" onClick={() => advance(ticket)}>
                  Mark as {STATUS_NEXT[ticket.status].replace('_', ' ')} →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
