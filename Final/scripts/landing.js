const main = document.getElementById("main") ;
const newMovieDiv = document.getElementById("newMovieDiv") ;
const topRated = document.getElementById("topRated") ;
var api_key = "api_key=aa4bc002b1afb54b32ea4076630282bb" ;
var base_url = "https://api.themoviedb.org/3/" ;
var api_url = base_url + "discover/movie?sort_by=popularity.desc&" + api_key ;
var new_url = base_url + "movie/upcoming?&page=2&" + api_key ;
var top_url = base_url + "movie/top_rated?&" + api_key ;
var img_url = "https://image.tmdb.org/t/p/w500" ;

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
        movieEl.innerHTML = `<img src = "${img_url + poster_path}" alt = "${title}">

                            <div class="movie-info">
                                <h3 id = "${id}">${title}</h3>
                                <span class = "${getColor(vote_average)}">${vote_average}</span>
                            </div> `     
                            
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

