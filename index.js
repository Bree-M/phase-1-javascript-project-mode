const backgrounds = [
  "url('https://i.pinimg.com/474x/bf/fb/62/bffb625a2aeea1b629cde597850bd2c6.jpg')",
  "url('https://i.pinimg.com/474x/13/7a/fd/137afde9ec0f667faf351837e99fe1f0.jpg')",
  "url('https://i.pinimg.com/236x/c5/84/c4/c584c4dbc14ad4434fe113335ee74fa7.jpg')",
  "url('https://i.pinimg.com/236x/ed/78/09/ed7809d298eb7f1c09f4525bd13e2a31.jpg')",
  "url('https://i.pinimg.com/236x/8a/af/5e/8aaf5e02a1c45b845a6080ba77d68ebe.jpg')"
];

let currentBgIndex = 0;

function rotateBackground() {
  document.body.style.backgroundImage = backgrounds[currentBgIndex];
}

// Initialize background
rotateBackground();

// Background control buttons
document.getElementById('prev-bg').addEventListener('click', () => {
  currentBgIndex = (currentBgIndex - 1 + backgrounds.length) % backgrounds.length;
  rotateBackground();
});

document.getElementById('next-bg').addEventListener('click', () => {
  currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
  rotateBackground();
});

// Tab functionality
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
      // Remove active class from all buttons and content
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
  });
});

// Weather API functionality with CORS proxy
async function getAviationWeather(icao) {
  try {
      // Using a CORS proxy to avoid issues
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const apiUrl = `https://aviationweather.gov/cgi-bin/data/dataserver.php?datasource=metars&format=json&stationString=${icao}&hoursBeforeNow=2`;
      
      const response = await fetch(proxyUrl + apiUrl, {
          headers: {
              'X-Requested-With': 'XMLHttpRequest'
          }
      });
      
      const data = await response.json();
      
      if(!data.data || !data.data.METAR || data.data.METAR.length === 0) {
          throw new Error("No weather data available for this airport");
      }
      
      const metar = data.data.METAR[0];
      return {
          station: metar.station_id,
          name: getAirportName(metar.station_id),
          raw: metar.raw_text,
          temperature: metar.temp_c,
          wind: {
              direction: metar.wind_dir_degrees,
              speed: metar.wind_speed_kt,
              gusts: metar.wind_gust_kt
          },
          visibility: metar.visibility_statute_mi,
          conditions: metar.flight_category,
          humidity: metar.dewpoint_c ? `${Math.round(100 - 5 * (metar.temp_c - metar.dewpoint_c))}%` : 'N/A',
          pressure: metar.altim_in_hg ? `${metar.altim_in_hg} inHg` : 'N/A',
          clouds: metar.clouds ? metar.clouds.map(c => ({
              type: c.code,
              height: c.base_feet_agl
          })) : [],
          timestamp: new Date().toISOString()
      };
  } catch (error) {
      console.error("Error fetching aviation weather:", error);
      throw error;
  }
}

function getAirportName(icao) {
  // Simple mapping - in a real app you'd want a more comprehensive list
  const airportNames = {
      'KLAX': 'Los Angeles International',
      'KJFK': 'John F. Kennedy International',
      'KSFO': 'San Francisco International',
      'KORD': "Chicago O'Hare International",
      'KDEN': 'Denver International',
      'KDFW': 'Dallas/Fort Worth International',
      'KATL': 'Hartsfield-Jackson Atlanta International',
      'KSEA': 'Seattle-Tacoma International',
      'KIAD': 'Washington Dulles International',
      'KBOS': 'Logan International'
  };
  
  return airportNames[icao] || icao;
}

