
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const year = document.getElementById("year");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("taskflow-tasks"));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(
            task =>
                task &&
                typeof task.id === "string" &&
                typeof task.text === "string" &&
                typeof task.completed === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

year.textContent = new Date().getFullYear();

function saveTasks() {
    try {
        localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Tasks could not be saved in this browser.");
    }
}

function updateTaskCount() {
    const remaining = tasks.filter(task => !task.completed).length;

    taskCount.textContent =
        `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as ${task.completed ? "active" : "completed"}`
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(existingTask => existingTask.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, deleteButton);
        taskList.appendChild(item);
    });

    emptyMessage.hidden = visibleTasks.length > 0;

    if (visibleTasks.length === 0) {
        emptyMessage.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task above!"
            : "No tasks match this filter.";
    }

    updateTaskCount();
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskInput.focus();
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        text,
        completed: false
    });

    saveTasks();
    currentFilter = "all";

    filterButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.filter === "all");
    });

    taskForm.reset();
    taskInput.focus();
    renderTasks();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(filterButton => {
            const isActive = filterButton === button;
            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });

        renderTasks();
    });

    button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === currentFilter)
    );
});

clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

renderTasks();
