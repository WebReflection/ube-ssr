const {join} = require('path');
const ube = require('../cjs');

const {render, html, include, bootstrap} = ube({
  output: join(__dirname, 'cache.json'),
  root: __dirname,
  flush: 'incremental',
  module: true,
  babel: false
});

const Div = include('comp/div.js').as('div');


let output = [];

console.time('bootstrap');
bootstrap(!!process.env.PRODUCTION).then(() => {
  console.timeEnd('bootstrap');
  console.time('render');
  render({write(data) { output.push(data); }}, html`
    <!doctype html>
    <${Div}>Hello SSR 👋 </${Div}>
    <!-- incremental test -->
    <${Div}>Hello Again 👋 </${Div}>
  `);
  console.timeEnd('render');
  require('fs').writeFile(join(__dirname, 'index.html'), output.join(''), Object);
});
