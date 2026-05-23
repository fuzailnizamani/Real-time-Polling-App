import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000';

const formatPercent = (value, total) => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

function App() {
  const socketRef = useRef(null);
  const [poll, setPoll] = useState({ question: '', options: {} });
  const [selectedOption, setSelectedOption] = useState('');
  const [message, setMessage] = useState('Waiting for live poll data...');
  const [connected, setConnected] = useState(false);

  const totalVotes = useMemo(
    () => Object.values(poll.options).reduce((sum, value) => sum + value, 0),
    [poll.options]
  );

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL, {
      // prefer polling first so the Engine.IO handshake completes
      // before upgrading to websocket; avoids "ws closed before" transient errors
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      setMessage('Connected to live poll server.');
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      setMessage('Disconnected from server. Reconnect to continue.');
    });

    socketRef.current.on('pollUpdate', (updatedPoll) => {
      setPoll(updatedPoll);
      setMessage('Live poll updated. Choose your favorite option!');
    });

    socketRef.current.on('voteError', (error) => {
      setMessage(error?.message || 'Vote failed. Please try again.');
    });

    socketRef.current.on('serverError', (error) => {
      setMessage(error?.message || 'Server error occurred.');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleVote = () => {
    if (!selectedOption) {
      setMessage('Please select an option before voting.');
      return;
    }

    socketRef.current.emit('vote', selectedOption);
    setMessage(`Your vote for ${selectedOption} was sent.`);
  };

  return (
    <div className="page-shell">
      <div className="card">
        <header className="hero">
          <p className={`status-badge ${connected ? 'online' : 'offline'}`}>
            {connected ? 'Online' : 'Offline'}
          </p>
          <h1>Real-Time Poll</h1>
          <p className="hero-copy">Vote for the best backend technology and watch live results update instantly.</p>
        </header>

        <section className="poll-panel">
          <div className="poll-question">
            <h2>{poll.question || 'Loading poll...'}</h2>
            <p className="poll-status">{message}</p>
          </div>

          <div className="option-grid">
            {Object.entries(poll.options).map(([option, votes]) => (
              <button
                key={option}
                className={`option-card ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option)}
                type="button"
              >
                <span>{option}</span>
                <strong>{votes} votes</strong>
                <small>{formatPercent(votes, totalVotes)}</small>
              </button>
            ))}
          </div>

          <div className="actions-row">
            <button className="primary-button" onClick={handleVote} type="button" disabled={!connected || !poll.question}>
              Submit Vote
            </button>
            <span className="votes-count">Total votes: {totalVotes}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
