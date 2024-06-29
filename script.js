function formatSize(size) {
    let value = parseFloat(size);
    if (size.includes('M')) {
        value /= 1024; // Convert MB to GB
    }
    return value;
}

function updateTotalSize() {
    let totalSize = 0;
    const checkboxes = document.querySelectorAll('.content-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const sizeText = checkbox.dataset.size;
            totalSize += formatSize(sizeText);
        }
    });
    document.getElementById('total-size').textContent = totalSize.toFixed(2) + ' GB';
}

fetch('contents.txt')
    .then(response => response.text())
    .then(text => {
        const contentList = document.getElementById('content-list');
        const items = text.split('\n').filter(item => item.trim() !== '');
        items.forEach(item => {
            const sizeMatch = item.match(/Size: (\d+(\.\d+)?[GM])/);
            if (sizeMatch) {
                const div = document.createElement('div');
                div.className = 'content-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.size = sizeMatch[1];
                checkbox.addEventListener('change', updateTotalSize);

                const label = document.createElement('label');
                label.textContent = item;

                div.appendChild(checkbox);
                div.appendChild(label);
                contentList.appendChild(div);
            }
        });
    })
    .catch(error => console.error('Error fetching contents.txt:', error));
