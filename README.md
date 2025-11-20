
-----

````markdown
# LinkShorty - Full Stack URL Shortener

A modern, full-stack URL shortening application similar to Bit.ly. Built with **Node.js & Express** on the backend and **React + Vite** with **Tailwind CSS** on the frontend.

This application allows users to shorten long URLs, customize short codes, track real-time click statistics, and view system health.

````
---

## Live Demo

* **Frontend (Vercel):** [https://link-shorty-web.vercel.app]
* **Backend (Render):** [https://link-shorty.onrender.com]

---

##  Screenshots


| Dashboard                                    | System Status                                   |
| ---------------------------------------------------- | ------------------------------------------------------ |
| ![dashboard Page](https://github.com/user-attachments/assets/0850dda5-1fa5-4e49-b76b-8a20e5982557) | ![System status](https://github.com/user-attachments/assets/fb5d7f47-9e92-4534-9a15-14143cb10b2b) |

| Game Category and analysis                                      | 
| ------------------------------------------------- | 
| ![Statistics Page](https://github.com/user-attachments/assets/c5ff69dc-8fa0-4d6c-aca4-91d2004d6d8c) |

---

## 🛠 Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS (Styling & Dark Mode)
* React Router DOM (Routing)
* Lucide React (Icons)
* Date-fns (Date formatting)

**Backend:**
* Node.js
* Express.js
* PostgreSQL (Neon DB)
* Cors & Dotenv

**Deployment:**
* **Frontend:** Vercel
* **Backend:** Render
* **Database:** Neon (Serverless Postgres)

---

## 📂 Project Structure

The project follows a monorepo structure:

```text
link-shorty/
├── backend/
│   ├── .env                # Env vars (DB URL, Port)
│   ├── package.json
│   ├── server.js           # Entry point
│   ├── db.js               # Database connection
│   └── routes.js           # API definitions
├── frontend/
│   ├── .env                # Env vars (API URL)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx         # Routing & Layout
│       └── pages/
│           ├── Dashboard.jsx
│           └── Stats.jsx
│           └── Health.jsx
└── README.md
````

-----

##  Features

1.  **Shorten Links:** Convert long URLs into short, shareable links.
2.  **Custom Codes:** Optionally define custom aliases (e.g., `/mydocs`).
3.  **Redirection (302):** Fast redirection to the original URL.
4.  **Statistics:** Track total clicks, last clicked time, and active duration.
5.  **QR Codes:** Auto-generated QR codes for every link.
6.  **Management:** Search, filter, and delete links.
7.  **System Health:** Real-time monitoring of API uptime and Database latency.
8.  **Dark Mode:** Fully responsive UI with Light/Dark theme toggle.

-----

##  Getting Started (Local Development)

### 1\. Prerequisites

  * Node.js (v14+) installed.
  * A PostgreSQL database (Local or Neon).

### 2\. Database Setup

Run the following SQL query in your PostgreSQL console to create the required table:

```sql
CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(8) UNIQUE NOT NULL,
    clicks INT DEFAULT 0,
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3\. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=4000
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run start
# Server running on port 4000
```

### 4\. Frontend Setup

Open a new terminal, navigate to the frontend folder, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Start the client:

```bash
npm run dev
# Client running on http://localhost:5173
```

-----

## 📡 API Documentation

### 1\. Core Endpoints

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/links` | Create a new short link | Public |
| `GET` | `/api/links` | List all links | Public |
| `GET` | `/api/links/:code` | Get stats for a specific link | Public |
| `DELETE` | `/api/links/:code` | Delete a link | Public |

### 2\. System & Redirects

| Method | Endpoint | Description | Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/:code` | Redirects to original URL | `302 Found` or `404` |
| `GET` | `/healthz` | System health check | `200 OK` |

### 3\. Example Payloads

**POST /api/links**

```json
{
  "url": "[https://google.com](https://google.com)",
  "customCode": "google"  // Optional
}
```

**GET /healthz Response**

```json
{
  "ok": true,
  "version": "1.0.0",
  "uptime": 120.5,
  "database": { "status": "connected", "latency": 50 }
}
```

-----


## Testing & Constraints

  * **Short Codes:** Must follow regex `[A-Za-z0-9]{6,8}`.
  * **Duplicate Codes:** Returns `409 Conflict`.
  * **Invalid URL:** Returns `400 Bad Request`.



```
```
