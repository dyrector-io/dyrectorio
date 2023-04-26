#!/bin/sh
ls -1  ./*.tgz | while read -r line; do cat $line | gzip -d | docker load; done
