import express from "express";
import { openDb } from "../db/database.js";
import songFilterSortMiddleware from "../middleware/songFilterSortMiddleware.js";

const router = express.Router();
// router.use(authenticateToken);

// Барлық әндерді алу
router.get("/", songFilterSortMiddleware, async (req, res) => {
  try {
    const db = await openDb();

    let sql = "SELECT * FROM songs";
    let params = [];

    // Фильтр по жанру
    if (req.genre) {
      sql += " WHERE genre = ?";
      params.push(req.genre);
    }

    // Сортировка
    sql += ` ORDER BY ${req.orderBy}`;

    const songs = await db.all(sql, params);
    res.json(songs);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
  // const db = await openDb();
  // const songs = await db.all("SELECT * FROM songs");
  // res.json(songs);
});

// Бір әнді алу
router.get("/:id", async (req, res) => {
  const db = await openDb();
  const song = await db.get("SELECT * FROM songs WHERE id = ?", [
    req.params.id,
  ]);
  if (song) res.json(song);
  else res.status(404).json({ error: "Ән табылмады" });
});

// Жаңа ән қосу
router.post("/", async (req, res) => {
  const { title, artist_id, duration, genre } = req.body;
  if (!title) return res.status(400).json({ error: "Title қажет" });

  const db = await openDb();
  const result = await db.run(
    "INSERT INTO songs (title, artist_id, duration, genre) VALUES (?, ?, ?, ?)",
    [title, artist_id, duration, genre]
  );
  res
    .status(201)
    .json({ id: result.lastID, title, artist_id, duration, genre });
});

// Әнді жаңарту
router.put("/:id", async (req, res) => {
  const { title, artist_id, duration, genre } = req.body;
  const db = await openDb();
  await db.run(
    "UPDATE songs SET title = ?, artist_id = ?, duration = ?, genre = ? WHERE id = ?",
    [title, artist_id, duration, genre, req.params.id]
  );
  res.json({ message: "Ән жаңартылды" });
});

// Әнді жою
router.delete("/:id", async (req, res) => {
  const db = await openDb();
  await db.run("DELETE FROM songs WHERE id = ?", [req.params.id]);
  res.json({ message: "Ән жойылды" });
});

export default router;
