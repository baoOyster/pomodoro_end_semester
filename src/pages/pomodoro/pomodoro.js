// import Running from '../../assets/images/stop.svg';
// import Pause from '../../assets/images/pause.svg';

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
                    alert("Hết giờ!"); // chỗ này sẽ chuyển thành nhảy lên chuông báo (cái mà người dùng cài trong setting)
                }
            }, 1000);
        }
    }

    function stopTimer() {
        isRunning = false;
        clearInterval(timer);
    }

    btnStop.addEventListener('click', () => {
        const playBtn = document.getElementById('btn_stop');
        if (isRunning) {
            // playBtn.src = '../../assets/images/pause.svg';
            stopTimer();
        } else {
            // playBtn.src = '../../assets/images/stop.svg';
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