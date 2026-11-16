#!/bin/sh
# Seed fixtures only into a fresh local development database. Existing MySQL
# volumes skip /docker-entrypoint-initdb.d entirely; use seed-local.ps1 then.
if [ "${APP_ENV:-}" != "development" ] || [ "${MYSQL_DATABASE:-}" != "rikkei_ecommerce" ]; then
  echo "Skipping local seed outside the development rikkei_ecommerce database."
else
  mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" < /seed.local.sql
fi
