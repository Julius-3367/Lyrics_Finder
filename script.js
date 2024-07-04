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
    result.innerHTML = "<p>Something went wrong. Please try again later.</p>";
  }
}

// Display search results
function showData(data) {
  result.innerHTML = `
    <ul class="song-list">
      ${data.data.map((song) => `
        <li>
          <div>
            <img src="${song.artist.picture}" alt="${song.artist.name}" />
            <strong>${song.artist.name}</strong> - ${song.title}
          </div>
          <span data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</span>
        </li>
      `).join('')}
    </ul>
  `;
}

// Event listener for lyrics button
result.addEventListener("click", (e) => {
  const clickedElement = e.target;

  if (clickedElement.tagName === "SPAN") {
    const artist = clickedElement.getAttribute("data-artist");
    const songTitle = clickedElement.getAttribute("data-songtitle");

    getLyrics(artist, songTitle);
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
      result.innerHTML = "<p>No lyrics found for this song.</p>";
    }
  } catch (error) {
    result.innerHTML = "<p>Something went wrong. Please try again later.</p>";
  }
}

