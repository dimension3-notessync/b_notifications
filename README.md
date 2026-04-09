# b_notifications

**Description:**  
backend component only accessable via docker network.  
Handles email-notification, "proof of concept phase"  
-> notification emails are only sent to one recipient due to the Amazon SES - Sandbox mode limiting unverified Apps to only send to self-owned/verified email adresses

**API-rules**
```
Route                  | HTTP-Method        | Input-Information                                               | Output-Information          | Description
_________________________________________________________________________________________________________________________________________________________________________________________________
/                      | POST               | subscribers: Json[]                                             | 200 - message: String       | Request to create an email notification
                                            | type: String (type of notification; eg.: "new lecture added")
_________________________________________________________________________________________________________________________________________________________________________________________________


```
