#!/bin/sh

set -e

npm run generate-keys
npx prisma generate
npx prisma migrate deploy
npm run start