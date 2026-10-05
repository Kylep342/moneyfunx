#!/usr/bin/env bash

set -ex

jq -r .version package.json | xargs git tag && git push && git push --tags
