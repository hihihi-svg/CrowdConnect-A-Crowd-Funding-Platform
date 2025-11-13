// Main Application Logic

class CrowdConnectApp {
  constructor() {
    this.currentView = 'hero';
    this.authMode = 'login';
    this.isDark = true;
    this.currentUser = null;
    this.projects = [];
    this.summaries = new Map();
    
    // Initialize
    this.init();
  }

  async init() {
    // Initialize MongoDB API Auth
    try {
      await authManager.init();
      authManager.onAuthStateChanged((user) => {
        this.currentUser = user;
        const path = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '/';
        if (user) {
          if (path !== '/dashboard') {
            window.location.replace('/dashboard');
            return;
          }
          this.showView('dashboard');
          this.loadProjects();
        } else {
          if (path !== '/login') {
            window.location.replace('/login');
            return;
          }
          this.showView('hero');
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Continue without auth for development
    }

    // Determine initial theme from localStorage or system preference
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') this.isDark = true;
      else if (stored === 'light') this.isDark = false;
      else this.isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) { /* ignore */ }

    this.bindEvents();
    // Set initial view based on current page
    try {
      const path = window.location.pathname;
      if (path === '/login') {
        // Optional query controls: ?auth=1 (show login), ?signup=1 (show signup)
        const params = new URLSearchParams(window.location.search);
        if (params.get('signup') === '1') {
          this.setAuthMode('signup');
          this.showView('auth');
        } else if (params.get('auth') === '1') {
          this.setAuthMode('login');
          this.showView('auth');
        } else {
          this.showView('hero');
        }
      } else if (path === '/dashboard') {
        this.showView('dashboard');
      }
    } catch (_) { /* ignore */ }
    this.applyTheme();
    this.refreshIcons();
  }

  hideNavAndFooter() {
    const navbar = document.querySelector('#app-shell nav');
    if (navbar) navbar.classList.add('hidden');
    const footer = document.getElementById('footer');
    if (footer) footer.classList.add('hidden');
  }

  showNavAndFooter() {
    const navbar = document.querySelector('#app-shell nav');
    if (navbar) navbar.classList.remove('hidden');
    const footer = document.getElementById('footer');
    if (footer) footer.classList.remove('hidden');
  }

  // View Management
  showView(view) {
    this.currentView = view;
    const views = {
      hero: 'view-hero',
      auth: 'view-auth',
      dashboard: 'view-dashboard',
      publish: 'view-publish',
      donate: 'view-donate',
      projects: 'view-projects',
      profile: 'view-profile'
    };

    // Hide all views
    Object.values(views).forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.add('hidden');
    });

    // Show appropriate container
    const appShell = document.getElementById('app-shell');
    if (!this.currentUser) {
      document.getElementById('view-hero')?.classList.toggle('hidden', view !== 'hero');
      document.getElementById('view-auth')?.classList.toggle('hidden', view !== 'auth');
      if (appShell) {
        appShell.classList.add('hidden');
        appShell.style.display = 'none';
      }
      if (view === 'auth') {
        this.hideNavAndFooter();
      }
    } else {
      document.getElementById('view-hero')?.classList.add('hidden');
      document.getElementById('view-auth')?.classList.add('hidden');
      if (appShell) {
        appShell.classList.remove('hidden');
        appShell.style.display = '';
      }
      this.showNavAndFooter();
      
      // Show specific view
      if (views[view]) {
        document.getElementById(views[view])?.classList.remove('hidden');
      }
    }

    // Load data for specific views
    if (view === 'dashboard') {
      this.renderDashboard();
    } else if (view === 'donate') {
      this.renderDonatePage();
    } else if (view === 'publish') {
      this.resetPublishForm();
      this.renderOtherProjectsSidebar();
    } else if (view === 'projects') {
      this.renderProjects();
    } else if (view === 'profile') {
      this.renderProfile();
    }

    this.refreshIcons();
  }

  // Authentication
  setAuthMode(mode) {
    this.authMode = mode;
    const title = document.getElementById('auth-title');
    const nameInput = document.getElementById('input-name');
    const loginTab = document.getElementById('tab-login');
    const signupTab = document.getElementById('tab-signup');
    const authBtn = document.getElementById('btn-auth');

    if (mode === 'login') {
      title.textContent = 'Welcome Back';
      nameInput.classList.add('hidden');
      loginTab.className = 'flex-1 py-2 rounded bg-purple-600 text-white';
      signupTab.className = 'flex-1 py-2 rounded bg-gray-800 text-gray-400';
      authBtn.textContent = 'Login';
    } else {
      title.textContent = 'Join CrowdConnect';
      nameInput.classList.remove('hidden');
      loginTab.className = 'flex-1 py-2 rounded bg-gray-800 text-gray-400';
      signupTab.className = 'flex-1 py-2 rounded bg-purple-600 text-white';
      authBtn.textContent = 'Sign Up';
    }
  }

