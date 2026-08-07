import { useState, useEffect } from 'react';
import TrainerCard from './TrainerCard.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function TrainerList({ refresh }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/trainers`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTrainers(data);
        else throw new Error(data.error || 'Failed to load trainers');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refresh]);

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading trainers…</p>;
  if (error)   return <div className="alert alert-error">{error}</div>;
  if (trainers.length === 0)
    return <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No trainers registered yet. Be the first! 🎮</p>;

  return (
    <div className="stack">
      {trainers.map((t) => (
        <TrainerCard key={t.id} trainer={t} />
      ))}
    </div>
  );
}
