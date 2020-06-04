const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const routes = require(path.resolve('./server/routes/suicidio'));
const routesHeart = require(path.resolve('./server/routes/heart'));
const routesTweet = require(path.resolve('./server/routes/tweet'));
// var users = require('./routes/users');

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

if( cluster.isMaster ){
  console.log(`Master ${process.pid} is running`);

  // gera os workers
  for( let i = 0; i < numCPUs; i++ )
    cluster.fork();

  // checa se existem workers mortos
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });

}else{

  // Estes são os workers que podem compartilhar qualquer conexão TCP
  // Serão inicializados usando o express
  console.log(`Worker ${process.pid} started`);

  app.use('/suicidio', routes);
  app.use('/heart', routesHeart);
  app.use('/tweet', routesTweet);
  // app.use('/users', users);

  app.get('/cluster', (req, res) => {
    let worker = cluster.worker.id;
    res.send(`Running on worker witch id ==> ${worker}`);
  });

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: {}
    });
  });

  app.listen(3040, '127.0.0.1', () => {
    console.log('servidor rodando');
  });

}

module.exports = app;
