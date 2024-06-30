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
        resetInactivityTimeout(); // Reset the inactivity timeout whenever the total size is updated
    } else {
        totalSizeContainer.style.display = 'none'; // Hide the total size container
    }
}

document.getElementById('copy-entries-button').addEventListener('click', function() {
    const checkedItems = [];
    const checkboxes = document.querySelectorAll('.content-item input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            let text = checkbox.nextElementSibling.textContent.trim();
            // Remove additional information like [NSZ], [NSP], [XCI], Size: etc.
            if (text.includes('[NSZ]')) {
                text = text.substring(0, text.indexOf('[NSZ]')).trim();
            } else if (text.includes('[NSP]')) {
                text = text.substring(0, text.indexOf('[NSP]')).trim();
            } else if (text.includes('[XCI]')) {
                text = text.substring(0, text.indexOf('[XCI]')).trim();
            } else if (text.includes('Size')) {
                text = text.substring(0, text.indexOf('Size')).trim();
            }
            checkedItems.push(text);
        }
    });

    if (checkedItems.length > 0) {
        navigator.clipboard.writeText(checkedItems.join('\n'))
            .then(() => {
                alert('Selected games are copied to clipboard, send it to me so I can install it right away!');
                updateTotalSize(); // Update total size container after copying
                resetInactivityTimeout(); // Reset inactivity timeout after copying
            })
            .catch(err => console.error('Failed to copy:', err));
    } else {
        alert('No items checked!');
    }
});

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
                checkbox.addEventListener('change', function() {
                    updateTotalSize();
                    resetInactivityTimeout();
                });

                const label = document.createElement('label');
                let labelText = item.trim();
                if (labelText.includes('[NSZ]')) {
                    labelText = labelText.substring(0, labelText.indexOf('[NSZ]')).trim();
                } else if (labelText.includes('[NSP]')) {
                    labelText = labelText.substring(0, labelText.indexOf('[NSP]')).trim();
                } else if (labelText.includes('[XCI]')) {
                    labelText = labelText.substring(0, labelText.indexOf('[XCI]')).trim();
                } else if (labelText.includes('Size')) {
                    labelText = labelText.substring(0, labelText.indexOf('Size')).trim();
                }
                label.textContent = labelText;

                div.appendChild(checkbox);
                div.appendChild(label);
                contentList.appendChild(div);
            }
        });
    })
    .catch(error => console.error('Error fetching contents.txt:', error));

// Inactivity timeout logic
let inactivityTimeout;

function resetInactivityTimeout() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
        const totalSizeContainer = document.getElementById('total-size-container');
        if (!totalSizeContainer.contains(document.activeElement)) {
            totalSizeContainer.style.display = 'none';
        }
    }, 5000); // 5 seconds
}

function setupInactivityListener() {
    window.addEventListener('mousemove', resetInactivityTimeout);
    window.addEventListener('keypress', resetInactivityTimeout);
    window.addEventListener('click', function() {
        updateTotalSize();
        resetInactivityTimeout();
    });
    window.addEventListener('scroll', function() {
        updateTotalSize();
        resetInactivityTimeout();
    });
    window.addEventListener('touchstart', resetInactivityTimeout); // Added for mobile devices
    window.addEventListener('touchmove', function() {
        updateTotalSize();
        resetInactivityTimeout();
    }); // Added for mobile devices
}

// Start the inactivity listener
setupInactivityListener();
resetInactivityTimeout(); // Initialize the inactivity timeout
