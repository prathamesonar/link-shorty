const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Updated CORS Configuration
app.use(cors({
    // Allow your specific Vercel app AND localhost (for testing)
    origin: [
        process.env.FRONTEND_URL, 
        'http://localhost:5173', 
        'https://link-shorty-web.vercel.app' // Hardcoded fallback just in case
    ],
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logger (Helps debug on Render logs)
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Routes
app.use('/', routes);

// Global Error Handler (Prevents crashing)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});