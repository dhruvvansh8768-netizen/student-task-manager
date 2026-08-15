const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let history = JSON.parse(localStorage.getItem("taskHistory")) || [];
let currentFilter = "all";

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("taskHistory", JSON.stringify(history));
}

function showHistory() {
  taskList.innerHTML = "";

  if (history.length === 0) {
    emptyMessage.style.display = "block";
    emptyMessage.textContent = "No completed task history yet.";
    return;
  }

  emptyMessage.style.display = "none";

  history.forEach((item) => {
    const li = document.createElement("li");
    li.className = "task-item history-item";

    const textBox = document.createElement("div");
    textBox.className = "task-text";
    textBox.textContent = item.text;

    const completedDate = document.createElement("span");
    completedDate.className = "task-date";
    completedDate.textContent = `Completed: ${item.completedAt}`;

    li.append(textBox, completedDate);
    taskList.appendChild(li);
  });
}

function renderTasks() {
  if (currentFilter === "history") {
    showHistory();
    return;
  }

  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "pending") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  if (filteredTasks.length === 0) {
    emptyMessage.style.display = "block";
    emptyMessage.textContent = "No tasks found.";
  } else {
    emptyMessage.style.display = "none";
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;

      if (task.completed) {
        task.completedAt = new Date().toLocaleString();

        history.unshift({
          id: Date.now(),
          text: task.text,
          completedAt: task.completedAt
        });
      } else {
        task.completedAt = null;
      }

      saveData();
      renderTasks();
    });

    const textBox = document.createElement("div");
    textBox.className = "task-text";
    textBox.textContent = task.text;

    const dueDate = document.createElement("span");
    dueDate.className = "task-date";

    if (task.completed && task.completedAt) {
      dueDate.textContent = `Completed: ${task.completedAt}`;
    } else if (task.date) {
      dueDate.textContent = `Due: ${task.date}`;
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveData();
      renderTasks();
    });

    li.append(checkbox, textBox, dueDate, deleteButton);
    taskList.appendChild(li);
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newTask = {
    id: Date.now(),
    text: taskInput.value.trim(),
    date: dateInput.value,
    completed: false,
    completedAt: null
  };

  if (!newTask.text) {
    return;
  }

  tasks.push(newTask);
  saveData();
  taskForm.reset();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    renderTasks();
  });
});

renderTasks();
