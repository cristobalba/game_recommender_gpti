document.getElementById('recommendationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const genre = document.getElementById('genre').value;
    const favorite = document.getElementById('favorite').value;
    const type = document.getElementById('type').value;

    const response = await fetch('/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ genre, favorite, type })
    });

    if (response.ok) {
        const data = await response.json();
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';

        data.recommendations.split('\n').forEach(game => {
            if (game.trim()) {
                const li = document.createElement('li');
                li.textContent = game;
                recommendationsList.appendChild(li);
            }
        });
    } else {
        alert('Ocurrió un error al obtener recomendaciones.');
    }
});document.getElementById('recommendationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const genre = document.getElementById('genre').value;
    const favorite = document.getElementById('favorite').value;
    const type = document.getElementById('type').value;

    const response = await fetch('/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ genre, favorite, type })
    });

    if (response.ok) {
        const data = await response.json();
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';

        data.recommendations.forEach(game => {
            if (game.trim()) {
                const li = document.createElement('li');
                li.textContent = game;
                recommendationsList.appendChild(li);
            }
        });
    } else {
        alert('Ocurrió un error al obtener recomendaciones.');
    }
});
