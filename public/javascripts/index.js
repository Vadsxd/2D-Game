const saveName = () => {
    localStorage["username"] = document.getElementById('input-name').value;
}

const loadScore = () => {
    const path = `/asset/score.json`;
    const request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send();
    return JSON.parse(request.responseText);
}

const btnScore = () => {
    let div = document.getElementById('div_score');

    if (getComputedStyle(div).display === 'none') {
        div.style.display = 'block';
    } else {
        div.style.display = 'none';
    }

    let scores = loadScore();
    let sortable_scores = Object.entries(scores).sort(([,a],[,b]) => b-a);

    let text = document.getElementById('score');
    text.setAttribute('style', 'white-space: pre;');
    text.style.color = "greenyellow";

    text.textContent = scoreToString(sortable_scores);
}

const scoreToString = (score) => {
    let str = "   Имя                     Счёт\r\n\r\n   ";

    score.forEach((item) => {
        str = str + item[0] + ".".repeat(2*(20 - item.toString().length));
        str = str + item[1] + "\r\n   ";
    });

    return str;
}