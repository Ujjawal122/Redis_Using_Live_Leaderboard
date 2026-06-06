# Live Leaderboard

Live Leaderboard is a full-stack real-time leaderboard application built with React, Node.js, Express, MongoDB, Redis, and Socket.IO. Users can register, log in, play a browser-based Meteor Dodge game, submit scores, view live rankings, and manage their profile.

The project is structured as a separate frontend and backend application.

## Features

- User registration and login with JWT stored in an HTTP-only cookie
- Protected routes for leaderboard, profile, and game pages
- Real-time leaderboard updates using Socket.IO
- Redis Sorted Sets for fast score ranking
- MongoDB storage for user accounts and player statistics
- Meteor Dodge game with automatic score submission
- User profile page with editable profile details
- Account deletion support
- Production deployment support for Render and Vercel

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Axios
- Socket.IO Client

Backend:

- Node.js
- Express
- MongoDB with Mongoose
- Redis with ioredis
- Socket.IO
- JSON Web Token
- bcryptjs
- cookie-parser
- cors

## Project Structure

```txt
live_leaderboard/
  client/
    src/
      components/
      context/
      lib/
      App.jsx
      main.jsx
    package.json
    vite.config.js

  server/
    src/
      config/
      controllers/
      middlewares/
      models/
      routes/
      services/
      sockets/
      app.js
      server.js
    package.json

  render.yaml
  README.md
```

## Local Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB database
- Redis database

### Backend Setup

Go to the backend folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
NODE_ENV=development
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
REDIS_URL=your_redis_connection_string
```

Start the backend server:

```bash
npm run dev
```

The backend runs on:

```txt
http://localhost:5000
```

### Frontend Setup

Go to the frontend folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

## Available Scripts

Backend scripts:

```bash
npm run dev
npm start
```

Frontend scripts:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Main Pages

```txt
/             Landing page
/register     User registration
/login        User login
/leaderboard  Protected leaderboard page
/game         Protected Meteor Dodge game page
/profile      Protected user profile page
```

## API Routes

Authentication routes:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Leaderboard routes:

```txt
GET  /api/leaderboard/top
GET  /api/leaderboard/rank/:username
POST /api/leaderboard/score
```

Player routes:

```txt
GET    /api/players/me
GET    /api/players/:id
PUT    /api/players/me
DELETE /api/players/me
```

## Environment Variables

Backend environment variables:

```env
PORT=5000
NODE_ENV=production
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
REDIS_URL=your_redis_connection_string
```

Frontend environment variables:

```env
VITE_BACKEND_URL=your_backend_url
```

## Deployment

### Backend on Render

The backend can be deployed on Render as a Node web service.

Render backend settings:

```txt
Root Directory: server
Build Command: npm ci
Start Command: npm start
```

Required Render environment variables:

```env
NODE_ENV=production
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
REDIS_URL=your_render_redis_connection_string
```

If using the included `render.yaml`, Render can create the backend service and Redis service from the Blueprint configuration.

### Frontend on Vercel

The frontend can be deployed on Vercel as a Vite application.

Vercel frontend settings:

```txt
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

Required Vercel environment variable:

```env
VITE_BACKEND_URL=https://your-render-backend-url.onrender.com
```

After deploying the frontend on Vercel, update the backend `CLIENT_URL` environment variable on Render with the Vercel frontend URL.

Example:

```env
CLIENT_URL=https://your-vercel-app.vercel.app
```

Then redeploy the backend.

## Notes

- The backend uses HTTP-only cookies for authentication.
- In production, cookies are configured with `secure: true` and `sameSite: "none"`.
- The frontend and backend must use correct production URLs for CORS and cookie authentication to work.
- Redis stores leaderboard rankings using a sorted set named `leaderboard`.
- MongoDB stores user profile data, total score, and games played.

## License

This project is licensed under the ISC License.
