// uploadToCloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// 🔹 Configure Cloudinary (replace with your real credentials)
cloudinary.config({
  cloud_name: 'dpub9wk5p',
  api_key: '738963691494398',
  api_secret: 'xjdU1MTmtiU4dxzjEy9sT-YUrUU'
});

// 🔹 Base folder that contains all songs and artists
const baseFolder = './songs';

// Function to upload all songs of one artist
function uploadSongs(folderPath, artistName) {
  const files = fs.readdirSync(folderPath);
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    if (file.endsWith('.mp3')) {
      cloudinary.uploader.upload(filePath, {
        resource_type: "video",  // For mp3/mp4/wav
        folder: `songs/${artistName}` // Keep same folder structure in Cloudinary
      })
      .then(result => {
        console.log(`✅ Uploaded: ${artistName}/${file}`);
        console.log(`🔗 URL: ${result.secure_url}\n`);
      })
      .catch(err => console.error(`❌ Error uploading ${file}:`, err.message));
    }
  });
}

// 🔹 Loop through all artist folders
const artists = fs.readdirSync(baseFolder);
artists.forEach(artist => {
  const artistPath = path.join(baseFolder, artist);
  if (fs.lstatSync(artistPath).isDirectory()) {
    uploadSongs(artistPath, artist);
  }
});
