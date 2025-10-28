import express from "express";
import cors from "cors";

import { initDb } from "./db/database.js";
import songsRouter from "./routes/songs.js";
import artistsRouter from "./routes/artists.js";
import playlistsRouter from "./routes/playlists.js";
import authRoutes from './routes/auth.js';

import spotifyArtistRoute from './routes/spotifyArtist.js';
import musicBrainzArtist from './routes/musicBrainzArtist.js';

import { setupSwagger } from "./swagger.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Ортақ middleware
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/api/songs", songsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/playlists", playlistsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/sartist', spotifyArtistRoute);
app.use('/api/bartist', musicBrainzArtist);


app.get("/", (req, res) => {
  res.json({
    message: "Music Platform API жұмыс істеп тұр!",
    endpoints: {
      songs: "/api/songs",
      artists: "/api/artists",
      playlists: "/api/playlists",
    },
  });
});

app.listen(PORT, async () => {
  await initDb();
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});