window.addEventListener('load', () => {
    const progressPath = document.getElementById('progress_path');
    const timerLabel = document.getElementById('timer_label'); 
    const btnStop = document.getElementById('btn_stop');
    const btnRestart = document.getElementById('btn_restart');

    const pathLength = progressPath.getTotalLength();
    progressPath.style.strokeDasharray = pathLength;

    let totalTime = 25 * 60; // sửa chỗ này thành liên kết đến giờ người dùng đặt hoặc pomodoro mặc định
    let timePassed = 0;
    let timer = null;
    let isRunning = false;

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateVisual() {
        let timeLeft = totalTime - timePassed;
        
        timerLabel.textContent = formatTime(timeLeft);

        const offset = (timePassed / totalTime) * pathLength;
        progressPath.style.strokeDashoffset = offset;
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(() => {
                timePassed++;
                updateVisual();

                if (timePassed >= totalTime) {
                    stopTimer();
                    alert("Hết giờ!");
                }
            }, 1000);
        }
    }

    function stopTimer() {
        isRunning = false;
        clearInterval(timer);
    }

    btnStop.addEventListener('click', () => {
        if (isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    btnRestart.addEventListener('click', () => {
        stopTimer();
        timePassed = 0;
        updateVisual();
        startTimer();
    });

    updateVisual();
});