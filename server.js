const app = require('./serverconfig.js');
const DAL = require('./DAL.js');
const hash = require('sha256');
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const webpush = require('web-push');
const PORT = process.env.PORT || 3000;

let USER_SUBSCRIPTIONS = [];

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/findUserByMail', (req, res) => {
    let user = req.body;
    DAL.findUserByMail(user, (result) => {
        if (!result) {
            DAL.addUser(user, (result) => {
                if (result.result.ok == 1)
                    res.send(result.ops);
                else res.send('failed');
            });
        }
        //else
    });
});

app.post('/addUser', (req, res) => {
    let user = req.body;
    user.password = hash(user.password);
    DAL.addUser(user, (result) => { console.log(result.result.ok); if (result.result.ok == 1) res.send(result.ops); else res.send('failed'); });
});

app.get('/', (req, res) => {
    res.send('welcome to my node server');
});

app.post('/addEvent', (req, res) => {
    let event = req.body;
    DAL.addEvent(event, (result) => res.send(result));
});

app.post('/UpdateEvent', (req, res) => {
    let event = req.body;
    DAL.UpdateEvent(event);
});

app.post('/DeleteEvent', (req, res) => {
    let event = req.body;
    DAL.DeleteEvent(event);
});

app.get('/allEvents', (req, res) => {
    DAL.getEvents((result) => {
        res.send(result);
    })

});
app.post('/getEventsByUser', (req, res) => {
    let user = req.body;
    DAL.getEventsByUser(user, (result) => {
        res.send(result);
    })

});
const vapidKeys = {
    "publicKey": "BEI0Gi-vvZjw5tVZKeXNNOjHPMlQ_nF3_vgD_p8yyntVK51mo1ayG1zaJntWvCMkm-EcSWlXlkHwUPZM3in_05w",
    "privateKey": "5JdoGSX9OnFzFovEnz97OPSNleUmTizxAVJ3TQvpyyU"
};


webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
app.post('/subscribeToEvent', (req, res) => {
    let user = req.body.user;
    let event = req.body.event;
    DAL.subscribeToEvent(user, event, (result) => {
        res.send(result);
    })

});

app.post('/sendNewsletter', (req, res) => {
    console.log('Total subscriptions', USER_SUBSCRIPTIONS.length);
    let username = req.body.name;
    console.log(username);
    // sample notification payload
    debugger;
    const notificationPayload = {
        "notification": {
            "title": "Angular News",
            "body": username + "subscribed to your event!",
            "icon": "assets/main-page-logo-small-hat.png",
            "vibrate": [100, 50, 100],
            "data": {
                "dateOfArrival": Date.now(),
                "primaryKey": 1
            },
            "actions": [{
                "action": "explore",
                "title": "Go to the site"
            }]
        }
    }

    Promise.all(USER_SUBSCRIPTIONS.map(sub => webpush.sendNotification(
        sub, JSON.stringify(notificationPayload))))
        .then(() => {
            console.log(sub);
            res.status(200).json({ message: 'Newsletter sent successfully.' });
            console.log(JSON.stringify(notificationPayload));
        })
        .catch(err => {
            console.log("Error sending notification, reason: ", err);
            res.sendStatus(500);
        })
});

app.post('/addPushSubscriber', (req, res) => {
    const sub = req.body;

    console.log('Received Subscription on the server: ', sub);

    USER_SUBSCRIPTIONS.push(sub);

    res.status(200).json({ message: "Subscription added successfully." });
});

// export function sendNewsletter(req, res) {

//     console.log('Total subscriptions', USER_SUBSCRIPTIONS.length);

//     // sample notification payload
//     const notificationPayload = {
//         "notification": {
//             "title": "Angular News",
//             "body": "Newsletter Available!",
//             "icon": "assets/main-page-logo-small-hat.png",
//             "vibrate": [100, 50, 100],
//             "data": {
//                 "dateOfArrival": Date.now(),
//                 "primaryKey": 1
//             },
//             "actions": [{
//                 "action": "explore",
//                 "title": "Go to the site"
//             }]
//         }
//     };


//     Promise.all(USER_SUBSCRIPTIONS.map(sub => webpush.sendNotification(
//         sub, JSON.stringify(notificationPayload) )))
//         .then(() => res.status(200).json({message: 'Newsletter sent successfully.'}))
//         .catch(err => {
//             console.error("Error sending notification, reason: ", err);
//             res.sendStatus(500);
//         });

// }

// export function addPushSubscriber(req, res) {

//     const sub = req.body;

//     console.log('Received Subscription on the server: ', sub);

//     USER_SUBSCRIPTIONS.push(sub);

//     res.status(200).json({message: "Subscription added successfully."});
// }




server.listen(PORT, () => console.log(`listening on ${PORT}`));

// const multer = require("multer");
// const router = express.Router();
// const MIME_TYPE_MAP = {
//     'image/png': 'png',
//     'image/jpeg': 'jpg',
//     'image/jpg': 'jpg',
// }
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const isValid=MIME_TYPE_MAP[file.mimetype];
//         let error =new Error("Invalid mime type");
//         if(isValid)error=null;
//         cb(error, "images");
//     },
//     filename: (req, file, cb) => {
//         const name = file.originalname.toLowerCase().split(' ').join('-');
//         const ext = MIME_TYPE_MAP[file.mimetype];
//         cb(null, nume + '-' + Date.now() + '.' + ext);
//     }
// });multer(storage).single("image"),