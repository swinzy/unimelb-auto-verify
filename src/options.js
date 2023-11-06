const saveButton = document.getElementById("saveButton");
const secretBox = document.getElementById("otpSecretInput");

const NORMAL_BTN = "btn-primary";
const SUCCESS_BTN = "btn-success";
const SAVED = "Saved";
const SAVE = "Save";
const TIMEOUT_BTN_RES = 2000;

// Saves options to chrome.storage
const saveOptions = () => {
    chrome.storage.sync.set(
        {secret: secretBox.value},
        () => {
            // Update status to let user know options were saved.
            saveButton.classList.add(SUCCESS_BTN);
            saveButton.classList.remove(NORMAL_BTN);
            saveButton.innerText = SAVED;

            // Restore status after a while
            setTimeout(() => {
                saveButton.classList.add(NORMAL_BTN);
                saveButton.classList.remove(SUCCESS_BTN);
                saveButton.innerText = SAVE;
            }, TIMEOUT_BTN_RES);
        }
    );
};

// Restores options using the preferences stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        {secret: ""},
        (items) => {
            secretBox.value = items.secret;
        }
    );
};

document.addEventListener("DOMContentLoaded", restoreOptions);
saveButton.addEventListener("click", saveOptions);