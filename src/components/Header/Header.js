import './Header.css';
import Logo from '../../assets/images/pomodoro.svg';
import Home from '../../assets/images/home.svg';
import Tasks from '../../assets/images/tasks.svg';
import Statistics from '../../assets/images/statistics.svg';
import SettingsImg from '../../assets/images/settings.svg';
import Settings from '../Settings/Settings';
import Close from '../../assets/images/Close.svg';

class Header  {
    #header;
    #nav;
    #popup;
    #menu = [
        {
            title: 'Home',
            icon: Home,
            link: '/'
        },
        {
            title: 'Tasks',
            icon: Tasks,
            link: '/tasks.html'
        },
        {
            title: 'Statistics',
            icon: Statistics,
            link: '/statistics.html'
        },
        {
            title: 'Settings',
            icon: SettingsImg,
            link: '/settings.html'
        }
    ];

    constructor() {
        this.onInit();
    }

    onInit() {
        this.#header = document.querySelector('header');
        
        this.#header.innerHTML = `
            <img src="${Logo}" alt="Pomodoro Logo" class="header-logo" />
            
            <div class='navigation'>
            </div>
            
            <div class="mobile-nav">
                
            </div>
        `;

        this.#nav = this.#header.querySelector('.navigation');
        this.#popup = this.#header.querySelector('.popup');

        this.addDesktopNavItems();

        const settingsBtn = this.#header.querySelector('.setting-toggle');
        settingsBtn.addEventListener('click', () => this.toggleSettingsPopup());

        new Settings();

        // Append close button after Settings renders (Settings overwrites .settings-container innerHTML)
        const popupContent = this.#header.querySelector('.popup');
        const closeBtn = document.createElement('img');
        closeBtn.src = Close;
        closeBtn.alt = 'Close';
        closeBtn.classList.add('popup-close-btn', 'cursor-pointer');
        closeBtn.addEventListener('click', () => this.toggleSettingsPopup());
        popupContent.prepend(closeBtn);
    }

    addDesktopNavItems() {
        this.#menu.forEach(item => {
            let navItem;

            if(item.title === 'Settings') {
                navItem = document.createElement('img');
                navItem.src = item.icon;
                navItem.alt = item.title;
                navItem.classList.add('header-nav', 'setting-toggle', 'cursor-pointer');
            } else {
                navItem = document.createElement('a');
                navItem.href = item.link;
                navItem.innerHTML = `<img src="${item.icon}" alt="${item.title}" class="header-nav cursor-pointer"/>`;
            }

            if(window.location.pathname === item.link) {
                navItem.classList.add('active-nav');
            }

            this.#nav.appendChild(navItem);
        });

        // Set popup wrapper
        this.#popup = document.createElement('div');
        this.#popup.classList.add('popup-wrapper');
        this.#popup.addEventListener('click', () => this.toggleSettingsPopup());
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.classList.add('popup', 'settings-container');
        popupContent.addEventListener('click', (e) => e.stopPropagation());
        
        this.#popup.appendChild(popupContent);
        this.#nav.appendChild(this.#popup);
    }
    
    toggleSettingsPopup() {
        this.#popup.style.display = this.#popup.style.display === 'flex' ? 'none' : 'flex';
        console.log(this.#popup.innerHTML);
    }
    
}

export default Header;