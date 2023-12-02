document.addEventListener('DOMContentLoaded', function () {
  loadMemes();
});
document.getElementById("post-meme-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const memeUrl = document.getElementById('meme').value;

  fetch('http://localhost:2000/post-meme', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ memeUrl })
  })
  .then(response => response.json())
  .then(data => {
      const memeMessageDiv = document.getElementById('meme-message');
      if (data.success) {
          memeMessageDiv.innerText = 'Meme posted successfully!';
          displayNewMeme(data.meme);
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
function displayNewMeme(meme) {
    const newMemeCard = document.createElement('div');
    newMemeCard.className = 'card meme-container';
  
    const memeImage = document.createElement('img');
    memeImage.src = meme.memeUrl;
    memeImage.alt = 'Meme Image';
    memeImage.className = 'card-img-top';

    const postMemeForm = document.getElementById('post-meme-form');
    postMemeForm.reset();
  
    const usernameParagraph = document.createElement('p');
    usernameParagraph.innerText = `Posted by: ${meme.user}`;
  
    newMemeCard.appendChild(usernameParagraph);
    newMemeCard.appendChild(memeImage);
  
    const memeContainer = document.getElementById('meme-container');
    memeContainer.appendChild(newMemeCard);  
}
function loadMemes() {
  fetch('http://localhost:2000/get-memes')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const memes = data.memes;
        for (const meme of memes) {
          displayNewMeme(meme);
        }
      } else {
        console.error('Failed to load memes:', data.message);
      }
    })
    .catch(error => {
      console.error('Error with loading memes:', error);
    });
}