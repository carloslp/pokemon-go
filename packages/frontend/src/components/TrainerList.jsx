import { useState, useEffect, useMemo } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TEAM_LABEL = { mystic: 'Mystic', valor: 'Valor', instinct: 'Instinct' };
const TEAM_OPTIONS = [
  { value: '', label: 'All teams' },
  { value: 'mystic', label: 'Mystic' },
  { value: 'valor', label: 'Valor' },
  { value: 'instinct', label: 'Instinct' },
];

function prettyCode(code) {
  return String(code ?? '').replace(/(\d{4})(?=\d)/g, '$1 ');
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <button
      type="button"
      className={`btn-copy${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      aria-label={`Copy trainer code ${prettyCode(text)}`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function TrainerList({ refresh }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    username: '',
    trainer_code: '',
    team: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/trainers`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTrainers(data);
        else throw new Error(data.error || 'Failed to load trainers');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refresh]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const filteredTrainers = useMemo(() => {
    const normalizedCodeFilter = filters.trainer_code.replace(/\s/g, '').toLowerCase();

    return trainers.filter((trainer) => {
      const username = String(trainer.username ?? '').toLowerCase();
      const trainerCode = String(trainer.trainer_code ?? '');
      const city = String(trainer.city ?? '').toLowerCase();
      const country = String(trainer.country ?? '').toLowerCase();

      return (
        username.includes(filters.username.trim().toLowerCase()) &&
        (!normalizedCodeFilter || trainerCode.includes(normalizedCodeFilter)) &&
        (!filters.team || trainer.team === filters.team) &&
        city.includes(filters.city.trim().toLowerCase()) &&
        country.includes(filters.country.trim().toLowerCase())
      );
    });
  }, [filters, trainers]);

  if (loading) return <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading trainers…</p>;
  if (error)   return <div className="alert alert-error">{error}</div>;
  if (trainers.length === 0)
    return <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No trainers registered yet. Be the first! 🎮</p>;

  return (
    <div className="card stack">
      <div className="trainer-filters">
        <div className="form-group">
          <label htmlFor="filter-username">Filter by trainer</label>
          <input
            id="filter-username"
            name="username"
            type="text"
            className="form-control"
            value={filters.username}
            onChange={handleFilterChange}
            placeholder="AshKetchum"
          />
        </div>

        <div className="form-group">
          <label htmlFor="filter-trainer-code">Filter by code</label>
          <input
            id="filter-trainer-code"
            name="trainer_code"
            type="text"
            inputMode="numeric"
            className="form-control"
            value={filters.trainer_code}
            onChange={handleFilterChange}
            placeholder="1234"
          />
        </div>

        <div className="form-group">
          <label htmlFor="filter-team">Filter by team</label>
          <select
            id="filter-team"
            name="team"
            className="form-control form-select"
            value={filters.team}
            onChange={handleFilterChange}
          >
            {TEAM_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filter-city">Filter by city</label>
          <input
            id="filter-city"
            name="city"
            type="text"
            className="form-control"
            value={filters.city}
            onChange={handleFilterChange}
            placeholder="Tokyo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="filter-country">Filter by country</label>
          <input
            id="filter-country"
            name="country"
            type="text"
            className="form-control"
            value={filters.country}
            onChange={handleFilterChange}
            placeholder="Japan"
          />
        </div>
      </div>

      {filteredTrainers.length === 0 ? (
        <p className="text-center">No trainers match the selected filters.</p>
      ) : (
        <div className="trainer-table-wrapper">
          <table className="trainer-table">
            <thead>
              <tr>
                <th scope="col">Trainer</th>
                <th scope="col">Code</th>
                <th scope="col">Team</th>
                <th scope="col">City</th>
                <th scope="col">Country</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.map((trainer) => (
                <tr key={trainer.id}>
                  <td>{trainer.username}</td>
                  <td>
                    <div className="trainer-table__code">
                      <span>{prettyCode(trainer.trainer_code)}</span>
                      <CopyButton text={trainer.trainer_code} />
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${trainer.team}`}>{TEAM_LABEL[trainer.team] ?? trainer.team}</span>
                  </td>
                  <td>{trainer.city || '—'}</td>
                  <td>{trainer.country || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