document.getElementById('search-btn').addEventListener('click', async function() {
  const icaoCode = document.getElementById('icao-code').value.trim().toUpperCase();
  const errorElement = document.getElementById('error-message');
  const weatherInfo = document.getElementById('weather-info');
  
  // Clear previous results
  weatherInfo.style.display = 'none';
  errorElement.style.display = 'none';
  errorElement.textContent = '';
  
  if (!icaoCode || icaoCode.length !== 4) {
      errorElement.textContent = 'Please enter a valid 4-letter ICAO code (e.g., KLAX)';
      errorElement.style.display = 'block';
      return;
  }
  
  // Show loading state
  this.disabled = true;
  const originalText = this.textContent;
  this.innerHTML = '<span class="loading"></span> Loading...';
  
  try {
      const weather = await getAviationWeather(icaoCode);
      
      // Update UI with weather data
      document.getElementById('airport-name').textContent = `${weather.name} (${weather.station})`;
      document.getElementById('temperature').textContent = `${weather.temperature}°C`;
      
      let windText = `${weather.wind.direction}° at ${weather.wind.speed}kts`;
      if (weather.wind.gusts) {
          windText += ` gusting ${weather.wind.gusts}kts`;
      }
      document.getElementById('wind').textContent = windText;
      
      document.getElementById('conditions').textContent = weather.conditions;
      document.getElementById('humidity').textContent = weather.humidity;
      document.getElementById('pressure').textContent = weather.pressure;
      document.getElementById('visibility').textContent = `${weather.visibility} miles`;
      document.getElementById('raw-metar').textContent = weather.raw;
      document.getElementById('weather-timestamp').textContent = `Last updated: ${new Date(weather.timestamp).toLocaleString()}`;
      
      // Show weather info
      weatherInfo.style.display = 'block';
      
  } catch (error) {
      console.error('Error fetching weather:', error);
      errorElement.textContent = error.message || 'Failed to fetch weather data. Please check the ICAO code and try again.';
      errorElement.style.display = 'block';
  } finally {
      // Reset button state
      this.disabled = false;
      this.textContent = originalText;
  }
});