  async handleAuth() {
    const email = document.getElementById('input-email').value.trim();
    const password = document.getElementById('input-password').value;
    const name = document.getElementById('input-name').value.trim();

    if (!email || !password) {
      this.showError('Please fill in all fields');
      return;
    }

    if (this.authMode === 'signup' && !name) {
      this.showError('Please enter your name');
      return;
    }

    try {
      if (this.authMode === 'signup') {
        await authManager.signUp(email, password, name);
      } else {
        await authManager.signIn(email, password);
      }
      // Auth state change will trigger view switch
    } catch (error) {
      this.showError(error.message);
    }
  }

  async handleLogout() {
    try {
      await authManager.signOut();
      this.showView('hero');
    } catch (error) {
      this.showError(error.message);
    }
  }

  // Project Management
  async loadProjects() {
    try {
      this.projects = await db.getAllProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
      this.projects = [];
    }
  }

  async publishProject() {
    const title = document.getElementById('publish-title').value.trim();
    const description = document.getElementById('publish-desc').value.trim();
    const targetFund = parseFloat(document.getElementById('publish-target').value);
    const motivation = document.getElementById('publish-motivation').value.trim();
    const problemStatement = document.getElementById('publish-problem').value.trim();
    const solution = document.getElementById('publish-solution').value.trim();
    const thesis = document.getElementById('publish-thesis').value.trim();

    if (!title || !description || !targetFund || !motivation || !problemStatement || !solution) {
      this.showError('Please fill in all required fields');
      return;
    }

    if (targetFund <= 0 || isNaN(targetFund)) {
      this.showError('Please enter a valid target fund amount');
      return;
    }

    if (!this.currentUser) {
      this.showError('Please log in to publish a project');
      return;
    }

    try {
      const project = {
        title,
        description,
        targetFund,
        motivation,
        problemStatement,
        solution,
        thesis: thesis || description
      };

      await db.saveProject(project);
      await this.loadProjects();
      this.showSuccessScreen();
      this.resetPublishForm();
      this.renderOtherProjectsSidebar();
    } catch (error) {
      this.showError('Failed to publish project: ' + error.message);
    }
  }

  resetPublishForm() {
    document.getElementById('publish-title').value = '';
    document.getElementById('publish-desc').value = '';
    document.getElementById('publish-target').value = '';
    document.getElementById('publish-motivation').value = '';
    document.getElementById('publish-problem').value = '';
    document.getElementById('publish-solution').value = '';
    document.getElementById('publish-thesis').value = '';
  }

  // Contribution
  async contributeToProject(projectId, amount) {
    if (!this.currentUser) {
      this.showError('Please log in to contribute');
      return;
    }

    if (!amount || amount <= 0) {
      this.showError('Please enter a valid amount');
      return;
    }

    try {
      const contribution = {
        projectId: projectId,
        contributorId: this.currentUser.uid,
        contributorName: this.currentUser.displayName || this.currentUser.email,
        amount: amount
      };

      await db.saveContribution(contribution);
      await this.loadProjects();
      this.showContributionSuccess(amount);
    } catch (error) {
      this.showError('Failed to process contribution: ' + error.message);
    }
  }

  // Rendering
  renderDashboard() {
    this.renderStats();
    this.renderLeaderboards();
    this.renderFeaturedProjects();
  }

  renderFeaturedProjects() {
    const container = document.getElementById('featured-projects');
    if (!container) return;

    container.innerHTML = '';
    const featured = this.projects.slice(0, 3);
    
    if (featured.length === 0) {
      container.innerHTML = '<div class="col-span-3 text-center text-gray-400"><p>No projects yet. Be the first to publish one!</p></div>';
      return;
    }
    
    featured.forEach(project => {
      const pct = Math.min(100, Math.round(((project.raised || 0) / project.targetFund) * 100));
      const card = document.createElement('div');
      card.className = 'card bg-gray-900 p-6 rounded-lg border border-gray-800 project-card';
      card.innerHTML = `
        <div class="text-6xl mb-4 text-center">${project.image || '✨'}</div>
        <h4 class="text-xl font-bold mb-2">${project.title}</h4>
        <p class="text-gray-400 mb-2 text-sm">by ${project.creator}</p>
        <p class="text-sm text-gray-500 mb-4">${project.description}</p>
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span>Rs ${(project.raised || 0).toLocaleString()}</span>
            <span>Rs ${project.targetFund.toLocaleString()}</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full progress-bar" style="width:${pct}%"></div>
          </div>
        </div>
        <button onclick="app.showView('donate')" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition-all">
          View Project
        </button>
      `;
      container.appendChild(card);
    });
  }

