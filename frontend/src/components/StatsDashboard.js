const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#7c3aed',
};

const CATEGORY_COLORS = {
  billing: '#3b82f6',
  technical: '#ef4444',
  account: '#8b5cf6',
  general: '#6b7280',
};

function Bar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="bar-count">{count}</span>
    </div>
  );
}

export default function StatsDashboard({ stats }) {
  if (!stats) return <div className="card"><p>Loading stats…</p></div>;

  const { total_tickets, open_tickets, avg_tickets_per_day, priority_breakdown, category_breakdown } = stats;

  return (
    <div className="card stats-card">
      <h2>Dashboard</h2>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value">{total_tickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{open_tickets}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{avg_tickets_per_day}</div>
          <div className="stat-label">Avg / Day</div>
        </div>
      </div>

      <div className="breakdown-section">
        <h4>Priority</h4>
        {Object.entries(priority_breakdown).map(([k, v]) => (
          <Bar key={k} label={k} count={v} total={total_tickets} color={PRIORITY_COLORS[k]} />
        ))}
      </div>

      <div className="breakdown-section">
        <h4>Category</h4>
        {Object.entries(category_breakdown).map(([k, v]) => (
          <Bar key={k} label={k} count={v} total={total_tickets} color={CATEGORY_COLORS[k]} />
        ))}
      </div>
    </div>
  );
}
