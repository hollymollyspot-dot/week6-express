
export default function appSrc(express, bodyParser, createReadStream, crypto, http) {
    const app = express();

    const login = 'govallo';

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning');

        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }

        next();
    });

    app.use((req, res, next) => {
        if (req.path !== '/' && !req.path.endsWith('/')) {
            return res.redirect(301, req.originalUrl.split('?')[0] + '/' +
                (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?').slice(1).join('?') : ''));
        }

        next();
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.get('/login/', (req, res) => {
        res.send(login);
    });

    app.get('/code/', (req, res) => {
        createReadStream(import.meta.url.substring(8)).pipe(res);
    });

    app.get('/sha1/:input/', (req, res) => {
        const hash = crypto.createHash('sha1').update(req.params.input).digest('hex');
        res.send(hash);
    });

    app.get('/req/', (req, res) => {
        const addr = req.query.addr;

        if (!addr) {
            return res.status(400).send('Missing addr');
        }

        http.get(addr, (response) => {
            response.pipe(res);
        }).on('error', () => {
            res.status(500).send('Request error');
        });
    });

    app.post('/req/', (req, res) => {
        const addr = req.body.addr;

        if (!addr) {
            return res.status(400).send('Missing addr');
        }

        http.get(addr, (response) => {
            response.pipe(res);
        }).on('error', () => {
            res.status(500).send('Request error');
        });
    });

    app.all('/{*splat}', (req, res) => {
        res.send(login);
    });

    return app;
}
