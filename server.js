import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
                "worker-src": ["'self'", "blob:"],
                "child-src": ["'self'", "blob:"],
                "img-src": ["'self'", "data:", "blob:", "https://api.mapbox.com"],
                "connect-src": ["'self'", "https://*.mapbox.com"],
            },
        },
    })
);

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// For all other requests, serve the index.html file so client-side routing works
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
