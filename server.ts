import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("goodquestion.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    answer TEXT NOT NULL,
    author_id INTEGER,
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );
`);

// Seed some data if empty
const questionCount = db.prepare("SELECT COUNT(*) as count FROM questions").get() as { count: number };
if (questionCount.count === 0) {
  const insertQuestion = db.prepare("INSERT INTO questions (title, content, answer) VALUES (?, ?, ?)");
  insertQuestion.run(
    "How to explain quantum entanglement to a 5-year-old?",
    "I want a simple analogy for quantum entanglement.",
    "Imagine you have a pair of magic socks. If you put one on your left foot in your bedroom, the other sock instantly knows it's the right-foot sock, even if it's all the way at your grandma's house! They are connected by a secret magic string that works faster than anything else in the world."
  );
  insertQuestion.run(
    "What is the best way to learn a new language?",
    "I'm struggling with Spanish. Any tips?",
    "The best way is immersion. Start by labeling everything in your house with Spanish words. Watch your favorite movies with Spanish subtitles, and try to speak for at least 15 minutes a day, even if it's just to yourself. Consistency beats intensity every time."
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      const result = stmt.run(username, email, hashedPassword);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ id: user.id, username: user.username });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(401).json({ error: "Unauthorized" });
      res.json(user);
    });
  });

  // Question Routes
  app.get("/api/questions", (req, res) => {
    const questions = db.prepare("SELECT * FROM questions ORDER BY created_at DESC").all();
    res.json(questions);
  });

  app.get("/api/questions/:id", (req, res) => {
    const question = db.prepare("SELECT * FROM questions WHERE id = ?").get(req.params.id);
    if (!question) return res.status(404).json({ error: "Not found" });
    res.json(question);
  });

  app.post("/api/questions", authenticateToken, (req: any, res) => {
    const { title, content, answer } = req.body;
    const stmt = db.prepare("INSERT INTO questions (title, content, answer, author_id) VALUES (?, ?, ?, ?)");
    const result = stmt.run(title, content, answer, req.user.id);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  // Like/Favorite Routes
  app.post("/api/questions/:id/like", authenticateToken, (req: any, res) => {
    try {
      db.prepare("INSERT INTO likes (user_id, question_id) VALUES (?, ?)").run(req.user.id, req.params.id);
      db.prepare("UPDATE questions SET likes_count = likes_count + 1 WHERE id = ?").run(req.params.id);
      res.json({ message: "Liked" });
    } catch (err) {
      db.prepare("DELETE FROM likes WHERE user_id = ? AND question_id = ?").run(req.user.id, req.params.id);
      db.prepare("UPDATE questions SET likes_count = likes_count - 1 WHERE id = ?").run(req.params.id);
      res.json({ message: "Unliked" });
    }
  });

  app.post("/api/questions/:id/favorite", authenticateToken, (req: any, res) => {
    try {
      db.prepare("INSERT INTO favorites (user_id, question_id) VALUES (?, ?)").run(req.user.id, req.params.id);
      res.json({ message: "Favorited" });
    } catch (err) {
      db.prepare("DELETE FROM favorites WHERE user_id = ? AND question_id = ?").run(req.user.id, req.params.id);
      res.json({ message: "Unfavorited" });
    }
  });

  // Comments
  app.get("/api/questions/:id/comments", (req, res) => {
    const comments = db.prepare(`
      SELECT c.*, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.question_id = ? 
      ORDER BY c.created_at DESC
    `).all(req.params.id);
    res.json(comments);
  });

  app.post("/api/questions/:id/comments", authenticateToken, (req: any, res) => {
    const { content } = req.body;
    const stmt = db.prepare("INSERT INTO comments (question_id, user_id, content) VALUES (?, ?, ?)");
    const result = stmt.run(req.params.id, req.user.id, content);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
