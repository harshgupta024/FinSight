# FinSight – Intelligent Financial Analytics Platform

A production-ready full-stack MERN application for cryptocurrency portfolio management, real-time market tracking, price alerts, and financial analytics.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green) ![License](https://img.shields.io/badge/License-ISC-blue)

## ✨ Features

- **JWT Authentication** – Register, login, and role-based access (user/admin)
- **Dashboard** – Real-time crypto prices, interactive charts, portfolio overview
- **Portfolio Management** – Add/edit/delete assets, auto-calculated gain/loss
- **Watchlist** – Track favorite coins with live prices
- **Price Alerts** – Set target prices, automatic background checking
- **WebSocket** – Live price updates pushed to clients
- **API Caching** – In-memory cache (Redis-ready) for external API responses
- **Swagger Docs** – Auto-generated API documentation at `/api-docs`

## 🛠 Tech Stack

| Layer      | Technologies                                            |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 18, Vite, TailwindCSS 3, Recharts, React Router  |
| Backend    | Node.js, Express, Mongoose, JWT, bcrypt, WebSocket      |
| Database   | MongoDB (Atlas-ready)                                   |
| DevOps     | Docker, Docker Compose, GitHub Actions                  |
| Security   | Helmet, CORS, rate limiting, express-validator           |

## 📁 Project Structure

```
FinSight/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── context/         # React Context (Auth)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Axios API layer
│   │   └── utils/           # Helpers & formatters
│   └── index.html
├── server/                  # Express Backend
│   ├── config/              # DB & env config
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth, error, rate-limit
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic & APIs
│   ├── utils/               # Response helpers
│   ├── __tests__/           # Jest tests
│   └── server.js            # Entry point
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/finsight.git
cd finsight

# Backend
cd server
cp .env.example .env   # Edit with your MongoDB URI & JWT secret
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finsight
JWT_SECRET=your_strong_secret_here
JWT_EXPIRE=7d
COINGECKO_API_URL=https://api.coingecko.com/api/v3
CLIENT_URL=http://localhost:5173
```

### 3. Run Development

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api-docs
- WebSocket: ws://localhost:5000/ws

## 🐳 Docker

```bash
docker-compose up --build
```

This starts the backend, MongoDB, and Redis.

## 📚 API Documentation

Visit `/api-docs` when the server is running for interactive Swagger documentation.

### Key Endpoints

| Method | Endpoint                     | Description           | Auth  |
| ------ | ---------------------------- | --------------------- | ----- |
| POST   | `/api/auth/register`         | Register user         | No    |
| POST   | `/api/auth/login`            | Login                 | No    |
| GET    | `/api/auth/me`               | Get profile           | Yes   |
| GET    | `/api/portfolio`             | Get portfolio         | Yes   |
| POST   | `/api/portfolio/asset`       | Add asset             | Yes   |
| GET    | `/api/watchlist`             | Get watchlist         | Yes   |
| POST   | `/api/alerts`                | Create alert          | Yes   |
| GET    | `/api/market/top`            | Top coins             | No    |
| GET    | `/api/market/history/:id`    | Price history         | No    |

## 🧪 Testing

```bash
cd server
npm test                 # Run tests
npm run test:coverage    # With coverage
```

## 🚢 Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables from `.env.example`

### Frontend → Vercel

1. Import project on [Vercel](https://vercel.com)
2. Set root directory to `client`
3. Framework: Vite
4. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com`

## 📄 License

ISC
