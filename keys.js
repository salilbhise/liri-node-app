// Checks to make sure the file is being loaded
console.log("This is loaded.");

// Loads Spotify API key
exports.spotify = {
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
};

// Loads OMDB API key
exports.omdb = {
    apikey: process.env.apikey,
}

// Loads Bands In Town API key
exports.bandsInTown = {
    app_id: process.env.app_id
}

// module.exports = keys;