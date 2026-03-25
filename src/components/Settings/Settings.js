import './Settings.css';
import Toggle from '../ToggleBtn/ToggleBtn';
import Tomato from '../../assets/images/tomato.svg';

export default class Settings {
    #settingsContainer;
    #settingsContent;

    // General settings
    currentSetting = 'General'; // General, Timers, Sounds, Account
    endTimerNotificationDefault = true;
    showSpotifyPlaylistDefault = true;

    // Timers settings
    pomodoroMinutesDefault = 25;
    shortBreakMinutesDefault = 5;
    longBreakMinutesDefault = 15;
    usePomodoroSequenceDefault = true;

    // Sounds settings
    soundsAlertSoundDefault = 'Lofi';
    playSoundWhenTimerFinishDefault = true;
    alertVolumeDefault = 50;

    // Accounts
    usersDefault = [{
        username: "guess",
        password: ""
    }]

    constructor() {
        this.onInit();
    }

    onInit() {
        // If no data in localStorage, set default values
        if (!localStorage.getItem('endTimerNotification')) {
            localStorage.setItem('endTimerNotification', this.endTimerNotificationDefault.toString());
        }
        if (!localStorage.getItem('showSpotifyPlaylist')) {
            localStorage.setItem('showSpotifyPlaylist', this.showSpotifyPlaylistDefault.toString());
        }
        if (!localStorage.getItem('pomodoroMinutes')) {
            localStorage.setItem('pomodoroMinutes', this.pomodoroMinutesDefault.toString());
        }
        if (!localStorage.getItem('shortBreakMinutes')) {
            localStorage.setItem('shortBreakMinutes', this.shortBreakMinutesDefault.toString());
        }
        if (!localStorage.getItem('longBreakMinutes')) {
            localStorage.setItem('longBreakMinutes', this.longBreakMinutesDefault.toString());
        }
        if (!localStorage.getItem('usePomodoroSequence')) {
            localStorage.setItem('usePomodoroSequence', this.usePomodoroSequenceDefault.toString());
        }
        if (!localStorage.getItem('soundsAlertSound')) {
            localStorage.setItem('soundsAlertSound', this.soundsAlertSoundDefault.toString());
        }
        if (!localStorage.getItem('playSoundWhenTimerFinish')) {
            localStorage.setItem('playSoundWhenTimerFinish', this.playSoundWhenTimerFinishDefault.toString());
        }
        if (!localStorage.getItem('alertVolume')) {
            localStorage.setItem('alertVolume', this.alertVolumeDefault.toString());
        }
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify(this.usersDefault));
        }
        
        this.#settingsContainer = document.querySelector('.settings-container');

        this.#settingsContainer.innerHTML = `
            <div class="settings-content-container">
                <div class="settings-menu">
                    <div id="general"><img src=${Tomato} alt="Tomato" />General</div>
                    <div id="timers"><img src=${Tomato} alt="Tomato" />Timers</div>
                    <div id="sounds"><img src=${Tomato} alt="Tomato" />Sounds</div>
                    <div id="accounts"><img src=${Tomato} alt="Tomato" />Accounts</div>
                    <div id="developer"><img src=${Tomato} alt="Tomato" />Developer Mode</div>
                </div>

                <div class="settings-content">
                    <!-- Content will be dynamically inserted here -->
                </div>
            </div>

            <div class="settings-actions">
                <button>Reset all</button>
                <div>
                    <button>Close</button>
                    <button>Save changes</button>
                </div>
            </div>
        `;

        // Append nav event listeners
        const generalBtn = this.#settingsContainer.querySelector('#general');
        const timersBtn = this.#settingsContainer.querySelector('#timers');
        const soundsBtn = this.#settingsContainer.querySelector('#sounds');
        const accountsBtn = this.#settingsContainer.querySelector('#accounts');
        const developerBtn = this.#settingsContainer.querySelector('#developer');

        generalBtn.addEventListener('click', () => this.generateGeneralContent());
        timersBtn.addEventListener('click', () => this.generateTimersContent());
        soundsBtn.addEventListener('click', () => this.generateSoundsContent());
        accountsBtn.addEventListener('click', () => this.generateAccountsContent());
        developerBtn.addEventListener('click', () => this.generateDeveloperModeContent());

        this.#settingsContent = this.#settingsContainer.querySelector('.settings-content');
        // Generate default content
        this.generateGeneralContent();

    }

    toggleLocalStorageData(key) {
        const currentValue = localStorage.getItem(key);
        if (currentValue === 'true') {
            localStorage.setItem(key, 'false');
        } else {
            localStorage.setItem(key, 'true');
        }
    }

    generateGeneralContent() {
        this.#settingsContent.innerHTML = `General content`;
    }

    generateTimersContent() {
        this.#settingsContent.innerHTML = `Timers content`;
    }

    generateSoundsContent() {
        this.#settingsContent.innerHTML = `Sounds content`;
    }

    generateAccountsContent() {
        this.#settingsContent.innerHTML = `Accounts content`;
    }

    generateDeveloperModeContent() {
        this.#settingsContent.innerHTML = `Developer Mode content`;
    }
}