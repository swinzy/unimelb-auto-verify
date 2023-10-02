// Debugging indicator
document.body.style.border = "5px solid red";


// Load configurations and run extension
chrome.storage.sync.get(
  { secret: "" },
  (items) => {
    main(items.secret);
  }
);

function main(OTP_SECRET) {
  var oktaSignInElement = document.getElementById("okta-sign-in");

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(() => {
    var identifierElement = document.querySelector('span[data-se="identifier"]');
    var credentialInput = document.querySelector('input[name="credentials.passcode"]');
    var verifyButton = document.querySelector('input[type="submit"]');
    if (!identifierElement || !credentialInput) {
      console.log("Not on Google Authenticator page, OTP is not calculated.");
      return;
    }
    var username = identifierElement.innerText;
    var totp = new jsOTP.totp();
    var timeCode = totp.getOtp(OTP_SECRET);
    console.log(`User name: ${username}, OTP: ${timeCode}`);
    credentialInput.value = timeCode;
    let event = new Event("input", {
      "bubbles": true,
      "cancelable": true
    });
    credentialInput.dispatchEvent(event);
    if (verifyButton)
      verifyButton.click();
    else
      console.log("NO BUTTON");
    observer.disconnect()
    return;
  });


  // Start observing the document with the configured parameters
  observer.observe(oktaSignInElement, {
    childList: true,  // Observe child elements being added/removed
    subtree: true     // Observe all descendants
  });
}
