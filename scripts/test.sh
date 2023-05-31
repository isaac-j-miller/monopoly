#!/bin/sh
set -euo pipefail

node ${@:-""} --test --require ts-node/register --require tsconfig-paths/register src/**/*.test.ts