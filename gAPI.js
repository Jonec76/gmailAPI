const { google } = require('googleapis');
var config = require("./config");
const mailcomposer = require('mailcomposer').MailComposer


function list(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.list({
        userId: config.list['userId'],
        maxResults: config.list['maxResults'],
        labelIds: 'INBOX' // It should be added! Or it will display some redundant mails 
    }, (err, res) => {
        console.log(res['data']['messages'].length)
    });
}


/**
 * 1. If you want to get the other part of the message(From, to, title, ....), then revome the parameter "format"
 *      - Because it would let the program delay caused by loading the mail content
 * 2. Then log out the res['data'] to get the data you want.
 */
function get(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.messages.get({ // RAW is for retrieve the content in the mail
        userId: config.get['userId'],
        id: config.get['messageId'],
        format: config.get['format'] // Remove it can decrease the delay by not showing the content
    }, (err, res) => {
        let contentB64 = res['data']['raw']
        console.log(Buffer.from(contentB64, 'base64').toString('UTF-8'))
    });
}

function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
            console.log(labels)
        } else {
            console.log('No labels found.');
        }
    });
}

function send(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    let mail = new mailcomposer({
        to: config.send["to"],
        text: config.send["content"],
        subject: config.send["subject"],
        textEncoding: "base64",
    });
    console.log(mail)
    mail.compile().build((error, msg) => {
        if (error) return console.log('Error compiling email ' + error);
        const encodedMessage = Buffer.from(msg)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        gmail.users.messages.send({
            auth: auth,
            userId: 'me',
            resource: {
                'raw': encodedMessage
            }
        }).catch(error => console.log('error: ', error));
    })
}
module.exports = {
    get: get,
    list: list,
    listLabels: listLabels,
    send: send
}