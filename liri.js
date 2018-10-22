// Loads API keys
require("dotenv").config();

// Accesses keys from file
var keys = require("./keys");

// Include NPM package, node-spotify-api, moment, fs
var request = require("request");
var Spotify = require("node-spotify-api");
var moment = require("moment");
var fs = require("fs");

// New Spotify key
var spotify = new Spotify(keys.spotify);

// New OMDB key
var omdbapi = keys.omdb;

// New Bands In Town key
var bandsInTown = keys.bandsInTown;

// Input from user
var command = process.argv[2];

// Grab the movieName, concert, song, do-what-it-says command which will always be the third node argument and assign it to an array.
var nameArr = process.argv.slice(3);

// Join the elements of the array to a string
var commandCall = (nameArr).join(" ");


// Hold the commands
// concert-this, spotify-this-song, movie-this, do-what-it-says
function choose(inputCommand) {
    // Choose what command to run
    switch (inputCommand) {
        case "concert-this":
            bandsInTownCall();
            break;
        case "spotify-this-song":
            spotifyApi();
            break;
        case "movie-this":
            omdbCall();
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
    }
}

// Runs commands
choose(command);

// Calls and returns OMDB API info
function omdbCall() {
    // If no movie is provided...
    if (commandCall === "") {
        // Default movie
        commandCall = "Mr. Nobody";
    }

    // Runs a request to the OMDB API with the movie specified
    var ombdUrl = "http://www.omdbapi.com/?t=" + commandCall + "&y=&plot=short&apikey=" + omdbapi.apikey;

    // Request movie to the API
    request(ombdUrl, function (error, response, body) {
        // Initialize data to be accessed
        let movieApiData = JSON.parse(body);

        // If the request is successful...
        if (!error && response.statusCode === 200 && movieApiData.Error === undefined) {
            // Movie title
            console.log("Title: " + movieApiData.Title);
            // Release year
            console.log("Release Year: " + movieApiData.Year);
            // IMDB rating 
            console.log("IMDB Rating: " + movieApiData.imdbRating);
            // Rotten Tomatoes rating
            console.log(movieApiData.Ratings[1].Source + ": " + movieApiData.Ratings[1].Value);
            // Country where movie was produced
            console.log("Country: " + movieApiData.Country);
            // Language
            console.log("Language: " + movieApiData.Language);
            // Plot 
            console.log("Plot: " + movieApiData.Plot);
            // Actors 
            console.log("Actors: " + movieApiData.Actors);
        } else {
            // Handles wrong movie input
            console.log(movieApiData.Error);
        }
    });
}

// Calls and returns Bands In Town info
function bandsInTownCall() {
    // Request to Bands In Town API w/ artist name
    var bandsInTownUrl = "https://rest.bandsintown.com/artists/" + commandCall + "/events?app_id=" + bandsInTown.app_id + "&date=upcoming";

    request(bandsInTownUrl, function (error, response, body) {
        console.log(bandsInTownUrl);
        
        // If the request is successful...
        if (!error && response.statusCode === 200) {
            let responseBody = JSON.parse(body);

            // console.log(responseBody);
            for (let key in responseBody) {
                // Output name of venue
                console.log("Name of the Venue: " + responseBody[key].venue.name);

                // Output venue's city
                console.log("Venue Location: " + responseBody[key].venue.city + ", " + responseBody[key].venue.country);

                // Output date of event per venue
                console.log("Date of Event: " + moment(responseBody[key].datetime).format("MM-DD-YYYY"));

                // Help w/ displaying venue (aesthetics)
                console.log("-------------------------------------------------------");
            }
        }
    });
}

// Calls and returns Spotify info
function spotifyApi() {
    // If there is no song input...
    if (nameArr.length !== 0) {
        // Converts the array that holds the data input from the user to as string becoming the song name
        nameArr = nameArr.join(" ");
    } else {
        // Pass in the following song in case no song was passed in...
        nameArr = "The Sign";
    }

    // Holds names of artists
    var spotifyNames = [];

    // Holds data of song based on artist
    var nameSet = {};

    // Request Spotify to run search based on name of the song
    spotify.search({ type: 'track', query: nameArr }, function (err, data) {
        // Handles errors in case the data does not return something
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        // Holds data returned from Spotify
        let spotifyData = data.tracks.items;

        // Loops through data set of 20 call backs
        for (let key in spotifyData) {
            // Initializes artist
            var artist = spotifyData[key].album.artists;
            // Initializes name of song
            var songName = spotifyData[key].name;

            // Makes sure name of songs matches to results from API
            if (songName.toLowerCase().search(nameArr.toLowerCase()) === -1) {
                // Keeps loop going
                continue;
            }

            // Link to song from Spotify
            var previewLinkSong = spotifyData[key].external_urls.spotify;

            // Album the song is from
            var albumName = spotifyData[key].album.name;

            // Initialize list of artists
            let artistList = [];

            // Loops through array of artist
            for (let innerKey in artist) {
                // Initialize artist name
                var artistName = artist[innerKey].name;

                // Add artist name to array that holds the list of artists
                artistList.push(artistName);
            }
            // Create a set that holds information about the song query based on name of artist
            nameSet[artistList.join(", ")] = {
                // Assigns the name of the song
                songName: songName,
                // Assigns link to the song in Spotify
                previewLinkSong: previewLinkSong,
                // Assigns name of album
                albumName: albumName
            };
        }
        // Loops through the data set of artists
        for (let keyName in nameSet) {
            // Adds the data 
            spotifyNames.push(
                // Add the name of artist
                "Artist: " + keyName +

                // Add the name of song
                "\nSong's Name: " + nameSet[keyName].songName +

                // Add URL to Spotify song
                "\nPreview Song in Spotify: " + nameSet[keyName].previewLinkSong +

                // Add name of album
                "\nAlbum's Name: " + nameSet[keyName].albumName +

                // Add a separator for easier output and aesthetics
                "\n-------------------------------------------------------------------------------");
        }
        // Output data
        console.log(spotifyNames.join("\n"));
    });
}

// Runs the data file random.txt
function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }

        // Print the contents of data
        console.log(data);

        // Split it by commas (to make it more readable)
        var dataArr = data.split(",");

        // Remove quotation marks from the data comming from the file and initialize the nameArr array
        nameArr = dataArr[1].replace("\"", "").split(" ");
        commandCall = nameArr.join(" ");
        // Send commands to choose from
        choose(dataArr[0]);
    });
}