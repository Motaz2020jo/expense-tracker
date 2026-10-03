// Expense Tracker - frontend logic

const API_URL = "http://localhost:3000/api/expenses";


const spinner = document.getElementById('spinner-container');
const alertContainer = document.getElementById('alert-container');

const darkModeBtn = document.getElementById('darkModeBtn');
darkModeBtn.addEventListener("click" , () => {
    if (darkModeBtn.checked) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }

    renderChart(expenses);
});


function showAlert(message) {
    alertContainer.innerHTML = "";
    let alert = document.createElement('div');
    alert.className = "alert alert-danger";
    alert.textContent = message;
    alertContainer.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
async function getExpenses(){
    try{
        spinner.style.visibility = "visible";
        const response = await fetch(API_URL);
        if(!response.ok){
            const err = await response.json();
            showAlert(err.message);
            return false;
        }

        const data = await response.json();
        return data.expenses;
    }catch(error){
        showAlert("Unable to connect to the server. Please try again.");
        return false;
    }finally{
        spinner.style.visibility = "hidden";
    }
}


async function addExpense(data){
    try{
        spinner.style.visibility = "visible";
        let response = await fetch(API_URL , {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if(!response.ok){
            const err = await response.json();
            showAlert(err.message);
            return false;
        }

        await response.json();
        return true;
    }catch(error){
        showAlert("Unable to connect to the server. Please try again.");
        return false;
    }finally{
        spinner.style.visibility = "hidden";
    }
}


async function updateExpense(id,data){
    try{
        spinner.style.visibility = "visible";
        let response = await fetch(API_URL + "/" + id,
        { 
            method: "put",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if(!response.ok){
            const err = await response.json();
            showAlert(err.message);
            return false;
        }

        await response.json();
        return true;
    }catch(error){
        showAlert("Unable to connect to the server. Please try again.");
        return false;
    }finally{
    spinner.style.visibility = "hidden";
    }
}


async function deleteExpense(id){
    try{
        spinner.style.visibility = "visible";
        let response = await fetch(API_URL + "/" + id , {
            method: "delete",
        });

        if(!response.ok){
            const err = await response.json();
            showAlert(err.message);
            return false;
        }
        
        await response.json();
        return true;
    }catch(error){
        showAlert("Unable to connect to the server. Please try again.");
        return false;
    }finally{
        spinner.style.visibility = "hidden";
    }
}


let expenses = [];
async function refresh() {
    expenses = await getExpenses();
    if(!expenses){
        return;
    }
    filteredExpenses = expenses;
    renderTable(expenses);
    renderSummary(expenses);    
    renderChart(expenses);
}

// ----------------------------------------------------------------------------
const addingExpense = document.getElementById('addExpenseBtn');
addingExpense.addEventListener("click" , () => handleAddExpense());
async function handleAddExpense(){
    let title = document.getElementById('title').value;
    let amount = document.getElementById('amount').value;
    let category = document.getElementById('category').value;
    let date = document.getElementById('date').value;

    if(title.trim() === ""){
        showAlert("Please enter a title.");
        return;
    }

    if(amount <= 0 || Number.isNaN(Number(amount))){
        showAlert("Please enter an amount greater than 0.");
        return;
    }

    amount = Number(amount);
    
    const categories = ["Food" , "Transport" , "Bills" , "Entertainment" , "Other"];
    if(!categories.includes(category)){
        showAlert("Please choose a valid category.");
        return;
    }

    if(date === "" || isNaN(Date.parse(date))){
        showAlert("Please enter a valid date.");
        return;
    }

    const data = {
        title: title,
        amount: amount,
        category: category,
        date: date
    };
    const isSuccess = await addExpense(data);
    if(!isSuccess){
        return;
    }
    await refresh();
    document.getElementById('addExpenseForm').reset();
}


const filteringCategories = document.getElementById('categoryFilter');
filteringCategories.addEventListener("change" , () => applyFilters());

const searchByTitle = document.getElementById('searchByTitle');
searchByTitle.addEventListener("input" , () => applyFilters());

const filteringMonths = document.getElementById('monthFilter');
filteringMonths.addEventListener("change" , () => applyFilters());
// search and filter
let filteredExpenses = [];
function applyFilters() {
    let selectedCategory = filteringCategories.value;
    let inputValue = searchByTitle.value.toLowerCase();
    let selectedMonth = filteringMonths.value;

    filteredExpenses = expenses.filter(expense => {
        return (selectedCategory === "All" || expense.category === selectedCategory)
            && expense.title.toLowerCase().includes(inputValue)
            && (selectedMonth === "All" || expense.date.split("-")[1] === selectedMonth);
    });

    renderTable(filteredExpenses);
}

const exportCsvBtn = document.getElementById('exportCsvBtn');

exportCsvBtn.addEventListener("click" , () => exportToCsv());
function exportToCsv() {
    let csvRows = [];
    csvRows.push(["Title", "Amount", "Category", "Date"]);

    for(let expense of filteredExpenses){
        csvRows.push([expense.title , expense.amount , expense.category , expense.date]);
    }

    let csvContent = csvRows.map(row => row.join(",")).join("\n");
    let downloadableFile = new Blob([csvContent] , {type: "text/csv"});

    let url = URL.createObjectURL(downloadableFile);
    let link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    link.click();

    URL.revokeObjectURL(url);
}



let editingExpenseId = 0;
function handleEdit(expenseToEdit){
    document.getElementById('editTitle').value = expenseToEdit.title;
    document.getElementById('editAmount').value = expenseToEdit.amount;
    document.getElementById('editCategory').value = expenseToEdit.category;
    document.getElementById('editDate').value = expenseToEdit.date;

    let editModal = new bootstrap.Modal(document.getElementById('editExpenseModal'));
    editModal.show();

    editingExpenseId = expenseToEdit.id;
}
function showEditAlert(message){
    const editAlertContainer = document.getElementById("edit-alert-container");
    editAlertContainer.innerHTML = "";

    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.textContent = message;

    editAlertContainer.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
let saveBtn = document.getElementById('saveEditBtn');
saveBtn.addEventListener("click" , async () => {
    let title = document.getElementById('editTitle').value;
    let amount = document.getElementById('editAmount').value;
    let category = document.getElementById('editCategory').value;
    let date = document.getElementById('editDate').value;

    if(title.trim() === "" || title.length > 100){
        showEditAlert("Please enter a title between 1 and 100 characters.");
        return;
    }
    if(amount <= 0 || isNaN(Number(amount))){
        showEditAlert("Please enter an amount greater than 0.");
        return;
    }
    const categories = ["Food" , "Transport" , "Bills" , "Entertainment" , "Other"];
    if(!categories.includes(category)){
        showEditAlert("Please choose a valid category.");
        return;
    }
    if(date === "" || isNaN(Date.parse(date))){
        showEditAlert("Please enter a valid date.");
        return;
    }
    amount = Number(amount);
    const data = {
        title: title,
        amount: amount,
        category: category,
        date: date
    };

    const isSuccess = await updateExpense(editingExpenseId , data);
    if(!isSuccess){
        return;
    }
    await refresh();

    let editModal = bootstrap.Modal.getInstance(document.getElementById('editExpenseModal'));

    editModal.hide();
});

async function handleDelete(expenseToDelete){
    const isSuccess = await deleteExpense(expenseToDelete.id);
    if(!isSuccess){
        return;
    }
    await refresh();
}


const sortableAmount = document.getElementById("sortableAmount");
const sortableDate = document.getElementById("sortableDate");

sortableAmount.addEventListener("click" , () => sortByAmount());
sortableDate.addEventListener("click" , () => sortByDate());

let amountAscending = true;

function sortByAmount() {
    if(amountAscending){
        expenses.sort((a , b) => a.amount - b.amount);
    }else {
        expenses.sort((a , b) => b.amount - a.amount);
    }
    amountAscending = !amountAscending;
    renderTable(expenses);
}

let dateAscending = true;
function sortByDate(){
    if(dateAscending){
        expenses.sort((a , b) => new Date(a.date) - new Date(b.date));
    }else {
        expenses.sort((a , b) => new Date(b.date) - new Date(a.date));
    }
    dateAscending = !dateAscending;
    renderTable(expenses);
}
const categoriesColors = {
    Food: "text-bg-success",
    Transport: "text-bg-primary",
    Bills: "text-bg-warning",
    Entertainment: "text-bg-secondary",
    Other: "text-bg-info"
};
function renderTable(list){
    let tbodyData = document.getElementById('expensesTableBody');
    tbodyData.innerHTML = "";
    for(let expense of list){
        let row = document.createElement('tr');

        let titleColumn = document.createElement('td');
        titleColumn.textContent = expense.title;
        row.appendChild(titleColumn);

        let amountColumn = document.createElement('td');
        amountColumn.textContent = expense.amount;
        row.appendChild(amountColumn);

        let categoryColumn = document.createElement('td');
        let categoryBadge = document.createElement('span');
        categoryBadge.textContent = expense.category;
        categoryBadge.className = "badge";
        categoryBadge.classList.add(categoriesColors[expense.category]);

        categoryColumn.appendChild(categoryBadge);
        row.appendChild(categoryColumn);

        let dateColumn = document.createElement('td');
        dateColumn.textContent = expense.date;
        row.appendChild(dateColumn);

        let actions = document.createElement('td');
        actions.className = "d-flex flex-column flex-md-row gap-2";
        let editbtn = document.createElement('button');
        editbtn.textContent = "Edit";
        editbtn.className = "btn bg-success-subtle btn-sm";
        editbtn.addEventListener("click" , () => handleEdit(expense));

        let deletebtn = document.createElement('button');
        deletebtn.textContent = "Delete";
        deletebtn.className = "btn btn-danger btn-sm";
        deletebtn.addEventListener("click" , () => handleDelete(expense));

        actions.appendChild(editbtn);
        actions.appendChild(deletebtn);
        row.appendChild(actions);

        tbodyData.appendChild(row);
    }
}
refresh();


function renderSummary(list){
    let totalAmount = 0;
    let highestExpenseAmount = 0;
    let highestExpenseTitle = "";

    for(let expense of list){
        totalAmount += expense.amount;
        if(expense.amount > highestExpenseAmount){
            highestExpenseAmount = expense.amount;
            highestExpenseTitle = expense.title;
        }
    }
    let numberOfExpenses = list.length;

    let total = document.getElementById('totalAmount');
    total.textContent = totalAmount;

    let number = document.getElementById('expensesCount');
    number.textContent = numberOfExpenses;

    let highestAmount = document.getElementById('highestExpenseAmount');
    highestAmount.textContent = highestExpenseAmount;

    let highestTitle = document.getElementById('highestExpenseTitle');
    highestTitle.textContent = highestExpenseTitle;
}

const chart = document.getElementById('chart');
let categoriesChart;
function renderChart(list) {
    if (categoriesChart) {
        categoriesChart.destroy();
    }

    let totalAmountPerCategory = {
        Food: 0,
        Transport: 0,
        Bills: 0,
        Entertainment: 0,
        Other: 0
    };

    for(let expense of list){
        totalAmountPerCategory[expense.category] += expense.amount;
    }

    categoriesChart = new Chart(chart , {
        type: 'doughnut',
        data: {
            labels: Object.keys(totalAmountPerCategory),
            datasets: [{
                label: 'Category',
                data: Object.values(totalAmountPerCategory),
                backgroundColor: [
                    '#198754', 
                    '#0d6efd', 
                    '#ffc107', 
                    '#6c757d', 
                    '#0dcaf0'  
                ]
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses by Category',
                    color: '#5ee6a8',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: darkModeBtn.checked ? '#ffffff' : '#666666'
                    }
                }
            }
        }
    });
}