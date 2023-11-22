document.getElementById("post-meme-form").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const memeUrl  = document.getElementById('meme').value;
  
    fetch('http://localhost:2000/post-meme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO add authorization header
      },
      body: JSON.stringify({ memeUrl  })
    })
    .then(response => {
      const data = response.json();
  
      const memeMessageDiv = document.getElementById('meme-message');
      if (response.status === 200) {
        memeMessageDiv.innerText = 'Meme posted successfully!';
      } else {
        memeMessageDiv.innerText = 'Failed to post meme. Please try again.';
      }
    })
    .catch(error => {
      console.error(error);
  
      const memeMessageDiv = document.getElementById('meme-message');
      memeMessageDiv.innerText = 'An error occurred. Please try again later.';
    });
  });