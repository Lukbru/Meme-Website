// Dodaj detektor zdarzen do formularza Logowania, aby obsłuzyc przesyłanie formularza
document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Zapobiegaj domyslnej opcji
  
    // Bierze wartosci pol wejsciowych nazwy uzytkownika i hasla
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
  
    // Tworzy zadanie pobrania, aby zalogowac uzytkownika
    fetch('http://localhost:2000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }) 
    })
    .then(response => { // Odpowiedz jako JSON
      const loginMessageDiv = document.getElementById('login-message');
    if (response.status === 200) { // Jesli odpowiedz jest sukcesem
      loginMessageDiv.innerText = 'Login successful!'; // Wyswietla sie wiadomosc ze udalo sie zalogowac

      response.json().then(data => {
        localStorage.setItem("token", data.token); // Dodaje do localStorage token
        setTimeout(function() { // Daje timer zanim zostanie uzytkownik przeslany na inna strone
           window.location.href = 'meme.html'; // Strona na ktura uzytkownik zostanie przeslany
        }, 2000); // Czas ktury musi uplynac zanim osoba zostanie przeslana
      })
    } else if (response.status === 401) { // Jesli nie jest zautoryzowanie ,czyli haslo sie nie zgadza
      loginMessageDiv.innerText = 'Wrong password. Please try again.'; // Wyswietla sie wiadomosc ze haslo sie nie zgadza
    } else if (response.status === 404) { // Jesli nie moglo znalezc nazwy takiej uzytkownika
      loginMessageDiv.innerText = 'User not found.'; // Wyswietla sie wiadomosc ze nie znaleziono takiej nazwy uzytkownika
    } else {
      loginMessageDiv.innerText = 'An error occurred. Please try again later.'; // Wyswietla sie ta wiadomosc jesli wystapil jakis inny blad od poprzednich
    }
  })
  .catch(error => { // jesli zdarzyl sie blad
    console.error(error);

    const loginMessageDiv = document.getElementById('login-message'); // Wyswietla prosta wiadomosc dla uzytkownika
    loginMessageDiv.innerText = 'An error occurred. Please try again later.'; // Wyswietla ta wiadomosc jesli wystapil jakis blad podczas dzialania strony
  });
});