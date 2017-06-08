const path = require('path');
const express = require('express');
const expressBrowserify = require('express-browserify');

const app = express();

app.set('views', path.join(__dirname, '..', 'src'));
app.set('view engine', 'js');
app.engine('js', require('express-react-views').createEngine());

// Middlewares
app.use('/css', express.static(path.resolve(__dirname, '..', 'public/css')));
app.use('/images', express.static(path.resolve(__dirname, '..', 'public/images')));
app.use(express.static(path.join(__dirname, '..', 'node_modules/watson-react-components/dist')));

const isDev = (app.get('env') === 'development');
const browserifyier = expressBrowserify(path.resolve(__dirname, '..', 'public/js/bundle.js'), {
  watch: isDev,
  debug: isDev,
  extension: ['js'],
  transform: ['babelify'],
});

if (!isDev) {
  browserifyier.browserify.transform('uglifyify', { global: true });
}

// Client Side Bundle route
app.get('/js/bundle.js', browserifyier);


module.exports = app;
