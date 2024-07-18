const api_key="3e15a6466362ba9ce54f1a12946e4a8e"

//Convert the kelvin degrees to fah
const fahrenheit = (kelvin) => {
    return ((kelvin - 273.15) * 9/5 + 32).toFixed(2)
}

//requests latitude and longitude from the geo api
const getLatLon = (city) => {
    return new Promise((resolve, reject) => {
        url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${api_key}`;
        fetch(url)
        .then((response) => {
            console.log("recieved reponse for getting lat lon from city name");
            response.json()
            .then((json) => {
                resolve({
                    "lat": json[0].lat,
                    "lon": json[0].lon
                })
            })
        })
    })
}
//gets weather data after requesting lat and lon
const getWeatherData = (lat, lon) => {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`
    return new Promise((resolve, reject) => {
        fetch(url)
        .then((response) => {
            console.log("recieved reponse for getting weather info from city name");
            response.json()
            .then((json) => {
                resolve(json)
            })
        })
    })
}
//renders the main weather card
const renderMainWeather = (weatherJson) => {
    console.log(weatherJson);
    const weatherDays = weatherJson.list;
    const curDay = weatherDays[0];
    const timeStr = dayjs.unix(curDay.dt);
    //format the unix time
    const formattedDate = timeStr.format('M/DD/YYYY');
    const city = weatherJson.city.name;
    const cityTitleEl = document.getElementById("main-city-name");
    cityTitleEl.textContent = city + " (" + formattedDate + ")"
    const mainTempEl = document.getElementById("main-temp");
    mainTempEl.textContent = "temp: " + fahrenheit(curDay.main.temp) + " F";
    const mainWind = document.getElementById("main-wind");
    mainWind.textContent = "wind: " + curDay.wind.speed + " MPH";
    const mainHumidity = document.getElementById("main-humidity");
    mainHumidity.textContent = "humidity: " + curDay.main.humidity + " %";
    const img = document.createElement("img");
    img.src = `https://openweathermap.org/img/wn/${curDay.weather[0].icon}@2x.png`;
    mainWeatherEl = document.getElementById("weather-details");
    const images = mainWeatherEl.getElementsByTagName('img');
    if (images[0]){
        mainWeatherEl.removeChild(images[0]);
    }
    mainWeatherEl.prepend(img);
}
//gets the html element for a 5 day forecast card
const getCard = (day_data) => {
    const timeStr = dayjs.unix(day_data.dt);
    const formattedDate = timeStr.format('M/DD/YYYY');
    const mainData = day_data.main;
    const card = document.createElement("div");
    card.classList.add("box");
    card.classList.add("column");
    card.classList.add("day-forecast");
    let lineItems = [formattedDate, "temp: " + fahrenheit(mainData.temp) + " F", "wind: " + day_data.wind.speed + " MPH", "humidity: ", mainData.humidity + " %"]
    const img = document.createElement("img");
    img.src = `https://openweathermap.org/img/wn/${day_data.weather[0].icon}@2x.png`
    card.appendChild(img);
    for (item of lineItems){
        const bullet = document.createElement("p");
        bullet.classList.add("main-city-detail");
        bullet.classList.add("subtitle");
        bullet.classList.add("is-4");
        bullet.textContent = item;
        card.appendChild(bullet);
    }
    return card;
}
//renders the whole 5 day forecast
const renderFiveDayForecast = (weatherJson) => {
    const weatherDays = weatherJson.list;
    const daysContainer = document.getElementById("days-container")
    daysContainer.innerHTML = '';
    for (j = 0; j += 8; j <= 40){
        const day_data = weatherDays[j]
        if (!day_data){
            //we cannot stride by 8 when we get to the last day so
            //we grab the last
            last_day = weatherDays.slice(-1).pop()
            card = getCard(last_day);
            daysContainer.appendChild(card);
            console.log("ran out of day data");
            break;
        }
        card = getCard(day_data);
        daysContainer.appendChild(card);
    }
}
//render the buttons for recent searches
const renderRecentSearches = () => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches"));
    console.log(recentSearches);
    const searchBar = document.getElementById("search-side-bar");
    const buttons = searchBar.getElementsByTagName('button');
    while (buttons.length > 0) {
        buttons[0].parentNode.removeChild(buttons[0]);
    }
    for (search of recentSearches){
        const btn = document.createElement("button");
        btn.classList.add("button");
        btn.classList.add("is-ghost");
        btn.textContent = search;
        btn.addEventListener('click', (event)=>{
            event.preventDefault();
            newCityLoaded(btn.textContent);
        })
        searchBar.appendChild(btn);
    }
}
//renders the weather data
const render = (weatherJson) => {
    renderMainWeather(weatherJson);
    renderFiveDayForecast(weatherJson);
    renderRecentSearches();
}
//loads a new city
const newCityLoaded = (city) => {
    console.log("newCityLoaded")
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches"))  || [];
    recentSearches.unshift(city);
    recentSearches = [...new Set(recentSearches)];
    localStorage.recentSearches = JSON.stringify(recentSearches);
    getLatLon(city)
    .then(({"lat": lat, "lon": lon}) => {
        getWeatherData(lat, lon)
        .then((weatherJson) => {
            render(weatherJson);
        })
    })
}
//add event listener for the button
const submitFormEl = document.getElementById("search-for-city");
const submitForm = (event) => {
    event.preventDefault();
    const inputEl = document.getElementById("search-for-city");
    const city = inputEl.value;
    newCityLoaded(city);
}
submitFormEl.addEventListener('keypress', function(event){
    if (event.key === "Enter"){
        event.preventDefault();
        submitForm(event);
    }
})
newCityLoaded("San Francisco")