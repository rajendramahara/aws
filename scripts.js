const username = localStorage.getItem('username');
const email = localStorage.getItem('email');
document.getElementById('username').textContent = username;
document.getElementById('email').textContent = email;

const getTodosUrl = "https://njheruhidl.execute-api.us-east-1.amazonaws.com/todos";
async function fetchTodos() {
    try {
        const response = await fetch(getTodosUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('id_token') || ''}`
            }
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const todos = await response.json();
        console.log("Fetched todos:", todos);
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = ''; // Clear existing todos
        todos.todos.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.text["S"];
            todoList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

fetchTodos();

const todoForm = document.getElementById('todo-form');
todoForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const todoInput = document.getElementById('todo-input');
    const todoText = todoInput.value.trim();
    if (todoText) {
        addTodo(todoText);
    }
});

async function addTodo(todoText) {
    const setTodo = await fetch(getTodosUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('id_token') || ''}`
        },
        body: JSON.stringify({
            text: todoText,
            userId: localStorage.getItem('username'),
            todoId: Date.now().toString()
        })
    });

    const data = await setTodo.json();
    console.log("Add Todo response:", data);
    window.location.reload();
}