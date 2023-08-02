#!/bin/sh
ls -1  ./*.tar | while read -r line; do cat $line | docker load; done
