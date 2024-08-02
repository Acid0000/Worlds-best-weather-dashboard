const apiKey = 'd7a644ddb1f9a08872fff194a9d95e1e';
const cityInput = document.getElementById('city-input');
const stateInput = document.getElementById('state-input');
const countryInput = document.getElementById('country-input');
const searchButton = document.getElementById('search-button');
const cityList = document.getElementById('city-list');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    const state = stateInput.value.trim();
    const country = countryInput.value.trim();
    getWeather(city, state, country);
});

function quickSearch(city) {
    getWeather(city);
}

function getWeather(city, state = '', country = '') {
    let query = city;
    if (state) query += `,${state}`;
    if (country) query += `,${country}`;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const { coord, name } = data;
            const { lat, lon } = coord;
            displayCurrentWeather(data);
            getForecast(lat, lon);
            saveCity(name);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function getForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error('Error fetching forecast data:', error));
}

function displayCurrentWeather(data) {
    const { name, weather, main, wind } = data;
    const tempFahrenheit = (main.temp - 273.15) * 9/5 + 32; // Convert Kelvin to Fahrenheit
    const windSpeedMPH = wind.speed * 2.237; // Convert m/s to MPH

    currentWeather.innerHTML = `
        <h2>${name}</h2>
        <p>${new Date().toLocaleDateString()}</p>
        <p>${weather[0].description}</p>
        <p>Temp: ${tempFahrenheit.toFixed(2)} °F</p> <!-- Display temperature with two decimal points -->
        <p>Wind: ${windSpeedMPH.toFixed(2)} MPH</p> <!-- Display wind speed with two decimal points -->
        <p>Humidity: ${main.humidity} %</p>
    `;
}

function displayForecast(data) {
    forecast.innerHTML = '';
    data.list.forEach(item => {
        if (item.dt_txt.includes('12:00:00')) {
            const { dt_txt, main, weather, wind } = item;
            const tempFahrenheit = (main.temp - 273.15) * 9/5 + 32; // Convert Kelvin to Fahrenheit
            const windSpeedMPH = wind.speed * 2.237; // Convert m/s to MPH

            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <p>${new Date(dt_txt).toLocaleDateString()}</p>
                <p>${weather[0].description}</p>
                <p>Temp: ${tempFahrenheit.toFixed(2)} °F</p> <!-- Display temperature with two decimal points -->
                <p>Wind: ${windSpeedMPH.toFixed(2)} MPH</p> <!-- Display wind speed with two decimal points -->
                <p>Humidity: ${main.humidity} %</p>
            `;
            forecast.appendChild(forecastItem);
        }
    });
}

function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem('cities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('cities', JSON.stringify(cities));
        displayCities();
    }
}

function displayCities() {
    cityList.innerHTML = '';
    let cities = JSON.parse(localStorage.getItem('cities')) || [];
    cities.forEach(city => {
        const cityItem = document.createElement('li');
        cityItem.textContent = city;
        cityItem.addEventListener('click', () => quickSearch(city));
        cityList.appendChild(cityItem);
    });
}

document.addEventListener('DOMContentLoaded', displayCities);
