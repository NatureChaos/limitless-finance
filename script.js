
// ======================================
// LIMITLESS FINANCE
// Main JavaScript
// ======================================


// 1. LOAD SAVED TRANSACTIONS

let transactions = JSON.parse(
    localStorage.getItem("limitlessTransactions") || "[]"
);

// Save transactions in the browser
function saveTransactions() {
    localStorage.setItem(
        "limitlessTransactions",
        JSON.stringify(transactions)
    );
}


// 2. LOAD SAVINGS INFORMATION

let savedAmount = Number(
    localStorage.getItem("limitlessSavedAmount")
) || 0;

let savingsTarget = Number(
    localStorage.getItem("limitlessSavingsTarget")
) || 0;


// 3. CONNECT JAVASCRIPT TO HTML ELEMENTS

const transactionForm = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");

const balanceDisplay = document.getElementById("balance");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");

const clearAllButton = document.getElementById("clear-all");
const filterButtons = document.querySelectorAll(".filter-btn");

const savingsForm = document.getElementById("savings-form");

// Supports either savings-amount or saved-amount as the HTML ID
const savingsAmountInput =
    document.getElementById("savings-amount") ||
    document.getElementById("saved-amount");

const savingsTargetInput = document.getElementById("savings-target");
const savingsGoalDisplay = document.getElementById("savings-goal");
const savingsDetails = document.getElementById("savings-details");


// 4. KEEP TRACK OF THE SELECTED FILTER

let currentFilter = "all";


// 5. FORMAT NUMBERS AS US DOLLARS

function formatMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}


// 6. CALCULATE INCOME, EXPENSES, AND BALANCE

function updateSummary() {

    const totalIncome = transactions
        .filter(transaction => transaction.amount > 0)
        .reduce((total, transaction) => {
            return total + transaction.amount;
        }, 0);

    const totalExpenses = transactions
        .filter(transaction => transaction.amount < 0)
        .reduce((total, transaction) => {
            return total + Math.abs(transaction.amount);
        }, 0);

    const balance = totalIncome - totalExpenses;

    balanceDisplay.textContent = formatMoney(balance);
    incomeDisplay.textContent = formatMoney(totalIncome);
    expenseDisplay.textContent = formatMoney(totalExpenses);
}


// 7. DISPLAY TRANSACTIONS ON THE SCREEN

function displayTransactions() {

    transactionList.textContent = "";

    const filteredTransactions = transactions.filter(transaction => {

        if (currentFilter === "income") {
            return transaction.amount > 0;
        }

        if (currentFilter === "expense") {
            return transaction.amount < 0;
        }

        return true;
    });

    filteredTransactions.forEach(transaction => {

        const listItem = document.createElement("li");

        const transactionName = document.createElement("span");
        transactionName.textContent = transaction.description;

        const transactionAmount = document.createElement("strong");

        transactionAmount.textContent = formatMoney(
            Math.abs(transaction.amount)
        );

        transactionAmount.style.color =
            transaction.amount > 0 ? "#38bdf8" : "#c084fc";

        listItem.appendChild(transactionName);
        listItem.appendChild(transactionAmount);

        listItem.style.display = "flex";
        listItem.style.justifyContent = "space-between";
        listItem.style.alignItems = "center";
        listItem.style.gap = "20px";

        transactionList.appendChild(listItem);
    });
}


// 8. UPDATE THE DASHBOARD

function updateApp() {
    updateSummary();
    displayTransactions();
}


// 9. ADD A NEW TRANSACTION

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);

    if (description === "" || !Number.isFinite(amount) || amount === 0) {
        alert("Please enter a description and a valid amount.");
        return;
    }

    const newTransaction = {
        id: Date.now(),
        description: description,
        amount: amount
    };

    transactions.push(newTransaction);

    saveTransactions();

    transactionForm.reset();

    updateApp();
});


// 10. CALCULATE SAVINGS PROGRESS

function updateSavingsProgress() {

    let progress = 0;

    if (savingsTarget > 0) {
        progress = Math.min(
            (savedAmount / savingsTarget) * 100,
            100
        );
    }

    savingsGoalDisplay.textContent =
        `Progress: ${progress.toFixed(1)}%`;

    savingsDetails.textContent =
        `${formatMoney(savedAmount)} saved of ${formatMoney(savingsTarget)}`;
}


// 11. UPDATE AND SAVE THE SAVINGS GOAL

savingsForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newSavedAmount = Number(savingsAmountInput.value);
    const newSavingsTarget = Number(savingsTargetInput.value);

    if (
        !Number.isFinite(newSavedAmount) ||
        !Number.isFinite(newSavingsTarget) ||
        newSavedAmount < 0 ||
        newSavingsTarget <= 0
    ) {
        alert("Please enter a valid savings amount and goal.");
        return;
    }

    savedAmount = newSavedAmount;
    savingsTarget = newSavingsTarget;

    // Save savings information in the browser
    localStorage.setItem(
        "limitlessSavedAmount",
        savedAmount.toString()
    );

    localStorage.setItem(
        "limitlessSavingsTarget",
        savingsTarget.toString()
    );

    updateSavingsProgress();
});


// 12. CLEAR ALL TRANSACTIONS

clearAllButton.addEventListener("click", function() {

    if (transactions.length === 0) {
        return;
    }

    const confirmClear = confirm(
        "Are you sure you want to clear all transactions?"
    );

    if (confirmClear) {
        transactions = [];

        saveTransactions();

        updateApp();
    }
});


// 13. FILTER TRANSACTIONS

filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(filterButton => {
            filterButton.classList.remove("active");
        });

        button.classList.add("active");

        displayTransactions();
    });
});


// 14. RESTORE SAVINGS INPUTS AFTER REFRESH

savingsAmountInput.value = savedAmount || "";
savingsTargetInput.value = savingsTarget || "";


// 15. LOAD THE DASHBOARD WHEN THE PAGE OPENS

updateApp();
updateSavingsProgress();
