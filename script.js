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
    let anyChecked = false;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            anyChecked = true;
            const sizeText = checkbox.dataset.size;
            totalSize += formatSize(sizeText);
        }
    });

    const totalSizeContainer = document.getElementById('total-size-container');
    if (anyChecked) {
        totalSizeContainer.style.display = 'block'; // Show the total size container
        document.getElementById('total-size').textContent = totalSize.toFixed(2) + ' GB';
    } else {
        totalSizeContainer.style.display = 'none'; // Hide the total size container
    }
}

// Initially hide the total size container
document.getElementById('total-size-container').style.display = 'none';

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
