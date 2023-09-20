# Unimelb Auto Verify
## Motivation
Are you absolutely pissed by the fact that 2FA verification pops up **EVERY SINGLE TIME** you try to log into LMS?<br>
Well now here is a solution!<br>
I present, the `Unimelb Auto Verify` extension!

## Disclaimer
**USE AT YOUR OWN RISK!**
2FA is designed to provide an extra layer of security. Users should be aware that the TOTP secret of their account is stored unencrypted on their device when using this extension. Always follow your university's policies regarding account access. I am not responsible for any security breaches or data loss caused by the use of this extension if you agree to use.

## Agile Ceremony
### Problem Space
A Unimelb student logs in to their LMS account on their browser. The website promts them to perform 2FA verification. They pull up their phone, and complete the 2FA verification. After that, they believe the best way to focus on study is to put the phone away. During study, the student accidentally closes the browser. In less than 2 seconds, they re-open the browser. The browser is smart enough to re-open the tabs they were working on for them. **However the new Unimelb authentication system is not! It wants the student to do the 2FA again!** The student have to travel 2km to the other room at where their phone is, just to do the ~~f**king~~ 2FA verification. In fact, this happens every day, and every time they try to log in to their account on a new browser session. Some times even the same browser session but just a different tab! The student is completely pissed off and starts to question their life. "What on earth have I done to have to suffer from this!?"

### Goal
With this extension installed, all you need to do is to connect your Unimelb account to Google Authenticator, export the QR code from Google Authenticator, extract the OTP secret from the QR code, and then provide the secret to the extension. Voilà, the extension can now automatically perform the 2FA authentication for you!

### Use Case
User install and configure the extension.<br>
User opens a Unimelb website that requires signing in.<br>
User enters their user name and password (or use autofill from browser).<br>
User clicks <kbd>Log in</kbd><br>
The website asks for authent... Before the user even notices, the extension has already filled the OTP code and clicked <kbd>Verify</kbd> button for them.<br>
And there, user has logged in successfully.
