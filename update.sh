#!/bin/bash

# Get the current date and time
date=$(date +"%b %d %Y")
time=$(date +"%I:%M%p")

# Change working dir
cd /home/pi5/nxgames

# Run multiple scripts
python3 /home/pi5/.bin/nxgames-rename /srv/dev-disk-by-uuid-b37d7069-0eb1-4ce4-bb3b-2f896c6f8b45/Games/Switch
bash /home/pi5/.bin/nxgames-update /srv/dev-disk-by-uuid-b37d7069-0eb1-4ce4-bb3b-2f896c6f8b45/Games/Switch

# Update index.html with the current date and time
sed -i "s|<p id=\"credit-text\">.*</p>|<p id=\"credit-text\">Updated as of $date $time</p>|" index.html

# Check if there are changes to commit
git add .
if git diff --exit-code --quiet; then
    echo "No changes to commit"
else
    # Git commit and push
    git commit -m "Update list of games as of $date $time"
    git push
fi
