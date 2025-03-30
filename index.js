const apiUrl = "https://api.worldweatheronline.com/premium/v1/weather.ashx?key=YOUR_FREE_KEY&format=json&q=";
        
// For demo purposes, we'll use a mock API response
// In production, you would use the actual API call
async function mockWeatherAPI(city) {
    const mockData = {
        "data": {
            "request": [{"query": city, "type": "City"}],
            "current_condition": [{
                "temp_C": Math.round(Math.random() * 30),
                "humidity": Math.round(Math.random() * 100),
                "windspeedKmph": Math.round(Math.random() * 30),
                "weatherDesc": [{"value": "Sunny"}],
                "weatherIconUrl": [{"value": "☀️"}]
            }]
        }
    };
    return { ok: true, json: () => Promise.resolve(mockData) };
}

// DOM Elements
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const weatherIcon = document.querySelector(".weather-icon");
const themeToggle = document.querySelector("#theme-toggle");
const historyList = document.querySelector("#history-list");
const clearHistoryBtn = document.querySelector(".clear-history-btn");
const weatherCard = document.querySelector(".weather-card");
const errorElement = document.querySelector(".error");

// Weather condition icons mapping
const weatherConditions = {
    "Sunny": "☀️",
    "Cloudy": "☁️",
    "Rain": "🌧️",
    "Drizzle": "🌦️",
    "Thunderstorm": "⛈️",
    "Snow": "❄️",
    "Mist": "🌫️",
    "Clear": "☀️"
};

let searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

// Initialize theme
const currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", currentTheme);
updateThemeButton();

// Event Listeners
searchForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
clearHistoryBtn.addEventListener("click", clearSearchHistory);
document.addEventListener("DOMContentLoaded", loadHistory);

// Form Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (city) {
        await checkWeather(city);
        addToHistory(city);
        searchInput.value = "";
    }
}

// Toggle Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    themeToggle.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// Load Search History
function loadHistory() {
    updateHistoryDisplay();
}

// Add to Search History with array methods
function addToHistory(city) {
    // Filter out duplicates (case insensitive)
    searchHistory = searchHistory.filter(item => 
        item.toLowerCase() !== city.toLowerCase()
    );
    
    // Add to beginning of array
    searchHistory.unshift(city);
    
    // Limit to 5 items using slice
    searchHistory = searchHistory.slice(0, 5);
    
    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
    updateHistoryDisplay();
}

// Clear Search History
function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem("weatherSearchHistory");
    updateHistoryDisplay();
}

// Update History Display with array iteration
function updateHistoryDisplay() {
    historyList.innerHTML = "";
    clearHistoryBtn.style.display = searchHistory.length === 0 ? "none" : "block";

    // Using forEach to iterate through history
    searchHistory.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.addEventListener("click", () => checkWeather(city));
        historyList.appendChild(li);
    });
}

// Weather Check Function
async function checkWeather(city) {
    try {
        // Show loading state
        searchForm.querySelector("button").disabled = true;
        searchForm.querySelector("button").innerHTML = '<span class="loading"></span> Loading...';
        
        // In production, use:
        // const response = await fetch(`${apiUrl}${city}`);
        // For demo, using mock data:
        const response = await mockWeatherAPI(city);
        
        if (!response.ok) throw new Error();
        
        const data = await response.json();
        updateWeatherDisplay(data);
        errorElement.style.display = "none";
        weatherCard.style.display = "block";
    } catch (error) {
        errorElement.style.display = "block";
        weatherCard.style.display = "none";
    } finally {
        searchForm.querySelector("button").disabled = false;
        searchForm.querySelector("button").textContent = "Search";
    }
}

// Update Weather Display
function updateWeatherDisplay(data) {
    const weather = data.data.current_condition[0];
    document.querySelector(".city").textContent = data.data.request[0].query;
    document.querySelector(".temp").textContent = `${weather.temp_C}°C`;
    document.querySelector(".humidity").textContent = weather.humidity;
    document.querySelector(".wind").textContent = weather.windspeedKmph;
    
    // Get weather description and find matching icon
    const weatherDesc = weather.weatherDesc[0].value;
    weatherIcon.textContent = weatherConditions[weatherDesc] || "🌤️";
}

// json-server simulation for local persistence
// To use this, you would need to:
// 1. Install json-server: npm install -g json-server
// 2. Create a db.json file
// 3. Run: json-server --watch db.json
async function saveToServer(data) {
    try {
        await fetch('http://localhost:3000/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.log("Using localStorage fallback");
        localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
    }
}
