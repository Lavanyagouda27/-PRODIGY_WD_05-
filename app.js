/* ==========================================
   WEATHERPRO APP.JS
========================================== */

const API_KEY = "YOUR_OPENWEATHER_API_KEY";

// HTML Elements
const cityInput = document.getElementById("cityInput");
const city = document.getElementById("city");
const temp = document.getElementById("temp");
const description = document.getElementById("description");
const icon = document.getElementById("icon");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const feels = document.getElementById("feels");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const date = document.getElementById("date");
const time = document.getElementById("time");

/* ==========================================
   LIVE DATE & TIME
========================================== */

function updateDateTime(){

const now = new Date();

if(date){

date.innerHTML = now.toDateString();

}

if(time){

time.innerHTML = now.toLocaleTimeString();

}

}

setInterval(updateDateTime,1000);

/* ==========================================
   SEARCH WEATHER
========================================== */

function getWeather(){

if(!cityInput.value){

alert("Enter city name");

return;

}

fetchWeather(cityInput.value);

}

/* ==========================================
   FETCH WEATHER
========================================== */

async function fetchWeather(cityName){

const loader=document.getElementById("loader");

if(loader) loader.style.display="flex";

try{

const response = await fetch(

`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`

);

const data = await response.json();

if(data.cod!="200"){

alert("City Not Found");

return;

}

displayWeather(data);

saveHistory(cityName);

getForecast(cityName);

}
catch(error){

console.log(error);

alert("Unable to fetch weather");

}

if(loader) loader.style.display="none";

}

/* ==========================================
   DISPLAY WEATHER
========================================== */

