// Simulación de base de datos
let db = {
    users: [],
    artworks: [],
    sessions: [],
    weeklyStats: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      winner: null
    },
    config: {
      uploadLimit: 5,
      currentWeek: 1
    }
  };
  
  // Elementos del DOM
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authModal = document.getElementById('auth-modal');
  const modalTitle = document.getElementById('modal-title');
  const authForm = document.getElementById('auth-form');
  const authSwitch = document.getElementById('auth-switch');
  const closeButtons = document.querySelectorAll('.close');
  
  // Estado de autenticación
  let currentUser = null;
  let isLoginMode = true;
  
  // Event Listeners
  loginBtn.addEventListener('click', () => {
    isLoginMode = true;
    modalTitle.textContent = 'Iniciar Sesión';
    authSwitch.textContent = '¿No tienes cuenta? Regístrate aquí';
    authModal.style.display = 'block';
  });
  
  registerBtn.addEventListener('click', () => {
    isLoginMode = false;
    modalTitle.textContent = 'Registrarse';
    authSwitch.textContent = '¿Ya tienes cuenta? Inicia sesión aquí';
    authModal.style.display = 'block';
  });
  
  logoutBtn.addEventListener('click', logout);
  
  authSwitch.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      modalTitle.textContent = 'Iniciar Sesión';
      authSwitch.textContent = '¿No tienes cuenta? Regístrate aquí';
    } else {
      modalTitle.textContent = 'Registrarse';
      authSwitch.textContent = '¿Ya tienes cuenta? Inicia sesión aquí';
    }
  });
  
  authForm.addEventListener('submit', handleAuth);
  
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      authModal.style.display = 'none';
      document.getElementById('upload-modal').style.display = 'none';
    });
  });
  
  // Funciones de autenticación
  function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;
  
    if (isLoginMode) {
      login(username, password);
    } else {
      register(username, password);
    }
  }
  
  function register(username, password) {
    if (username.length < 3) {
      alert('El usuario debe tener al menos 3 caracteres');
      return;
    }
    
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
  
    if (db.users.some(user => user.username === username)) {
      alert('El usuario ya existe');
      return;
    }
  
    const newUser = {
      id: generateId(),
      username,
      password,
      stars: 0,
      joinDate: new Date().toISOString(),
      weeklyUploads: 0
    };
  
    db.users.push(newUser);
    alert('Registro exitoso! Ahora puedes iniciar sesión');
    isLoginMode = true;
    modalTitle.textContent = 'Iniciar Sesión';
    authSwitch.textContent = '¿No tienes cuenta? Regístrate aquí';
    authForm.reset();
  }
  
  function login(username, password) {
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
      currentUser = user;
      authModal.style.display = 'none';
      updateUI();
      alert(`Bienvenido ${user.username}!`);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }
  
  function logout() {
    currentUser = null;
    updateUI();
  }
  
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  function updateUI() {
    if (currentUser) {
      document.getElementById('user-info').style.display = 'block';
      document.getElementById('username-display').textContent = currentUser.username;
      document.getElementById('stars-count').textContent = currentUser.stars;
      document.getElementById('uploads-count').textContent = currentUser.weeklyUploads;
      
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
    } else {
      document.getElementById('user-info').style.display = 'none';
      
      loginBtn.style.display = 'block';
      registerBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
    }
  }
  
  // Para uso en app.js
  function getCurrentUser() {
    return currentUser;
  }
  
  function getDB() {
    return db;
  }