  renderStats() {
    const totalRaised = this.projects.reduce((sum, p) => sum + (p.raised || 0), 0);
    const activeProjects = this.projects.length;
    
    // Update stats if elements exist
    const statsElements = document.querySelectorAll('[data-stat]');
    statsElements.forEach(el => {
      const stat = el.getAttribute('data-stat');
      if (stat === 'total-raised') {
        if (totalRaised >= 1000000) {
          el.textContent = `Rs ${(totalRaised / 1000000).toFixed(2)}M`;
        } else if (totalRaised >= 1000) {
          el.textContent = `Rs ${(totalRaised / 1000).toFixed(1)}K`;
        } else {
          el.textContent = `Rs ${totalRaised}`;
        }
      }
      if (stat === 'active-projects') el.textContent = `${activeProjects}+`;
    });
  }

  async renderLeaderboards() {
    const contribList = document.getElementById('leaderboard-contributors');
    const publishList = document.getElementById('leaderboard-publishers');
    if (!contribList || !publishList) return;

    contribList.innerHTML = '<li class="text-gray-500 text-sm">Loading...</li>';
    publishList.innerHTML = '<li class="text-gray-500 text-sm">Loading...</li>';

    try {
      const [contributors, publishers] = await Promise.all([
        db.getContributionLeaderboard(10),
        db.getPublishesLeaderboard(10)
      ]);

      const formatItem = (rank, name, count, extra) => `
        <li class="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 flex items-center justify-center rounded-full bg-purple-700/30 text-purple-300 text-sm font-bold">${rank}</span>
            <span class="font-semibold">${name || 'Unknown'}</span>
          </div>
          <div class="text-sm text-gray-300">${count} ${extra || ''}</div>
        </li>`;

      // Contributors
      if (contributors.length === 0) {
        contribList.innerHTML = '<li class="text-gray-500 text-sm">No contributions yet.</li>';
      } else {
        contribList.innerHTML = contributors
          .map((c, i) => formatItem(i + 1, c.name, `${c.count} contributions`, c.totalAmount != null ? `(+Rs ${c.totalAmount.toLocaleString()})` : ''))
          .join('');
      }

      // Publishers
      if (publishers.length === 0) {
        publishList.innerHTML = '<li class="text-gray-500 text-sm">No publishes yet.</li>';
      } else {
        publishList.innerHTML = publishers
          .map((p, i) => formatItem(i + 1, p.name, `${p.count} publishes`))
          .join('');
      }

      this.refreshIcons();
    } catch (e) {
      console.error('Render leaderboards error:', e);
      contribList.innerHTML = '<li class="text-red-400 text-sm">Failed to load.</li>';
      publishList.innerHTML = '<li class="text-red-400 text-sm">Failed to load.</li>';
    }
  }

  async renderDonatePage() {
    await this.loadProjects();
    const container = document.getElementById('donate-list');
    if (!container) return;

    container.innerHTML = '<div class="col-span-2 text-center"><div class="spinner mx-auto"></div><p class="mt-4">Loading projects...</p></div>';

    // Generate summaries
    const summaries = await api.summarizeProjects(this.projects);
    
    container.innerHTML = '';
    
    if (this.projects.length === 0) {
      container.innerHTML = '<div class="col-span-2 text-center text-gray-400"><p>No projects available yet. Be the first to publish one!</p></div>';
      return;
    }
    
    this.projects.forEach((project, index) => {
      const summary = summaries[index] || api.summarizeText(project.description);
      const pct = Math.min(100, Math.round(((project.raised || 0) / project.targetFund) * 100));
      
      const card = document.createElement('div');
      card.className = 'card bg-gray-900 p-6 rounded-lg border border-gray-800 project-card';
      card.innerHTML = `
        <div class="text-6xl mb-4 text-center">${project.image || '✨'}</div>
        <h3 class="text-2xl font-bold mb-2">${project.title}</h3>
        <p class="text-gray-400 mb-2 text-sm">Creator: ${project.creator}</p>
        <div class="mb-4 p-3 bg-gray-800 rounded">
          <p class="text-sm text-gray-300 italic">"${summary}"</p>
        </div>
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span>Rs ${(project.raised || 0).toLocaleString()} raised</span>
            <span>Goal: Rs ${project.targetFund.toLocaleString()}</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full progress-bar" style="width:${pct}%"></div>
          </div>
        </div>
        <button onclick="app.showContributionModal('${project._id || project.id}')" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold transition-all">
          Contribute Now
        </button>
      `;
      container.appendChild(card);
    });
  }

