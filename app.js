let currentStage = 'todo';
let tasks = {
    todo: [],
    completed: [],
    archived: []
};
let user = null;

window.addEventListener('load', function() {
    checkUserAuthentication();
    loadUserData();
    loadTasks();
    initializeEventListeners();
});

function checkUserAuthentication() {
    const userData = localStorage.getItem('taskFlowUser');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    user = JSON.parse(userData);
    if (!user.name || !user.dateOfBirth || user.age <= 10) {
        localStorage.removeItem('taskFlowUser');
        window.location.href = 'index.html';
        return;
    }
}

function loadUserData() {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    userName.textContent = user.name;
    userAvatar.src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`;
}

function loadTasks() {
    const savedTasks = localStorage.getItem('taskFlowTasks');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
        updateCounters();
    } else {
        loadDummyTasks();
    }
}

// dummy tasks from DummyJSON API
function loadDummyTasks() {
    fetch('https://dummyjson.com/todos')
        .then(response => response.json())
        .then(data => {
            const todos = data.todos.slice(0, 10); 
            
            todos.forEach(todo => {
                const task = {
                    id: Date.now() + Math.random(),
                    text: todo.todo,
                    stage: 'todo',
                    timestamp: new Date().toLocaleString()
                };
                tasks.todo.push(task);
            });
            
            saveTasks();
            renderTasks();
            updateCounters();
        })
        .catch(error => {
            console.error('Error loading dummy tasks:', error);
            renderTasks();
            updateCounters();
        });
}

function initializeEventListeners() {
    document.querySelectorAll('.stage-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const stage = this.dataset.stage;
            switchStage(stage);
        });
    });

    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addTask();
    });

    document.getElementById('signOutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('taskFlowUser');
            localStorage.removeItem('taskFlowTasks');
            window.location.href = 'index.html';
        }
    });
}

function switchStage(stage) {
    currentStage = stage;
    
    document.querySelectorAll('.stage-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-stage="${stage}"]`).classList.add('active');
    
    renderTasks();
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (!taskText) return;
    
    const task = {
        id: Date.now() + Math.random(),
        text: taskText,
        stage: currentStage,
        timestamp: new Date().toLocaleString()
    };
    
    tasks[currentStage].push(task);
    taskInput.value = '';
    
    saveTasks();
    renderTasks();
    updateCounters();
}

function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const currentTasks = tasks[currentStage];
    
    if (currentTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No tasks in ${currentStage}</h3>
                <p>Add a new task to get started!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentTasks.map(task => `
        <div class="task-card">
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-actions">
                    ${getTaskActions(task)}
                </div>
            </div>
            <div class="task-timestamp">Last modified at: ${task.timestamp}</div>
        </div>
    `).join('');
    
    container.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = parseFloat(this.dataset.taskId);
            const action = this.dataset.action;
            handleTaskAction(taskId, action);
        });
    });
}

function getTaskActions(task) {
    const actions = [];
    
    switch (task.stage) {
        case 'todo':
            actions.push(`<button class="task-btn btn-complete" data-task-id="${task.id}" data-action="complete">Mark as completed</button>`);
            actions.push(`<button class="task-btn btn-archive" data-task-id="${task.id}" data-action="archive">Archive</button>`);
            break;
        case 'completed':
            actions.push(`<button class="task-btn btn-todo" data-task-id="${task.id}" data-action="todo">Move to Todo</button>`);
            actions.push(`<button class="task-btn btn-archive" data-task-id="${task.id}" data-action="archive">Archive</button>`);
            break;
        case 'archived':
            actions.push(`<button class="task-btn btn-todo" data-task-id="${task.id}" data-action="todo">Move to Todo</button>`);
            actions.push(`<button class="task-btn btn-complete" data-task-id="${task.id}" data-action="complete">Move to Completed</button>`);
            break;
    }
    
    return actions.join('');
}

function handleTaskAction(taskId, action) {
    let task = null;
    let sourceStage = null;
    
    for (const stage in tasks) {
        const taskIndex = tasks[stage].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            task = tasks[stage][taskIndex];
            sourceStage = stage;
           
            tasks[stage].splice(taskIndex, 1);
            break;
        }
    }
    
    if (!task) return;
    
    task.timestamp = new Date().toLocaleString();
    
    switch (action) {
        case 'complete':
            task.stage = 'completed';
            tasks.completed.push(task);
            break;
        case 'archive':
            task.stage = 'archived';
            tasks.archived.push(task);
            break;
        case 'todo':
            task.stage = 'todo';
            tasks.todo.push(task);
            break;
    }
    
    saveTasks();
    renderTasks();
    updateCounters();
}

// task counters in the tabs
function updateCounters() {
    document.getElementById('todoCounter').textContent = tasks.todo.length;
    document.getElementById('completedCounter').textContent = tasks.completed.length;
    document.getElementById('archivedCounter').textContent = tasks.archived.length;
}

// tasks to localStorage
function saveTasks() {
    localStorage.setItem('taskFlowTasks', JSON.stringify(tasks));
}