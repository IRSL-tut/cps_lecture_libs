#!/bin/bash

export MSYS_NO_PATHCONV=1

openssl genrsa -out server.key 2048
openssl req -new -out server.csr -key server.key -subj "/C=JP/ST=Aichi/O=IRSL/CN=TUT"

#
openssl x509 -req -days 3650 -signkey server.key -in server.csr -out server.crt
# OR
# echo 'subjectAltName = DNS:tut.ac.jp, DNS:*.irsl.eiiris.tut.ac.jp, IP:133.15.97.31' > subjectnames.txt
# openssl x509 -req -days 3650 -signkey server.key -in server.csr -out server.crt -extfile subjectnames.txt

openssl rsa -in server.key -text > key.pem
openssl x509 -inform PEM -in server.crt > cert.pem
