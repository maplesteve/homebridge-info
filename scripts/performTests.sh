#!/bin/bash

HOMEBRIDGE_BINARY="homebridge"
HOMEBRIDGE_CONFIG="homebridge-test-config.json"

# You can set variables to own values by the command line when calling 'npm test':
# - 'HBB': Provide the full path to the 'homebridge' binary; otherwise make sure, that 'homebridge' is found by the shell.
# - 'HBC': If you have a special config file for homebridge, provide the full path (e.g. for local testing).
# Example:
# $ HBB="/Development/homebridge/bin/homebridge" HBC="local_conf.json" npm test
if [ $HBB ]; then
    HOMEBRIDGE_BINARY=$HBB
fi

if [ $HBC ]; then
    HOMEBRIDGE_CONFIG=$HBC
fi


echo "Starting homebridge with test config..."
# Stop running homebridge instances
if pgrep homebridge; then
    echo "Killing other homebridge instance."
    killall homebridge
fi

TEST_CONFIG_DIR="/tmp/homebridge-info-test"

# Create config directory if not exists
if ! [ -d "$TEST_CONFIG_DIR/" ]; then
    mkdir "$TEST_CONFIG_DIR/"
    echo "Created test config dir: $TEST_CONFIG_DIR/"
fi

# Copy the config.json fixture
cp scripts/$HOMEBRIDGE_CONFIG "$TEST_CONFIG_DIR/config.json"

# Start homebridge
echo "Starting homebridge: $HOMEBRIDGE_BINARY -U $TEST_CONFIG_DIR"
$HOMEBRIDGE_BINARY -U $TEST_CONFIG_DIR &

# Give homebridge 5 seconds to be ready
echo "Waiting 5 seconds for homebridge to start..."
sleep 5

# Tests
echo "Testing:"
echo "========"

echo "1) Lint"
eslint ./*.js
EXIT1=$?

echo "2) mocha"
./node_modules/mocha/bin/mocha
EXIT2=$?



# Clean up
# Stop the homebridge instance
killall homebridge
rm -rf $TEST_CONFIG_DIR

# Add up the exit codes and return
EXITCODE=$(expr $EXIT1 + $EXIT2)
exit $EXITCODE
