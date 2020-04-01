let apiKey="94ad115827be5f934ef5a524648ee25a";

var savedLocations = [];
var currentLoc;

function initialize() {
    //grab previous locations from local storage
    savedLocations = JSON.parse(localStorage.getItem("weathercities"));
}



function showPrevious() {
    //show the previously searched for locations based on what is in local storage
    if (savedLocations) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedLocations.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
            if (savedLocations[i] == currentLoc){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevSearches").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=94ad115827be5f934ef5a524648ee25a&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedLocations));
            initialize();
        }
    }).then(function (response) {
        //create the card
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#earthforecast").append(currCard);

        //add location to card header
        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);


        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        //display city name
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));
        //display last updated
        var currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currdate)));
        //display Temperature
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        //display Humidity
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        //display Wind Speed
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

        //get UV Index
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=94ad115827be5f934ef5a524648ee25a&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            var uvindex = uvresponse.value;
            // for highlighting the value of uv index, uv index is color coded
            var bgcolor;
            if (uvindex <= 3) {
                bgcolor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                bgcolor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange";
            }
            else {
                bgcolor = "red";
            }
            var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
            cardBody.append(uvdisp);

        });

        cardRow.append(textDiv);
        getForecast(response.id);
    });
}

function getForecast(city) {
    //get 5 day forecast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=94ad115827be5f934ef5a524648ee25a&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //add container div for forecast cards
        var newrow = $("<div>").attr("class", "forecast");
        $("#earthforecast").append(newrow);

        //loop through array response to find the forecasts for 15:00
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    //clear all the weather
    $("#earthforecast").empty();
}

function saveLoc(loc){
    //add this to the saved locations array
    if (savedLocations === null) {
        savedLocations = [loc];
    }
    else if (savedLocations.indexOf(loc) === -1) {
        savedLocations.push(loc);
    }
    //save the new array to localstorage
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
    showPrevious();
}

$("#searchbtn").on("click", function () {
    //don't refresh the screen
    event.preventDefault();
    //grab the value of the input field
    var loc = $("#searchinput").val().trim();
    //if loc wasn't empty
    if (loc !== "") {
        //clear the previous forecast
        clear();
        currentLoc = loc;
        saveLoc(loc);
        //clear the search field value
        $("#searchinput").val("");
        //get the new forecast
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLoc = $(this).text();
    showPrevious();
    getCurrent(currentLoc);
});

initialize();


// my notes

// var movies = ["The Matrix", "The Notebook", "Mr. Nobody", "The Lion King"];
//       // displayMovieInfo function re-renders the HTML to display the appropriate content
//       function getMovieInfo() {
//         var movie = $(this).attr("data-name");      // The Notebook
//         var queryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=trilogy";
//         // Creates AJAX call for the specific movie button being clicked
//         $.ajax({
//           url: queryURL,
//           method: "GET"
//         }).then(function (res) {
//           // console.log(response)
//           // YOUR CODE GOES HERE!!!
//           let movieObj = {};
//           // * Movie Poster
//           movieObj.moviePoster = res.Poster;
//           // * Rating
//           movieObj.rating = res.Ratings[1];
//           // * Release Date
//           movieObj.releaseDate = res.Released;
//           // * Plot
//           movieObj.plot = res.Plot;
//           movieObj.title = res.Title;
//           // console.log(movieObj)
//           renderCard(movieObj)
//         });
//       }
//       // Function for displaying movie cards
//       function renderCard(movie) {
//         $("#movies-view").empty();
//         // Card from Bootstrap interpolation
//         let cardInterpolation = $(`
//         <div class="card">
//            <img class="card-img-top" src=${movie.moviePoster} alt=${movie.title}>
//            <div class="card-body">
//                <h5 class="card-title">${movie.title}</h5>
//                <p class="card-text">${movie.plot}</p>
//            </div>
//         </div>`
//         );
//         // let movieCard = $("<div>");
//         // movieCard.addClass("card");
//         // let img = $("<img>");
//         // img.addClass("card-img-top");
//         // img.attr("src", movie.moviePoster);
//         // img.attr("alt", "movie poster");
//         // movieCard.append(img);
//         // let cardBody = $("<div>");
//         // cardBody.addClass("card-body");
//         // let cardTitle = $("<h5>").addClass("card-title").text(movie.title)
//         // let cardText = $("<p>").addClass("card-text").text(movie.plot);
//         // cardBody.append(cardTitle);
//         // cardBody.append(cardText);
//         // movieCard.append(cardBody);
//         $("#movies-view").append(cardInterpolation);
//         // $("#movies-view").append(movieCard);
//       };
