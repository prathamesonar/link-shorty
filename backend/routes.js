const express = require('express');
const router = express.Router();
const pool = require('./db');
const os = require('os');

const isValidUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
};

const generateCode = () => {
    // Simple random alphanumeric string (6 chars)
    return Math.random().toString(36).substring(2, 8);
};

// --- 1. Health Check ---
router.get('/healthz', async (req, res) => {
    const startTime = Date.now();
    
    let dbStatus = 'disconnected';
    let dbLatency = 0;
    try {
        const dbStart = Date.now();
        await pool.query('SELECT 1');
        dbLatency = Date.now() - dbStart;
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'error';
    }

    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const loadAvg = os.loadavg(); 

    res.status(200).json({ 
        ok: true, 
        version: "1.0.0", 
        timestamp: new Date().toISOString(),
        uptime: uptime,
        system: {
            platform: process.platform,
            nodeVersion: process.version,
            cpuArch: os.arch(),
            memoryUsage: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024),       
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), 
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) 
            }
        },
        database: {
            status: dbStatus,
            latency: dbLatency 
        }
    });
});

router.post('/api/links', async (req, res) => {
    const { url, customCode } = req.body;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    let code = customCode;

    if (code) {
        if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
            return res.status(400).json({ error: 'Code must be 6-8 alphanumeric characters.' });
        }
        const check = await pool.query('SELECT * FROM links WHERE short_code = $1', [code]);
        if (check.rows.length > 0) {
            return res.status(409).json({ error: 'Code already exists' });
        }
    } else {
        let exists = true;
        while (exists) {
            code = generateCode();
            const check = await pool.query('SELECT * FROM links WHERE short_code = $1', [code]);
            if (check.rows.length === 0) exists = false;
        }
    }

    try {
        const result = await pool.query(
            'INSERT INTO links (original_url, short_code) VALUES ($1, $2) RETURNING *',
            [url, code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/links', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM links ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/links/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query('SELECT * FROM links WHERE short_code = $1', [code]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/api/links/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query('DELETE FROM links WHERE short_code = $1 RETURNING *', [code]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:code', async (req, res) => {
    const { code } = req.params;
    
    try {
        const result = await pool.query(
            'UPDATE links SET clicks = clicks + 1, last_clicked_at = NOW() WHERE short_code = $1 RETURNING original_url',
            [code]
        );

        if (result.rows.length > 0) {
            res.redirect(302, result.rows[0].original_url);
        } else {
            res.status(404).send('404 - Short link not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;