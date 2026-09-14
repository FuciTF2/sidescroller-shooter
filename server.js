const express = require('express');
const app = express();
const PORT = 3000;

// Set Content Security Policy to allow resources
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';"
  );
  next();
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname + '/sidescroller-shooter-remaster/src'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/sidescroller-shooter-remaster/src/index.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Game running at http://localhost:${PORT}`);
});
