node-libquoted provdides a NodeJS module ('libquoted') for encoding and decodingquoted-printable text as described in 
[RFC2045](http://tools.ietf.org/html/rfc2045#page-19)

### Overview
`libquoted` provides simple functions for encoding and decoding quoted-printabletext.

### Prerequisites
* [NodeJS v0.10+](http://www.nodejs.org)
* npm - Usually packaged with NodeJS

### Installation
    npm install danielsen/node-libquoted

or

    # cd /path/to/myapp/node_modules
    # mkdir quoted-printable 
    # cd quoted-printable
    # git clone git@github.com:danielsen/node-quoted-printable.git
    # npm install

### Documentation
Local documentation can be generated with the `doxygen` command, however this
only covers the C++ backer functions.

    # doxygen Doxyfile

### Usage
Use `encode` to encode unicode text to quoted-printable. Use `decode` to decode
quoted-printable text to unicode.

    var libquoted = require('libquoted');

    console.log(libquoted.encode('热门搜索'));
    =E7=83=AD=E9=97=A8=E6=90=9C=E7=B4=A2
    console.log(libquoted.decode('=E7=83=AD=E9=97=A8=E6=90=9C=E7=B4=A2'));
    热门搜索

Encoded strings can be folded to meet the 76 character quoted-printable line 
length requirement with `wrap()`.

    var folded = libquoted.wrap(LongQuotedPrintableLine);

Streams can be encoded and decoded with the `Encoder` and `Decoder` stream 
objects. Both accept the optional stream options argument. The `Encoder`
consturctor accepts the optional options variable `lineLength` for working
with line lengths other than the default 76 characters.

    var encoder = new libquoted.Encoder([options]);
    var decoder = new libquoted.Decoder();

    var sourceFile  = fs.createReadStream('sourcefile.txt');
    var encodedFile = fs.createWriteStream('encodedfile.txt');
    var decodedFile = fs.createWriteStream('decodedfile.txt');

    sourceFile.pipe(encoder).pipe(encodedFile);
    encodedFile.pipe(decoder).pipe(decodedFile);
