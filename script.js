/* ========== AUTH ========== */
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

if (tabLogin && tabSignup) {
  tabLogin.onclick = () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  };
  tabSignup.onclick = () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  };
}

function togglePass(toggleId, inputId) {
  const eye = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!eye) return;
  eye.onclick = () => (input.type = input.type === 'password' ? 'text' : 'password');
}
togglePass('toggle-login-pass', 'login-password');
togglePass('toggle-signup-pass', 'signup-password');

if (signupForm) {
  signupForm.onsubmit = e => {
    e.preventDefault();
    const u = document.getElementById('signup-username').value.trim();
    const p = document.getElementById('signup-password').value.trim();
    if (!u || !p) return alert('Please fill all fields');
    if (localStorage.getItem(u)) return alert('Username already exists');
    localStorage.setItem(u, JSON.stringify({ password: p, tasks: [] }));
    alert('Account created successfully!');
    tabLogin.click();
  };
}

if (loginForm) {
  loginForm.onsubmit = e => {
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value.trim();
    const user = JSON.parse(localStorage.getItem(u));
    if (!user) return alert('User not found');
    if (user.password !== p) return alert('Wrong password');
    localStorage.setItem('activeUser', u);
    window.location.href = 'app.html';
  };
}

/* ========== APP PAGE ========== */
if (window.location.pathname.includes('app.html')) {
  const user = localStorage.getItem('activeUser');
  if (!user) window.location.href = 'index.html';

  const menuToggle = document.getElementById('menu-toggle');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const themeToggle = document.getElementById('theme-toggle');
  const logoutBtn = document.getElementById('logout-btn');
  const datetimeEl = document.getElementById('datetime');

  menuToggle.onclick = () => dropdownMenu.classList.toggle('hidden');
  logoutBtn.onclick = () => {
    localStorage.removeItem('activeUser');
    window.location.href = 'index.html';
  };

  // Live date-time
  setInterval(() => {
    const now = new Date();
    datetimeEl.textContent = now.toLocaleString();
  }, 1000);

  // Theme handling
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.className = savedTheme;
  themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
    const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
    themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
  };

  // ===== TASK LOGIC =====
  const addBtn = document.getElementById('add-btn');
  const taskList = document.getElementById('task-list');
  const filter = document.getElementById('filter');
  const search = document.getElementById('search');
  const username = localStorage.getItem('activeUser');
  const data = JSON.parse(localStorage.getItem(username));
  let tasks = data.tasks || [];

  function saveTasks() {
    data.tasks = tasks;
    localStorage.setItem(username, JSON.stringify(data));
    renderTasks();
  }

  function renderTasks() {
    taskList.innerHTML = '';
    tasks
      .filter(t =>
        (filter.value === 'all' ||
          (filter.value === 'completed' && t.completed) ||
          (filter.value === 'pending' && !t.completed)) &&
        t.text.toLowerCase().includes(search.value.toLowerCase())
      )
      .forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="${t.completed ? 'completed' : ''}">
            ${t.text} — <small>${t.category} | ${t.due}</small>
          </span>
          <div>
            <button onclick="toggleTask(${i})">✔</button>
            <button onclick="editTask(${i})">✏️</button>
            <button onclick="deleteTask(${i})">🗑</button>
          </div>`;
        taskList.appendChild(li);
      });
  }

  window.toggleTask = i => {
    tasks[i].completed = !tasks[i].completed;
    saveTasks();
  };
  window.deleteTask = i => {
    tasks.splice(i, 1);
    saveTasks();
  };
  window.editTask = i => {
    const newText = prompt('Edit task:', tasks[i].text);
    if (newText) tasks[i].text = newText;
    saveTasks();
  };

  addBtn.onclick = () => {
    const text = document.getElementById('task-input').value.trim();
    const due = document.getElementById('due-date').value;
    const category = document.getElementById('category').value;
    if (!text) return alert('Enter a task description');
    tasks.push({ text, due, category, completed: false });
    document.getElementById('task-input').value = '';
    saveTasks();
  };

  filter.onchange = renderTasks;
  search.onkeyup = renderTasks;
  renderTasks();
}
