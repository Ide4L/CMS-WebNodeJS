const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL database configuration
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: '', // Replace with your database password
  database: 'Ideal1',
});

app.get('', (req, res) => {
  res.sendFile(__dirname + '/addText.html');
});

// Handle form submission and update data in the database
app.post('/update-data', (req, res) => {
  const { id, processor, ram, ssd, graphics, price } = req.body;

  // Validate and sanitize user inputs
  if (!id || !processor || !ram || !ssd || !graphics || !price) {
    res.status(400).send('Invalid input data.');
    return;
  }

  // Sanitize inputs to prevent SQL injection
  const idSafe = mysql.escape(id);
  const processorSafe = mysql.escape(processor);
  const ramSafe = mysql.escape(ram);
  const ssdSafe = mysql.escape(ssd);
  const graphicsSafe = mysql.escape(graphics);
  const priceSafe = mysql.escape(price);

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database: " + err.message);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Update the row based on the ID
    const updateQuery = 'UPDATE computer SET Processor = ?, Ram = ?, SSD = ?, Graphics = ?, Price = ? WHERE id = ?';
    connection.query(updateQuery, [processorSafe, ramSafe, ssdSafe, graphicsSafe, priceSafe, idSafe], (err, result) => {
      connection.release();

      if (!err) {
        res.send('<script>alert("Data updated successfully."); window.location = "/";</script>');
      } else {
        console.error("Error updating data in the database: " + err.message);
        res.status(500).send('Internal Server Error');
      }
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
