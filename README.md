# TaskFlow — Smart To-Do List Management Application

A full-stack To-Do List Management Application built with React, Tailwind CSS, Node.js, Express.js, and MongoDB (Mongoose).

## Project Structure

```text
├── frontend/
│   └── src/
│       ├── api/            # REST API client for /api/tasks
│       ├── components/     # Sidebar, StatsCards, AnalyticsCharts, TaskList, Modals
│       ├── types/          # Frontend TypeScript interfaces
│       ├── utils/          # Date formatting and overdue helpers
│       ├── App.tsx         # Main application workspace
│       ├── index.css       # Tailwind CSS v4 styles
│       └── main.tsx        # React entry point
├── backend/
│   ├── config/             # MongoDB connection setup
│   ├── controllers/        # Express request handlers
│   ├── middleware/         # Input validation & sanitization
│   ├── models/             # Mongoose Task schema
│   ├── repositories/       # Data access layer (MongoDB + persistent fallback)
│   ├── routes/             # /api/tasks REST endpoints
│   ├── types/              # Backend DTOs
│   └── app.ts              # Express app configuration
├── server.ts               # Full-stack Express + Vite entry point
├── index.html
└── package.json
```

## REST API Endpoints

| Method | Endpoint         | Description                                     |
| ------ | ---------------- | ----------------------------------------------- |
| GET    | `/api/tasks`     | List tasks (supports `status`, `priority`, `search`, `overdueOnly`, `sortBy`) + dashboard stats |
| GET    | `/api/tasks/:id` | Get a single task by ID                         |
| POST   | `/api/tasks`     | Create a new task                               |
| PUT    | `/api/tasks/:id` | Update a task (title, description, dueDate, priority, status) |
| PATCH  | `/api/tasks/:id` | Partially update a task (e.g. toggle status)    |
| DELETE | `/api/tasks/:id` | Delete a task by ID                             |
| GET    | `/api/health`    | Health and active database mode check           |

## Running Locally

### 1. Prerequisites
- Node.js v20+ (or v22+)
- MongoDB (local `mongod` instance or a MongoDB Atlas connection string)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and set your MongoDB connection string:
```bash
cp .env.example .env
```
Edit `.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
PORT=3000
```
*(If `MONGODB_URI` is left blank, the server automatically persists tasks to `.data/tasks.json` so you can also test locally without a running MongoDB daemon.)*

### 4. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Production Build & Start
```bash
npm run build
NODE_ENV=production npm start
```
