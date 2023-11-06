const checkOnMFAPage = () => {
    // Prompt for Google Authenticator
    var googleAuthElement = document.getElementsByClassName("challenge-authenticator--google_otp")

    // Page does not contain Google Authenticator prompt
    if (googleAuthElement.length === 0) {
        console.log("UnimelbAutoVerify: Not on Google Authenticator page, extension standby.");
        return false;
    }
    return true;
}

const autoFillMFA = () => {
    // Show effective decoration
    if (showDecor)
        document.body.style.border = "5px solid green";
    else
        document.body.style.border = "0";

    // Abort action if not on MFA page
    if (!checkOnMFAPage()) return;

    // Element contains username
    var identifierElement = document.querySelector('span[data-se="identifier"]');

    // Box to put MFA code
    var credentialInput = document.querySelector('input[name="credentials.passcode"]');

    // Button to submit MFA code
    var verifyButton = document.querySelector('input[type="submit"]');

    // Abort action if:
    // Page does not contain username, does not contain MFA code box, or otpSecret is not provided
    if (!identifierElement || !credentialInput || !otpSecret || otpSecret === "") {
        console.log("UnimelbAutoVerify: Page does not contain information required, action not applied.");
        return;
    }

    if (identifierElement.innerText.toUpperCase() !== username.toUpperCase()) {
        console.log("UnimelbAutoVerify: Username does not match, action not applied.");
        return;
    }

    var totp = new jsOTP.totp();
    var timeCode = totp.getOtp(otpSecret);

    console.log(`OTP code ${timeCode} autofilled for user ${username.toUpperCase()}`);

    // Put MFA code in
    credentialInput.value = timeCode;

    // Send event letting web page know code has been entered
    let event = new Event("input", {
        "bubbles": true,
        "cancelable": true
    });
    credentialInput.dispatchEvent(event);

    // Automatically click "Verify" if possible
    if (autoSubmit && verifyButton)
        verifyButton.click();
    else
        console.log("UnimelbAutoVerify: Verify button not found. Please manually submit the code.");

    // Job done, stop autofill.
    observer.disconnect();
};

const startAutofill = () => {
    var oktaSignInElement = document.getElementById("okta-sign-in");

    // Start observing DOM change
    observer.observe(oktaSignInElement, {
        childList: true,  // Observe child elements being added/removed
        subtree: true     // Observe all descendants
    });
}

// Every time DOM changes, check if it can autofill MFA
const observer = new MutationObserver(autoFillMFA);

// Do not expose otp secret to window
let otpSecret = "";
let username = "";
let showDecor = true;
let autoSubmit = true;

// Load configurations and start autofill
chrome.storage.sync.get(
    {
        secret: "",
        username: "",
        showDecor: true,
        autoSubmit: true,
    },
    (items) => {
        // Only start extension when relevant information is ready
        startAutofill();
        otpSecret = items.secret;
        username = items.username.toUpperCase();
        showDecor = items.showDecor;
        autoSubmit = items.autoSubmit;
    }
);
