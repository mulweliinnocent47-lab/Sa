#!/bin/sh
# Run from the root of your Sa project, after unzipping this update over it:
#   unzip -o sa-student-update.zip -d .   (then)   sh APPLY.sh
git rm -r --ignore-unmatch app/api/plannerFetch 2>/dev/null
git add -A
git commit -m "XP leaderboard, push notifications, profile config, PWA icon, performance"
git push
