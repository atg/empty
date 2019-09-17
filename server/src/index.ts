import fs from 'fs';
import crypto from 'crypto';
import pathlib from 'path';
import http from 'http';

import h from 'hyperscript';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const MemoryStore = require('memorystore')(session);
import csurf from 'csurf';

const PORT = 8009;

class Main {
  static readonly shared = new Main();

  app!: express.Express;
  httpServer!: http.Server;
  async init() {
    const app = this.app = express();
    const rootPath = pathlib.normalize(pathlib.join(__dirname, '..', '..'));

    function sessionSecret() {
      let p = pathlib.join(rootPath, '_sessionsecret.txt');
      try {
        if (fs.existsSync(p)) {
          return fs.readFileSync(p, 'utf8').trim();
        } else {
          let secret = crypto.randomBytes(32).toString('base64');
          fs.writeFileSync(p, secret);
          return secret;
        }
      } catch (err) {
        console.log("Cannot write to _sessionsecret.txt. Please make it writable or fill it with a secret.");
        throw err;
      }
    }

    app.enable('trust proxy');
    // app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({
      store: new MemoryStore({
        checkPeriod: 24 * 60 * 60 * 1000,
      }),
      secret: sessionSecret(),
      resave: false,
      saveUninitialized: false,
    })); // session secret
    app.use(csurf()); // depends on session middleware
    // app.use(flash());

    this.app.use(function(req: any, res: any, next: any) {
      res.header('x-frame-options', 'SAMEORIGIN');
      res.header('x-xss-protection', '1; mode=block');
      next();
    });

    const httpServer = this.httpServer = app.listen(PORT, () => console.log(`HTTP listening on port ${PORT}!`));

    app.use('/static', express.static(pathlib.join(rootPath, 'client/static')));
    await this.entrypoint();
  }
  async entrypoint() {
    const style = (href: string) => h('link', { href, rel: 'stylesheet' });
    const script = (src: string) => h('script', { src });
    const app = this.app;
    app.get('/', (req: any, res: any) => {
      const dom = h('html',
        h('head',
          h('meta', { charset: 'utf-8' }),
          h('title', 'Title here'),
          style('static/css/style.css'),
          script('static/vendor/system.min.js'),
          script('static/vendor/system-named-register.min.js'),
          script('static/vendor/lodash.min.js'),
          script('static/vendor/mithril.min.js'),
          script('static/vendor/msgpack-lite.min.js'),
          script('static/js/packed.js'),
          h('script', `System.import("client");`),
        ),
        h('body',
          h('main#Main'),
        )
      );
      res.send('<!doctype html>\n' + dom.outerHTML);
    });
  }
}

if (require.main === module) {
  Main.shared.init();
}