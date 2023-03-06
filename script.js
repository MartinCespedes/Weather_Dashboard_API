//Declare a variable to store the searched city
let city="";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");
var sCity=[];
// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up the API key
var APIKey="8278616794cd3b82d32b9b455c901c29";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

       //Dta object from server side Api for icon property.
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        // Display the Humidity
        $(currentHumidty).html(response.main.humidity+"%");
        //Display Wind speed and convert to MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

      // Fetch UV index data
      const lat = response.data.coord.lat;
      const lon = response.data.coord.lon;
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      return axios.get(uvUrl);
    })
    .then((response) => {
      // Update the UI with the UV index data
      const uvIndex = response.data.value;
      let uvSeverity = "";

      if (uvIndex < 3) {
        uvSeverity = "low";
      } else if (uvIndex < 6) {
        uvSeverity = "moderate";
      } else if (uvIndex < 8) {
        uvSeverity = "high";
      } else if (uvIndex < 11) {
        uvSeverity = "very high";
      } else {
        uvSeverity = "extreme";
      }

      UVIndex.textContent = `UV Index: ${uvIndex} (${uvSeverity})`;

      // Fetch 5-day forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
      return axios.get(forecastUrl);
    })
    .then((response) => {
      // Update the UI with the 5-day forecast data
      fiveDayHeader.classList.remove("d-none");
      fiveDayForecast.innerHTML = "";

      for (let i = 0; i < response.data.list.length; i += 8) {
        const forecastDate = new Date(response.data.list[i].dt_txt);
        const forecastDay = forecastDate.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const forecastIcon = response.data.list[i].weather[0].icon;
        const forecastTemp = response.data.list[i].main.temp;
        const forecastHumidity = response.data.list[i].main.humidity;

        const forecastElement = document.createElement("div");
        forecastElement.classList.add(
          "col-md-2",
          "forecast",
          "bg-primary",
          "text-white",
          "m-2",
          "rounded"
        );
        forecastElement.innerHTML = `
          <h5>${forecastDay}</h5>
          <img src="https://openweathermap.org/img/w/${forecastIcon}.png" alt="${response.data.list[i].weather[0].description}">
          <p>Temp: ${forecastTemp} °C</p>
          <p>Humidity: ${forecastHumidity}%</p>
        `;
        fiveDayForecast.appendChild(forecastElement);
      }
    })
    .catch((error) => {
      console.error(error);
    });
});
