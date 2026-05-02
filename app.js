// ============ GLOBAL STATE ============
const state = {
  user: null,
  currentLang: 'tm',
  token: localStorage.getItem('token') || null,
  apiBase: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api'
};

// ============ TRANSLATIONS ============
const translations = {
  tm: {
    home: 'Baş sahypa',
    services: 'Hyzmatlar',
    projects: 'Taslamalar',
    about: 'Biz barada',
    login: 'Giriş',
    signup: 'Hasaba al',
    logout: 'Çykyş',
    welcome: 'Hoş geldiňiz',
    buildingSolutions: 'Intelligent Web & AI çözgütlerini döredýäris',
    exploreWork: 'Işimi öwren',
    featuredServices: 'Esasy hyzmatlar',
    recentProjects: 'Soňky taslamalar',
    viewAll: 'Hemmesini gör',
    webDevelopment: 'Web ösüşi',
    aiSolutions: 'AI çözgütleri',
    mobileApps: 'Ykjam programmalar',
    design: 'Dizaýn',
    automation: 'Awtomatlaşdyrma',
    botDevelopment: 'Bot ösüşi',
    modernWebsites: 'Häzirki zaman we çalt web sahypalary',
    customAI: 'Ýörite AI modelleri we akylly awtomatlaşdyrma',
    crossPlatform: 'Platformalararasy ykjam programmalar',
    loading: 'Ýüklenýär...',
    error: 'Ýalňyşlyk',
    success: 'Üstünlikli',
    send: 'Iber',
    cancel: 'Ýatyr',
    save: 'Sakla',
    delete: 'Poz',
    edit: 'Üýtget',
    profile: 'Profil',
    settings: 'Sazlamalar',
    chat: 'Söhbetdeş',
    orders: 'Sargytlar',
    balance: 'Balans',
    tmt: 'TMT'
  },
  uz: {
    home: 'Bosh sahifa',
    services: 'Xizmatlar',
    projects: 'Loyihalar',
    about: 'Biz haqimizda',
    login: 'Kirish',
    signup: "Ro'yxatdan o'tish",
    logout: 'Chiqish',
    welcome: 'Xush kelibsiz',
    buildingSolutions: "Intelligent Web & AI yechimlarini yaratamiz",
    exploreWork: 'Ishimni ko\'ring',
    featuredServices: 'Asosiy xizmatlar',
    recentProjects: "So'nggi loyihalar",
    viewAll: 'Hammasini ko\'rish',
    webDevelopment: 'Web dasturlash',
    aiSolutions: 'AI yechimlari',
    mobileApps: 'Mobil ilovalar',
    design: 'Dizayn',
    automation: 'Avtomatlashtirish',
    botDevelopment: 'Bot yaratish',
    modernWebsites: 'Zamonaviy va tez web saytlar',
    customAI: 'Maxsus AI modellari va aqlli avtomatlashtirish',
    crossPlatform: 'Cross-platform mobil ilovalar',
    loading: 'Yuklanmoqda...',
    error: 'Xato',
    success: 'Muvaffaqiyatli',
    send: 'Yuborish',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    delete: "O'chirish",
    edit: "O'zgartirish",
    profile: 'Profil',
    settings: 'Sozlamalar',
    chat: 'Chat',
    orders: 'Buyurtmalar',
    balance: 'Balans',
    tmt: 'TMT'
  },
  ru: {
    home: 'Главная',
    services: 'Услуги',
    projects: 'Проекты',
    about: 'О нас',
    login: 'Войти',
    signup: 'Регистрация',
    logout: 'Выйти',
    welcome: 'Добро пожаловать',
    buildingSolutions: 'Создаем умные Web & AI решения',
    exploreWork: 'Посмотреть работы',
    featuredServices: 'Основные услуги',
    recentProjects: 'Последние проекты',
    viewAll: 'Посмотреть все',
    webDevelopment: 'Web разработка',
    aiSolutions: 'AI решения',
    mobileApps: 'Мобильные приложения',
    design: 'Дизайн',
    automation: 'Автоматизация',
    botDevelopment: 'Разработка ботов',
    modernWebsites: 'Современные и быстрые веб-сайты',
    customAI: 'Пользовательские AI модели и умная автоматизация',
    crossPlatform: 'Кроссплатформенные мобильные приложения',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    send: 'Отправить',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Изменить',
    profile: 'Профиль',
    settings: 'Настройки',
    chat: 'Чат',
    orders: 'Заказы',
    balance: 'Баланс',
    tmt: 'TMT'
  },
  en: {
    home: 'Home',
    services: 'Services',
    projects: 'Projects',
    about: 'About',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    welcome: 'Welcome',
    buildingSolutions: 'Building Intelligent Web & AI Solutions',
    exploreWork: 'Explore My Work',
    featuredServices: 'Featured Services',
    recentProjects: 'Recent Projects',
    viewAll: 'View All',
    webDevelopment: 'Web Development',
    aiSolutions: 'AI Solutions',
    mobileApps: 'Mobile Apps',
    design: 'Design',
    automation: 'Automation',
    botDevelopment: 'Bot Development',
    modernWebsites: 'Modern, fast & responsive websites and web apps',
    customAI: 'Custom AI models, chatbots & intelligent automation',
    crossPlatform: 'Cross-platform mobile apps with premium UI/UX',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    send: 'Send',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    profile: 'Profile',
    settings: 'Settings',
    chat: 'Chat',
    orders: 'Orders',
    balance: 'Balance',
    tmt: 'TMT'
  }
};

