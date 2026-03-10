import './Header.css';
import Logo from '../../assets/images/pomodoro.svg';
import Home from '../../assets/images/home.svg';
import Tasks from '../../assets/images/tasks.svg';
import Statistics from '../../assets/images/statistics.svg';
import Settings from '../../assets/images/settings.svg';
import BurgerMenu from '../../assets/images/burger-menu.svg';

class Header  {
    #header;
    #nav;
    #popup;
    #sidebarBackground;
    #sidebar;
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
            icon: Settings,
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
                <div class="nav-toggle header-nav cursor-pointer"><img src="${BurgerMenu}" alt="burger menu" class="burger-menu"/></div>
        
                <div class="sidebar-background">
                </div>
                <div class="sidebar">
                </div>
            </div>
        `;

        this.#nav = this.#header.querySelector('.navigation');
        this.#popup = this.#header.querySelector('.popup');
        this.#sidebar = this.#header.querySelector('.sidebar');
        this.#sidebarBackground = this.#header.querySelector('.sidebar-background');

        this.addDesktopNavItems();
        this.addMobileNavItems();

        const settingsBtn = this.#header.querySelector('.setting-toggle');
        settingsBtn.addEventListener('click', () => this.toggleSettingsPopup());

        const navToggle = this.#header.querySelector('.nav-toggle');
        navToggle.addEventListener('click', () => this.toggleMobileNav());

        this.#sidebarBackground.addEventListener('click', () => this.toggleMobileNav());
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

            // Set popup
            this.#popup = document.createElement('div');
            this.#popup.classList.add('popup');
            this.#nav.appendChild(this.#popup);
        });
    }

    addMobileNavItems() {
        this.#menu.forEach(item => {
            const navItem = document.createElement('a');
            navItem.href = item.link;
            navItem.innerHTML = `<img class="header-nav" src="${item.icon}" alt="${item.title}"/> ${item.title}`;
            if(window.location.pathname === item.link) {
                navItem.classList.add('active-nav');
            }
            this.#sidebar.appendChild(navItem);
        })
    }

    toggleSettingsPopup() {
        this.#popup.style.display = this.#popup.style.display === 'block' ? 'none' : 'block';
    }

    toggleMobileNav() {
        this.#sidebarBackground.style.display = this.#sidebarBackground.style.display === 'block' ? 'none' : 'block';
        this.#sidebar.style.display = this.#sidebar.style.display === 'flex' ? 'none' : 'flex';
    }

    
}

export default Header;