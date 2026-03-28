import './Settings.css';
import Toggle from '../ToggleBtn/ToggleBtn';
import Tomato from '../../assets/images/tomato.svg';

export default class Settings {
    #settingsContainer;
    #settingsContent;
    #currentSetting = 'general';
    #draft = {};   // in-memory working copy — only written to localStorage on Save

    #settingKeys = [
        'endTimerNotification',
        'showSpotifyPlaylist',
        'pomodoroMinutes',
        'shortBreakMinutes',
        'longBreakMinutes',
        'usePomodoroSequence',
        'soundsAlertSound',
        'playSoundWhenTimerFinish',
        'alertVolume',
        'geminiApiKey',
        'customSounds',
    ];

    #defaults = {
        account: {
            name:     'guest',
            password: '',
        },
        endTimerNotification:     'true',
        showSpotifyPlaylist:      'true',
        pomodoroMinutes:          '25',
        shortBreakMinutes:        '5',
        longBreakMinutes:         '15',
        usePomodoroSequence:      'true',
        soundsAlertSound:         'Lofi',
        playSoundWhenTimerFinish: 'true',
        alertVolume:              '50',
        geminiApiKey:             '',
        customSounds:             '{}',
    };

    /**
     * @param {HTMLElement|null} container  Mount target. Defaults to the first
     *   `.settings-container` element in the document (the popup on most pages).
     *   Pass an explicit element to mount inline (e.g. the settings page's <main>).
     */
    constructor(container = null) {
        this.#init(container);
    }

    #init(container = null) {
        this.#initLocalStorage();

        this.#settingsContainer = container ?? document.querySelector('.settings-container');

        this.#settingsContainer.innerHTML = `
            <div class="settings-content-container">
                <div class="settings-menu">
                    <div id="general"  class="settings-menu-item active-menu"><img src="${Tomato}" alt="Tomato" />General</div>
                    <div id="timers"   class="settings-menu-item"><img src="${Tomato}" alt="Tomato" />Timers</div>
                    <div id="sounds"   class="settings-menu-item"><img src="${Tomato}" alt="Tomato" />Sounds</div>
                    <div id="accounts" class="settings-menu-item"><img src="${Tomato}" alt="Tomato" />Accounts</div>
                    <div id="agent"    class="settings-menu-item"><img src="${Tomato}" alt="Tomato" />AI Agent</div>
                </div>
                <div class="settings-content"></div>
            </div>
            <div class="settings-actions">
                <button class="settings-reset-btn">Reset all</button>
                <div>
                    <button class="settings-save-btn">Save changes</button>
                </div>
            </div>
        `;

        this.#settingsContent = this.#settingsContainer.querySelector('.settings-content');

        this.#settingsContainer.querySelectorAll('.settings-menu-item').forEach(item => {
            item.addEventListener('click', () => this.#navigate(item.id));
        });

        this.#settingsContainer.querySelector('.settings-reset-btn')
            .addEventListener('click', () => this.#resetAll());

        this.#settingsContainer.querySelector('.settings-save-btn')
            .addEventListener('click', () => this.#saveCurrentAccount());

        this.#navigate('general');
    }

    // ── localStorage ─────────────────────────────────────────────────────────

    #initLocalStorage() {
        try { JSON.parse(localStorage.getItem('accounts')); } catch {
            localStorage.removeItem('accounts');
        }

        if (!localStorage.getItem('accounts')) {
            const guest = this.#buildAccountObject(
                this.#defaults.account.name,
                this.#defaults.account.password,
                this.#defaultSettings()
            );
            localStorage.setItem('accounts', JSON.stringify([guest]));
        }

        if (!localStorage.getItem('currentAccount')) {
            localStorage.setItem('currentAccount', this.#defaults.account.name);
        }

        this.#loadDraft();
        this.#migrateOldFlatKeys();
    }

    /** One-time migration: if old flat keys exist, pull them into the account then delete them. */
    #migrateOldFlatKeys() {
        let migrated = false;
        this.#settingKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                this.#draft[key] = value;
                localStorage.removeItem(key);
                migrated = true;
            }
        });
        if (migrated) this.#saveCurrentAccount();
    }

    #defaultSettings() {
        return Object.fromEntries(
            this.#settingKeys.map(k => [k, this.#defaults[k]])
        );
    }

    #buildAccountObject(name, password, settings) {
        return { name, password, settings };
    }

    #getAccounts() {
        return JSON.parse(localStorage.getItem('accounts') ?? '[]');
    }

    #getCurrentAccountName() {
        return localStorage.getItem('currentAccount') ?? this.#defaults.account.name;
    }

    /** Loads the current account's settings into the in-memory draft. */
    #loadDraft() {
        const account = this.#getAccounts().find(a => a.name === this.#getCurrentAccountName());
        // Merge defaults so new keys added later are always present
        this.#draft = { ...this.#defaultSettings(), ...account?.settings };
    }

    /** Commits the in-memory draft to the current account object in localStorage. */
    #saveCurrentAccount() {
        const accounts = this.#getAccounts();
        const account = accounts.find(a => a.name === this.#getCurrentAccountName());
        if (!account) return;

        account.settings = { ...this.#draft };
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }

    /** Called by Header whenever the popup is opened — resets draft to last saved state. */
    reload() {
        this.#loadDraft();
        this.#navigate(this.#currentSetting);
    }

    // ── Navigation ────────────────────────────────────────────────────────────

    #navigate(id) {
        this.#currentSetting = id;

        this.#settingsContainer.querySelectorAll('.settings-menu-item').forEach(item => {
            item.classList.toggle('active-menu', item.id === id);
        });

        const contentMap = {
            general:  () => this.#renderGeneral(),
            timers:   () => this.#renderTimers(),
            sounds:   () => this.#renderSounds(),
            accounts: () => this.#renderAccounts(),
            agent:    () => this.#renderAIAgent(),
        };

        this.#settingsContent.innerHTML = '';
        contentMap[id]?.();
    }

    // ── Section renderers ─────────────────────────────────────────────────────

    #renderGeneral() {
        [
            { label: 'End timer notification', key: 'endTimerNotification' },
            { label: 'Show Spotify playlist',  key: 'showSpotifyPlaylist'  },
        ].forEach(({ label, key }) => {
            this.#settingsContent.appendChild(this.#createToggleRow(label, key));
        });
    }

    #renderTimers() {
        [
            { label: 'Pomodoro (minutes)',    key: 'pomodoroMinutes',   min: 1, max: 90 },
            { label: 'Short break (minutes)', key: 'shortBreakMinutes', min: 1, max: 30 },
            { label: 'Long break (minutes)',  key: 'longBreakMinutes',  min: 1, max: 60 },
        ].forEach(({ label, key, min, max }) => {
            this.#settingsContent.appendChild(
                this.#createRow(label, this.#createNumberInput(key, min, max))
            );
        });

        this.#settingsContent.appendChild(
            this.#createToggleRow('Use pomodoro sequence', 'usePomodoroSequence', 'Pomodoro → short break, repeat 4x, then one long break')
        );
    }

    #renderSounds() {
        const builtInOptions = ['Lofi', 'Bell', 'Chime', 'None'];
        const customSounds = JSON.parse(this.#draft['customSounds'] ?? '{}');

        const select = document.createElement('select');
        select.classList.add('settings-select');

        builtInOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            option.selected = this.#draft['soundsAlertSound'] === opt;
            select.appendChild(option);
        });

        Object.keys(customSounds).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            option.selected = this.#draft['soundsAlertSound'] === name;
            select.insertBefore(option, select.lastElementChild); // before 'None'
        });

        select.addEventListener('change', () => {
            this.#draft['soundsAlertSound'] = select.value;
        });

        this.#settingsContent.appendChild(this.#createRow('Alert sound', select));
        this.#settingsContent.appendChild(
            this.#createToggleRow('Play sound when timer finishes', 'playSoundWhenTimerFinish')
        );

        const range = document.createElement('input');
        range.type = 'range';
        range.min = 0;
        range.max = 100;
        range.value = this.#draft['alertVolume'] ?? '50';
        range.classList.add('settings-range');
        range.addEventListener('input', () => {
            this.#draft['alertVolume'] = range.value;
        });

        this.#settingsContent.appendChild(this.#createRow('Alert volume', range));

        const uploadBtn = document.createElement('button');
        uploadBtn.classList.add('settings-upload-sound-btn');
        uploadBtn.textContent = 'Upload sound';
        uploadBtn.addEventListener('click', () => this.#showUploadSoundPopup(select));
        this.#settingsContent.appendChild(
            this.#createRow('Custom sound', uploadBtn, 'Upload your own audio file')
        );
    }

    #showUploadSoundPopup(select) {
        const overlay = document.createElement('div');
        overlay.classList.add('settings-password-overlay');

        const card = document.createElement('div');
        card.classList.add('settings-password-card');

        const title = document.createElement('p');
        title.classList.add('settings-password-title');
        title.textContent = 'Upload custom sound';

        const nameLabel = document.createElement('label');
        nameLabel.classList.add('settings-upload-label');
        nameLabel.textContent = 'Sound name';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'e.g. My alarm';
        nameInput.classList.add('settings-account-input');

        const fileLabel = document.createElement('label');
        fileLabel.classList.add('settings-upload-label');
        fileLabel.textContent = 'Audio file';
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.classList.add('settings-file-input');

        const error = document.createElement('span');
        error.classList.add('settings-account-error');

        const actions = document.createElement('div');
        actions.classList.add('settings-password-actions');

        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('settings-account-switch-btn');
        cancelBtn.textContent = 'Cancel';

        const confirmBtn = document.createElement('button');
        confirmBtn.classList.add('settings-account-create-btn');
        confirmBtn.textContent = 'Upload';

        const close = () => overlay.remove();
        cancelBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        confirmBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const file = fileInput.files[0];

            if (!name) { error.textContent = 'Please enter a sound name.'; return; }
            if (!file)  { error.textContent = 'Please select an audio file.'; return; }

            const reader = new FileReader();
            reader.onload = (ev) => {
                const customSounds = JSON.parse(this.#draft['customSounds'] ?? '{}');
                customSounds[name] = ev.target.result;
                this.#draft['customSounds'] = JSON.stringify(customSounds);

                const exists = [...select.options].some(o => o.value === name);
                if (!exists) {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    select.insertBefore(option, select.lastElementChild);
                }
                select.value = name;
                this.#draft['soundsAlertSound'] = name;
                close();
            };
            reader.onerror = () => { error.textContent = 'Failed to read the file.'; };
            reader.readAsDataURL(file);
        });

        actions.append(cancelBtn, confirmBtn);
        card.append(title, nameLabel, nameInput, fileLabel, fileInput, error, actions);
        overlay.appendChild(card);
        this.#settingsContainer.appendChild(overlay);
        nameInput.focus();
    }

    #renderAccounts() {
        const accounts = this.#getAccounts();
        const currentName = this.#getCurrentAccountName();

        const currentRow = document.createElement('div');
        currentRow.classList.add('settings-row');
        currentRow.innerHTML = `<span>Logged in as</span><strong class="settings-account-name">${currentName}</strong>`;
        this.#settingsContent.appendChild(currentRow);

        const list = document.createElement('div');
        list.classList.add('settings-account-list');

        accounts.forEach(account => {
            const item = document.createElement('div');
            item.classList.add('settings-account-item');

            const nameEl = document.createElement('span');
            nameEl.textContent = account.name;
            item.appendChild(nameEl);

            if (account.name === currentName) {
                const badge = document.createElement('span');
                badge.classList.add('settings-account-badge');
                badge.textContent = 'Active';
                item.appendChild(badge);
            } else {
                const switchBtn = document.createElement('button');
                switchBtn.classList.add('settings-account-switch-btn');
                switchBtn.textContent = 'Switch';
                switchBtn.addEventListener('click', () => this.#showPasswordPrompt(account.name));
                item.appendChild(switchBtn);
            }

            list.appendChild(item);
        });

        this.#settingsContent.appendChild(list);

        const form = document.createElement('div');
        form.classList.add('settings-account-form');

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Username';
        nameInput.classList.add('settings-account-input');

        const passInput = document.createElement('input');
        passInput.type = 'password';
        passInput.placeholder = 'Password';
        passInput.classList.add('settings-account-input');

        const createBtn = document.createElement('button');
        createBtn.classList.add('settings-account-create-btn');
        createBtn.textContent = 'Create account';
        createBtn.addEventListener('click', () => {
            this.#createAccount(nameInput.value.trim(), passInput.value, errorEl);
        });

        const errorEl = document.createElement('span');
        errorEl.classList.add('settings-account-error');

        form.append(nameInput, passInput, createBtn, errorEl);
        this.#settingsContent.appendChild(form);
    }

    #renderAIAgent() {
        [
            {
                label:      'Gemini API Key',
                key:        'geminiApiKey',
                description: 'Used for AI-powered features. Get yours at aistudio.google.com',
            },
        ].forEach(({ label, key, description }) => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('settings-api-key-wrapper');

            const input = document.createElement('input');
            input.type = 'password';
            input.classList.add('settings-account-input', 'settings-api-key-input');
            input.placeholder = 'Paste your API key here';
            input.value = this.#draft[key] ?? '';
            input.addEventListener('input', () => {
                this.#draft[key] = input.value;
            });

            const toggleBtn = document.createElement('button');
            toggleBtn.classList.add('settings-api-key-toggle');
            toggleBtn.textContent = 'Show';
            toggleBtn.addEventListener('click', () => {
                const hidden = input.type === 'password';
                input.type = hidden ? 'text' : 'password';
                toggleBtn.textContent = hidden ? 'Hide' : 'Show';
            });

            wrapper.append(input, toggleBtn);
            this.#settingsContent.appendChild(this.#createRow(label, wrapper, description));
        });
    }

    // ── Account actions ───────────────────────────────────────────────────────

    #showPasswordPrompt(name) {
        const account = this.#getAccounts().find(a => a.name === name);

        const overlay = document.createElement('div');
        overlay.classList.add('settings-password-overlay');

        const card = document.createElement('div');
        card.classList.add('settings-password-card');

        const title = document.createElement('p');
        title.classList.add('settings-password-title');
        title.textContent = `Switch to "${name}"`;

        const input = document.createElement('input');
        input.type = 'password';
        input.placeholder = 'Enter password';
        input.classList.add('settings-account-input');

        const error = document.createElement('span');
        error.classList.add('settings-account-error');

        const actions = document.createElement('div');
        actions.classList.add('settings-password-actions');

        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('settings-account-switch-btn');
        cancelBtn.textContent = 'Cancel';

        const confirmBtn = document.createElement('button');
        confirmBtn.classList.add('settings-account-create-btn');
        confirmBtn.textContent = 'Confirm';

        const close = () => overlay.remove();

        cancelBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        confirmBtn.addEventListener('click', () => {
            if (input.value !== account.password) {
                error.textContent = 'Incorrect password.';
                input.value = '';
                input.focus();
                return;
            }
            close();
            this.#switchAccount(name);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')  confirmBtn.click();
            if (e.key === 'Escape') close();
        });

        actions.append(cancelBtn, confirmBtn);
        card.append(title, input, error, actions);
        overlay.appendChild(card);
        this.#settingsContainer.appendChild(overlay);
        input.focus();
    }

    #switchAccount(name) {
        this.#saveCurrentAccount();
        localStorage.setItem('currentAccount', name);
        this.#loadDraft();
        this.#navigate('accounts');
    }

    #createAccount(name, password, errorEl) {
        if (!name) {
            errorEl.textContent = 'Username cannot be empty.';
            return;
        }

        const accounts = this.#getAccounts();
        if (accounts.find(a => a.name === name)) {
            errorEl.textContent = `Account "${name}" already exists.`;
            return;
        }

        accounts.push(this.#buildAccountObject(name, password, this.#defaultSettings()));
        localStorage.setItem('accounts', JSON.stringify(accounts));
        this.#navigate('accounts');
    }

    #resetAll() {
        this.#draft = { ...this.#defaultSettings() };
        this.#saveCurrentAccount();
        this.#navigate(this.#currentSetting);
    }

    // ── UI helpers ────────────────────────────────────────────────────────────

    #createRow(label, control, description) {
        const row = document.createElement('div');
        row.classList.add('settings-row');

        const labelGroup = document.createElement('div');
        labelGroup.classList.add('settings-row-label-group');

        const labelEl = document.createElement('span');
        labelEl.classList.add('settings-row-label');
        labelEl.textContent = label;
        labelGroup.appendChild(labelEl);

        if (description) {
            const descEl = document.createElement('span');
            descEl.classList.add('settings-row-description');
            descEl.textContent = description;
            labelGroup.appendChild(descEl);
        }

        row.append(labelGroup, control);
        return row;
    }

    #createToggleRow(label, key, description) {
        const toggle = new Toggle('', null, '', key, {
            get: ()  => this.#draft[key],
            set: (v) => { this.#draft[key] = v; },
        });
        return this.#createRow(label, toggle.element, description);
    }

    #createNumberInput(key, min, max) {
        const input = document.createElement('input');
        input.type = 'number';
        input.classList.add('settings-number-input');
        input.min = min;
        input.max = max;
        input.value = this.#draft[key] ?? this.#defaults[key];
        input.addEventListener('change', () => {
            this.#draft[key] = input.value;
        });
        return input;
    }
}
