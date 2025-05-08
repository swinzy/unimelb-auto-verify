(() => {
    const enterAndClick = (input, value, button) => {
        if (!input) {
            console.debug("UAV: No input found, not autofilling.");
            return false;
        }

        // Put value in
        input.value = value;

        // Send event letting web page know value has been entered
        const event = new Event("input", {
            "bubbles": true,
            "cancelable": true
        });
        input.dispatchEvent(event);

        // Click button if possible
        if (button) button.click();
        return true;
    };

    const autofillUsername = () => {
        // Find input and next button
        const credentialInput = document.querySelector("input[name='identifier']");
        const nextButton = document.querySelector("input[type='submit']");

        // Autofill and continue
        return enterAndClick(credentialInput, username.toUpperCase(), nextButton);
    };

    const autofillPassword = () => {
        // Prompt for Google Authenticator
        const googleAuthElement = document.getElementsByClassName("challenge-authenticator--google_otp");

        // Page contains Google Authenticator prompt, do not enter password here
        if (googleAuthElement.length !== 0) {
            console.debug("UAV: On MFA page, not autofilling password.");
            return false;
        }

        // Element contains username
        const identifierElement = document.querySelector("span[data-se='identifier']");
        if (!identifierElement) {
            console.debug("UAV: User does not exist. Password not autofilled.");
            return false;
        }

        const pattern = /@.*/i;
        const purifiedUsername = identifierElement.innerText.toUpperCase().replace(pattern, "");

        if (purifiedUsername !== username.toUpperCase()) {
            console.debug("UAV: Username does not match. Password not autofilled.");
            return false;
        }

        const credentialInput = document.querySelector("input[name='credentials.passcode']");
        const verifyButton = document.querySelector("input[type='submit']");

        // Autofill and continue
        return enterAndClick(credentialInput, passwd, verifyButton);
    };

    const autofillMFA = () => {
        // Prompt for Google Authenticator
        const googleAuthElement = document.getElementsByClassName("challenge-authenticator--google_otp")

        // Page does not contain Google Authenticator prompt
        if (googleAuthElement.length === 0) {
            console.debug("UAV: Not on MFA page. Not autofilling MFA code.");
            return false;
        }

        // Element contains username
        const identifierElement = document.querySelector("span[data-se='identifier']");

        // Box to put MFA code
        const credentialInput = document.querySelector("input[name='credentials.passcode']");

        // Button to submit MFA code
        const verifyButton = document.querySelector("input[type='submit']");

        const pattern = /@.*/i;
        const purifiedUsername = identifierElement.innerText.toUpperCase().replace(pattern, "");

        if (purifiedUsername !== username.toUpperCase()) {
            console.debug("UAV: Username does not match. MFA not autofilled.");
            return false;
        }

        const totp = new jsOTP.totp();
        const timeCode = totp.getOtp(otpSecret);

        console.debug(`UAV: Autofilling OTP code ${timeCode} for user ${username.toUpperCase()}`);

        // Override auto click function
        if (!enterAndClick(credentialInput, timeCode, null))
            return false;

        // Automatically click "Verify" if possible
        if (autoSubmit && verifyButton)
            verifyButton.click();
        else
            console.debug("UAV: Verify button not found or auto submit disabled. Please manually submit the code.");

        return true;
    };

    // Main observer callback
    const main = () => {
        // Show effective decoration
        if (showDecor)
            document.body.style.border = "5px solid green";
        else
            document.body.style.border = "0";

        // Zero click
        if (easyAccess === "zc" && !hasAutofilledUsr) {
            console.debug("UAV: Trying to autofill username");
            if (autofillUsername()) {
                hasAutofilledUsr = true;
                console.debug("UAV: Username autofilled!");
            }
        }

        // Zero click or One click
        if ((easyAccess === "zc" || easyAccess === "oc") && !hasAutofilledPwd) {
            console.debug("UAV: Trying to autofill password");
            if (autofillPassword()) {
                hasAutofilledPwd = true;
                console.debug("UAV: Password autofilled!");
            }
        }

        console.debug("UAV: Trying to autofill MFA code");
        if (autofillMFA()) {
            console.debug("UAV: MFA code autofilled!");

            // Job done, stop autofill.
            observer.disconnect();
        }
    };

    const startAutofill = () => {
        const oktaSignInElement = document.getElementById("okta-sign-in");
        if (!oktaSignInElement) {
            console.warn("UAV: No sign-in element found.");
            return;
        }

        // Start observing DOM change
        observer.observe(oktaSignInElement, {
            childList: true,  // Observe child elements being added/removed
            subtree: true     // Observe all descendants
        });
    };

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
            if (chrome.runtime.lastError) {
                console.error("UAV: Cannot load settings.", chrome.runtime.lastError);
                return;
            }

            otpSecret = items.secret;
            username = items.username.toUpperCase();
            showDecor = items.showDecor;
            autoSubmit = items.autoSubmit;
            passwd = items.passwd;
            easyAccess = items.easyAccess;
            // Only start extension when relevant information is ready
            startAutofill();
        }
    );
})();
