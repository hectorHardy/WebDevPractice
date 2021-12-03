const main = document.getElementById("main") ;
const newMovieDiv = document.getElementById("newMovieDiv") ;
const topRated = document.getElementById("topRated") ;
var api_key = "api_key=aa4bc002b1afb54b32ea4076630282bb" ;
var base_url = "https://api.themoviedb.org/3/" ;
var api_url = base_url + "discover/movie?sort_by=popularity.desc&" + api_key ;
var new_url = base_url + "movie/upcoming?&page=2&" + api_key ;
var top_url = base_url + "movie/top_rated?&" + api_key ;
var img_url = "https://image.tmdb.org/t/p/w500" ;

var watchList = [] ;

window.onload = function(){
    getMovies(api_url, main) ;
    getMovies(new_url, newMovieDiv)
    getMovies(top_url, topRated) ;
}

function getMovies(url, divTag) {
    fetch(url).then(res => res.json()).then(data => {
        console.log(data.results) ;
        showMovies(data.results, divTag) ;
        
    })
}

function showMovies(data, divTag) {
    divTag.innerHTML = '';
    //data = JSON.parse(data);
    data.forEach(movie => {
        var {title, poster_path, vote_average, id} = movie ;
        var movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
                            <img src = "${img_url + poster_path}" alt = "${title}">

                            <div class="movie-info">
                                <h3 id = "${id}" onclick = getMovieId(id)>${title}</h3>
                                <span class = "${getColor(vote_average)}">${vote_average}</span>
                            </div> 
                            `     
                            
                            divTag.appendChild(movieEl) ;
})
}

function getColor(vote) {
    if(vote>=8){
        return "green" ;
    }
    else if(vote>=5){
        return "orange" ;
    }
    else{
        return "red" ;
    }
}

function getMovieId(id) {
    
    console.log(id) ;

    //$('#watchList').empty();

    var id_url = base_url + "movie/" + id + "?" + api_key;
    console.log(id_url) ;
    $.getJSON(id_url, function (jsondata) {
        addResultsDiv(jsondata);
    });

}

function addResultsDiv(jsondata) {
    console.log(jsondata);
    

    var title = jsondata.title;
    var poster = "http://image.tmdb.org/t/p/w500" + jsondata.poster_path;
    var voteAvg = jsondata.vote_average;
    var id = jsondata.id ;

    console.log(title + poster + voteAvg) ;

    var newItem = "<div class = " + 'watchlistItem' + " >" +
            "<img id = 'wListImg' src ='"+ poster +"' alt = " + title + "'>" +

            "<div class='movie-info'>" + 
                "<h3 id = '" + id + "' onclick = getMovieId(id)>" + title + "</h3>" + 
                "<span class = " + getColor(voteAvg) + ">" + voteAvg + "</span>" + 
            "</div></div>"
              
            $('#watchList').append(newItem) ;
}
