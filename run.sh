#!/bin/sh
npm run db:migrate
echo ""
node .output/server/index.mjs