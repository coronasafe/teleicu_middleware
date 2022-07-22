#!/bin/sh

#migrate database
npx prisma generate
npx prisma migrate deploy

# start server
npm run start