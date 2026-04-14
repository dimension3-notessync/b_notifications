
import express from 'express';
import { rateLimit } from 'express-rate-limit';

import emailHandler from "./routes/POST.js";

const port = process.env.PORT || "undefined";
const testEmailRecipient = process.env.TEST_EMAIL || "undefined";
const emailServer = process.env.EMAIL_SERVER || "undefined";
const domain = process.env.DOMAIN || "undefined";
const start = Date.now();

if (port === "undefined") {
    console.error("Critical Error: Missing PORT environment variable. Please set it.");
    process.exit(1);
}
if (testEmailRecipient === "undefined") {
    console.error("Critical Error: Missing testEmailRecipient environment variable. Please set it.");
    process.exit(1);
}
if (emailServer === "undefined") {
    console.error("Critical Error: Missing emailServer environment variable. Please set it.");
    process.exit(1);
}
if (domain === "undefined") {
    console.error("Critical Error: Missing domain environment variable. Please set it.");
    process.exit(1);
}

const limiter = rateLimit({
    windowMs: 1000, // 1 second
    limit: 2, // Limit each IP to 1 requests per `window` (here, per 1 second).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
})

const app = express();
app.use(express.json());
app.use(limiter);
const router = express.Router();


// login user
router.post('/', async (req, res) => {
    emailHandler(req, res, testEmailRecipient, emailServer, domain);
});

router.get('/health', async (req, res) => {
    const uptime = Date.now() - start;
    try {
        return res.status(200).send({message:'notifications is healthy.', uptime: uptime});
    } catch (error) {
        console.error('notifications health check failed:', error);
        return res.status(500).send('notifications is unhealthy');
    }
});

app.use('/', router);

app.listen(port, () => {
    console.log(`notification-backend running on port ${port}`);
});
