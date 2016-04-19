node-quoted-printable provdides a NodeJS module ('quoted-printable') for 
encoding and decoding quoted-printable text as described in 
[RFC2045](http://tools.ietf.org/html/rfc2045#page-19)

### Overview
`quoted-printable` provides simple functions for encoding and decoding
quoted-printable text.

### Prerequisites
* [NodeJS v0.10+](http://www.nodejs.org)
* npm - Usually packaged with NodeJS

### Installation
    npm install danielsen/node-quoted-printable

or

    # cd /path/to/myapp/node_modules
    # mkdir quoted-printable 
    # cd quoted-printable
    # git clone git@github.com:danielsen/node-quoted-printable.git
    # npm install

### Documentation
Local documentation can be generated with the `doxygen` command.

    # doxygen Doxyfile

### Usage
Use `encode` to encode unicode text to quoted-printable. Use `decode` to decode
quoted-printable text to unicode.

    var qp  = require('quoted-printable');

    console.log(qp.encode('热门搜索'));
    =E7=83=AD=E9=97=A8=E6=90=9C=E7=B4=A2
    console.log(qp.decode('=E7=83=AD=E9=97=A8=E6=90=9C=E7=B4=A2'));
    热门搜索
