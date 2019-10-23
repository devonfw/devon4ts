currentDir=$PWD
# 1. Install all dependencies
for Dir in ../packages/*/; do
  echo $currentDir/$Dir
  cd $currentDir/$Dir
  yarn
  yarn build
done
