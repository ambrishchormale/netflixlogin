import express from "express";
import cors from "cors";
import axios from "axios";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { pool, ensureSchema } from "./db.js";
import { authMiddleware, createToken } from "./auth.js";

const app = express();

// 2. CONFIGURE CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://netflixloginn-web.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
      ...(config.corsOrigins || [])
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked for this origin"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Server is live and running!');
});

// Health check available at both /api/health and /health
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ status: "ok" });
});

// REGISTER - Handles both /api/auth/register and /auth/register
app.post(["/api/auth/register", "/auth/register"], async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Provide name, email and password (min 6 chars)" });
  }

  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash],
    );

    const user = { id: result.insertId, name, email };
    return res.status(201).json({ token: createToken(user), user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register", details: error.message });
  }
});

// LOGIN - Handles both /api/auth/login and /auth/login
app.post(["/api/auth/login", "/auth/login"], async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Provide email and password" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const dbUser = rows[0];
    const matches = await bcrypt.compare(password, dbUser.password_hash);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
    return res.json({ token: createToken(user), user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login", details: error.message });
  }
});

app.get(["/api/auth/me", "/auth/me"], authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load user", details: error.message });
  }
});

app.get(["/api/movies/rows", "/movies/rows"], authMiddleware, async (_req, res) => {
  const rowQueries = [
    { id: "trending", title: "Trending Now", query: "avengers" },
    { id: "action", title: "Action Hits", query: "mission impossible" },
    { id: "sci-fi", title: "Sci-Fi Essentials", query: "star wars" },
    { id: "crime", title: "Crime & Thriller", query: "batman" },
    { id: "classics", title: "Classics", query: "godfather" },
  ];

  try {
    const rows = await Promise.all(
      rowQueries.map(async (row) => {
        const response = await axios.get("https://www.omdbapi.com/", {
          params: {
            apikey: config.omdbApiKey,
            s: row.query,
            type: "movie",
          },
          timeout: 10000,
        });

        const list = response.data?.Search || [];
        const movies = list
          .filter((movie) => movie.Poster && movie.Poster !== "N/A")
          .map((movie) => ({
            imdbID: movie.imdbID,
            title: movie.Title,
            year: movie.Year,
            poster: movie.Poster,
          }));

        return { id: row.id, title: row.title, movies };
      }),
    );
    return res.json({ rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch OMDB data", details: error.message });
  }
});

// 5. ERROR HANDLING
app.use((err, _req, res, next) => {
  if (err?.message === "CORS blocked for this origin") {
    return res.status(403).json({ message: "CORS blocked for this origin" });
  }
  if (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
  return next();
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found on server" });
});

export default app;

if (process.env.NODE_ENV !== "production") {
  (async function start() {
    try {
      await ensureSchema();
      app.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
      });
    } catch (error) {
      console.error("Failed to start server", error.message);
      process.exit(1);
    }
  })();
}