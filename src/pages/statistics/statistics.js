class StatisticsPage {
    #period = 'today'; // 'today' | 'week' | 'month'

    constructor() {
        this.#bindPeriodButtons();
        this.#render();

        window.addEventListener('settings-saved', () => {
            setTimeout(() => this.#render(), 0);
        });
        window.addEventListener('stats-updated', () => this.#render());
    }

    // ── Storage ───────────────────────────────────────────────────────────────

    #getStats() {
        const accounts    = JSON.parse(localStorage.getItem('accounts') ?? '[]');
        const currentName = localStorage.getItem('currentAccount') ?? 'guest';
        return accounts.find(a => a.name === currentName)?.stats ?? { sessions: [], streak: 0, highestStreak: 0, lastActiveDate: '' };
    }

    // ── Period helpers ────────────────────────────────────────────────────────

    #periodStart(period) {
        const d = new Date();
        if (period === 'today') {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
        if (period === 'week') {
            const day = d.getDay(); // 0=Sun
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
        }
        // month
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    #prevPeriodRange(period) {
        const start = this.#periodStart(period);
        if (period === 'today') {
            const s = new Date(start); s.setDate(s.getDate() - 1);
            const e = new Date(start);
            return { s, e };
        }
        if (period === 'week') {
            const e = new Date(start);
            const s = new Date(start); s.setDate(s.getDate() - 7);
            return { s, e };
        }
        // month
        const e = new Date(start);
        const s = new Date(start.getFullYear(), start.getMonth() - 1, 1);
        return { s, e };
    }

    #filterSessions(sessions, period) {
        const start = this.#periodStart(period);
        return sessions.filter(s => new Date(s.completedAt) >= start);
    }

    #filterPrevious(sessions, period) {
        const { s, e } = this.#prevPeriodRange(period);
        return sessions.filter(sess => {
            const d = new Date(sess.completedAt);
            return d >= s && d < e;
        });
    }

    // ── Render ────────────────────────────────────────────────────────────────

    #render() {
        const stats    = this.#getStats();
        const sessions = stats.sessions ?? [];
        const current  = this.#filterSessions(sessions, this.#period);
        const prev     = this.#filterPrevious(sessions, this.#period);

        this.#renderSummary(current, prev, stats);
        this.#renderChart(sessions);
        this.#renderHistory(current);
    }

    #renderSummary(current, prev, stats) {
        // Total focus time (pomodoro sessions only, in hours)
        const totalSecs = current
            .filter(s => s.mode === 'pomodoro' && s.completed)
            .reduce((sum, s) => sum + (s.duration ?? 0), 0);
        const totalHours = (totalSecs / 3600).toFixed(1);

        const prevSecs = prev
            .filter(s => s.mode === 'pomodoro' && s.completed)
            .reduce((sum, s) => sum + (s.duration ?? 0), 0);
        const timePct = prevSecs === 0
            ? (totalSecs > 0 ? '+100%' : '0%')
            : `${totalSecs >= prevSecs ? '+' : ''}${Math.round((totalSecs - prevSecs) / prevSecs * 100)}%`;

        // Completed tasks (completed pomodoro sessions)
        const doneTasks = current.filter(s => s.mode === 'pomodoro' && s.completed).length;
        const prevDone  = prev.filter(s => s.mode === 'pomodoro' && s.completed).length;
        const taskPct   = prevDone === 0
            ? (doneTasks > 0 ? '+100%' : '0%')
            : `${doneTasks >= prevDone ? '+' : ''}${Math.round((doneTasks - prevDone) / prevDone * 100)}%`;

        const totalTimeEl   = document.getElementById('totalTime');
        const evaluateTime  = document.getElementById('evaluateTime');
        const totalDoneEl   = document.getElementById('totalDoneTasks');
        const evaluateTask  = document.getElementById('evaluateTask');
        const streakEl      = document.getElementById('streakCount');
        const highestEl     = document.getElementById('highestStreakCount');

        if (totalTimeEl)  totalTimeEl.innerHTML  = `<strong>${totalHours}</strong>`;
        if (evaluateTime) {
            evaluateTime.textContent = timePct;
            evaluateTime.style.color = timePct.startsWith('-') ? '#EF4444' : '#10B981';
        }
        if (totalDoneEl)  totalDoneEl.innerHTML  = `<strong>${doneTasks}</strong>`;
        if (evaluateTask) {
            evaluateTask.textContent = taskPct;
            evaluateTask.style.color = taskPct.startsWith('-') ? '#EF4444' : '#10B981';
        }
        if (streakEl)  streakEl.innerHTML  = `<strong>${stats.streak ?? 0}</strong>`;
        if (highestEl) highestEl.innerHTML = `<strong>${stats.highestStreak ?? 0}</strong>`;
    }

    #renderChart(allSessions) {
        const container = document.getElementById('statistic_container');
        if (!container) return;

        const current = this.#filterSessions(allSessions, this.#period);

        let buckets, labels;

        if (this.#period === 'today') {
            // 24 hourly buckets
            buckets = Array(24).fill(0);
            labels  = Array.from({ length: 24 }, (_, i) => i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`);
            current.filter(s => s.mode === 'pomodoro' && s.completed).forEach(s => {
                const h = new Date(s.completedAt).getHours();
                buckets[h] += (s.duration ?? 1500) / 60; // minutes
            });
        } else if (this.#period === 'week') {
            buckets = Array(7).fill(0);
            labels  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weekStart = this.#periodStart('week');
            current.filter(s => s.mode === 'pomodoro' && s.completed).forEach(s => {
                const diff = Math.floor((new Date(s.completedAt) - weekStart) / 86400000);
                if (diff >= 0 && diff < 7) buckets[diff] += (s.duration ?? 1500) / 60;
            });
        } else {
            // month — one bucket per day
            const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            buckets = Array(daysInMonth).fill(0);
            labels  = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            current.filter(s => s.mode === 'pomodoro' && s.completed).forEach(s => {
                const day = new Date(s.completedAt).getDate() - 1;
                if (day >= 0 && day < daysInMonth) buckets[day] += (s.duration ?? 1500) / 60;
            });
        }

        const maxVal = Math.max(...buckets, 1);

        container.innerHTML = `
            <div class="chart-wrapper">
                <div class="chart-bars">
                    ${buckets.map((v, i) => `
                        <div class="chart-col">
                            <div class="chart-bar" style="height:${(v / maxVal) * 100}%"
                                 title="${labels[i]}: ${v.toFixed(0)} min"></div>
                            <span class="chart-label">${this.#period === 'today' && i % 3 !== 0 ? '' : labels[i]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    #renderHistory(sessions) {
        const tbody = document.getElementById('history_table_body');
        if (!tbody) return;

        // Show most recent 20 sessions
        const recent = [...sessions].reverse().slice(0, 20);

        if (!recent.length) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94A3B8;padding:20px;">Chưa có dữ liệu</td></tr>`;
            return;
        }

        tbody.innerHTML = recent.map(s => {
            const dur   = this.#formatDuration(s.duration ?? 0);
            const mode  = { pomodoro: 'Pomodoro', short: 'Nghỉ ngắn', long: 'Nghỉ dài' }[s.mode] ?? s.mode;
            const title = s.taskTitle ? `${esc(s.taskTitle)} <span class="mode-badge">${mode}</span>` : mode;
            const date  = new Date(s.completedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
            const stops = s.pauseCount ?? 0;
            const badge = s.completed
                ? `<span class="status-done">Hoàn thành</span>`
                : `<span class="status-interrupted">Bị dừng</span>`;
            return `
                <tr>
                    <td>${title}</td>
                    <td>${dur}</td>
                    <td>${stops}</td>
                    <td>${badge}</td>
                    <td>${date}</td>
                </tr>
            `;
        }).join('');
    }

    #formatDuration(secs) {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    }

    // ── Period buttons ────────────────────────────────────────────────────────

    #bindPeriodButtons() {
        const map = {
            todayButton: 'today',
            weekButton:  'week',
            monthButton: 'month',
        };
        Object.entries(map).forEach(([id, period]) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            if (period === this.#period) btn.classList.add('active');
            btn.addEventListener('click', () => {
                this.#period = period;
                document.querySelectorAll('.Switch_timeOptions button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.#render();
            });
        });
    }
}

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new StatisticsPage());
} else {
    new StatisticsPage();
}
