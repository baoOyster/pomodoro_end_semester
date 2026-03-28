function updateDueDate(dateString) {
    const d = new Date(dateString);
    const options = { weekday: 'short', month: 'long', day: 'numeric' };
    const result = "Due " + d.toLocaleDateString('en-US', options);
    
    document.getElementById('display-due-date').innerText = result;
}
updateDueDate('2026-03-13'); 