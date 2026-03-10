import './Setting.css';

class Settings {
    currentSetting = 'General';
    endTimerNotificationDefault = true;
    showSpotifyPlaylistDefault = true;
    pomodoroMinutesDefault = 25;
    shortBreakMinutesDefault = 5;
    longBreakMinutesDefault = 15;
    usePomodoroSequenceDefault = true;

    constructor() {
        this.onInit();
    }

    onInit() {
        // If no data in localStorage, set default values
        
    }

    toggleLocalStorageData(key) {
        const currentValue = localStorage.getItem(key);
        if (currentValue === 'true') {
            localStorage.setItem(key, 'false');
        } else {
            localStorage.setItem(key, 'true');
        }
    }
}