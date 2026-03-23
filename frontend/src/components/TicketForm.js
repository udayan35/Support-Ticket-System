import { useState, useRef, useCallback } from 'react';
import { api } from '../api';

const CATEGORIES = ['billing', 'technical', 'account', 'general'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function TicketForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });
  const [classifying, setClassifying] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const classifyTimer = useRef(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'description') {
      clearTimeout(classifyTimer.current);
      if (value.trim().length > 20) {
        classifyTimer.current = setTimeout(async () => {
          setClassifying(true);
          try {
            const result = await api.classify(value);
            setSuggestion(result);
            setForm((prev) => ({
              ...prev,
              category: result.suggested_category,
              priority: result.suggested_priority,
            }));
          } catch {
            // LLM unavailable — silently ignore
          } finally {
            setClassifying(false);
          }
        }, 800);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const ticket = await api.createTicket(form);
      setForm({ title: '', description: '', category: 'general', priority: 'medium' });
      setSuggestion(null);
      onCreated(ticket);
    } catch (err) {
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Submit a Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Title *</label>
          <input
            name="title"
            maxLength={200}
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Brief summary of your issue"
          />
        </div>

        <div className="field">
          <label>Description *</label>
          <textarea
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your issue in detail..."
            rows={4}
          />
          {classifying && <span className="hint classifying">🤖 Analyzing with AI...</span>}
          {suggestion && !classifying && (
            <span className="hint suggestion">
              ✨ AI suggested: <strong>{suggestion.suggested_category}</strong> / <strong>{suggestion.suggested_priority}</strong>
            </span>
          )}
        </div>

        <div className="row">
          <div className="field">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}
