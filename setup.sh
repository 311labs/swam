#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
CUR_PATH=`pwd`
SWAMCORE=swamcore
echo $CUR_PATH
echo $SCRIPT_DIR

if [ ! -d "$CUR_PATH/swamcore" ]
then
	echo "requires SWAM to be setup in swamcore"
	exit 1
fi

if [ -f "$CUR_PATH/swam.py" ]
then
	echo "already configured"
	# exit 1
fi

ln -snf "$SWAMCORE/runserver" "runserver"
ln -snf "$SWAMCORE/swam.py" "swam.py"
cp "$SWAMCORE/swam.conf" "swam.conf"
mkdir -p "apps"
cd apps
ln -snf "../$SWAMCORE/apps/docs" "docs"
cd ..
mkdir -p "plugins"


if [ ! -f "pyproject.toml" ]
then
	cp "$SWAMCORE/pyproject.toml" pyproject.toml
	vim pyproject.toml
fi

echo "DONE"