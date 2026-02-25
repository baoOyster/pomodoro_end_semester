import './Header.css';
import Logo from '../../assets/images/pomodoro.svg';
import Home from '../../assets/images/home.svg';
import Tasks from '../../assets/images/tasks.svg';
import Statistics from '../../assets/images/statistics.svg';
import Settings from '../../assets/images/settings.svg';
import BurgerMenu from '../../assets/images/burger-menu.svg';

class Header  {
    #header;
    #popup;

    constructor() {
        this.onInit();
    }

    onInit() {
        this.#header = document.querySelector('header');
        
        this.#header.innerHTML = `
            <img src="${Logo}" alt="Pomodoro Logo" class="header-logo" />
            
            <div class='navigation'>
                <a href="/"><img class="header-nav cursor-pointer" src="${Home}" alt="pomodoro"/></a>
                <a href="/tasks.html"><img class="header-nav cursor-pointer" src="${Tasks}" alt="tasks"/></a>
                <a href="/statistics.html"><img class="header-nav cursor-pointer" src="${Statistics}" alt="statistics"/></a>
                <img src="${Settings}" alt="setting" class="header-nav setting-toggle cursor-pointer"/>
            </div>
            
            <div class="mobile-nav">
                <div class="nav-toggle header-nav cursor-pointer"><img src="${BurgerMenu}" alt="burger menu" class="burger-menu"/></div>
        
                <div class="sidebar">
                    <a href="/"><img class="header-nav" src="${Home}" alt="pomodoro"/> Home</a>
                    <a href="/tasks.html"><img class="header-nav" src="${Tasks}" alt="tasks"/> Tasks</a>
                    <a href="/statistics.html"><img class="header-nav" src="${Statistics}" alt="statistics"/> Statistics</a>
                    <button><img src="${Settings}" alt="setting" class="header-nav setting-toggle"/></button>
                </div>
            </div>
        `;

        this.#popup = this.#header.querySelector('.popup');
        
        const settingsBtn = this.#header.querySelector('.setting-toggle');
        settingsBtn.addEventListener('click', () => this.toggleSettingsPopup());
    }

    toggleSettingsPopup() {
        this.#popup.style.display = this.#popup.style.display === 'block' ? 'none' : 'block';
    }
}

export default Header;