const form = document.getElementById("form");
const search = document.getElementById("search");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

// Api url
const apiURL = "https://api.lyrics.ovh";

// Hide loading indicator initially
loading.style.display = 'none';

// Listen event in form input
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchValue = search.value.trim();

  if (!searchValue) {
    alert("Please enter an artist name or song title.");
  } else {
    searchSong(searchValue);
  }
});

// Search song
async function searchSong(searchValue) {
  showLoading();
  try {
    const searchResult = await fetch(`${apiURL}/suggest/${searchValue}`);
    const data = await searchResult.json();
    showData(data);
  } catch (error) {
    showError("Failed to fetch results. Please try again later.");
  } finally {
    hideLoading();
  }
}

// Display final result
function showData(data) {
  result.innerHTML = `
    <ul class="song-list">
      ${data.data.map(song => `
        <li>
          <div>
            <img src="${song.artist.picture}" alt="${song.artist.name}" />
            <strong>${song.artist.name}</strong> - ${song.title}
          </div>
          <span class="get-lyrics" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get lyrics</span>
        </li>
      `).join('')}
    </ul>
  `;
}

// Event listener for get lyrics button
result.addEventListener("click", (e) => {
  const clickElement = e.target;
  if (clickElement.classList.contains('get-lyrics')) {
    const artist = clickElement.getAttribute("data-artist");
    const songTitle = clickElement.getAttribute("data-songtitle");
    getLyrics(artist, songTitle);
  }
});

// Get lyrics for song
async function getLyrics(artist, songTitle) {
  showLoading();
  try {
    const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
    const data = await res.json();
    if (data.error) {
      showError("Lyrics not found.");
    } else {
      const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");
      result.innerHTML = `
        <div class="full-lyrics">
          <h2>${artist} - ${songTitle}</h2>
          <p>${lyrics}</p>
        </div>
      `;
    }
  } catch (error) {
    showError("Failed to fetch lyrics. Please try again later.");
  } finally {
    hideLoading();
  }
}

// Show loading indicator
function showLoading() {
  loading.style.display = 'block';
}

// Hide loading indicator
function hideLoading() {
  loading.style.display = 'none';
}

// Show error message
function showError(message) {
  result.innerHTML = `<p class="error">${message}</p>`;
}

