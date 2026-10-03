# Expense Tracker

Expense Tracker is a web application for managing personal expenses. It uses a Node.js + Express backend with PostgreSQL to store and manage expense data through a REST API.

## How to run

1. Create the database:
     Open PostgreSQL using pgAdmin and create a new database named: expense_tracker

2. Run the database schema: 
     Open the schema.sql file in pgAdmin's Query Tool and run it.
     This will create the expenses table and insert the sample data.

3. Create the .env file:
     In the backend project folder, create a file named: .env
     Add your PostgreSQL connection information:
          DB_HOST=localhost 
          DB_PORT=5432 
          DB_NAME=expense_tracker 
          DB_USER=postgres 
          DB_PASSWORD=your_postgresql_password
     Replace your_postgresql_password with your PostgreSQL password.

4. Install the required packages:
     Open a terminal in the project folder and run: npm install


**Backend**

1. Make sure Node.js and PostgreSQL are installed.
2. Create a PostgreSQL database named expense_tracker using pgAdmin.
3. Open the database and run the schema.sql file to create the expenses table and insert sample data.
4. Copy .env.example to a new file named .env in the backend folder, then add your PostgreSQL password.
5. Open the terminal in the backend folder.
6. Install the required packages: npm install express cors pg dotenv
7. Start the backend: node server.js
8. The API will run at: http://localhost:3000

**Frontend**

1. Open the frontend project folder in VS Code.
2. Make sure the backend server is running.
3. Open the index.html file using VS Code Live Server.
4. The Expense Tracker application will open in the browser.

## Features

- [1] Add an expense (with validation)
- [2] Delete an expense
- [3] Edit an expense
- [4] Filter by category
- [5] Summary cards (total, count, highest)
- [6] Data is saved in a PostgreSQL database
- [7] Search expenses by title
- [8] Filter expenses by month
- [9] Sort expenses by amount and date
- [10] Display expenses by category using Chart.js
- [11] Export expenses as CSV
- [12] Dark mode


## Screenshots

![[desktop-img1.png]]
![[desktop-img2.png]]
![[desktop-img3.png]]
![[desktop-img4.png]]

![[iphone16-1.png]]
![[iphone16-2.png]]
![[iphone16-3.png]]
## What was the hardest part?

The hardest part was working with the frontend JavaScript and understanding how different parts of the code depend on each other. Testing the application helped me discover and fix errors that were not always obvious from the code itself. I also learned how important it is to organize the code and test each feature after making changes. Another challenge was connecting the frontend with the backend API and making sure that all operations worked correctly together.

## Links:
Demo Video for the project: https://drive.google.com/file/d/1G8LXYydAjyPFkN3OCxulduSX20KrmiKj/view?usp=sharing

Github Link: 