// ============ TRANSLATION HELPER ============
function t(key) {
  return translations[state.currentLang][key] || key;
}

// ============ API HELPER ============
async function api(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(`${state.apiBase}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============ ROUTING ============
function navigateTo(page) {
  const content = document.getElementById('main-content');
  
  switch(page) {
    case 'home':
      renderHome();
      break;
    case 'services':
      renderServices();
      break;
    case 'projects':
      renderProjects();
      break;
    case 'about':
      renderAbout();
      break;
    case 'login':
      renderLogin();
      break;
    case 'profile':
      renderProfile();
      break;
    default:
      renderHome();
  }

  // Update active nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
}

// ============ HOME PAGE ============
function renderHome() {
  const content = document.getElementById('main-content');
  content.innerHTML = `
    <!-- Hero Section -->
    <section class="hero-gradient py-20 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <div class="fade-in">
          <div class="inline-block mb-6">
            <div class="flex items-center justify-center space-x-3 mb-4">
              <div class="w-16 h-16 bg-gold/10 rounded-xl flex items-center justify-center">
                <span class="text-gold font-bold text-3xl">S</span>
              </div>
            </div>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-bold mb-6">
            <span class="text-white">Hello, I'm </span>
            <span class="gradient-text">Soltero</span>
          </h1>
          
          <h2 class="text-3xl md:text-4xl font-semibold mb-6 text-gold">
            Web & AI Developer
          </h2>
          
          <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            ${t('buildingSolutions')}
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button onclick="navigateTo('services')" class="btn-primary">
              ${t('exploreWork')} →
            </button>
            <button onclick="navigateTo('about')" class="btn-secondary">
              ${t('about')}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stories Section -->
    <section class="py-12 px-4 bg-dark-secondary">
      <div class="max-w-7xl mx-auto">
        <div id="stories-container" class="story-container">
          <!-- Stories will be loaded here -->
        </div>
      </div>
    </section>

    <!-- Featured Services -->
    <section class="py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-12">
          <h2 class="text-3xl font-bold">${t('featuredServices')}</h2>
          <button onclick="navigateTo('services')" class="text-gold hover:underline">
            ${t('viewAll')} →
          </button>
        </div>
        
        <div id="services-grid" class="grid-auto-fit">
          <!-- Services will be loaded here -->
        </div>
      </div>
    </section>

    <!-- Recent Projects -->
    <section class="py-20 px-4 bg-dark-secondary">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-12">
          <h2 class="text-3xl font-bold">${t('recentProjects')}</h2>
          <button onclick="navigateTo('projects')" class="text-gold hover:underline">
            ${t('viewAll')} →
          </button>
        </div>
        
        <div id="projects-grid" class="grid-auto-fit">
          <!-- Projects will be loaded here -->
        </div>
      </div>
    </section>
  `;

  // Load dynamic data
  loadStories();
  loadServices();
}

// ============ LOAD STORIES ============
async function loadStories() {
  try {
    const data = await api('/stories');
    const container = document.getElementById('stories-container');
    
    if (!data.stories || data.stories.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center py-4">No stories available</p>';
      return;
    }

    container.innerHTML = data.stories.map(story => `
      <div class="story-item" onclick="viewStory('${story._id}')">
        <div class="relative">
          <div class="w-24 h-24 rounded-full border-2 border-gold p-1">
            <img src="${story.image}" alt="${story.title}" 
                 class="w-full h-full rounded-full object-cover">
          </div>
          <div class="absolute bottom-0 right-0 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
            <span class="text-dark text-xs font-bold">+</span>
          </div>
        </div>
        <p class="text-sm text-center mt-2 text-gray-400 truncate">${story.title}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load stories:', error);
  }
}

