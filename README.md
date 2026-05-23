# Real-Time Polling App

A small real-time polling demo using Express and Socket.IO (server) with a React + Vite client.

## Features

- Live poll updates with Socket.IO
- Simple in-memory poll state (server)
- React-based client with vote UI and live results

## Prerequisites

- Node.js 18+ and npm

## Project structure

- `server.js` — Express + Socket.IO backend
- `client/` — Vite + React front-end

## Setup & Run (development)

1. Start the backend server

```bash
cd "Real-time Polling App"
npm install
npm run start
```

2. Start the client dev server

```bash
cd client
npm install
npm run dev
```

Open the client URL shown by Vite (usually http://localhost:5173) and the backend runs on http://localhost:3000 by default.

## Build

To build the client for production:

```bash
cd client
npm run build
```

Serve the built `dist` files with any static server, or integrate with the Express server as needed.

## Important Notes

- Keep `socket.io` (server) and `socket.io-client` (client) on matching major versions (both v4 in this project) to avoid Engine.IO handshake errors such as `WebSocket is closed before the connection is established` during refresh/reconnect.
- The client uses a short reconnection strategy and prefers engine.io polling before upgrading to websocket to reduce transient handshake races.

## Troubleshooting

- If you see websocket/handshake errors on reload:
  - Verify the backend is running on port `3000`.
  - Confirm `socket.io` versions in `package.json` files match between `server` and `client`.
  - Try removing any explicit `transports` option in the client to use defaults.
  - If behind a proxy (nginx), ensure websocket upgrade headers are forwarded (`Upgrade` / `Connection` headers).

## Contributing

Open an issue or submit a PR for improvements. This project is intentionally small and educational.

## License

MIT