#!/bin/bash

# Add timestamps to each line of output
{
    # Get the current date and time
    date=$(date +"%b %d %Y")
    time=$(date +"%I:%M%p")

    # Change to the working directory
    cd /home/pi5/nxgames || { echo "Failed to change directory"; exit 1; }

    # Run multiple scripts
    python3 /home/pi5/.bin/nxgames-rename
    bash /home/pi5/.bin/nxgames-update

    # Update index.html with the current date and time
    sed -i "s|<p id=\"credit-text\">.*</p>|<p id=\"credit-text\">Updated as of $date $time PHT</p>|" index.html

    # Check for changes specifically in contents.txt
    if git status --porcelain | grep -q "contents.txt"; then
        # Stage the specific files
        git add contents.txt index.html

        # Commit and push changes
        git commit -m "Update list of games as of $date $time"
        git push
    else
        echo "No changes to contents.txt, skipping push"
    fi
} 2>&1 | while read -r line; do
    echo "$(date +"[%Y-%m-%d %H:%M:%S]") $line"
done
