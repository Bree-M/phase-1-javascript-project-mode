const apiKey = "1156cdfb54b177fb904e9ff97e4dd89c";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// DOM Elements
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const weatherIcon = document.querySelector(".weather-icon");
const themeToggle = document.querySelector("#theme-toggle");
const historyList = document.querySelector("#history-list");
const clearHistoryBtn = document.createElement("button");

let searchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

// Initialize theme
const currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", currentTheme);
updateThemeButton();

// Create Clear History Button
clearHistoryBtn.textContent = ":wastebasket: Clear History";
clearHistoryBtn.classList.add("clear-history-btn");
clearHistoryBtn.addEventListener("click", clearSearchHistory);
document.querySelector(".search-history").appendChild(clearHistoryBtn);

// Create and add footer
const footer = document.createElement('footer');
footer.innerHTML = ' :heart: ~R';
document.body.appendChild(footer);

// Event Listeners
searchForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
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
    themeToggle.textContent = currentTheme === "dark" ? ":sunny: Light Mode" : ":crescent_moon: Dark Mode";
}

// Load Search History
function loadHistory() {
    updateHistoryDisplay();
}

// Add to Search History
function addToHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
        updateHistoryDisplay();
    }
}

// Clear Search History
function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem("weatherSearchHistory");
    updateHistoryDisplay();
}

// Update History Display
function updateHistoryDisplay() {
    historyList.innerHTML = "";
    if (searchHistory.length === 0) {
        clearHistoryBtn.style.display = "none";
    } else {
        clearHistoryBtn.style.display = "block";
    }

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
        const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);

        if (!response.ok) throw new Error("City not found");

        const data = await response.json();
        updateWeatherDisplay(data);
        document.querySelector(".error").style.display = "none";
        document.querySelector(".weather").style.display = "block";
    } catch (error) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
}

// Update Weather Display
function updateWeatherDisplay(data) {
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent = `${Math.round(data.main.temp)}°C`;
    document.querySelector(".humidity").textContent = `${data.main.humidity}%`;
    document.querySelector(".wind").textContent = `${data.wind.speed} km/h`;

    const weatherConditions = {
        Clouds: "assets/clouds.png",
        Clear: "assets/clear.png",
        Rain: "assets/rain.png",
        Drizzle: "assets/drizzle.png",
        Mist: "assets/mist.png",
        Snow: "assets/snow.png",
        Thunderstorm: "assets/thunderstorm.png"
    };

    weatherIcon.src = weatherConditions[data.weather[0].main] || "assets/clear.png";
}
