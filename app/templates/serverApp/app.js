const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const process = require('process');
const Router = require('koa-router');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const proxy = require('koa2-proxy-middleware');
const health = require('./routes');

const root = process.cwd();
const timeout = 1000 * 100;
const staticPath = '<%= static %>';
const proxyConfig = JSON.parse('<%- proxy %>');
const template = fs.readFileSync(path.resolve(__dirname, staticPath, './index.html'));

process.on('uncaughtException', (err) => {
  console.log(err, 'process error');
});

const app = new Koa();
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
});
app.use(proxy(proxyConfig));
app.use(bodyParser(['json', 'form', 'text']));
app.use(koaStatic(path.resolve(__dirname, staticPath)));

const router = new Router();
router.use('/health', health.routes(), health.allowedMethods());
app.use(async (ctx) => {
  ctx.set('Content-Type', 'text/html');
  ctx.body = template;
});

app.listen(8080);
