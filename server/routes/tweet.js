const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:1926@localhost:5433/DB_DATAWAREHOUSE';

router.get('/', (req, res, next) => {
  res.sendFile(path.join(
    __dirname, '..', '..', 'client', 'views', 'index.html'));
});

router.post('/heart/salvar', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {
                age: req.body.age, 
                sex: req.body.sex,
                chest_pain_type: req.body.chest_pain_type,
                trestbps: req.body.trestbps,
                chol: req.body.chol, 
                fbs: req.body.restecg,  
                restecg: req.body.restecg, 
                thalach: req.body.thalach, 
                exang: req.body.exang, 
                oldpeak: req.body.oldpeak, 
                slope: req.body.slope, 
                ca: req.body.ca, 
                thal: req.body.thal, 
                target: req.body.target
              };
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO public.heart(age, sex, chest_pain_type, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal, target) '+
    '               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
    [data.age, data.sex, data.chest_pain_type, data.trestbps, data.chol, data.fbs, data.restecg, data.thalach, data.exang, data.oldpeak, data.slope, data.ca, data.thal, data.target]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM heart');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

/**
 * Rota de Medida de Dispersão do Suicídio
 */
router.get('/tweetAll', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    //const query = client.query('SELECT * FROM public.twitter');
    //const query = client.query("SELECT PUBLISH.* FROM TWITTER PUBLISH WHERE PUBLISH.THEME = 'BOLSONARO' AND (CAST(PUBLISH.TIME_CURRENT as DATE) = '2020-05-17')");
    const query = client.query("SELECT * FROM TWITTER WHERE THEME = 'BOLSONARO' AND	(CAST(TIME_CURRENT as DATE)) > '2020-05-16'");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

// url: http://127.0.0.1:3040/tweet/tweetAll/BOLSONARO
router.get('/tweetAll/:theme', (req, res, next) => {
  const results = [];
  const theme = req.params.theme;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM public.twitter WHERE theme = ($1)', [theme]);
    //const query = client.query("SELECT * FROM public.twitter WHERE time_current BETWEEN '2020-05-07' AND '2020-05-08'");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

// url: http://127.0.0.1:3040/tweet/tweetAllPeriodico/BOLSONARO/2020-04-28/2020-05-12
router.get('/tweetAllPeriodico/:theme?/:first_date?/:last_date', (req, res, next) => {
  const results = [];
  const theme = req.params.theme;
  const first_date = req.params.first_date;
  const last_date = req.params.last_date;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT FilterTweetsPeriodo($1, $2, $3)', [theme,first_date,last_date]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.post('/api/v1/todos', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {text: req.body.text, complete: false};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO items(text, complete) values($1, $2)',
    [data.text, data.complete]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.put('/api/v1/todos/:todo_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
  // Grab data from http request
  const data = {text: req.body.text, complete: req.body.complete};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    client.query('UPDATE items SET text=($1), complete=($2) WHERE id=($3)',
    [data.text, data.complete, id]);
    // SQL Query > Select Data
    const query = client.query("SELECT * FROM items ORDER BY id ASC");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});

router.delete('/api/v1/todos/:todo_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM items WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;
