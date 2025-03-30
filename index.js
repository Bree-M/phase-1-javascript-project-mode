const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorElement = document.getElementById('error-message');
const weatherCard = document.getElementById('weather-card');
const unitToggleBtn = document.getElementById('unit-toggle-btn');

// Weather data elements
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temperature');
const weatherIcon = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('weather-description');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');

// State
let useCelsius = true;
let currentWeatherData = null;
let backgroundInterval;

// API Configuration
const apiKey = '8f20807cea52eed92572aea82df038d5'; // Free-tier API key
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

// Background images (weather-themed)
const backgrounds = [
    "url('https://images.unsplash.com/photo-1601134467661-3d775b999c8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
    "url('https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
    "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
    "url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
    "url('https://images.unsplash.com/photo-1563974318767-a4de855d7b43?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
    "url('https://images.unsplash.com/photo-1504253163759-c23fccaebb55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
];

// Event Listeners
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchWeather();
    }
});
unitToggleBtn.addEventListener('click', toggleTemperatureUnit);

// Initialize
checkDarkModePreference();
startBackgroundRotation();

// Functions
function startBackgroundRotation() {
    // Set initial background
    changeBackground();
    
    // Change background every minute (60000 milliseconds)
    backgroundInterval = setInterval(changeBackground, 60000);
}

function changeBackground() {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    document.body.style.backgroundImage = backgrounds[randomIndex];
}

async function fetchWeather() {
    const city = cityInput.value.trim();
    
    // Clear previous results
    weatherCard.style.display = 'none';
    errorElement.style.display = 'none';
    errorElement.textContent = '';
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    // Show loading state
    searchBtn.disabled = true;
    const originalText = searchBtn.textContent;
    searchBtn.innerHTML = '<span class="loading"></span> Loading...';
    
    try {
        currentWeatherData = await getWeatherData(city);
        displayWeather(currentWeatherData);
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    } finally {
        // Reset button state
        searchBtn.disabled = false;
        searchBtn.textContent = originalText;
    }
}

async function getWeatherData(city) {
    try {
        const response = await fetch(`${apiUrl}?q=${city}&units=metric&appid=${apiKey}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling.');
            } else {
                throw new Error(`API request failed with status ${response.status}`);
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather:", error);
        throw new Error("Could not connect to weather service. Please try again later.");
    }
}

function displayWeather(data) {
    // Location
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    
    // Date
    const date = new Date(data.dt * 1000);
    dateElement.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Temperature
    updateTemperatureDisplay();
    
    // Weather icon
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].main;
    
    // Weather description
    weatherDesc.textContent = data.weather[0].description;
    
    // Details
    humidityElement.textContent = `${data.main.humidity}%`;
    windElement.textContent = `${data.wind.speed} m/s`;
    pressureElement.textContent = `${data.main.pressure} hPa`;
    visibilityElement.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Show weather card
    weatherCard.style.display = 'block';
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;
    
    const temp = useCelsius 
        ? currentWeatherData.main.temp 
        : (currentWeatherData.main.temp * 9/5) + 32;
    tempElement.textContent = `${Math.round(temp)}°${useCelsius ? 'C' : 'F'}`;
}

function toggleTemperatureUnit() {
    useCelsius = !useCelsius;
    unitToggleBtn.textContent = useCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';
    
    // Update temperature display if we have weather data
    if (currentWeatherData) {
        updateTemperatureDisplay();
    }
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function checkDarkModePreference() {
    // Check for dark mode preference in localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