// Flight data functions
function generateRandomFlights(count) {
  const airlines = [
      { name: "American Airlines", code: "AA" },
      { name: "Delta Air Lines", code: "DL" },
      { name: "United Airlines", code: "UA" },
      { name: "Southwest Airlines", code: "WN" },
      { name: "Lufthansa", code: "LH" },
      { name: "Emirates", code: "EK" },
      { name: "Singapore Airlines", code: "SQ" },
      { name: "Qatar Airways", code: "QR" },
      { name: "British Airways", code: "BA" },
      { name: "Air France", code: "AF" }
  ];

  const airports = [
      "KLAX", "KJFK", "KORD", "KDEN", "KSFO", 
      "KDFW", "KATL", "KSEA", "KIAD", "KBOS",
      "EGLL", "LFPG", "EDDF", "OMDB", "RJAA"
  ];

  const statuses = [
      { text: "On Time", type: "ontime" },
      { text: "Delayed", type: "delayed" },
      { text: "Cancelled", type: "cancelled" },
      { text: "Boarding", type: "boarding" },
      { text: "Departed", type: "departed" },
      { text: "Landed", type: "landed" }
  ];

  const flights = [];

  for (let i = 0; i < count; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = `${airline.code}${Math.floor(Math.random() * 2000) + 100}`;
      
      let origin, destination;
      do {
          origin = airports[Math.floor(Math.random() * airports.length)];
          destination = airports[Math.floor(Math.random() * airports.length)];
      } while (origin === destination);

      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate random departure time (within next 24 hours)
      const depHours = Math.floor(Math.random() * 24);
      const depMinutes = Math.floor(Math.random() * 60);
      const departureTime = `${depHours.toString().padStart(2, '0')}:${depMinutes.toString().padStart(2, '0')}`;

      // Calculate flight duration (1-6 hours for demo purposes)
      const flightDurationMinutes = Math.floor(Math.random() * 300) + 60;
      
      // Calculate arrival time
      const depTimeInMinutes = depHours * 60 + depMinutes;
      const arrTimeInMinutes = depTimeInMinutes + flightDurationMinutes;
      
      const arrHours = Math.floor(arrTimeInMinutes / 60) % 24;
      const arrMinutes = arrTimeInMinutes % 60;
      const arrivalTime = `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;

      // Format duration as "Xh Ym"
      const durationHours = Math.floor(flightDurationMinutes / 60);
      const durationMinutes = flightDurationMinutes % 60;
      const flightDuration = `${durationHours}h ${durationMinutes}m`;

      const gate = `Gate ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}${Math.floor(Math.random() * 30) + 1}`;
      
      // Determine if flight is international (simple check if first letter differs)
      const isInternational = origin[0] !== destination[0];
      
      flights.push({
          number: flightNumber,
          airline: airline.name,
          origin: origin,
          destination: destination,
          status: status.text,
          statusType: status.type,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          duration: flightDuration,
          isInternational: isInternational,
          gate: gate
      });
  }

  // Sort by departure time
  return flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

function renderFlights(flights) {
  const flightsContainer = document.getElementById('flights-info');
  if (!flightsContainer) {
      console.error('Flight container not found');
      return;
  }
  
  flightsContainer.innerHTML = '';
  
  if (flights.length === 0) {
      flightsContainer.innerHTML = '<p>No flights found</p>';
      return;
  }
  
  flights.forEach(flight => {
      const flightElement = document.createElement('div');
      flightElement.className = 'flight-item';
      
      const statusClass = `status-${flight.statusType}`;
      const intlBadge = flight.isInternational ? '<span class="intl-badge">INTL</span>' : '';
      
      flightElement.innerHTML = `
          <div class="flight-header">
              <span class="flight-number">${flight.number}</span>
              ${intlBadge}
              <span class="airline">${flight.airline}</span>
          </div>
          <div class="flight-route">
              <span class="airport">${flight.origin}</span> 
              <span class="route-arrow">→</span> 
              <span class="airport">${flight.destination}</span>
          </div>
          <div class="flight-times">
              <span class="time-block">
                  <span class="time-label">Dep:</span>
                  <span class="departure-time">${flight.departureTime}</span>
              </span>
              <span class="time-block">
                  <span class="time-label">Arr:</span>
                  <span class="arrival-time">${flight.arrivalTime}</span>
              </span>
              <span class="time-block">
                  <span class="time-label">Dur:</span>
                  <span class="duration">${flight.duration}</span>
              </span>
          </div>
          <div class="flight-details">
              <span class="flight-gate">${flight.gate}</span>
              <span class="flight-status ${statusClass}">${flight.status}</span>
          </div>
      `;
      
      flightsContainer.appendChild(flightElement);
  });
}

// Pilot briefing functionality
async function fetchAviationWeather(departure, destination) {
  try {
      // In a real implementation, you would call an actual aviation weather API here
      console.log(`Fetching weather for ${departure} to ${destination}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with real API response
      return {
          timestamp: new Date().toISOString(),
          departure: {
              icao: departure,
              name: getAirportName(departure),
              metar: {
                  raw: `${departure} 301751Z 12012G20KT 10SM FEW030 SCT250 22/18 A2992`,
                  wind: {
                      direction: 120,
                      speed: 12,
                      gusts: 20,
                      unit: 'KT'
                  },
                  visibility: 10,
                  clouds: [
                      { type: 'FEW', height: 3000 },
                      { type: 'SCT', height: 25000 }
                  ],
                  temperature: 22,
                  dewpoint: 18,
                  altimeter: 29.92,
                  units: {
                      temperature: 'C',
                      altimeter: 'inHg',
                      visibility: 'SM'
                  }
              },
              taf: {
                  raw: `${departure} 301700Z 3018/0118 12012G20KT P6SM FEW030 SCT250 FM302000 13015G25KT P6SM SCT040 BKN080 TEMPO 3020/3023 5SM -SHRA BKN030CB FM010000 14010KT P6SM SCT040 OVC100`
              }
          },
          destination: {
              icao: destination,
              name: getAirportName(destination),
              metar: {
                  raw: `${destination} 301753Z 25008KT 10SM FEW250 28/12 A2995`,
                  wind: {
                      direction: 250,
                      speed: 8,
                      gusts: null,
                      unit: 'KT'
                  },
                  visibility: 10,
                  clouds: [
                      { type: 'FEW', height: 25000 }
                  ],
                  temperature: 28,
                  dewpoint: 12,
                  altimeter: 29.95,
                  units: {
                      temperature: 'C',
                      altimeter: 'inHg',
                      visibility: 'SM'
                  }
              },
              taf: {
                  raw: `${destination} 301720Z 3018/0118 25008KT P6SM FEW250 FM010300 VRB03KT P6SM SKC`
              }
          },
          hazards: [
              'Moderate turbulence below 10,000ft along route',
              'Possible icing between 8,000-12,000ft near waypoint XYZ',
              'Thunderstorms forecast near destination after 00Z'
          ],
          routeWeather: {
              summary: 'VFR conditions along most of route with isolated buildups near destination',
              freezingLevel: '12,000ft',
              turbulence: 'Light to moderate below 10,000ft',
              icing: 'Possible between 8,000-12,000ft in clouds'
          }
      };
  } catch (error) {
      console.error('Error fetching aviation weather:', error);
      throw error;
  }
}

