# MovieFlix Fullstack App

Fullstack React + Express + MySQL app with:
- Register/Login authentication
- JWT-protected REST APIs
- OMDB movie rows rendered in a Netflix-style home page
- CORS enabled for frontend-backend integration

## Project Structure
- `server/` Express API + MySQL auth + OMDB fetch
- `client/` React (Vite) frontend

## Setup

### 1. Server
```powershell
cd server
Copy-Item .env.example .env -Force
npm install
npm run dev
```
Server runs at `http://localhost:5000`.
Use `CORS_ORIGINS` in `server/.env` (comma-separated) to allow additional frontend domains in deployment.

### 2. Client (new terminal)
```powershell
cd client
Copy-Item .env.example .env -Force
npm install
npm run dev
```
Client runs at `http://localhost:5173`.

## Verification

### Backend API test (server must be running)
```powershell
cd server
node scripts/test-api.js
```
Expected output includes:
- `Register status: 201`
- `Rows fetched: 5`
- `First row movie count: 10`

### Frontend build check
```powershell
cd client
npm run build
```

## Usage Flow
1. Open client URL.
2. Create account or sign in.
3. On success, app redirects to `/home`.
4. Home page loads movie rows from OMDB via backend REST endpoint.
