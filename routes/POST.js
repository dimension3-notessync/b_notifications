import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

function errorHandler(res, error, action) {
    console.error(`Error in ${action}:`, error);
    return res.status(500).send({ message: 'An unexpected server error occurred.' });
}

export default async function emailHandler(req, res, testEmailRecipient, emailServer, domain) {
    const type = req.body?.type;
    const subscribers = req.body?.subscribers;

    // --- Consolidated Input Validation ---
    if (!type || subscribers === undefined || subscribers === null) {
        // Check for 'subscribers' being undefined or null, but allow empty array/string to be handled below
        const missingFields = [];
        if (!type) missingFields.push('type');
        if (subscribers === undefined || subscribers === null) missingFields.push('subscribers');
        return res.status(400).send({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // --- Construct Notification Text based on subscribers content ---
    let subscriberListText = '';
    if (Array.isArray(subscribers)) {
        if (subscribers.length > 0) {
            subscriberListText = subscribers.join(', '); // List all subscribers
        } else {
            // Case: subscribers is an empty array
            subscriberListText = 'no person subscribed to this notification';
        }
    } else if (typeof subscribers === 'string' && subscribers.trim() !== '') {
        // Case: subscribers is a non-empty string (e.g., a single subscriber's name)
        subscriberListText = subscribers;
    } else {
        // Fallback for subscribers being an empty string, or some other unexpected falsy value
        subscriberListText = 'No specific subscribers listed.';
    }

    const notificationText = `You have a new "${type}" notification. ` +
        `This notification could've been sent to the following user id's: ${subscriberListText}.`;

    // Create the SES client (credentials are loaded automatically from env, files, or IAM roles)
    const sesClient = new SESClient({ region: `${emailServer}` });

    async function sendSimpleEmail(to, subject, textBody) {
        const params = {
            Source: `notification@${domain}`, // Must be a verified email address in SES
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to] // Ensure 'to' is an array
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

    try {
        const messageId = await sendSimpleEmail(
            testEmailRecipient, // Sending to testRecipient for testing purposes
            'Notification from NoteSync',
            notificationText
        );
        console.log('Email sent:', messageId);
        return res.status(200).send({message : 'Email notification sent', messageId: messageId});
    } catch (err) {
        console.error('Error sending email:', err);
        // Use your centralized errorHandler for email failures, or a specific error response
        return errorHandler(res, err, 'sendEmailNotification'); // Example using errorHandler
    }
}
