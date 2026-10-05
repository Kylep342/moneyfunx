#!/usr/bin/env bash

set -eux

mkdir -p logs

npm install

npm run build:watch > >(tee logs/build.log) 2>&1 &
npm run test > >(tee logs/test.log) 2>&1 &

wait
