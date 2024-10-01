function validateForm(x, y, r) {
    const yInput = document.getElementById('y');
    yInput.classList.remove('error');
    const replacedY = y.replace(',', '.');
    console.log(replacedY, replacedY.length);
    if ((replacedY.length > 7 && replacedY[0] === '-') || replacedY.length > 6) {
        yInput.classList.add('error');
        return false;
    }
    const parsedY = parseFloat(replacedY);

    if (isNaN(parsedY) || parsedY < -3 || parsedY > 3 || parsedY.length > 6) {
        yInput.classList.add('error')
        return false;
    }

    if (!r) {
        return false;
    }

    return x !== null;
}
let selectedX = null;
document.querySelectorAll('.x-btn').forEach(button => {
    button.addEventListener('click', function() {
        selectedX = this.getAttribute('data-value');
        document.querySelectorAll('.x-btn').forEach(btn => btn.style.border = "");
        this.style.border = "2px solid gold";
    });
});

document.getElementById('submit-btn').addEventListener('click', function() {
    const y = document.getElementById('y').value;
    const r = document.querySelector('input[name="r"]:checked')?.value;

    if (!validateForm(selectedX, y, r)) return;

    const postData = {
        x: parseFloat(selectedX),
        y: parseFloat(y.replace(',', '.')),
        r: parseFloat(r)
    };

    fetch('/fcgi-bin/app.jar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })

        .then(response => {
            return response.text()
        })
        .then(responseText => {
            console.log("responseText:", responseText)

            const fixedText = responseText
                .replace(/'/g, '"')
                .replace(/:\s*(-?[0-9]+),([0-9]+)/g, ': $1.$2');
            console.log("fixedText" + fixedText)
            return JSON.parse(fixedText)
        })
        .then(data => {
            console.log(data)
            addResultToTable(data, new Date().toLocaleTimeString());
            saveResults();
        })
        .catch(error => console.error('Ошибка:', error));
});

function addResultToTable(data, currentTime) {
    const tbody = document.querySelector("#results-table tbody");
    const row = document.createElement("tr");

    let status = data.status
    if ((typeof status) == "boolean") {
        status = status ? 'Попадание' : 'Промах';
    }
    row.innerHTML = `
            <td>${data.x}</td>
            <td>${data.y}</td>
            <td>${data.r}</td>
            <td>${status}</td>
            <td>${data.time}</td>
            <td>${currentTime}</td>
        `;

    tbody.appendChild(row);
}

function saveResults() {
    const tableRows = document.querySelectorAll("#results-table tbody tr");
    const results = Array.from(tableRows).map(row => {
        const cells = row.children;
        return {
            x: cells[0].textContent,
            y: cells[1].textContent,
            r: cells[2].textContent,
            status: cells[3].textContent,
            time: cells[4].textContent,
            currentTime: cells[5].textContent,
        };
    });
    sessionStorage.setItem("results", JSON.stringify(results));
}

function loadResults() {
    const results = JSON.parse(sessionStorage.getItem("results"));
    if (results) {
        results.forEach(result => addResultToTable(result, result.currentTime));
    }
}

loadResults();
