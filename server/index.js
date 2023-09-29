const express = require('express');
const cors = require('cors');
const knex = require('knex');
require('dotenv').config();



const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD,
});


const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS implemented so that we don't get errors when trying to access the server from a different server location
app.use(cors());

// POST: Create Users and send to the database
app.post('/add-users', (req, res) => {

    const sentUserName = req.body.user
    const sentEmail = req.body.email
    const sentPassword = req.body.password
    //const hashedPassword = bcrypt.hashSync(sentPassword,  bcrypt.genSaltSync())
    const SQL = 'INSERT INTO users (username, email, password) values ($1, $2, $3)'
    const Values = [sentUserName, sentEmail, sentPassword]
    pool.query(SQL, Values, (err, results) => {
        if (err) {
            return res.send(err)
        }
        else {
            console.log("User Inserted Successfully!")
            return res.json({ message: 'New User Added', results })
        }
    })
})

//new Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email or password exists in the database
        const query = 'SELECT * FROM users WHERE email = $1 and password = $2';
        const values = [email, password];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Return a success response with the user data
        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//POST: Fetch Customer Data from Database
app.get('/getcustomers', async (req, res) => {
    try{
        const allcustomers = await pool.query("select * from customers");
        res.json(allcustomers.rows);
        console.log("success");
    } catch (err) {
        console.error(err.message);
    }
})

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));