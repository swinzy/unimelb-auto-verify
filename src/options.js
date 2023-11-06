const htmlElement = document.querySelector("html");
const saveButton = document.getElementById("save-button");
const secretBox = document.getElementById("otp-secret-input");
const usernameBox = document.getElementById("username-input");

const NORMAL_BTN = "btn-primary";
const SUCCESS_BTN = "btn-success";
const SAVED = "Saved";
const SAVE = "Save";
const TIMEOUT_BTN_RES = 2000;

const onThemeChange = (mutations) => {
    for (const mutation of mutations) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "data-bs-theme")
            return;
        changeTheme(mutation.target.getAttribute("data-bs-theme"));
    }
}

const changeTheme = (theme) => {
    const githubLogo = document.getElementById("github-logo");
    if (theme === "dark") {
        // Dark theme
        githubLogo.src = "github-mark-white.svg";
    }
    else {
        // Default/light theme
        githubLogo.src = "github-mark.svg";
    }
}

// Saves options to chrome.storage
const saveOptions = () => {
    chrome.storage.sync.set(
        {
            secret: secretBox.value,
            username: usernameBox.value.toUpperCase(),
        },
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
        {
            secret: "",
            username: "",
        },
        (items) => {
            secretBox.value = items.secret;
            usernameBox.value = items.username;
        }
    );
};

const themeObserver = new MutationObserver(onThemeChange);
themeObserver.observe(htmlElement, { attributes: true });
changeTheme(htmlElement.getAttribute("data-bs-theme"));
document.addEventListener("DOMContentLoaded", restoreOptions);
saveButton.addEventListener("click", saveOptions);