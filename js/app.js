document.addEventListener("DOMContentLoaded", function () {

    const iconElement = document.querySelector(".weather-icon");
    const tempElement = document.querySelector(".temperature-value p");
    const descElement = document.querySelector(".temperature-description p");
    const locationElement = document.querySelector(".location p");
    const notificationElement = document.querySelector(".notification");

    //Weather Object and Data
    const weather = {};

    weather.temperature = {
        unit: "celsius"
    };

    //App Constants
    const envVariables = {};

    // ----------------START LOAD APP CONSTANTS---------------
    function getScript(url, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        script.onreadystatechange = callback;
        script.onload = callback;

        document.getElementsByTagName('head')[0].appendChild(script);
    }

    //---------------LOAD KEYS & ENV VARIABLES FROM EXTERNAL FILE---------------
    getScript("./js/config.js", function () {
        envVariables.key = key;
        envVariables.KELVIN = KELVIN;
        document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName('head')[0].lastChild);
    });

    // ----------------END LOAD APP CONSTANTS---------------
    //Temp converter
    function toFahrenheit(c) {
        return parseInt(c * (9 / 5) + 32);
    }

    // GET CURRENT LOCATION
    function getCurrentLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(setPosition, showError);
        } else {
            notificationElement.style.display = "block";
            notificationElement.innerHTML = "<p>Browser does not support geolocation</p>";
        }

        // Set User's postion
        function setPosition(position) {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            getWeather(latitude, longitude);
        }

        //Show error message
        function showError(error) {
            notificationElement.style.display = "block";
            notificationElement.innerHTML = `<p> ${error.message} </p>`;
        }
    }

    function getWeather(latitude, longitude, isName, location) {
        // WEATHER CALL
        var api
        if (!isName) {
            // coordinates api call
            api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${envVariables.key}`;
        } else {
            // name api call
            api = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${envVariables.key}`
        }

        fetch(api)
            .then(function (response) {
                let data = response.json();
                return data;
            })
            .then(function (data) {
                weather.temperature.value = Math.floor(data.main.temp - envVariables.KELVIN);
                weather.description = data.weather[0].description;
                weather.iconId = data.weather[0].icon;
                weather.city = data.name;
                weather.country = data.sys.country;
            })
            .then(function () {
                updateWeatherObject(weather);
                document.getElementById("trigger").style.display = "block";
            }
            );
    }

    // Display weather to UI
    function displayweather(savedWeather) {
        iconElement.innerHTML = `<img src="icons/${savedWeather.iconId}.png"/>`;
        weather.temperature.value = savedWeather.temperature.value;
        tempElement.innerHTML = `${weather.temperature.value}&deg;<span>C</span>`;
        descElement.innerHTML = savedWeather.description;
        locationElement.innerHTML = `${savedWeather.city}, ${savedWeather.country}`;
    }

    // Display weather to UI @ StartUp
    if (window.localStorage) {
        (function () {
            weatherInfoFromLocalStorage = JSON.parse(localStorage.getItem("weather"));
            if (weatherInfoFromLocalStorage) {
                displayweather(weatherInfoFromLocalStorage);
            }
        }());
    }

    // Display weather to UI after search
    function updateWeatherObject(weather) {
        localStorage.clear();
        localStorage.setItem("weather", JSON.stringify(weather));
        weatherInfoFromLocalStorage = JSON.parse(localStorage.getItem("weather"));
        displayweather(weatherInfoFromLocalStorage);
    }

    //COORDINATES WEATHER SEARCH
    document.getElementById("coordinates-search-form").addEventListener("submit", function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        var lat = document.getElementById("lat");
        var lon = document.getElementById("lon");

        var latitude = parseFloat(lat.value);
        var longitude = parseFloat(lon.value);

        lat.value = "";
        lon.value = "";

        getWeather(latitude, longitude, false);
        document.getElementById("coordinateDiv").style.display = "none";
    });

    //NAME WEATHER SEARCH
    document.getElementById("name-search-form").addEventListener("submit", function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        let name = document.getElementById("location");
        let location = name.value;

        getWeather(false, false, true, location);
        document.getElementById("nameDiv").style.display = "none";
    });

    // WEATHER ACCESS OPTION HANDLER
    document.getElementById("weather-access-form").addEventListener("submit", function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        let form = document.getElementById("weather-access-container");
        let SearchOptions = document.getElementById("SearchOptions");

        if (e.submitter.id === "currentLocation") {
            getCurrentLocation();
        } else if (e.submitter.id === "otherLocation") {
            SearchOptions.style.display = "block";
        } else {
            console.log(e.submitter.id);
        }

        form.style.display = "none";
    });

    document.getElementById("SearchOptionsForm").addEventListener("submit", function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        let currentForm = document.getElementById("SearchOptions");
        let nameDiv = document.getElementById("nameDiv");
        let coordinateDiv = document.getElementById("coordinateDiv");

        if (e.submitter.id === "NameSearch") {
            nameDiv.style.display = "block";
        } else if (e.submitter.id === "CordinatesSearch") {
            coordinateDiv.style.display = "block";
        } else {
            console.log(e.submitter.id);
        }

        currentForm.style.display = "none";
    });

    // CELSIUS TO FAHRENHEIT CHANGE HANDLER
    tempElement.addEventListener("click", function (e) {
        var temp = e.target.childNodes[1].innerHTML;
        if (e.target.innerHTML === "- °<span>C</span>") {
            return false;
        }
        else if (temp === "C") {
            var f = toFahrenheit(weather.temperature.value);
            tempElement.innerHTML = `${f}&deg;<span>F</span>`;
        } else if (temp === "F") {
            tempElement.innerHTML = `${weather.temperature.value}&deg;<span>C</span>`;
        } else {
            console.log(e.target);
        }
    });

    document.getElementById("repeatSearch").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("weather-access-container").style.display = "block";
        let currentForm = document.getElementById("trigger");
        currentForm.style.display = "none";
    });
});