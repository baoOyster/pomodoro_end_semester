import LogoTransfer from '../../assets/images/Logo_transfer.svg';
import TomatoImg from '../../assets/images/tomato.svg';
import ChevronLeft from '../../assets/images/chevron_left.svg';
import ChevronRight from '../../assets/images/chevron_right.svg';
import Fire from '../../assets/images/fire.svg';

class StatisticsManager {
    // ── DOM Elements ──────────────────────────────────────────────────────────
    #todayTotalTimeDisplay = document.getElementById('today_total_time_value');
    #progressPercentageText = document.getElementById('progress_percentage');
    #currentProgressContainer = document.getElementById('current_progress_container');
    #currentTaskText = document.getElementById('current_task_name');
    #heatMapGrid = document.querySelector('.square_grid');
    #displayDate = new Date();
    #pieChartInstance = null;

    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#init());
        } else {
            this.#init();
        }
    }

    #init() {
        this.#recordVisit();
        this.#updateAll();

        // Listen for stats or account changes
        window.addEventListener('stats-updated', () => this.#updateAll());
        window.addEventListener('settings-saved', () => this.#updateAll());
    }

    #recordVisit() {
        try {
            const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const currentName = localStorage.getItem('currentAccount') || 'guest';
            const accountIndex = accounts.findIndex(a => a.name === currentName);
            
            if (accountIndex === -1) return;

            const account = accounts[accountIndex];
            if (!account.stats) account.stats = {};
            if (!Array.isArray(account.stats.visitedDays)) account.stats.visitedDays = [];

            const todayStr = new Date().toDateString();
            if (!account.stats.visitedDays.includes(todayStr)) {
                account.stats.visitedDays.push(todayStr);
                localStorage.setItem('accounts', JSON.stringify(accounts));
            }
        } catch (e) {
            console.error('Failed to record visit:', e);
        }
    }

    // ── Data Getters ──────────────────────────────────────────────────────────

    get #account() {
        const accounts    = JSON.parse(localStorage.getItem('accounts') ?? '[]');
        const currentName = localStorage.getItem('currentAccount') ?? 'guest';
        return accounts.find(a => a.name === currentName) || null;
    }

    get #sessions() {
        return this.#account?.stats?.sessions ?? [];
    }

    get #stats() {
        return this.#account?.stats ?? { tasksPlanned: 0, tasksDone: 0 };
    }

    // ── Updaters ──────────────────────────────────────────────────────────────

    #updateAll() {
        this.#updateTodayTotalTime();
        this.#updateTomatoProgress();
        this.#updateCurrentTask();
        this.#renderHeatMap();
        this.#renderCalendar();
        this.#renderPieChart();
    }

    #updateTodayTotalTime() {
        const todayStr = new Date().toDateString();
        
        // Sum durations (in seconds) for sessions completed today
        const totalSecondsToday = this.#sessions
            .filter(s => new Date(s.completedAt).toDateString() === todayStr && s.mode === 'pomodoro')
            .reduce((sum, s) => sum + (s.duration || 0), 0);

        const totalMinutes = Math.floor(totalSecondsToday / 60);
        const hours = Math.floor(totalMinutes / 60); 
        const minutes = totalMinutes % 60; 
        
        if (this.#todayTotalTimeDisplay) {
            this.#todayTotalTimeDisplay.innerText = `${hours} hours ${minutes} minutes`;
        }
    }

    #updateTomatoProgress() {
        const planned = this.#stats.tasksPlanned || 0;
        const done = this.#stats.tasksDone || 0;
        
        let percent = planned > 0 ? (done / planned) * 100 : 0;
        percent = Math.max(0, Math.min(100, Math.round(percent))); 
        
        if (this.#progressPercentageText) {
            this.#progressPercentageText.innerText = `${percent}%`;
        }

        if (this.#currentProgressContainer) {
            this.#currentProgressContainer.innerHTML = '';
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block'; 
            wrapper.style.height = '30px';
            
            const emptyTomatoesLayer = document.createElement('div');
            emptyTomatoesLayer.style.display = 'flex';
            emptyTomatoesLayer.style.justifyContent = 'space-between';
            emptyTomatoesLayer.style.gap = '10px';
            
            const fullTomatoesLayer = document.createElement('div');
            fullTomatoesLayer.style.position = 'absolute';
            fullTomatoesLayer.style.top = '0';
            fullTomatoesLayer.style.left = '0';
            fullTomatoesLayer.style.display = 'flex';
            fullTomatoesLayer.style.gap = '10px';
            fullTomatoesLayer.style.overflow = 'hidden'; 
            fullTomatoesLayer.style.width = `${percent}%`;
            fullTomatoesLayer.style.transition = 'width 0.5s ease-in-out';
            
            for (let i = 0; i < 10; i++) {
                const emptyImg = document.createElement('img');
                emptyImg.src = LogoTransfer;
                emptyImg.style.width = '50px'; 
                emptyImg.style.height = '50px';
                
                const fullImg = document.createElement('img');
                fullImg.src = TomatoImg;
                fullImg.style.width = '50px';
                fullImg.style.height = '50px';
                
                emptyTomatoesLayer.appendChild(emptyImg);
                fullTomatoesLayer.appendChild(fullImg);
            }
            
            wrapper.appendChild(emptyTomatoesLayer);
            wrapper.appendChild(fullTomatoesLayer);
            this.#currentProgressContainer.appendChild(wrapper);
        }
    }

    #updateCurrentTask() {
        const title = this.#account?.focusTask?.title;
        if (!this.#currentTaskText) return;
        
        if (title) {
            this.#currentTaskText.innerText = title;
            this.#currentTaskText.style.color = '#B52222';
            this.#currentTaskText.style.fontStyle = 'normal';
        } else {
            this.#currentTaskText.innerText = "Chưa có task";
            this.#currentTaskText.style.color = '#7F7F7F';
            this.#currentTaskText.style.fontStyle = 'italic';
        }
        
        this.#currentTaskText.style.textShadow = '0px 4px 4px rgba(0, 0, 0, 0.25)';
        this.#currentTaskText.style.fontWeight = 'bold';
        this.#currentTaskText.style.fontSize = '40px';
    }

    #getColorForHours(hours) {
        if (hours <= 0) return '#FFFBFB'; 
        if (hours <= 1) return '#FFF7D5'; 
        if (hours <= 2) return '#FFC2C2'; 
        if (hours <= 4) return '#FF7C7C'; 
        return '#BF1919';                 
    }

    #renderHeatMap() {
        if (!this.#heatMapGrid) return;
        
        // Group sessions by local date (YYYY-MM-DD)
        const dailyHours = {};
        this.#sessions.forEach(s => {
            if (!s.duration || s.mode !== 'pomodoro') return;
            // Get local date string 'YYYY-MM-DD' dynamically
            const dateObj = new Date(s.completedAt);
            const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            
            dailyHours[dateString] = (dailyHours[dateString] || 0) + s.duration;
        });

        this.#heatMapGrid.innerHTML = ''; 
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 364); 
        
        for (let i = 0; i < 365; i++) {
            const currentSquareDate = new Date(startDate);
            currentSquareDate.setDate(startDate.getDate() + i);
            
            const dateString = `${currentSquareDate.getFullYear()}-${String(currentSquareDate.getMonth() + 1).padStart(2, '0')}-${String(currentSquareDate.getDate()).padStart(2, '0')}`;
            
            const square = document.createElement('div');
            square.className = 'heat_square';
            
            const totalSeconds = dailyHours[dateString] || 0;
            const hoursStudied = totalSeconds / 3600; // float hours
            
            square.style.backgroundColor = this.#getColorForHours(hoursStudied);
            const displayTime = hoursStudied > 0 ? `${hoursStudied.toFixed(1)} hours` : '0 hours';
            square.title = `${dateString}: ${displayTime}`;
            
            this.#heatMapGrid.appendChild(square);
        }

        // Auto-scroll to end (most recent day)
        this.#heatMapGrid.scrollLeft = this.#heatMapGrid.scrollWidth;
    }

    #renderCalendar() {
        const dayContainer = document.getElementById('day_in_month');
        const headerTitle = document.getElementById('calendar_and_streak');
        if (!dayContainer || !headerTitle) return;
        
        const year = this.#displayDate.getFullYear();
        const month = this.#displayDate.getMonth(); 
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        headerTitle.innerHTML = `${monthNames[month]} ${year} 
            <span>
                <img src="${ChevronLeft}" id="go_back" alt="back">
                <img src="${ChevronRight}" id="go_forward" alt="next">
            </span>`;
            
        const firstDayIndex = new Date(year, month, 1).getDay(); 
        const lastDay = new Date(year, month + 1, 0).getDate(); 

        dayContainer.innerHTML = '';
        const shiftClick = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
        for (let i = 0; i < shiftClick; i++) {
            const emptySpan = document.createElement('span');
            dayContainer.appendChild(emptySpan); 
        }
        
        const today = new Date();
        const accountStats = this.#account?.stats || {};
        const visitedDays = Array.isArray(accountStats.visitedDays) ? accountStats.visitedDays : [];
        
        for (let i = 1; i <= lastDay; i++) {
            const daySpan = document.createElement('span');
            daySpan.className = 'day';
            daySpan.style.display = 'flex';
            daySpan.style.justifyContent = 'center';
            daySpan.style.alignItems = 'center';
            
            const iterationDateStr = new Date(year, month, i).toDateString();
            if (visitedDays.includes(iterationDateStr)) {
                daySpan.innerHTML = `<img src="${Fire}" style="width:20px;height:20px;" title="${iterationDateStr}" alt="Streak">`;
            } else {
                daySpan.innerText = i;
            }
            
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                daySpan.style.backgroundColor = '#FF7C7C';
                daySpan.style.borderRadius = '50%';
                daySpan.style.color = visitedDays.includes(iterationDateStr) ? 'transparent' : '#342B25';
            }
            dayContainer.appendChild(daySpan);
        }
        
        document.getElementById('go_back').onclick = () => {
            this.#displayDate.setMonth(this.#displayDate.getMonth() - 1);
            this.#renderCalendar();
        };
        document.getElementById('go_forward').onclick = () => {
            this.#displayDate.setMonth(this.#displayDate.getMonth() + 1);
            this.#renderCalendar();
        };
    }

    #renderPieChart() {
        const rightCol = document.querySelector('.right_col');
        if (!rightCol) return;

        const flagLabels = this.#account?.flagLabels || {};
        
        // Define standard colors array explicitly referencing colors used in TasksManager
        const standardColors = ['red', 'yellow', 'purple', 'green', 'blue'];
        
        // Check if any standard color is actually customized (has a non-empty label that diffs from default)
        const hasLabels = standardColors.some(color => {
            const label = flagLabels[color];
            return label && label.trim() !== '';
        });

        if (!hasLabels) {
            rightCol.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; flex:1; text-align:center; padding: 20px; font-style:italic; color:#7F7F7F; font-size:14px; line-height: 1.5;">Vui lòng dán nhãn (label) cho ít nhất một loại Flag trong trang Tasks để chúng mình có thể phân tích phân bổ thời gian của bạn nhé!</div>';
            return;
        }

        const tasks = this.#account?.tasks || [];
        const colorCounts = {};
        let totalPomodoros = 0;
        
        tasks.forEach(t => {
            const c = t.color || 'red';
            const done = t.pomodorosDone || 0;
            if (!colorCounts[c]) colorCounts[c] = 0;
            colorCounts[c] += done;
            totalPomodoros += done;
        });

        if (totalPomodoros === 0) {
            rightCol.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; flex:1; text-align:center; padding: 20px; font-style:italic; color:#7F7F7F; font-size:14px;">Bạn chưa hoàn thành Pomodoro nào để thống kê thể loại.</div>';
            return;
        }

        // Restore canvas if it was replaced by message previously
        if (!document.getElementById('myDonutCanvas')) {
            rightCol.innerHTML = '<canvas id="myDonutCanvas"></canvas><div id="task_label"></div>';
        }

        const canvas = document.getElementById('myDonutCanvas');
        const ctx = canvas.getContext('2d');

        const labels = [];
        const data = [];
        const bgColors = [];

        const mapColor = {
            red: '#FF7C7C',
            yellow: '#FFF7D5',
            purple: '#E6E6FA',
            green: '#C2F0C2',
            blue: '#C2E0FF'
        };

        for (const color of standardColors) {
            const count = colorCounts[color] || 0;
            if (count > 0) {
                // Use custom label if preset, else capitalize color
                const labelStr = flagLabels[color] && flagLabels[color].trim() !== '' 
                    ? flagLabels[color] 
                    : color.charAt(0).toUpperCase() + color.slice(1);
                    
                labels.push(`${labelStr} (${count})`);
                data.push(count);
                bgColors.push(mapColor[color] || mapColor.red);
            }
        }

        if (this.#pieChartInstance) {
            this.#pieChartInstance.destroy();
        }

        // Make canvas responsive
        canvas.style.maxHeight = "300px";

        this.#pieChartInstance = new window.Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: { family: 'Inter, sans-serif', size: 12 },
                            color: '#471515'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
}

new StatisticsManager();
