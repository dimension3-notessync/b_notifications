
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export default async function emailHandler(req, res, testEmailRecipient, emailServer, domain) {
    let notificationText;
    if (!req.body) {
        return res.status(404).send({message:"req.body is missing, please add type & subscribers"})
    } else {
        if (req.body.type) {
            if (req.body.subscribers) {
                notificationText = `You have a new ${req.body.type} notification.` +
                    "This notification could've been sent to these users:" +
                    `${req.body.subscribers}`
            }
        }
        else {
            return res.status(404).send({message:"req.body is missing, please add type & subscribers"})
        }

    }

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



