document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
  
    fetch('http://localhost:2000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
      const data = response.json();
  
      const loginMessageDiv = document.getElementById('login-message');
    if (response.status === 200) {
      loginMessageDiv.innerText = 'Login successful!';
      setTimeout(function() {
        window.location.href = 'meme.html';
      }, 2000);
    } else if (response.status === 401) {
      loginMessageDiv.innerText = 'Wrong password. Please try again.';
    } else if (response.status === 404) {
      loginMessageDiv.innerText = 'User not found.';
    } else {
      loginMessageDiv.innerText = 'An error occurred. Please try again later.';
    }
  })
  .catch(error => {
    console.error(error);

    const loginMessageDiv = document.getElementById('login-message');
    loginMessageDiv.innerText = 'An error occurred. Please try again later.';
  });
});