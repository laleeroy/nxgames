#!/bin/bash

# Function to log messages with timestamps
log() {
    echo "$(date +"[%Y-%m-%d %H:%M:%S]") $1"
}

# Main script logic
{
    # Get the current date and time
    current_date=$(date +"%b %d %Y")
    current_time=$(date +"%I:%M%p")

    # Change to the working directory
    cd /home/pi5/nxgames || { log "Failed to change directory"; exit 1; }

    # Run multiple scripts
    log "Running nxgames-rename..."
    python3 /home/pi5/.bin/nxgames-rename || { log "nxgames-rename failed"; exit 1; }

    log "Running nxgames-update..."
    bash /home/pi5/.bin/nxgames-update || { log "nxgames-update failed"; exit 1; }

    # Update index.html with the current date and time
    log "Updating index.html..."
    sed -i "s|<p id=\"credit-text\">.*</p>|<p id=\"credit-text\">Updated as of $current_date $current_time PHT</p>|" index.html

    # Check for changes specifically in contents.txt
    if git status --porcelain | grep -q "contents.txt"; then
        log "Changes detected in contents.txt. Staging files..."
        git add contents.txt index.html

        log "Committing and pushing changes..."
        git commit -m "Update list of games as of $current_date $current_time" || { log "Commit failed"; exit 1; }
        git push || { log "Push failed"; exit 1; }
    else
        log "No changes to contents.txt, skipping push"
    fi

    log "Script completed successfully."
} 2>&1 | while read -r line; do
    log "$line"
done
