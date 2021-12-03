const tmdbKey = "16c416000d15a81b6baaeb7641ed1b26";
const imdbKey = "k_km2lsf6q";
const rapidKey = "8784b1dedbmshe159ceaadd14dc3p1baa6bjsn50195ef5079f";
const posterBasePath = "https://image.tmdb.org/t/p/original";
const movieId = window.location.search.split("=")[1];

// Function to insert movie meta data to the page
function insertData(movie){
    $('#movie-title').html(movie.title); // Insert the movie title to the content header    
    insertPoster(movie.poster_path); // Call the insert poster function and pass the movie's poster's path
    $('#movie-overview').append($('<p>').text(movie.overview))
    insertDetails(movie); // Call the insert details function and pass it the object
}; // End of function

// Function to insert the movie poster
function insertPoster(path){
    const posterPath = posterBasePath + path; // Concatenate base and poster path    
    $('#poster').prop("src", posterPath);
}; // End of function

// Function to insert details of the movie
function insertDetails(movie){
    var cast = []; // Array to store cast members
    var genres = []; // Array to store genres

    getCast(movie.id, function(data){ // Callback function to get the first five cast members
        data.cast.slice(0, 5).forEach(member => {
            cast.push(member.name); // Retrieve cast member's name and append it to the collection
        }); // End of for loop
    }); // End of callback function

    movie.genres.forEach(genre => { // For loop to get the names of genre objects
        genres.push(genre.name); // Append the genre name to the collection
    }); // End of for loop

    setTimeout(() => {
        $('#movie-details-table').html(`
        <tr>
            <td><h4>Release date:</h4></td><td>${movie.release_date}</td>
        </tr>
        <tr>
            <td><h4>Duration:</h4></td><td>${movie.runtime} mins</td>
        </tr>
        <tr>
            <td><h4>Genres:</h4></td><td>${genres.join(", ")}</td>
        </tr>
        <tr>
            <td><h4>Rating:</h4></td><td>${movie.vote_average}</td>
        </tr>
        <tr>
            <td><h4>Cast:</h4></td><td>${cast.join(", ")}</td>
        </tr>
        `).css("border-bottom", "2px solid rgba(229, 9, 20, .75)")
    }, 400);
}; // End of function

// Helper function to get the cast members starring in the movie
function getCast(tmdbID, callback){
    $.ajax({
        type: "GET",
        url: "https://api.themoviedb.org/3/movie/" + tmdbID + "/credits",
        data: {
            api_key: tmdbKey,
            language: "en-US"
        },
        success: callback // The response object is fed to the callback function as a parameter
    });
}; // End of function

// Helper function to query the corresponding embed link from the IMDB API 
function getTrailer(imdbID, callback){    
    $.ajax({
        type: "GET",
        url: "https://imdb-api.com/API/Trailer/" + imdbKey + "/" + imdbID,
        success: callback 
    });
};

// Function to insert the movie trailer to the web page
function insertTrailer(movie){
    const imdbID = movie.imdb_id; // The movie object contains an IMDB ID which is used to query the IMDB API
    getTrailer(imdbID, function(response) {
        $('#trailer').attr("src", response.linkEmbed)
    }); // End of callback function
}; // End of function

// Helper function to query the streaming platforms and their links where the movie can be found
function getStreamingLinks(tmdbID, callback){
    /*
    Note: This query uses fetch instead of AJAX
    The response objects were bugged when using Ajax to make the query through rapid api
    The response object could not be accessed - other users have reported the same issue, hence used fetch to obtain the desired information
    */

    fetch("https://streaming-availability.p.rapidapi.com/get/basic?country=gb&tmdb_id=movie/" + tmdbID + "&output_language=en", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "streaming-availability.p.rapidapi.com",
		"x-rapidapi-key": rapidKey
	    }
    })
    .then(response => {
        var cleanData = {};
        response.json().then((data) => {
            Object.keys(data.streamingInfo).forEach(key => {
                cleanData[key] = data.streamingInfo[key].gb.link;
            })
            callback(cleanData);
        });
    })
}; // End of function

// Function to insert streaming availability information to the web page
function insertStreamingLinks(movie){
    var table = $('<table>').append('<tr></tr>');

    getStreamingLinks(movie.id, function(data) {
        if(Object.keys(data).length != 0){
            for( var[key, value] of Object.entries(data)) {
                $(table).append(`<td><a class="stream-link" href="${value}">${key}</td>`)
            }; // End of for loop

            $('#streaming-container').append(table);

        } else {
            $('#streaming-container').append('<h2>No streaming services available for this movie :(</h2>');
        }; // End of if statement
    }); // End of callback function
}; // End of function


$(document).ready(function() {
    // When document is loaded make an API call to the TMDB API and query the movie object corresponding to the ID passed in the URL
    $.ajax({
        type: "GET",
        url: "https://api.themoviedb.org/3/movie/" + movieId,
        data: {
            api_key: tmdbKey,
            language: "en-US",
        },
        success: function(response) {
            $(document).prop("title", "MovieBase - " + response.title);
            insertData(response);
            insertStreamingLinks(response);
            insertTrailer(response);
        }
    });

    // Hide both the embedded trailer and streaming links by default
    $('#trailer-container').hide();
    $('#streaming-container').hide();

    // When the 'trailer' and 'streaming availablity' buttons are click toggle the corresponding container
    $('#trailer-button').click(() => {
        $('#trailer-container').slideToggle("2000");
    });

    $('#streaming-button').click(() => {
        $('#streaming-container').slideToggle("2000");
    });
});