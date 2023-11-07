const enterAndClick = (input, value, button) => {
    if (!input) return false;

    // Put value in
    input.value = value;

    // Send event letting web page know value has been entered
    let event = new Event("input", {
        "bubbles": true,
        "cancelable": true
    });
    input.dispatchEvent(event);

    // Click button if possible
    if (button) button.click();
    return true;
}

const autofillUsername = () => {
    // Find input and next button
    const credentialInput = document.querySelector("input[name='identifier']");
    const nextButton = document.querySelector("input[type='submit']");

    // Autofill and continue
    return enterAndClick(credentialInput, username.toUpperCase(), nextButton);
}

const autofillPassword = () => {
    // Prompt for Google Authenticator
    var googleAuthElement = document.getElementsByClassName("challenge-authenticator--google_otp")

    // Page contains Google Authenticator prompt, do not enter password here
    if (googleAuthElement.length !== 0) {
        return false;
    }

    const credentialInput = document.querySelector("input[name='credentials.passcode']");
    const verifyButton = document.querySelector("input[type='submit']");

    // Autofill and continue
    return enterAndClick(credentialInput, passwd, verifyButton);
}

const autofillMFA = () => {
    // Prompt for Google Authenticator
    var googleAuthElement = document.getElementsByClassName("challenge-authenticator--google_otp")

    // Page does not contain Google Authenticator prompt
    if (googleAuthElement.length === 0) {
        return false;
    }

    // Element contains username
    var identifierElement = document.querySelector("span[data-se='identifier']");

    // Box to put MFA code
    var credentialInput = document.querySelector("input[name='credentials.passcode']");

    // Button to submit MFA code
    var verifyButton = document.querySelector("input[type='submit']");

    if (identifierElement.innerText.toUpperCase() !== username.toUpperCase()) {
        console.log("UnimelbAutoVerify: Username does not match, action not applied.");
        return false;
    }

    var totp = new jsOTP.totp();
    var timeCode = totp.getOtp(otpSecret);

    console.log(`Autofilling OTP code ${timeCode} for user ${username.toUpperCase()}`);

    // Override auto click function
    if (!enterAndClick(credentialInput, timeCode, null))
        return false;

    // Automatically click "Verify" if possible
    if (autoSubmit && verifyButton)
        verifyButton.click();
    else
        console.log("UnimelbAutoVerify: Verify button not found. Please manually submit the code.");

    return true;
}

const main = () => {
    // Show effective decoration
    if (showDecor)
        document.body.style.border = "5px solid green";
    else
        document.body.style.border = "0";

    if (easyAccess === "zc" && !hasAutofilledUsr) {
        if (autofillUsername())
            hasAutofilledUsr = true;
    }

    if (easyAccess === "zc" || easyAccess === "oc" && !hasAutofilledPwd) {
        if (autofillPassword())
            hasAutofilledPwd = true;
    }

    if (autofillMFA())
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
const observer = new MutationObserver(main);

// Do not expose otp secret to window
let otpSecret = "";
let username = "";
let showDecor = false;
let autoSubmit = false;
let passwd = "";
let easyAccess = "";

let hasAutofilledPwd = false;
let hasAutofilledUsr = false;

// Load configurations and start autofill
chrome.storage.sync.get(
    {
        secret: "",
        username: "",
        showDecor: true,
        autoSubmit: true,
        easyAccess: "",
        passwd: "",
    },
    (items) => {
        // Only start extension when relevant information is ready
        startAutofill();
        otpSecret = items.secret;
        username = items.username.toUpperCase();
        showDecor = items.showDecor;
        autoSubmit = items.autoSubmit;
        passwd = items.passwd;
        easyAccess = items.easyAccess;
    }
);
