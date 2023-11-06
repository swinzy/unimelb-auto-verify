<div align="center">
<table>
<tbody>
  <tr>
    <td><img src="res/logo.svg" alt="Logo" width="128px"/></td>
    <td>
    
  # Unimelb Auto Verify
  </td>
  </tr>
</tbody>
</table>
</div>

## Motivation
Are you absolutely pissed by the fact that MFA verification pops up **EVERY SINGLE TIME** you try to log into LMS?<br>
Well now here is a solution!<br>
I present, the `Unimelb Auto Verify` extension!

<br>

> [!WARNING]
> **USE AT YOUR OWN RISK!** <br>
> MFA is designed to provide an extra layer of security. Users should be aware that the TOTP secret of their account is stored unencrypted on their device when using this extension. Always follow your university's policies regarding account access. I am not responsible for any security breaches or data loss caused by the use of this extension if you agree to use.

<br>

## Use Case
### Prerequisite
1. Go to [Unimelb SSO Settings](https://sso.unimelb.edu.au/enduser/settings).
2. Under `Security Methods`, set up `Google Authenticator` on your phone.
3. On your phone, export your account to a QR code.
4. Extract the OTP secret from the QR code. (The OTP secret should look like this `MTLZNDU2NZG5M4HA`)
5. Take note of the OTP secret. You will need it later on.

### Install & Configure
1. Install the extension.
2. Open extension options for UnimelbAutoVerify.
3. Fill in your OTP secret and hit <kbd>Save</kbd>.

### Usage
1. Go to any Unimelb page that requires logging in.
2. If you had `Effective Decoration` options on, you may see a green border on the logging in page.
3. Enter your username and password as usual.
4. When prompting authentication, select Google Authenticator.
5. If it did not automatically fill in the verification code, refresh the page.
6. Done! From now on, as long as you do not change the default authentication method, it should automatically fill in the verification code every time after you entered your password.

> [!IMPORTANT]
> To be able to generate a correct OTP code, your local system time must be correct (match the server time).<br>
> (An error of no greater than 30 seconds from the Unimelb server is generally acceptable)

## Goals
- [X] Supports username verification
- [ ] Supports turning on/off effective decoration
- [ ] Supports turning on/off auto click <kbd>Verify</kbd>
- [ ] Supports decoding Google Authenticator link
- [ ] Supports decoding Google Authenticator QR code
- [ ] Supports multi-account autofill