  renderOtherProjectsSidebar() {
    const container = document.getElementById('other-projects-sidebar');
    if (!container) return;

    container.innerHTML = '';
    
    // Show up to 5 other projects
    const otherProjects = this.projects.slice(0, 5);
    
    if (otherProjects.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-sm">No other projects yet. Be the first!</p>';
      return;
    }

    otherProjects.forEach(project => {
      const item = document.createElement('div');
      item.className = 'p-3 bg-gray-800 rounded border border-gray-700 hover:border-purple-500 transition-all cursor-pointer';
      item.innerHTML = `
        <h4 class="font-bold text-sm mb-1">${project.title}</h4>
        <p class="text-xs text-gray-400 line-clamp-2">${project.description}</p>
        <div class="mt-2 flex justify-between text-xs">
          <span class="text-purple-400">Rs ${(project.raised || 0).toLocaleString()}</span>
          <span class="text-gray-500">of Rs ${project.targetFund.toLocaleString()}</span>
        </div>
      `;
      item.addEventListener('click', () => {
        this.showView('donate');
      });
      container.appendChild(item);
    });
  }

  renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    container.innerHTML = '';
    this.projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'card bg-gray-900 p-6 rounded-lg border border-gray-800 project-card';
      card.innerHTML = `
        <div class="text-6xl mb-4 text-center">${project.image}</div>
        <h3 class="text-xl font-bold mb-2">${project.title}</h3>
        <p class="text-gray-400 text-sm mb-4">${project.description}</p>
        <button onclick="app.showView('donate')" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition-all">
          View Details
        </button>
      `;
      container.appendChild(card);
    });
  }

  renderProfile() {
    if (!this.currentUser) return;
    
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    
    if (nameEl) nameEl.textContent = this.currentUser.displayName || 'User';
    if (emailEl) emailEl.textContent = this.currentUser.email || '';
    
    // Load user projects
    if (this.currentUser && this.currentUser.uid) {
      db.getUserProjects(this.currentUser.uid).then(projects => {
        const countEl = document.getElementById('profile-projects-count');
        if (countEl) countEl.textContent = projects.length;
      });
    }
  }

  // Modals and UI
  showContributionModal(projectId) {
    const project = this.projects.find(p => p._id === projectId || p.id === projectId);
    if (!project) return;

    const modal = document.createElement('div');
    modal.className = 'contribution-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="text-2xl font-bold mb-4">Contribute to ${project.title}</h3>
        <p class="text-gray-400 mb-4">${project.description}</p>
        <div class="mb-4">
          <label class="block text-sm mb-2">Amount (Rs)</label>
          <input type="number" id="contribution-amount" min="1" step="0.01" 
            class="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none" 
            placeholder="Enter amount">
        </div>
        <div class="flex gap-4">
          <button onclick="app.processContribution('${project._id || project.id}')" 
            class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold transition-all">
            Contribute
          </button>
          <button onclick="this.closest('.contribution-modal').remove()" 
            class="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded font-semibold transition-all">
            Cancel
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async processContribution(projectId) {
    const amountInput = document.getElementById('contribution-amount');
    const amount = parseFloat(amountInput?.value);
    
    if (!amount || amount <= 0) {
      this.showError('Please enter a valid amount');
      return;
    }

    document.querySelector('.contribution-modal')?.remove();
    await this.contributeToProject(projectId.toString(), amount);
  }

  showContributionSuccess(amount) {
    const modal = document.createElement('div');
    modal.className = 'success-screen';
    modal.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-4xl font-bold mb-4">Thank You!</h2>
        <p class="text-xl text-purple-300 mb-6">You've contributed Rs ${amount.toLocaleString()}</p>
        <button onclick="this.closest('.success-screen').remove(); app.showView('dashboard');" 
          class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all">
          Go Back to Home
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showSuccessScreen() {
    this.createBalloons();
    const modal = document.createElement('div');
    modal.className = 'success-screen';
    modal.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-4xl font-bold mb-4">Project Published!</h2>
        <p class="text-xl text-purple-300 mb-6">Your project is now live and ready to receive contributions</p>
        <div class="mb-6">
          <button onclick="app.showView('donate')" 
            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg mr-4 font-semibold transition-all">
            View All Projects
          </button>
          <button onclick="this.closest('.success-screen').remove(); app.showView('dashboard');" 
            class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
            Go to Dashboard
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      modal.remove();
    }, 5000);
  }

  createBalloons() {
    const colors = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    const container = document.createElement('div');
    container.className = 'balloon-container';
    
    for (let i = 0; i < 20; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      const color = colors[Math.floor(Math.random() * colors.length)];
      balloon.style.background = color;
      balloon.style.left = Math.random() * 100 + '%';
      balloon.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(balloon);
    }
    
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 5000);
  }

  showError(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
      setTimeout(() => {
        errorEl.classList.add('hidden');
      }, 5000);
    } else {
      alert(message); // Fallback
    }
  }

  // Theme
  applyTheme() {
    const body = document.body;
    const cards = document.querySelectorAll('.card');
    const inputs = document.querySelectorAll('input, textarea, select');
    
    if (this.isDark) {
      body.classList.remove('bg-gray-50', 'text-gray-900');
      body.classList.add('bg-black', 'text-white');
      body.classList.remove('light');
      cards.forEach(c => {
        c.classList.remove('bg-white', 'border-gray-200');
        c.classList.add('bg-gray-900', 'border-gray-800');
      });
      inputs.forEach(el => {
        el.classList.remove('bg-white', 'bg-gray-100', 'border-gray-300', 'text-gray-900');
        el.classList.add('bg-gray-800', 'border-gray-700', 'text-white');
      });
      document.getElementById('icon-sun')?.classList.remove('hidden');
      document.getElementById('icon-moon')?.classList.add('hidden');
      document.getElementById('icon-sun-global')?.classList.remove('hidden');
      document.getElementById('icon-moon-global')?.classList.add('hidden');
    } else {
      body.classList.remove('bg-black', 'text-white');
      body.classList.add('bg-gray-50', 'text-gray-900');
      body.classList.add('light');
      cards.forEach(c => {
        c.classList.remove('bg-gray-900', 'border-gray-800');
        c.classList.add('bg-white', 'border-gray-200');
      });
      inputs.forEach(el => {
        el.classList.remove('bg-gray-800', 'border-gray-700', 'text-white');
        el.classList.add('bg-white', 'border-gray-300', 'text-gray-900');
      });
      document.getElementById('icon-sun')?.classList.add('hidden');
      document.getElementById('icon-moon')?.classList.remove('hidden');
      document.getElementById('icon-sun-global')?.classList.add('hidden');
      document.getElementById('icon-moon-global')?.classList.remove('hidden');
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    this.applyTheme();
    try {
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    } catch (_) { /* ignore */ }
  }

  refreshIcons() {
    if (window.lucide && window.lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // Event Bindings
  bindEvents() {
    // Hero buttons
    document.getElementById('btn-get-started')?.addEventListener('click', () => {
      this.setAuthMode('signup');
      this.showView('auth');
    });
    
    document.getElementById('btn-login')?.addEventListener('click', () => {
      this.setAuthMode('login');
      this.showView('auth');
    });

    // Auth
    document.getElementById('tab-login')?.addEventListener('click', () => this.setAuthMode('login'));
    document.getElementById('tab-signup')?.addEventListener('click', () => this.setAuthMode('signup'));
    document.getElementById('btn-auth')?.addEventListener('click', () => this.handleAuth());
    document.getElementById('btn-back-home')?.addEventListener('click', () => this.showView('hero'));

    // Navigation
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-nav');
        this.showView(target);
      });
    });

    // Publish
    document.getElementById('btn-publish')?.addEventListener('click', () => this.publishProject());

    // Profile
    document.getElementById('btn-logout')?.addEventListener('click', () => this.handleLogout());

    // Theme
    document.getElementById('btn-theme')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('btn-theme-global')?.addEventListener('click', () => this.toggleTheme());
  }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new CrowdConnectApp();
});

