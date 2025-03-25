// Elemen// Elementos del DOM
const uploadBtn = document.getElementById('upload-btn');
const uploadModal = document.getElementById('upload-modal');
const uploadForm = document.getElementById('upload-form');
const artworksList = document.getElementById('artworks-list');
const topArtworks = document.getElementById('top-artworks');
const timeLeftElement = document.getElementById('time-left');

// Event Listeners
uploadBtn.addEventListener('click', () => {
  if (!getCurrentUser()) {
    alert('Debes iniciar sesión para subir obras');
    return;
  }
  
  const user = getCurrentUser();
  if (user.weeklyUploads >= getDB().config.uploadLimit) {
    alert(`Has alcanzado tu límite de ${getDB().config.uploadLimit} subidas esta semana`);
    return;
  }
  
  uploadModal.style.display = 'block';
});

uploadForm.addEventListener('submit', handleUpload);

document.getElementById('art-image').addEventListener('change', function(e) {
  const preview = document.getElementById('image-preview');
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    reader.readAsDataURL(this.files[0]);
  }
});

// Funciones principales
async function handleUpload(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    
    const db = getDB();
    
    if (user.weeklyUploads >= db.config.uploadLimit) {
      alert(`Has alcanzado tu límite de ${db.config.uploadLimit} subidas esta semana`);
      return;
    }
    
    const title = document.getElementById('art-title').value;
    const description = document.getElementById('art-description').value;
    const imageFile = document.getElementById('art-image').files[0];
    
    if (!imageFile) {
      alert('Debes seleccionar una imagen');
      return;
    }
  
    try {
      // Redimensionar la imagen antes de subirla
      const resizedImage = await resizeImage(imageFile, 760, 760);
      
      const newArtwork = {
        id: generateId(),
        title,
        description,
        imageUrl: resizedImage,
        authorId: user.id,
        authorName: user.username,
        likes: 0,
        likedBy: [],
        uploadDate: new Date().toISOString(),
        week: db.config.currentWeek
      };
      
      db.artworks.push(newArtwork);
      user.weeklyUploads++;
      
      uploadForm.reset();
      document.getElementById('image-preview').style.display = 'none';
      uploadModal.style.display = 'none';
      updateUI();
      renderArtworks();
      
      alert('Obra subida con éxito!');
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Error al procesar la imagen. Intenta nuevamente.');
    }
  }
  
  // Función para redimensionar imágenes
  function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          // Calcular nuevas dimensiones manteniendo aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
  
          // Asegurarse de que no excedan los límites
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
  
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
function renderArtworks() {
  const db = getDB();
  const sortedArtworks = [...db.artworks].sort((a, b) => b.likes - a.likes);
  
  topArtworks.innerHTML = '';
  const top10 = sortedArtworks.slice(0, 10);
  top10.forEach(artwork => {
    topArtworks.appendChild(createArtworkCard(artwork, true));
  });
  
  artworksList.innerHTML = '';
  const recentFirst = [...db.artworks].reverse();
  recentFirst.forEach(artwork => {
    artworksList.appendChild(createArtworkCard(artwork, false));
  });
  
  if (getCurrentUser()) {
    document.getElementById('uploads-count').textContent = getCurrentUser().weeklyUploads;
  }
  
  updateTimeLeft();
}

function createArtworkCard(artwork, isTop) {
    const user = getCurrentUser();
    const card = document.createElement('div');
    card.className = 'artwork-card';
    
    const isLiked = user && artwork.likedBy.includes(user.id);
    
    card.innerHTML = `
      <div class="artwork-image-container">
        <img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image">
      </div>
      <div class="artwork-info">
        <h3 class="artwork-title">${artwork.title}</h3>
        <p class="artwork-author">Por: ${artwork.authorName}</p>
        <div class="artwork-actions">
          <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${artwork.id}">
            <span class="like-count">${artwork.likes}</span> 👍
          </button>
          ${isTop ? '<span style="color: var(--primary);">🏆 TOP</span>' : ''}
        </div>
      </div>
    `;
    
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => handleLike(artwork.id));
    
    return card;
}

function handleLike(artworkId) {
  const user = getCurrentUser();
  if (!user) {
    alert('Debes iniciar sesión para dar like');
    return;
  }
  
  const db = getDB();
  const artwork = db.artworks.find(a => a.id === artworkId);
  
  if (!artwork) return;
  
  if (artwork.authorId === user.id) {
    alert('No puedes dar like a tu propia obra');
    return;
  }
  
  const likeIndex = artwork.likedBy.indexOf(user.id);
  
  if (likeIndex === -1) {
    artwork.likes++;
    artwork.likedBy.push(user.id);
  } else {
    artwork.likes--;
    artwork.likedBy.splice(likeIndex, 1);
  }
  
  renderArtworks();
}

// Resto del código original...