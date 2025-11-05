import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Serve your frontend

// ✅ Fetch songs by artist
app.get("/songs/:artist", (req, res) => {
  const artist = req.params.artist;
  const artistFolder = path.join(__dirname, "songs", artist);

  fs.readdir(artistFolder, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err.message);
      return res.status(404).json([]);
    }

    const audioFiles = files.filter(
      (file) => file.endsWith(".mp3") || file.endsWith(".wav")
    );
    res.json(audioFiles);
  });
});

// Serve actual audio files
app.get("/songs/:artist/:song", (req, res) => {
  const { artist, song } = req.params;
  const songPath = path.join(__dirname, "songs", artist, song);
  res.sendFile(songPath);
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


