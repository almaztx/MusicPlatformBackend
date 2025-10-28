import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/authMiddleware.js';

dotenv.config();
const router = express.Router();

let accessToken = null;

// Access token алу Spotify-ден (Client Credentials Flow)
const getAccessToken = async () => {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const headers = {
    'Authorization': 'Basic ' + Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const response = await axios.post(tokenUrl, params, { headers });
  return response.data.access_token;
};

// 🎵 /:name маршруты
router.get('/:name', authenticateToken, async (req, res) => {
  try {
    const artistName = req.params.name;

    // Егер access token жоқ болса немесе ескірсе — жаңадан алу
    if (!accessToken) {
      accessToken = await getAccessToken();
    }

    // Spotify Artist Search API
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;
    const headers = { 'Authorization': `Bearer ${accessToken}` };

    const response = await axios.get(searchUrl, { headers });
    const artist = response.data.artists.items[0];

    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Spotify API-де нақты debut_year болмайды, сондықтан біз ол үшін mock мән береміз
    const result = {
      name: artist.name,
      country: artist?.country || 'Unknown', // Spotify елді әрқашан бермейді
      debut_year: artist?.followers.total > 1000000 ? 2000 : 2010 // мысал үшін логика
    };

    res.json(result);

  } catch (error) {
    console.error('Spotify API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch artist info' });
  }
});

export default router;