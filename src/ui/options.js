const htmlElement = document.querySelector("html");
const saveButton = document.getElementById("save-button");
const secretBox = document.getElementById("otp-secret-input");
const usernameBox = document.getElementById("username-input");
const autoSubmitBox = document.getElementById("auto-submit-box");
const showDecorBox = document.getElementById("show-decor-box");

const passwordSection = document.getElementById("passwd-section");
const passwordBox = document.getElementById("passwd-input");
const eaGroup = document.getElementById("ea-group");
const eaOff = document.getElementById("ea-off");
const eaOneClick = document.getElementById("ea-oc");
const eaZeroClick = document.getElementById("ea-zc");

const migrationLinkInput = document.getElementById("migration-link-input");
const accountSelect = document.getElementById("account-select-input");
const importButton = document.getElementById("import-button");
const importModalButton = document.getElementById("import-modal-button");
const importModal = new bootstrap.Modal(document.getElementById("import-link-modal"));
const uploadQrInput = document.getElementById("upload-qr-input");
const uploadResult = document.getElementById("upload-result");

const NORMAL_BTN = "btn-primary";
const SUCCESS_BTN = "btn-success";
const SAVED = "Saved";
const SAVE = "Save";
const TIMEOUT_BTN_RES = 2000;
const HIDDEN = "collapse";
const INVALID = "is-invalid";
const VALID = "is-valid";

const onThemeChange = (mutations) => {
    for (const mutation of mutations) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "data-bs-theme")
            return;
        changeTheme(mutation.target.getAttribute("data-bs-theme"));
    }
};

const changeTheme = (theme) => {
    const githubLogo = document.getElementById("github-logo");
    if (theme === "dark") {
        // Dark theme
        githubLogo.src = "../res/github-mark-white.svg";
    }
    else {
        // Default/light theme
        githubLogo.src = "../res/github-mark.svg";
    }
};

const showPasswordSection = () => {
    if (eaOneClick.checked || eaZeroClick.checked)
        passwordSection.classList.remove(HIDDEN);
    else
        passwordSection.classList.add(HIDDEN);
};

const getEasyAccessLevel = () => {
    if (eaZeroClick.checked) return "zc";
    if (eaOneClick.checked) return "oc";
    return "off";
};

const setEasyAccessLevel = (easyAccessLevel) => {
    if (easyAccessLevel === "off") {
        eaOff.checked = true;
    }
    else if (easyAccessLevel === "oc") {
        eaOneClick.checked = true;
    }
    else if (easyAccessLevel === "zc") {
        eaZeroClick.checked = true;
    }

    showPasswordSection();
};

const resetImportModal = () => {
    migrationLinkInput.value = "";
    migrationLinkInput.classList.remove(VALID);
    migrationLinkInput.classList.remove(INVALID);
    accountSelect.options.length = 0;
    importButton.disabled = true;
    uploadQrInput.value = "";
}

const importModalButtonClicked = () => {
    resetImportModal();
};

const migrationLinkChanged = async () => {
    if (migrationLinkInput.value.length === 0) {
        migrationLinkInput.classList.remove(VALID);
        migrationLinkInput.classList.remove(INVALID);
        accountSelect.options.length = 0;
        importButton.disabled = true;
        return;
    }

    try {
        const accounts = await decodeMigrationUri(migrationLinkInput.value);
        accountSelect.options.length = 0;
        accounts.forEach(account => {
            const option = document.createElement("option");
            option.value = account.secret;
            option.text = `${account.issuer || "Unknown"}: ${account.name || "Unnamed"}`;
            accountSelect.appendChild(option);
        });
        if (accounts.length > 0) {
            migrationLinkInput.classList.remove(INVALID);
            migrationLinkInput.classList.add(VALID);
        }
    } catch (e) {
        migrationLinkInput.classList.remove(VALID);
        migrationLinkInput.classList.add(INVALID);
        accountSelect.options.length = 0;
        importButton.disabled = true;
    }
};

const migrationAccountChanged = () => {
    importButton.disabled = (accountSelect.selectedOptions.length === 0);
};

const importMigrationLink = () => {
    if (accountSelect.selectedOptions.length > 0) {
        secretBox.value = accountSelect.selectedOptions[0].value;
        resetImportModal();
        importModal.hide();
    }
};

const uploadQrChanged = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const qr = new Image();
    qr.src = URL.createObjectURL(file);
    qr.onload = async () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = qr.naturalWidth;
        canvas.height = qr.naturalHeight;
        context.drawImage(qr, 0, 0);
        const data = context.getImageData(0, 0, qr.naturalWidth, qr.naturalHeight);
        const decoded = jsQR(data.data, qr.naturalWidth, qr.naturalHeight);

        if (!decoded) {
            uploadResult.textContent = "Invalid QR Code";
            return;
        }

        if (!decoded.data.startsWith("otpauth-migration://")) {
            uploadResult.textContent = "Not a Google Authenticator QR Code";
            return;
        }

        uploadResult.textContent = "";
        migrationLinkInput.value = decoded.data;
        await migrationLinkChanged();
    }
};

// Saves options to chrome.storage
function saveOptions()  {
    chrome.storage.sync.set(
        {
            secret: secretBox.value,
            username: usernameBox.value.toUpperCase(),
            showDecor: showDecorBox.checked,
            autoSubmit: autoSubmitBox.checked,
            easyAccess: getEasyAccessLevel(),
            passwd: passwordBox.value,
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
}

// Restores options using the preferences stored in chrome.storage.
function restoreOptions() {
    const DEFAULT_CONFIG = {
        secret: "",
        username: "",
        showDecor: true,
        autoSubmit: true,
        easyAccess: "",
        passwd: "",
    };
    chrome.storage.sync.get(
        DEFAULT_CONFIG,
        (items) => {
            secretBox.value = items.secret;
            usernameBox.value = items.username;
            showDecorBox.checked = items.showDecor;
            autoSubmitBox.checked = items.autoSubmit;
            passwordBox.value = items.passwd;
            setEasyAccessLevel(items.easyAccess);
        }
    );
}

function loaded() {
    restoreOptions();
}

const themeObserver = new MutationObserver(onThemeChange);
themeObserver.observe(htmlElement, { attributes: true });
changeTheme(htmlElement.getAttribute("data-bs-theme"));
document.addEventListener("DOMContentLoaded", loaded);
saveButton.addEventListener("click", saveOptions);
eaGroup.addEventListener("change", showPasswordSection);
migrationLinkInput.addEventListener("input", migrationLinkChanged);
importModalButton.addEventListener("click", importModalButtonClicked)
importButton.addEventListener("click", importMigrationLink);
accountSelect.addEventListener("change", migrationAccountChanged);
uploadQrInput.addEventListener("change", uploadQrChanged);