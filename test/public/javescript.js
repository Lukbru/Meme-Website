document.getElementById("register-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  fetch('http://localhost:2000/registerr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    const data = response.json();

   
    const messageDiv = document.getElementById('message'); 
    if (response.status === 201) {
      messageDiv.innerText = 'Registration successful! Redirecting to login page... ';
      setTimeout(function() {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      messageDiv.innerText = 'Registration failed. Please try again.';
    }
  })
  .catch(error => {
    console.error(error);

    const messageDiv = document.getElementById('message');
    messageDiv.innerText = 'An error occurred. Please try again later.';
  });
});
