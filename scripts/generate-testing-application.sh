#!/bin/bash

set -x #echo on

npx schematics ./schematics/:application --dry-run=false --name=testing
cd testing || exit
npx schematics ../schematics/:convict --dry-run=false --no-skip-import
npx schematics ../schematics/:typeorm --db=sqlite --dry-run=false --no-skip-import
npx schematics ../schematics/:security --dry-run=false --no-skip-import
npx schematics ../schematics/:swagger --dry-run=false --no-skip-import
npx schematics ../schematics/:auth-jwt --dry-run=false --no-skip-import
npx schematics ../schematics/:resource --type=rest --crud --orm=typeorm --name=employee --dry-run=false --no-skip-import
# npx schematics ../schematics/:controller --name="employee/get-employee" --dry-run=false --no-skip-import
# npx schematics ../schematics/:filter --name="employee/employee" --dry-run=false --no-skip-import
# npx schematics ../schematics/:guard --name="employee/employee" --dry-run=false --no-skip-import
# npx schematics ../schematics/:interceptor --name="employee/employee" --dry-run=false --no-skip-import
# npx schematics ../schematics/:mailer --dry-run=false --no-skip-import
# npx schematics ../schematics/:middleware --name="employee/employee" --dry-run=false --no-skip-import
# npx schematics ../schematics/:module --name="patata" --dry-run=false --no-skip-import
# npx schematics ../schematics/:pipe --name="employee/employee" --dry-run=false --no-skip-import
# npx schematics ../schematics/:repository --name="employee/employee" --dry-run=false --no-skip-import
yarn typeorm:datasource migration:generate src/migration/CreateTables


