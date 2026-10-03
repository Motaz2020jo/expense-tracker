require("dotenv").config();

const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const cors = require('cors');
app.use(cors());

const {Pool} = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


app.get('/api/expenses' , async (req , res) => {
    try{
        const result = await pool.query("SELECT id,title,amount::float8 AS amount,category,to_char(date, 'YYYY-MM-DD') AS date FROM expenses");
        res.status(200).json({
            message: "Expenses retrieved successfully",
            expenses: result.rows
        });
    }catch(error){
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.get('/api/expenses/:id' , async (req , res) => {
    try{
        const id = Number(req.params.id);
        if(!Number.isInteger(id)){
            return res.status(404).json({
                message: `Expense with id ${req.params.id} was not found`
            });
        }

        const result = await pool.query("SELECT id,title,amount::float8 AS amount,category,to_char(date, 'YYYY-MM-DD') AS date FROM expenses WHERE id = $1" , [id]);
        if(result.rows.length === 0){
            return res.status(404).json({
                message: `Expense with id ${id} was not found`
            });
        }
        res.status(200).json({
            message: "Expense retrieved successfully",
            expense: result.rows[0]
        });
    }catch(error) {
        res.status(500).json({
            message: "Internal server error"
        });
    } 
});


function validateExpense(body) {
    if(!body.title || typeof body.title !== "string" || body.title.trim() === "" || body.title.length > 100) {
            return "Invalid title";
    }
    if(typeof body.amount !== "number" || body.amount <= 0) {
        return "Invalid amount";
    }

    const categories = ["Food" , "Transport" , "Bills" , "Entertainment" , "Other"];
    if(!body.category || !categories.includes(body.category)) {
        return "Invalid category";
    }
    if(!body.date || isNaN(Date.parse(body.date))) {
        return "Invalid date";
    }
    return null;
}
app.post('/api/expenses' , async (req , res) => {
    try{
        const validationError = validateExpense(req.body);

        if(validationError) {
            return res.status(400).json({
                message: validationError
            });
        }
        
        const creatingExpense = await pool.query("INSERT INTO expenses (title, amount, category, date) VALUES ($1,$2,$3,$4) RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date",
            [req.body.title,req.body.amount,req.body.category,req.body.date]);

        res.status(201).json({
            message: "Expense created successfully",
            expense: creatingExpense.rows[0]
        });
    }catch(error){
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.put('/api/expenses/:id' , async (req , res) => {
    try{
        const id = Number(req.params.id);
        if(!Number.isInteger(id)){
            return res.status(404).json({
                message: `Expense with id ${req.params.id} was not found`
            });
        }
        const validationError = validateExpense(req.body);

        if(validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const targetExpense = await pool.query("SELECT id,title,amount::float8 AS amount,category,to_char(date, 'YYYY-MM-DD') AS date FROM expenses WHERE id = $1" , [id]);
        if(targetExpense.rows.length === 0){
            return res.status(404).json({
                message: `Expense with id ${req.params.id} was not found`
            });
        }

        const updatingExpense = await pool.query("UPDATE expenses SET title = $1,amount = $2,category = $3,date = $4 WHERE id = $5 RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date",
            [req.body.title,req.body.amount,req.body.category,req.body.date,id]);
        res.status(200).json({
            message: "Expense updated successfully",
            expense: updatingExpense.rows[0]
        });
    }catch(error){
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.delete('/api/expenses/:id' , async (req , res) => {
    try{
        const id = Number(req.params.id);
        if(!Number.isInteger(id)){
            return res.status(404).json({
                message: `Expense with id ${req.params.id} was not found`
            });
        }

        const targetExpenseToDelete = await pool.query("SELECT id FROM expenses WHERE id = $1" , [id]);
        if(targetExpenseToDelete.rows.length === 0){
            return res.status(404).json({
                message: `Expense with id ${req.params.id} was not found`
            });
        }

        await pool.query("DELETE FROM expenses WHERE id = $1",[id]);
        res.status(200).json({
            message: `Expense with id ${id} was deleted successfully`
        });
    }catch(error){
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.listen(port , () => {
    console.log(`Server running on port: ${port}`);
});