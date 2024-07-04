const form = document.getElementById("form");
const search = document.getElementById("search");
const result = document.getElementById("result");

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
async function searchSong(searchValue) {
  try {
    const searchResult = await fetch(`${apiURL}/suggest/${searchValue}`);
    const data = await searchResult.json();
    showData(data);
  } catch (error) {
    showError("Something went wrong. Please try again later.");
  }
}

// Display search results
function showData(data) {
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
                  data-songtitle="${song.title}" 
                  data-lyrics="${song.lyrics}">Get Lyrics</span>
            <button class="save-lyrics btn"
                    data-artist="${song.artist.name}"
                    data-songtitle="${song.title}"
                    data-lyrics="${song.lyrics}">Save Lyrics</button>
          </li>
        `).join('')}
      </ul>
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
    const lyrics = clickedElement.getAttribute("data-lyrics");
    saveLyrics(artist, songTitle, lyrics);
  }
});

// Get song lyrics
async function getLyrics(artist, songTitle) {
  try {
    const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
    const data = await res.json();

    if (data.lyrics) {
      const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");
      result.innerHTML = `
        <div class="full-lyrics">
          <h2>${artist} - ${songTitle}</h2>
          <p>${lyrics}</p>
        </div>
      `;
    } else {
      showError("No lyrics found for this song.");
    }
  } catch (error) {
    showError("Something went wrong. Please try again later.");
  }
}

// Function to save lyrics to local storage
function saveLyrics(artist, songTitle, lyrics) {
  let savedLyrics = JSON.parse(localStorage.getItem("savedLyrics")) || [];

  // Check if lyrics already saved
  const existingLyric = savedLyrics.find((lyric) => {
    return lyric.artist === artist && lyric.songTitle === songTitle;
  });

  if (!existingLyric) {
    savedLyrics.push({ artist, songTitle, lyrics });
    localStorage.setItem("savedLyrics", JSON.stringify(savedLyrics));
    alert("Lyrics saved successfully!");
  } else {
    alert("Lyrics already saved!");
  }
}

// Function to show error message
function showError(message) {
  result.innerHTML = `<p>${message}</p>`;
}

