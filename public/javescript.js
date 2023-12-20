// Dodaj detektor zdarzen do formularza rejestracji, aby obsłuzyc przesyłanie formularza
document.getElementById("register-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Zapobiegaj domyslnej opcji

   // Bierze wartosci pol wejsciowych nazwy uzytkownika i hasla
  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  // Tworzy zadanie pobrania, aby zarejestrowac uzytkownika
  fetch('http://localhost:2000/registerr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {  // Odpowiedz jako JSON
    const data = response.json();

    const messageDiv = document.getElementById('message'); 

    if (response.status === 201) { // Sprawdza czy rejestracja byla sukcesem
      messageDiv.innerText = 'Registration successful! Redirecting to login page... '; // Ta wiadomosc wyskakuje jesli udalo sie zarejestrowac
      setTimeout(function() { // Daje timer zanim zostanie uzytkownik przeslany na inna strone
        window.location.href = 'login.html'; // Strona na ktura uzytkownik zostanie przeslany
      }, 2000); // Czas ktury musi uplynac zanim osoba zostanie przeslana
    } else {
      messageDiv.innerText = 'Registration failed. Please try again.'; // Ta wiadomosc zostanie wyswietlona jesli rejestracja nie powiodla sie
    }
  })
  .catch(error => {  // jesli zdarzyl sie blad
    console.error(error);

    const messageDiv = document.getElementById('message'); // Wyswietla prosta wiadomosc dla uzytkownika
    messageDiv.innerText = 'An error occurred. Please try again later.'; // Wyswietla ta wiadomosc jesli wystapil jakis blad podczas dzialania strony
  });
});