function displayWeather(data){

if(city){

city.innerHTML = data.name+", "+data.sys.country;

}

if(temp){

temp.innerHTML = Math.round(data.main.temp)+"°C";

}

if(description){

description.innerHTML = data.weather[0].description;

}

if(icon){

icon.src=

`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

}

if(humidity){

humidity.innerHTML=data.main.humidity+" %";

}

if(wind){

wind.innerHTML=data.wind.speed+" km/h";

}

if(pressure){

pressure.innerHTML=data.main.pressure+" hPa";

}

if(visibility){

visibility.innerHTML=(data.visibility/1000)+" km";

}

if(feels){

feels.innerHTML=Math.round(data.main.feels_like)+"°C";

}

if(sunrise){

sunrise.innerHTML=

new Date(data.sys.sunrise*1000).toLocaleTimeString();

}

if(sunset){

sunset.innerHTML=

new Date(data.sys.sunset*1000).toLocaleTimeString();

}

changeBackground(data.weather[0].main);

}
/* ==========================================
   CURRENT LOCATION WEATHER
========================================== */

function getLocationWeather(){

    if(!navigator.geolocation){

        alert("Geolocation is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(successLocation,errorLocation);

}

async function successLocation(position){

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try{

        const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        const data = await response.json();

        displayWeather(data);

        getForecast(data.name);

        getAQI(lat,lon);

        updateMap(lat,lon);

    }

    catch(error){

        console.log(error);

    }

}

function errorLocation(){

    alert("Unable to get your location.");

}

/* ==========================================
   5 DAY FORECAST
========================================== */

async function getForecast(cityName){

    const forecast=document.getElementById("forecast");

    if(!forecast) return;

    forecast.innerHTML="";

    try{

        const response=await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
        );

        const data=await response.json();

        const daily=data.list.filter(item=>
        item.dt_txt.includes("12:00:00"));

        daily.slice(0,5).forEach(day=>{

            const card=document.createElement("div");

            card.className="forecast-card";

            card.innerHTML=`

            <h3>${new Date(day.dt_txt).toLocaleDateString("en-US",{weekday:"short"})}</h3>

            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

            <h2>${Math.round(day.main.temp)}°C</h2>

            <p>${day.weather[0].main}</p>

            `;

            forecast.appendChild(card);

        });

    }

    catch(error){

        console.log(error);

    }

}

/* ==========================================
   AIR QUALITY INDEX
========================================== */

async function getAQI(lat,lon){

    const aqi=document.getElementById("aqi");

    if(!aqi) return;

    try{

        const response=await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        const data=await response.json();

        const level=data.list[0].main.aqi;

        const quality=[
            "",
            "Good",
            "Fair",
            "Moderate",
            "Poor",
            "Very Poor"
        ];

        aqi.innerHTML=quality[level];

    }

    catch(error){

        console.log(error);

    }

}

/* ==========================================
   UPDATE GOOGLE MAP
========================================== */

function updateMap(lat,lon){

    const map=document.getElementById("weatherMap");

    if(!map) return;

    map.src=`https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed`;

}

/* ==========================================
   AUTO LOAD WEATHER
========================================== */

window.addEventListener("load",()=>{

    updateDateTime();

    if(document.getElementById("cityInput")){

        getLocationWeather();

    }

});
/* ==========================================
   FAVORITE CITIES
========================================== */

function addFavorite(){

const input=document.getElementById("favoriteCity");

if(!input) return;

const city=input.value.trim();

if(city==="") return;

let favorites=JSON.parse(localStorage.getItem("favorites"))||[];

if(!favorites.includes(city)){

favorites.push(city);

localStorage.setItem("favorites",JSON.stringify(favorites));

}

input.value="";

loadFavorites();

}

function loadFavorites(){

const list=document.getElementById("favoriteList");

if(!list) return;

list.innerHTML="";

let favorites=JSON.parse(localStorage.getItem("favorites"))||[];

favorites.forEach(city=>{

const btn=document.createElement("button");

btn.className="favorite-city";

btn.innerHTML=city;

btn.onclick=function(){

fetchWeather(city);

};

list.appendChild(btn);

});

}

/* ==========================================
   SEARCH HISTORY
========================================== */

function saveHistory(city){

let history=JSON.parse(localStorage.getItem("history"))||[];

history=history.filter(item=>item!==city);

history.unshift(city);

history=history.slice(0,10);

localStorage.setItem("history",JSON.stringify(history));

displayHistory();

}

function displayHistory(){

const list=document.getElementById("history");

if(!list) return;

list.innerHTML="";

const history=JSON.parse(localStorage.getItem("history"))||[];

history.forEach(city=>{

const li=document.createElement("li");

li.innerHTML=city;

li.onclick=function(){

fetchWeather(city);

};

list.appendChild(li);

});

}

/* ==========================================
   DARK MODE
========================================== */

const themeButton=document.querySelector(".theme-toggle");

if(themeButton){

themeButton.addEventListener("click",()=>{

document.body.classList.toggle("dark-mode");

localStorage.setItem(

"theme",

document.body.classList.contains("dark-mode")?"dark":"light"

);

});

}

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark-mode");

}

/* ==========================================
   VOICE SEARCH
========================================== */

const voiceBtn=document.getElementById("voiceBtn");

if(voiceBtn){

const SpeechRecognition=

window.SpeechRecognition||

window.webkitSpeechRecognition;

if(SpeechRecognition){

const recognition=new SpeechRecognition();

recognition.lang="en-US";

voiceBtn.onclick=function(){

recognition.start();

};

recognition.onresult=function(event){

const cityName=event.results[0][0].transcript;

cityInput.value=cityName;

fetchWeather(cityName);

};

}

}

/* ==========================================
   WEATHER BACKGROUND
========================================== */

function changeBackground(weather){

const body=document.body;

weather=weather.toLowerCase();

if(weather.includes("clear")){

body.style.background="linear-gradient(135deg,#4facfe,#00f2fe)";

}

else if(weather.includes("cloud")){

body.style.background="linear-gradient(135deg,#757f9a,#d7dde8)";

}

else if(weather.includes("rain")){

body.style.background="linear-gradient(135deg,#314755,#26a0da)";

}

else if(weather.includes("snow")){

body.style.background="linear-gradient(135deg,#e6dada,#274046)";

}

else if(weather.includes("thunder")){

body.style.background="linear-gradient(135deg,#141E30,#243B55)";

}

else{

body.style.background="linear-gradient(-45deg,#0f2027,#203a43,#2c5364,#1f1c2c)";

}

}

/* ==========================================
   ENTER KEY SEARCH
========================================== */

if(cityInput){

cityInput.addEventListener("keypress",function(e){

if(e.key==="Enter"){

getWeather();

}

});

}

/* ==========================================
   INITIALIZE APP
========================================== */

window.addEventListener("load",()=>{

updateDateTime();

displayHistory();

loadFavorites();

});