function displayWeatherData(data) {
  const display = document.getElementById('weatherDisplay');
  
  // Format the data for pilot needs
  let html = `
      <div class="timestamp">Last updated: ${new Date(data.timestamp).toLocaleString()}</div>
      <button class="btn btn-secondary" onclick="refreshBriefing()">Refresh Briefing</button>
      
      <div class="airport-weather">
          <h3>${data.departure.name} (${data.departure.icao}) - Departure</h3>
          <p><strong>METAR:</strong> ${data.departure.metar.raw}</p>
          <p><strong>Wind:</strong> ${data.departure.metar.wind.direction}° at ${data.departure.metar.wind.speed}kts${data.departure.metar.wind.gusts ? ' gusting '+data.departure.metar.wind.gusts+'kts' : ''}</p>
          <p><strong>Visibility:</strong> ${data.departure.metar.visibility} ${data.departure.metar.units.visibility}</p>
          <p><strong>Clouds:</strong> ${formatClouds(data.departure.metar.clouds)}</p>
          <p><strong>Temp/Dewpoint:</strong> ${data.departure.metar.temperature}°C / ${data.departure.metar.dewpoint}°C</p>
          <p><strong>Altimeter:</strong> ${data.departure.metar.altimeter} ${data.departure.metar.units.altimeter}</p>
          <h4>TAF:</h4>
          <pre>${data.departure.taf.raw}</pre>
      </div>
      
      <div class="airport-weather">
          <h3>${data.destination.name} (${data.destination.icao}) - Destination</h3>
          <p><strong>METAR:</strong> ${data.destination.metar.raw}</p>
          <p><strong>Wind:</strong> ${data.destination.metar.wind.direction}° at ${data.destination.metar.wind.speed}kts${data.destination.metar.wind.gusts ? ' gusting '+data.destination.metar.wind.gusts+'kts' : ''}</p>
          <p><strong>Visibility:</strong> ${data.destination.metar.visibility} ${data.destination.metar.units.visibility}</p>
          <p><strong>Clouds:</strong> ${formatClouds(data.destination.metar.clouds)}</p>
          <p><strong>Temp/Dewpoint:</strong> ${data.destination.metar.temperature}°C / ${data.destination.metar.dewpoint}°C</p>
          <p><strong>Altimeter:</strong> ${data.destination.metar.altimeter} ${data.destination.metar.units.altimeter}</p>
          <h4>TAF:</h4>
          <pre>${data.destination.taf.raw}</pre>
      </div>
      
      <div class="weather-hazards">
          <h3>Flight Hazards</h3>
          <ul>
              ${data.hazards.map(h => `<li class="hazard-item">${h}</li>`).join('')}
          </ul>
      </div>
      
      <div class="airport-weather">
          <h3>Route Weather Summary</h3>
          <p><strong>Overall:</strong> ${data.routeWeather.summary}</p>
          <p><strong>Freezing Level:</strong> ${data.routeWeather.freezingLevel}</p>
          <p><strong>Turbulence:</strong> ${data.routeWeather.turbulence}</p>
          <p><strong>Icing Potential:</strong> ${data.routeWeather.icing}</p>
      </div>
  `;
  
  display.innerHTML = html;
}

function formatClouds(clouds) {
  if (!clouds || clouds.length === 0) return 'Sky clear';
  return clouds.map(c => `${c.type} at ${c.height}ft`).join(', ');
}

function refreshBriefing() {
  const departure = prompt('Enter departure ICAO code:', 'KJFK');
  const destination = prompt('Enter destination ICAO code:', 'KLAX');
  
  if (departure && destination) {
      fetchAviationWeather(departure, destination)
          .then(data => {
              displayWeatherData(data);
          })
          .catch(error => {
              console.error('Error refreshing briefing:', error);
              document.getElementById('weatherDisplay').innerHTML = 
                  '<p class="error">Failed to refresh briefing. Please try again.</p>';
          });
  }
}

// Initialize with random flights when page loads
document.addEventListener('DOMContentLoaded', () => {
  let flightsData = generateRandomFlights(15);
  renderFlights(flightsData);
  
  // Enter key handler for weather search
  document.getElementById('icao-code').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          document.getElementById('search-btn').click();
      }
  });
  
  // Flight search functionality
  document.getElementById('search-flight-btn').addEventListener('click', () => {
      const query = document.getElementById('flight-search').value.trim().toLowerCase();
      const allFlights = Array.from(document.querySelectorAll('.flight-item'));
      
      allFlights.forEach(flight => {
          const flightText = flight.textContent.toLowerCase();
          flight.style.display = query === '' || flightText.includes(query) ? 'block' : 'none';
      });
  });
  
  // Refresh flights button
  document.getElementById('refresh-flights').addEventListener('click', () => {
      flightsData = generateRandomFlights(15);
      renderFlights(flightsData);
  });
  
  // Pilot briefing button
  document.getElementById('aviationWeatherBtn').addEventListener('click', function() {
      refreshBriefing();
  });
});

// Make refreshBriefing available globally
window.refreshBriefing = refreshBriefing;