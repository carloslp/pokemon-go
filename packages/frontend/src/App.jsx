import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm.jsx';
import TrainerList from './components/TrainerList.jsx';

export default function App() {
  const [refresh, setRefresh] = useState(0);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSuccess = (trainer) => {
    setSuccessMsg(`Welcome, ${trainer.username}! You've been added to the directory.`);
    setRefresh((n) => n + 1);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <main className="page">
      <header className="app-header">
        <span className="app-header__logo" aria-hidden="true">🎮</span>
        <div>
          <h1>Trainer Directory</h1>
          <p className="app-header__subtitle">Pokemon GO – Find &amp; connect with trainers near you</p>
        </div>
      </header>

      {successMsg && (
        <div className="alert alert-success" role="alert">
          {successMsg}
        </div>
      )}

      <div className="stack">
        <RegistrationForm onSuccess={handleSuccess} />

        <section>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Registered Trainers</h2>
          <TrainerList refresh={refresh} />
        </section>
      </div>
    </main>
  );
}
