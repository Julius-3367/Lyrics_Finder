const form = document.getElementById("form");
const search = document.getElementById("search");
const result = document.getElementById("result");
const savedLyricsList = document.getElementById("saved-lyrics-list");
const backBtn = document.getElementById("backBtn");

// API URL
const apiURL = "https://api.lyrics.ovh";

// Event listener for form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchValue = search.value.trim();

  if (!searchValue) {
    alert("Please enter an artist name or song title to search!");
  } else {
    searchSong(searchValue);
  }
});

// Search song
async function searchSong(searchValue, page = 1) {
  try {
    showSpinner();
    const searchResult = await fetch(`${apiURL}/suggest/${searchValue}?page=${page}`);
    const data = await searchResult.json();
    showData(data, searchValue);
  } catch (error) {
    showError("Something went wrong. Please try again later.");
  } finally {
    hideSpinner();
  }
}

// Display search results
function showData(data, searchValue) {
  if (data && data.data && data.data.length > 0) {
    result.innerHTML = `
      <ul class="song-list">
        ${data.data.map((song) => `
          <li>
            <div>
              <img src="${song.artist.picture}" alt="${song.artist.name}" />
              <strong>${song.artist.name}</strong> - ${song.title}
            </div>
            <span class="get-lyrics btn"
                  data-artist="${song.artist.name}"
                  data-songtitle="${song.title}">Get Lyrics</span>
            <button class="save-lyrics btn"
                    data-artist="${song.artist.name}"
                    data-songtitle="${song.title}">Save Lyrics</button>
          </li>
        `).join('')}
      </ul>
      <div class="pagination">
        ${data.prev ? `<button class="btn page-btn" data-page="${data.prev}">Prev</button>` : ''}
        ${data.next ? `<button class="btn page-btn" data-page="${data.next}">Next</button>` : ''}
      </div>
    `;
  } else {
    showError("No songs found. Please try a different search term.");
  }
}

// Event listener for lyrics and save buttons
result.addEventListener("click", async (e) => {
  const clickedElement = e.target;

  if (clickedElement.classList.contains("get-lyrics")) {
    const artist = clickedElement.getAttribute("data-artist");
    const songTitle = clickedElement.getAttribute("data-songtitle");
    getLyrics(artist, songTitle);
  } else if (clickedElement.classList.contains("save-lyrics")) {
    const artist = clickedElement.getAttribute("data-artist");
    const songTitle = clickedElement.getAttribute("data-songtitle");
    saveLyrics(artist, songTitle);
  } else if (clickedElement.classList.contains("page-btn")) {
    const page = clickedElement.getAttribute("data-page");
    searchSong(search.value, page);
  }
});

// Get song lyrics
async function getLyrics(artist, songTitle) {
  try {
    showSpinner();
    const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
    const data = await res.json();

    if (data.lyrics) {
      const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");
      result.innerHTML = `
        <div class="full-lyrics">
          <h2>${artist} - ${songTitle}</h2>
          <p>${lyrics}</p>
          <button class="save-lyrics btn"
                  data-artist="${artist}"
                  data-songtitle="${songTitle}">Save Lyrics</button>
        </div>
      `;
      backBtn.style.display = "block";
    } else {
      showError("No lyrics found for this song.");
    }
  } catch (error) {
    showError("Something went wrong. Please try again later.");
  } finally {
    hideSpinner();
  }
}

// Function to save lyrics to local storage
function saveLyrics(artist, songTitle) {
  let savedLyrics = JSON.parse(localStorage.getItem("savedLyrics")) || [];

  // Check if lyrics already saved
  const existingLyric = savedLyrics.find((lyric) => {
    return lyric.artist === artist && lyric.songTitle === songTitle;
  });

  if (!existingLyric) {
    const timestamp = new Date().toLocaleString();
    savedLyrics.push({ artist, songTitle, timestamp });
    localStorage.setItem("savedLyrics", JSON.stringify(savedLyrics));
    displaySavedLyrics();
    alert("Lyrics saved successfully!");
  } else {
    alert("Lyrics already saved!");
  }
}

// Function to display saved lyrics
function displaySavedLyrics() {
  let savedLyrics = JSON.parse(localStorage.getItem("savedLyrics")) || [];

  if (savedLyrics.length > 0) {
    savedLyricsList.innerHTML = savedLyrics.map((lyric) => `
      <li>
        <span>${lyric.artist} - ${lyric.songTitle} <br><small>${lyric.timestamp}</small></span>
        <button class="view-lyrics btn"
                data-artist="${lyric.artist}"
                data-songtitle="${lyric.songTitle}">View</button>
        <button class="delete-lyrics btn"
                data-artist="${lyric.artist}"
                data-songtitle="${lyric.songTitle}">Delete</button>
      </li>
    `).join('');
  } else {
    savedLyricsList.innerHTML = "<p>No lyrics saved.</p>";
  }
}

// Event listener for saved lyrics actions
savedLyricsList.addEventListener("click", (e) => {
  const clickedElement = e.target;

  if (clickedElement.classList.contains("delete-lyrics")) {
    const artist = clickedElement.getAttribute("data-artist");
    const songTitle = clickedElement.getAttribute("data-songtitle");
    deleteLyrics(artist, songTitle);
  } else if (clickedElement.classList.contains("view-lyrics")) {
    const artist = clickedElement.getAttribute("data-artist");
    const songTitle = clickedElement.getAttribute("data-songtitle");
    getLyrics(artist, songTitle);
  }
});

// Function to delete lyrics from local storage
function deleteLyrics(artist, songTitle) {
  let savedLyrics = JSON.parse(localStorage.getItem("savedLyrics")) || [];

  savedLyrics = savedLyrics.filter((lyric) => {
    return lyric.artist !== artist || lyric.songTitle !== songTitle;
  });

  localStorage.setItem("savedLyrics", JSON.stringify(savedLyrics));
  displaySavedLyrics();
}

// Function to show error message
function showError(message) {
  result.innerHTML = `<p class="error">${message}</p>`;
}

// Function to show loading spinner
function showSpinner() {
  result.innerHTML = '<div class="spinner"></div>';
}

// Function to hide loading spinner
function hideSpinner() {
  const spinner = document.querySelector(".spinner");
  if (spinner) {
    spinner.remove();
  }
}

// Back button event listener
backBtn.addEventListener("click", () => {
  result.innerHTML = '';
  backBtn.style.display = "none";
});

// Initialize saved lyrics display
displaySavedLyrics();

