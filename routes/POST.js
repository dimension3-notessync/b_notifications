
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export default async function emailHandler(req, res, testEmailRecipient, emailServer, domain) {
    let notificationText;
    if (!req.body) {
        notificationText = "You have a new notification."
    } else {
        if (req.body.lectureAdd) {
            if (req.body.subscribers) {
                notificationText = "You have a new notification, a new lecture has been added." +
                    "This notification could've been sent to these users:" +
                    `${req.body.subscribers}`
            }
        }
        else if (req.body.lectureEdit) {
            if (req.body.subscribers) {
                notificationText = "You have a new notification, a lecture's information has been updated." +
                    "This notification could've been sent to these users:" +
                    `${req.body.subscribers}`
            }
        }
        else if (req.body.fileUpload) {
            if (req.body.subscribers && req.body.authorID) {
                notificationText = "You have a new notification, a file has been uploaded by an author you subscribe." +
                    "This notification could've been sent to these users:" +
                    `${req.body.subscribers}`
            }
        }
        else {
            notificationText = "You have a new notification."
        }

    }
    console.log(req.body)
    console.log(notificationText)
    console.log(emailServer)
    console.log(domain)
    console.log(testEmailRecipient)

    // Create the SES client (credentials are loaded automatically from env, files, or IAM roles)
    const sesClient = new SESClient({ region: `${emailServer}` });

    async function sendSimpleEmail(to, subject, textBody) {
        const params = {
            Source: `notification@${domain}`, // Must be a verified email address
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to]
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: textBody,
                        Charset: 'UTF-8'
                    }
                }
            }
        };

        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        return response.MessageId;
    }

    // Usage example
    sendSimpleEmail(
        `${testEmailRecipient}`,
        'Notification from NoteSync',
        `${notificationText}`
    ).then(messageId => {
        console.log('Email sent:', messageId);
        return res.status(200).send({message : 'Email notification sent'})
    })
        .catch(err => {
            console.error('Error:', err)
            return res.status(500).send({message: 'Something went wrong'})
        });
}



