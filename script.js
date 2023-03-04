const apiKey = "8278616794cd3b82d32b9b455c901c29";
const searchButton = document.querySelector("#search-button");
const enterCity = document.querySelector("#enter-city");
const todayWeather = document.querySelector("#today-weather");
const cityName = document.querySelector("#city-name");
const currentPic = document.querySelector("#current-pic");
const temperature = document.querySelector("#temperature");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");
const UVIndex = document.querySelector("#UV-index");
const fiveDayHeader = document.querySelector("#fiveday-header");
const fiveDayForecast = document.querySelector("#five-day-forecast");

searchButton.addEventListener("click", (event) => {
  event.preventDefault();
  const city = enterCity.value;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  axios
    .get(url)
    .then((response) => {
      // Update the UI with the weather data
      todayWeather.classList.remove("d-none");
      cityName.textContent = `${
        response.data.name
      } (${new Date().toLocaleDateString()})`;
      currentPic.setAttribute(
        "src",
        `https://openweathermap.org/img/w/${response.data.weather[0].icon}.png`
      );
      temperature.textContent = `Temperature: ${response.data.main.temp} °C`;
      humidity.textContent = `Humidity: ${response.data.main.humidity}%`;
      windSpeed.textContent = `Wind Speed: ${response.data.wind.speed} km/h`;

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
