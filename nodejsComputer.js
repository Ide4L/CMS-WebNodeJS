const express = require('express');
const { check, validationResult } = require('express-validator');
const mysql = require('mysql');
const util = require('util');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

// MySQL database configuration
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: '', // Replace with your database password
  database: 'Ideal1',
});

const query = util.promisify(pool.query).bind(pool);

app.get('', (req, res) => {
  res.sendFile(__dirname + '/addText.html');
});

app.post('/submit', [
  check('processor').notEmpty(),
  check('ram').notEmpty(),
  check('ssd').notEmpty(),
  check('graphics').notEmpty(),
  check('price').notEmpty(),
  check('material_color').notEmpty(),
  check('monitor').notEmpty().isIn(['0', '1']).withMessage('Monitor must be "0" or "1'),
  check('playvideo').notEmpty().isIn(['0', '1']).withMessage('Playvideo must be "0" or "1'),
  check('importModel').notEmpty(), // Validation for ImportModel
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { processor, ram, ssd, graphics, price, material_color, monitor, playvideo, importModel } = req.body;
    const insertQuery = 'INSERT INTO computer (Processor, Ram, SSD, Graphics, Price, material_color, Monitor, Playvideo, ImportModel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await query(insertQuery, [processor, ram, ssd, graphics, price, material_color, monitor, playvideo, importModel]);
    res.send('<script>alert("Data submitted successfully."); window.location = "/";</script>');
  } catch (error) {
    console.error("Error inserting data into the database: " + error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/update/:id', async (req, res) => {
  try {
    const idToUpdate = req.params.id;
    const { processor, ram, ssd, graphics, price, material_color, importModel } = req.body;

    const updateQuery = 'UPDATE computer SET Processor=?, Ram=?, SSD=?, Graphics=?, Price=?, material_color=?, ImportModel=? WHERE id = ?';
    await query(updateQuery, [processor, ram, ssd, graphics, price, material_color, importModel, idToUpdate]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating the database entry: " + error.message);
    res.json({ success: false });
  }
});

app.delete('/delete/:id', async (req, res) => {
  try {
    const idToDelete = req.params.id;

    const deleteQuery = 'DELETE FROM computer WHERE id = ?';
    await query(deleteQuery, idToDelete);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting the database entry: " + error.message);
    res.json({ success: false });
  }
});

app.get('/getdata', async (req, res) => {
  try {
    const selectQuery = 'SELECT * FROM computer';
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
    const selectQuery = 'SELECT * FROM computer ORDER BY id DESC LIMIT 1';
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

      const selectQuery = 'SELECT id, processor, ram, ssd, graphics, price, material_color, playvideo, importmodel FROM computer'; 

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

app.put('/edit', async (req, res) => {
  try {
      const { processor, ram, ssd, graphics, price, material_color, importModel } = req.body;
      const idToUpdate = 1; // Replace with the ID of the entry you want to edit

      const updateQuery = 'UPDATE computer SET Processor=?, Ram=?, SSD=?, Graphics=?, Price=?, material_color=?, ImportModel=? WHERE id = ?';
      await query(updateQuery, [processor, ram, ssd, graphics, price, material_color, importModel, idToUpdate]);
      res.json({ success: true });
  } catch (error) {
      console.error("Error updating the database entry: " + error.message);
      res.json({ success: false });
  }
});

app.get('/getLastMaterialColor', async (req, res) => {
  try {
    // Query your database to get the last material color data.
    const selectQuery = 'SELECT material_color FROM computer ORDER BY id DESC LIMIT 1'; // Retrieve the most recent entry
    const result = await query(selectQuery);

    if (result.length > 0) {
      const colorData = result[0].material_color;
      res.json({ material_color: colorData });
    } else {
      res.status(404).send('No color data found.');
    }
  } catch (error) {
    console.error("Error retrieving last material color data from the database: " + error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getLastMonitorData', async (req, res) => {
  try {
      // Query your database to get the last monitor data.
      const selectQuery = 'SELECT Monitor FROM computer ORDER BY id DESC LIMIT 1';
      const result = await query(selectQuery);

      if (result.length > 0) {
          // Extract the monitor value (0 or 1) from the result.
          const lastMonitorData = result[0].Monitor;
          res.send(lastMonitorData.toString());
      } else {
          res.status(404).send('No monitor data found.');
      }
  } catch (error) {
      console.error("Error retrieving last monitor data from the database: " + error.message);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/getLastPlayvideoData', async (req, res) => {
  try {
      // Query your database to get the last monitor data.
      const selectQuery = 'SELECT Playvideo FROM computer ORDER BY id DESC LIMIT 1';
      const result = await query(selectQuery);

      if (result.length > 0) {
          // Extract the monitor value (0 or 1) from the result.
          const lastMonitorData1 = result[0].Playvideo;
          res.send(lastMonitorData1.toString());
      } else {
          res.status(404).send('No monitor data found.');
      }
  } catch (error) {
      console.error("Error retrieving last monitor data from the database: " + error.message);
      res.status(500).send('Internal Server Error');
  }
});


app.get('/getLastModelLink', async (req, res) => {
  try {
      // Query your database to get the last monitor data.
      const selectQuery = 'SELECT ImportModel FROM computer ORDER BY id DESC LIMIT 1';
      const result = await query(selectQuery);

      if (result.length > 0) {
          // Extract the monitor value (0 or 1) from the result.
          const lastModelLink = result[0].ImportModel;
          res.send(lastModelLink.toString());
      } else {
          res.status(404).send('No monitor data found.');
      }
  } catch (error) {
      console.error("Error retrieving last monitor data from the database: " + error.message);
      res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
