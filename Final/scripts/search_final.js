// When document is loaded
const apiKey = "16c416000d15a81b6baaeb7641ed1b26"
const poster_path_base = "https://image.tmdb.org/t/p/original"

// Helper function to insert movies to the results container

function insertMovie(movie){ // Movie object parameter
    var redirect_url = "profile_final.html?movie_id=" + movie.id;
    // Generate and store the full path to the movie's poster if the unique poster path is not null
    var full_poster_path = (movie.poster_path !== null) ? poster_path_base + movie.poster_path : "";
    // Create the external container with the corresponding class for styling
    var movie_container = $('<div/>').attr('class', 'outside-container');
    // Create the internal html string using the HTML <table> tag
    $(movie_container).html(`
                            <div class="inside-container">
                                <div class="movie-image">
                                    <img src=${full_poster_path} style="object-fit: contain; height: 160px;">
                                </div>
                                <div class="movie-description">
                                    <table style="height: 100%">
                                        <tr>
                                            <td class="title"><a href=${redirect_url}>${movie.title}</a></td>                                            
                                        </tr>
                                        <tr>                                            
                                            <td><div class="overview">${movie.overview}</div></td>
                                        </tr>
                                        <tr>
                                            <td>Rating: ${movie.vote_average}</td>
                                        </tr>
                                        <tr>
                                            <td style="vertical-align: bottom">Release date: ${movie.release_date}
                                        </tr>
                                    </table>
                                </div>
                                <button id="add-button">Add</button>                                
                            </div>
                            `);
    $('#results').append(movie_container); // Append the container with the movie details to the results container
}; // End of helper function

// Helper function to query the ID of a crew or cast member
function getId(name, key, callback){
    $.ajax({
        type: "GET",
        url: "https://api.themoviedb.org/3/search/person?api_key=" + apiKey + "&language=en-US&page=1&include_adult=false&",
        data: "query=" + name,
        success: function(data){
            if(data.results.length != 0){ // Check if there was any match
                $('#' + key).removeClass("not-found");
                callback(data.results[0].id) // Using the first result   
            } else {
                $('#' + key).addClass("not-found");
            };     
        } // End of success function
    }); // End of API call
}; // End of function

// Helper function to query suggestions for either crew or cast
function getSuggestions(value, callback){
    $.ajax({
        type: "GET",
        url: "https://api.themoviedb.org/3/search/person?api_key=" + apiKey + "&language=en-US&page=1&include_adult=false&",
        data: "query=" + value,
        success: callback // pass the return values to the callback function
    }); // End of API call
}; // End of function

$(document).ready(function() { // Event listener for when the document is loaded
    // API call to query available genres
    $.ajax({
        type: "GET",
        cache: true,
        url: "https://api.themoviedb.org/3/genre/movie/list",
        data: {
            api_key: apiKey,
            language: "en-US"
        },
        success: function(data){
            // Iterate over response object and insert values to the select field in the HTML document
            for(var i = 0; i < data.genres.length; i++){
                $('#genre').append("<option value='" + data.genres[i].id + "'>" + data.genres[i].name + "</option");
            }; // End of for loop
        } // End of success function 
    }) // End of API call
    
    $('#advanced-search').hide(); // Hide the advanced search box by default

    $('#with_crew').on("input", function(){ // Function that executes when the user interacts with the directors input field
       if($('#with_crew').val() === ""){return};
       var value = $('#with_crew').val(); // Store the current value in a variable
       getSuggestions(value, function(data) { // Call the 'getSuggestions' function and pass it the value and the callback function
            $('#directors').empty(); // Empty the corresponding Datalist
            // Using a for loop fill the Datalist with the new values
            for(var i = 0; i < data.results.length / 2; i++){
                $('#directors').append($("<option></option").text(data.results[i].name));
            }; // End of for loop
        }); // End of callback function
    });    

    $('#with_cast').on("input", function(){ // Function that executes when the user interacts with the cast input field
        if($('#with_cast').val() === ""){return};
        var value = $('#with_cast').val(); // Store the current value in a variable
        getSuggestions(value, function(data) { // Call the 'getSuggestions' function and pass it the value and the callback function
            $('#cast').empty(); // Empty the corresponding Datalist
            // Using a for loop fill the Datalist with the new values
            for(var i = 0; i < data.results.length / 2; i++){
                $('#cast').append($("<option></option").text(data.results[i].name));
            }; // End of for loop
        }); // End of callback function    
     });

    $("#showAdvancedBtn").click( () => { // Event listener for when the advanced search button is clicked
        $('#advanced-search').slideToggle(); // Show or hide the advanced search menu
        // Change the text on the button accordingly, as well enable or disable the input box for the title
        if($('#showAdvancedBtn').html() === "Show advanced search"){
            $('#showAdvancedBtn').html("Hide advanced search") & $('#title').prop("disabled", true).val("");
            $('#year').on('input', function() {
                $(this).next('#year_value').html(this.value);
              });
        } else {
            $('#showAdvancedBtn').html("Show advanced search") & $('#title').prop("disabled", false);
        }

        return false;
    });

    $('#searchButton').click(() => { // Event listener for when the search button is being clicked
        $('#results').empty(); // erase previous results

        /*
        The user will be able to search either by only title or by using the advanced
        options. Hence there are two scenarios that can happen when the srach button is pressed
        */

        if ($('#title').val() !== ""){ // Defines searching by title, if the title input field is not empty
            var title = $('#title').val(); // Save user input from the title input box in a variable
            $.getJSON("https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&language=en-US&page=1&include_adult=false&query=" + title, function(data) {
                data.results.forEach(movie => {
                    insertMovie(movie); // Calling the 'insertMovie' helper function passing it each movie object
                });
            }); 
        } else {
            var search_parameters = $('form').serializeArray(); // Get the values from the form as a list of objects
            var querydata = {}; // An object that will hold the cleaned down parameters for the query
            search_parameters.forEach(parameter => { // Iterate through the value objects
                var key = parameter.name
                var value = parameter.value
                // If the user entered either a director or a cast member use the helper function to obtain the corresponding ID
                if((key == "with_crew" & value != "") | (key == "with_cast" & value != "")){
                    getId(value, key, function(id) {
                        querydata[key] = id; // Callback function to add crew ID to the key
                    });
                } else {
                    querydata[key] = value; // Assign the value to the key
                }; // End of if statement
            }) // End of for loop

            setTimeout(() => { // API call to get the matching movies with a .5s delay to wait for the ID query
                $.ajax({
                    type: "GET",
                    url: "https://api.themoviedb.org/3/discover/movie?api_key=" + apiKey + "&sort_by=popularity.desc$page=1",
                    cache: false,
                    data: querydata, // Use the cleaned data that contains the IDs if crew members were specified
                    success: function(data) {
                        data.results.forEach(movie => { // For each matched movie, pass the movie to the helper function to insert it to the results container
                            insertMovie(movie);
                        }); // End of for loop
                    } // End of function
                }) // End of API call
            }, 500); // End of function            
        }; 
    });
});