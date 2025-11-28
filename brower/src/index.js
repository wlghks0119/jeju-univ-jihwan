document.addEventListener("DOMContentLoaded", () => {
  // --- Selectors ---
  const form = document.querySelector('.form-data');
  const region = document.querySelector('.region-name');
  const apiKey = document.querySelector('.api-key');
  const errors = document.querySelector('.errors');
  const loading = document.querySelector('.loading');
  const results = document.querySelector('.result-container');
  const usage = document.querySelector('.carbon-usage');
  const fossilfuel = document.querySelector('.fossil-fuel');
  const myregion = document.querySelector('.my-region');
  const clearBtn = document.querySelector('.clear-btn');

  // --- Safety check ---
  if (!form || !region || !apiKey || !results || !loading || !usage || !myregion || !clearBtn) {
    console.error("❌ One or more elements are missing from the HTML structure.");
    return;
  }

  // --- Initialize UI ---
  function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegion = localStorage.getItem('regionName');

    if (!storedApiKey || !storedRegion) {
      // First-time user
      form.style.display = 'block';
      results.style.display = 'none';
      loading.style.display = 'none';
      clearBtn.style.display = 'none';
      errors.textContent = '';
    } else {
      // Returning user
      displayCarbonUsage(storedApiKey, storedRegion);
      results.style.display = 'none';
      form.style.display = 'none';
      clearBtn.style.display = 'block';
    }
  }

  // --- Form submission ---
  function handleSubmit(e) {
    e.preventDefault();
    setUpUser(apiKey.value, region.value);
  }

  function setUpUser(apiKeyValue, regionValue) {
    localStorage.setItem('apiKey', apiKeyValue);
    localStorage.setItem('regionName', regionValue);
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';
    displayCarbonUsage(apiKeyValue, regionValue);
  }

  // --- Fetch Carbon Data ---
  async function displayCarbonUsage(apiKeyValue, regionCode) {
    try {
      const url = `https://api.electricitymaps.com/v3/carbon-intensity/latest?countryCode=${regionCode}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'auth-token': apiKeyValue,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const carbonIntensity = Math.round(data.carbonIntensity);

      calculateColor(carbonIntensity);

      loading.style.display = 'none';
      form.style.display = 'none';
      myregion.textContent = regionCode.toUpperCase();
      usage.textContent = `${carbonIntensity} gCO₂/kWh`;

      if (data.fossilFuelPercentage !== undefined) {
        fossilfuel.textContent = `${data.fossilFuelPercentage.toFixed(2)}% fossil fuels`;
      }

      results.style.display = 'block';
    } catch (error) {
      console.error('Error fetching carbon data:', error);
      loading.style.display = 'none';
      results.style.display = 'none';
      errors.textContent =
        'Sorry, we couldn’t fetch data for that region. Please check your API key and region code.';
    }
  }

  // --- Color Scale ---
  function calculateColor(value) {
    const co2Scale = [0, 150, 600, 750, 800];
    const colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'];

    const closestNum = co2Scale.sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0];
    const scaleIndex = co2Scale.findIndex((n) => n > closestNum);
    const closestColor = colors[scaleIndex];

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
    } else {
      console.log(`Icon color (local mode): ${closestColor}`);
    }
  }

  // --- Reset ---
  function reset(e) {
    e.preventDefault();
    localStorage.removeItem('regionName');
    localStorage.removeItem('apiKey');
    init();
  }

  // --- Event listeners ---
  form.addEventListener('submit', handleSubmit);
  clearBtn.addEventListener('click', reset);

  // --- Start ---
  init();
});