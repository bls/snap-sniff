#!/bin/sh
# This will probably get out of date as claudia updates, but for now....

aws iam delete-role-policy --role-name snap-sniff-lambda-executor --policy-name log-writer
aws iam delete-role --role-name snap-sniff-lambda-executor

