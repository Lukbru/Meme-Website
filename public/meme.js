document.addEventListener('DOMContentLoaded', function () {
  loadMemes(); // Laduje memy z serwera (collection)

  const logoutButton = document.getElementById('logout-btn');  // Usuwa token ,aby osoba byla nie zalogowana
  const logoutMessage = document.getElementById('logout-message'); // Wyswietla wiadomosc o pomyslnym wylogowaniu

  logoutButton.addEventListener('click', function () { // Przycisk na wylogowanie sie
    localStorage.removeItem('token'); // Usuwa tokena z localStorage

    logoutMessage.innerText = 'You have logged out.'; // Wiadomosc wyswietlana gdy osoba zostala wylogowana
    logoutMessage.style.display = 'block'; // Wiadomosc jest wyswietlona w prostokacie
  });
});
document.getElementById("post-meme-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Zapobiegaj domyslnej opcji

  const memeUrl = document.getElementById('meme').value; // Bierze wartosc mema

  fetch('http://localhost:2000/post-meme', { // Tworzy zadanie pobrania, aby opublikowac mema na serwerze
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ memeUrl })
  })
  .then(response => response.json())   // Odpowiedz jako JSON
  .then(data => {
      const memeMessageDiv = document.getElementById('meme-message'); 
      if (data.success) { // Jesli sie powiodlo
          memeMessageDiv.innerText = 'Meme posted successfully!'; // Wiadomosc wyswietla sie gdy Meme zostal dodany na strone/serwer
          displayNewMeme(data.meme); // Pokazanie dodanego mema
      } else {
          memeMessageDiv.innerText = 'Failed to post meme. Please log in to post memes.'; // Wiadomosc wyswietla sie jesli meme nie zostal dodany
      }
  })
  .catch(error => { // Jesli wystapil blad
      console.error(error); // Konsola error
      const memeMessageDiv = document.getElementById('meme-message');
      memeMessageDiv.innerText = 'An error occurred. Please try again later.'; // Wiadomosc wyswietla sie jesli wystapil blad
  });
});
function displayNewMeme(meme) { //Funkcja pokazujaca dodane memy na stronie
    const newMemeCard = document.createElement('div');
    newMemeCard.className = 'card meme-container';
  
    const memeImage = document.createElement('img'); // Tworzy obrazek dla posta
    memeImage.src = meme.memeUrl;
    memeImage.alt = 'Meme Image';
    memeImage.className = 'card-img-top';

    const postMemeForm = document.getElementById('post-meme-form'); 
    postMemeForm.reset(); // Czysci pasek gdzie wpisuje sie URL mema
  
    const usernameParagraph = document.createElement('p');
    usernameParagraph.innerText = `Posted by: ${meme.user}`; // Dodaje do posta naze uzytkownika ktory dodal mema
  
    newMemeCard.appendChild(usernameParagraph); // Daje nazwe uzytkownika dodajacego mema w boxie
    newMemeCard.appendChild(memeImage); // Daje obrazek URL mema w boxie
  
    const memeContainer = document.getElementById('meme-container'); 
    memeContainer.insertBefore(newMemeCard, memeContainer.firstChild); // Daje najnowszy post na sama gore strony
}
function loadMemes(sortOrder = 'newest') { // Funkcja ladujaca memy na strone
  fetch(`http://localhost:2000/get-memes?sort=${sortOrder}`) // + Sortuje memy
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const memes = data.memes;
        clearMemes(); // Czyscie strone
        for (const meme of memes) {
          displayNewMeme(meme); // Dodaje memy z powrotem na strone
        }
      } else {
        console.error('Failed to load memes:', data.message); // Wiadomosc wyswietla sie jesli nie udalo sie zaladowac memow
      }
    })
    .catch(error => {
      console.error('Error with loading memes:', error); //Wiadomosc wyswietla sie jesli wystapil jakis blad
    });
}
function clearMemes() { // Funkcja czysci memy ze strony
  const memeContainer = document.getElementById('meme-container');
  memeContainer.innerHTML = '';
}
function sortMemes() { // Funkcja sortuje memy na stronie
  const sortOrderSelect = document.getElementById('sort-order');
  const sortOrder = sortOrderSelect.value; // Sprawdza jak memy maja byc posortowane

  loadMemes(sortOrder); // Laduje memy ktore sa teraz posortowane
}