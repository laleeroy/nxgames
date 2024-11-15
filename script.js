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

// An array to keep track of checked items in order
let checkedItemsOrder = [];

document.getElementById('copy-entries-button').addEventListener('click', function() {
    const checkedItems = [];
    const checkboxes = document.querySelectorAll('.content-item input[type="checkbox"]');

    // Collect the checked items in the order they were checked (in the array 'checkedItemsOrder')
    checkedItemsOrder.forEach(item => {
        // Remove "Size: X.XG" part of the text
        let text = item.trim();
        if (text.includes('Size')) {
            text = text.substring(0, text.indexOf('Size')).trim();  // Remove everything from "Size"
        }
        checkedItems.push(text);
    });

    if (checkedItems.length > 0) {
        navigator.clipboard.writeText(checkedItems.join('\n'))
            .then(() => {
                alert('The selected games have been copied to the clipboard.');
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

                    // Track the order of checked items
                    const labelText = item.trim();
                    if (checkbox.checked) {
                        checkedItemsOrder.push(labelText);  // Add item to the checked order
                    } else {
                        const index = checkedItemsOrder.indexOf(labelText);
                        if (index > -1) {
                            checkedItemsOrder.splice(index, 1);  // Remove item if unchecked
                        }
                    }
                });

                const label = document.createElement('label');
                let labelText = item.trim();
                if (labelText.includes('Size')) {
                    labelText = labelText.substring(0, labelText.indexOf('Size')).trim();  // Remove "Size" part for display
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

// Filter functionality for the search bar
document.getElementById('search-bar').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const items = document.querySelectorAll('.content-item');

    items.forEach(item => {
        const labelText = item.querySelector('label').textContent.toLowerCase();
        if (labelText.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});
