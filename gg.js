const express = require('express');
const { check, validationResult } = require('express-validator');
const mysql = require('mysql');
const util = require('util');
const app = express();
const port = process.env.PORT || 5000;
const serverless = require('serverless-http');
const router = express.Router();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MySQL database configuration
const pool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    user: 'root',
    password: '', // Replace with your database password
    database: 'Ideal1',
});

const query = util.promisify(pool.query).bind(pool);
app.use(express.static(__dirname));




app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');

});

app.post('/submit', [
    check('motorinfo').notEmpty(),
    check('wheelinfo').notEmpty(),
    check('materialcolor').notEmpty(),
    
    check('modelobject').notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { motorinfo, wheelinfo, materialcolor, doanimation, modelobject } = req.body;
        const insertQuery = 'INSERT INTO excavator (MotorInfo, WheelInfo, MaterialColor, DoAnimation, ModelObject) VALUES (?, ?, ?, ?, ?)';
        await query(insertQuery, [motorinfo, wheelinfo, materialcolor, doanimation, modelobject]);
        res.send('<script>alert("Data submitted successfully."); window.location = "/";</script>');
    } catch (error) {
        console.error("Error inserting data into the database: " + error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getdata', async (req, res) => {
    try {
        const selectQuery = 'SELECT * FROM excavator';
        const results = await query(selectQuery);
        res.json(results);
    } catch (error) {
        console.error("Error retrieving data from the database: " + error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Get the last data
app.get('/getlastdata', async (req, res) => {
    try {
      const selectQuery = 'SELECT * FROM excavator ORDER BY id DESC LIMIT 1';
      const result = await query(selectQuery);
  
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).send('No data found.');
      }
    } catch (error) {
      console.error("Error retrieving last data from the database: " + error.message);
      res.status(500).send('Internal Server Error');
    }
  });

  
app.get('/getDropdownData', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error connecting to the database: " + err.message);
            res.status(500).send("Internal Server Error");
            return;
        }

        const selectQuery = 'SELECT id, motorinfo, wheelinfo, materialcolor, doanimation, modelobject FROM excavator';

        connection.query(selectQuery, (err, results) => {
            connection.release();

            if (!err) {
                res.json(results);
            } else {
                console.error("Error retrieving data from the database: " + err.message);
                res.status(500).send('Internal Server Error');
            }
        });
    });
});




app.get('/getLastMaterialColor', async (req, res) => {
    try {
        // Query your database to get the last material color data.
        const selectQuery = 'SELECT materialcolor FROM excavator ORDER BY id DESC LIMIT 1'; // Retrieve the most recent entry
        const result = await query(selectQuery);

        if (result.length > 0) {
            const colorData = result[0].materialcolor;
            res.json({ color: colorData });
        } else {
            res.status(404).send('No color data found.');
        }
    } catch (error) {
        console.error("Error retrieving last material color data from the database: " + error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getLastModelLink', async (req, res) => {
    try {
        // Query your database to get the last monitor data.
        const selectQuery = 'SELECT modelobject FROM excavator ORDER BY id DESC LIMIT 1';
        const result = await query(selectQuery);

        if (result.length > 0) {
            // Extract the monitor value (0 or 1) from the result.
            const lastModelLink = result[0].modelobject;
            res.send(lastModelLink.toString());
        } else {
            res.status(404).send('No monitor data found.');
        }
    } catch (error) {
        console.error("Error retrieving last monitor data from the database: " + error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getLastanimation', async (req, res) => {
    try {
        // Query your database to get the last monitor data.
        const selectQuery = 'SELECT doanimation FROM excavator ORDER BY id DESC LIMIT 1';
        const result = await query(selectQuery);

        if (result.length > 0) {
            // Extract the monitor value (0 or 1) from the result.
            const lastanim = result[0].doanimation;
            res.send(lastanim.toString());
        } else {
            res.status(404).send('No monitor data found.');
        }
    } catch (error) {
        console.error("Error retrieving last monitor data from the database: " + error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/updateLastRow', async (req, res) => {
    try {
        const { motorinfo, wheelinfo, materialcolor, doanimation, modelobject } = req.body;

        // Update the last row in the database
        const updateQuery = 'UPDATE excavator SET MotorInfo = ?, WheelInfo = ?, MaterialColor = ?, DoAnimation = ?, ModelObject = ? ORDER BY id DESC LIMIT 1';
        await query(updateQuery, [motorinfo, wheelinfo, materialcolor, doanimation, modelobject]);

        res.status(200).send('Update successful');
    } catch (error) {
        console.error('Error updating data in the database:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


app.use('./functions/api', router);
module.exports.handler = serverless(app);

app.listen(port, () => console.log(`Listening on port ${port}`));
