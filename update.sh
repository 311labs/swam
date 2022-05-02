#!/bin/bash

cd `dirname $0`

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

SCRIPTPATH=`pwd -P`

echo '------- start update --------'
echo `date` >> var/update.log

echo "fetching latest code..." >> var/update.log
git reset --hard
echo "reseting local to remote..." >> var/update.log
git pull

./post_update.sh $BRANCH

echo `date`

echo '------- end update --------' >> var/update.log