// ============ LOAD SERVICES ============
async function loadServices() {
  try {
    const data = await api('/services');
    const grid = document.getElementById('services-grid');
    
    const services = data.services.slice(0, 6); // Show first 6
    
    grid.innerHTML = services.map(service => `
      <div class="service-card card-hover">
        <div class="text-4xl mb-4">${service.icon || '💻'}</div>
        <h3 class="text-xl font-bold mb-2">${service.title}</h3>
        <p class="text-gray-400 mb-4">${service.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-gold font-bold">${service.price} ${service.currency}</span>
          <button onclick="viewService('${service._id}')" class="text-sm text-gold hover:underline">
            Learn more →
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load services:', error);
  }
}

// ============ INIT APP ============
document.addEventListener('DOMContentLoaded', () => {
  // Hide loading screen
  setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
  }, 1000);

  // Check if user is logged in
  if (state.token) {
    loadUser();
  }

  // Language selector
  document.getElementById('language-select').addEventListener('change', (e) => {
    state.currentLang = e.target.value;
    localStorage.setItem('lang', e.target.value);
    // Refresh current page
    navigateTo('home');
  });

  // Load saved language
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    state.currentLang = savedLang;
    document.getElementById('language-select').value = savedLang;
  }

  // PWA Install
  setupPWA();

  // Initial render
  renderHome();
});

// ============ LOAD USER ============
async function loadUser() {
  try {
    const data = await api('/auth/me');
    state.user = data.user;
    updateUserUI();
  } catch (error) {
    console.error('Failed to load user:', error);
    state.token = null;
    localStorage.removeItem('token');
  }
}

// ============ UPDATE USER UI ============
function updateUserUI() {
  const loginBtn = document.getElementById('login-btn');
  const userProfile = document.getElementById('user-profile');

  if (state.user) {
    loginBtn.classList.add('hidden');
    userProfile.classList.remove('hidden');
    
    document.getElementById('user-avatar').src = state.user.profilePicture || '/default-avatar.png';
    document.getElementById('user-name').textContent = state.user.name || state.user.username;
  } else {
    loginBtn.classList.remove('hidden');
    userProfile.classList.add('hidden');
  }
}

// ============ PWA SETUP ============
function setupPWA() {
  let deferredPrompt;
  const installPrompt = document.getElementById('pwa-install-prompt');
  const installBtn = document.getElementById('pwa-install');
  const closeBtn = document.getElementById('pwa-close');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.classList.remove('hidden');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      installPrompt.classList.add('hidden');
    }
    
    deferredPrompt = null;
  });

  closeBtn.addEventListener('click', () => {
    installPrompt.classList.add('hidden');
  });
}

// Placeholder functions (will implement later)
function renderServices() { console.log('Services page'); }
function renderProjects() { console.log('Projects page'); }
function renderAbout() { console.log('About page'); }
function renderLogin() { console.log('Login page'); }
function renderProfile() { console.log('Profile page'); }
function viewStory(id) { console.log('View story:', id); }
function viewService(id) { console.log('View service:', id); }
