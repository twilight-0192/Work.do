
(function(){
  // ---------- state ----------
  let tasks = [];
  let currentFilter = 'all'; // 'all', 'pending', 'completed'

  // DOM elements
  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addTaskBtn');
  const taskContainer = document.getElementById('taskListContainer');
  const totalSpan = document.getElementById('totalTasks');
  const completedSpan = document.getElementById('completedTasks');
  const pendingSpan = document.getElementById('pendingTasks');
  const filterButtons = document.querySelectorAll('.filter-tab');  // class updated
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');

  // ---------- load from localStorage ----------
  function loadTasks() {
    const stored = localStorage.getItem('flowTasks'); 
    if (stored) {
      try {
        tasks = JSON.parse(stored);
      } catch (e) {
        tasks = [];
      }
    } else {
      // sample demo tasks (heritage vibe)
      tasks = [
        { id: '1', text: 'Weave a morning routine', completed: false },
        { id: '2', text: 'Write in journal', completed: true },
        { id: '3', text: 'Water the plants', completed: false },
        { id: '4', text: 'Bake sourdough', completed: false },
      ];
    }
    // ensure each task has valid fields
    tasks = tasks.map(t => ({
      id: t.id || Date.now() + '-' + Math.random(),
      text: t.text || 'untitled',
      completed: !!t.completed
    }));
    render();
  }

  // save to localStorage
  function saveTasks() {
    localStorage.setItem('flowTasks', JSON.stringify(tasks));
  }

  // update stats badges
  function updateStats() {
    const total = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = total - completedCount;
    totalSpan.innerText = total;
    completedSpan.innerText = completedCount;
    pendingSpan.innerText = pendingCount;
  }

  // render tasks based on currentFilter
  function renderTasks() {
    let filtered = [];
    if (currentFilter === 'all') {
      filtered = tasks;
    } else if (currentFilter === 'pending') {
      filtered = tasks.filter(t => !t.completed);
    } else { // completed
      filtered = tasks.filter(t => t.completed);
    }

    if (filtered.length === 0) {
      taskContainer.innerHTML = `<div class="empty-message">
        <i class="fa-regular fa-face-smile"></i>
        <span>no tasks — a quiet basket</span>
      </div>`;
      return;
    }

    // build html
    let htmlStr = '';
    filtered.forEach(task => {
      const completedClass = task.completed ? 'completed-task' : '';
      const checkedAttr = task.completed ? 'checked' : '';
      const escapedText = escapeHtml(task.text);
      htmlStr += `
        <div class="task-item ${completedClass}" data-task-id="${task.id}">
          <input type="checkbox" class="task-check" ${checkedAttr} data-id="${task.id}">
          <span class="task-text">${escapedText}</span>
          <div class="task-actions">
            <button class="icon-btn delete-btn" data-id="${task.id}" title="delete"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      `;
    });
    taskContainer.innerHTML = htmlStr;

    // attach event listeners to checkboxes and delete buttons
    document.querySelectorAll('.task-check').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        toggleComplete(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        deleteTask(id);
      });
    });
  }

  // simple escape to prevent XSS
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      if (m === '"') return '&quot;';
      return m;
    });
  }

  // toggle completion
  function toggleComplete(id) {
    tasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    render();
  }

  // delete task
  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
  }

  // add new task
  function addTask() {
    const text = taskInput.value.trim();
    if (text === '') {
      taskInput.style.transition = '0.2s';
      taskInput.style.borderColor = '#d3a58b';
      setTimeout(() => taskInput.style.borderColor = '', 300);
      taskInput.focus();
      return;
    }
    const newTask = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      text: text,
      completed: false
    };
    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
    render();
  }

  // clear completed tasks
  function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    // if current filter is 'completed' and no tasks left, maybe reset filter to all?
    if (currentFilter === 'completed' && tasks.filter(t => t.completed).length === 0) {
      setActiveFilter('all');
    } else {
      render();
    }
  }

  // set active filter and update UI
  function setActiveFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if (btnFilter === filter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    render();
  }

  // main render: stats + tasks + active filter
  function render() {
    updateStats();
    renderTasks();
    // ensure filter buttons match currentFilter
    filterButtons.forEach(btn => {
      const btnFilter = btn.getAttribute('data-filter');
      if (btnFilter === currentFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ---------- event listeners ----------
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setActiveFilter(filter);
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // initialize
  loadTasks();

  // handle storage sync across tabs (optional)
  window.addEventListener('storage', (e) => {
    if (e.key === 'flowTasks') {
      loadTasks();
    }
  });


})();
