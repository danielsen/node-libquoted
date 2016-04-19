/* Copyright (C) 2016  Dan Nielsen <dnielsen@reachmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
const Transform   = require('stream').Transform;
const util        = require('util');
const _libquoted  = require('./build/Release/quoted');

exports.encode        = _libquoted.encode;
exports.decode        = _libquoted.decode;

var wrap = function (str, lineLength) {
  str         = (str || '').toString();
  lineLength  = lineLength || 76;

  if (str.length <= lineLength) return str;

  var _pos    = 0;
  var _len    = str.length;
  var _margin = Math.floor(lineLength / 3);
  var _output = '';

  var _code;
  var _line;
  var _match;

  while (_pos < _len) {
    _line = str.substr(_pos, lineLength);

    if ((_match = _line.match(/\r\n/))) {
      _line   = _line.substr(0, _match.index + _match[0].length);
      _output += _line;
      _pos    += _line.length;
      continue;
    }

    if (_line.substr(-1) === '\n') {
      _output += _line;
      _pos    += _line.length;
      continue;
    } else if ((_march = _line.substr(-_margin).match(/\n.*?$/))) {
      _line   = _line.substr(0, _line.length - (_match[0].length - 1));
      _output += _line;
      _pos    += _line.length;
      continue;
    } else if (_line.length > lineLength - _margin &&
      (_match = _line.substr(-_margin).match(/[ \t\.,!\?][^ \t\.,!\?]*$/))) {
      _line = _line.substr(0, _line.length - (_match[0].length - 1));
    } else {
      if (_line.match(/\=[\da-f]{0,2}$/i)) {
        if ((_match = _line.match(/\=[\da-f]{0,1}$/i))) {
          _line = _line.substr(0, _line.length - _match[0].length);
        }

        while (_line.length > 3 && _line.length < _len - _pos 
                && !_line.match(/^(?:=[\da-f]{2}){1,4}$/i) 
                && (_match = _line.match(/\=[\da-f]{2}$/ig))) {
          _code = parseInt(_match[0].substr(1, 2), 16);
          if (_code < 128) break;

          _line = _line.substr(0, _line.length - 3);

          if (_code >= 0xC0) break;

        }
      }
    }

    if (_pos + _line.length < _len && _line.substr(-1) !== '\n') {
      if (_line.length === lineLength && _line.match(/\=[\da-f]{2}$/i)) {
        _line = _line.substr(0, _line.length - 3);
      } else if (_line.length === lineLength) {
        _line = _line.substr(0, _line.length - 1);
      }
      _pos  += _line.length;
      _line += '\r\n';
    } else {
      _pos += _line.length;
    }
    _output += _line;
  }
  return _output;
}

var Encoder = function (options) {
  this._options = options || {};

  if (this._options.lineLength !== false) 
    this._options.lineLength = this._options.lineLength || 76;

  this._currentLine = '';
  this.inputBytes   = 0;
  this.outputBytes  = 0;

  Transform.call(this, this._options);
}
util.inherits(Encoder, Transform);

Encoder.prototype._transform = function (chunk, encoding, done) {
  var _qp;

  if (encoding !== 'buffer') {
    chunk = new Buffer(chunk, encoding);
  }

  if (!chunk || !chunk.length) {
    return done();
  }

  this.inputBytes += chunk.length;

  if (this._options.lineLength) {
    _qp  = this._curline + _libquoted.encode(chunk);
    _qp  = wrap(_qp, this._options.lineLength);
    _qp  = _qp.replace(/(^|\n)([^\n]*)$/, function(match, lineBreak, lastLine) {
      this._curLine = lastLine;
      return lineBreak;
    }.bind(this));

    if (_qp) {
      this.outputBytes += _qp.length;
      this.push(_qp);
    }
  } else {
    _qp  = _libquoted.encode(chunk);
    this.outputBytes += _qp.length;
    this.push(_qp, 'ascii');
  }
  done();
}

Encoder.prototype._flush = function (done) {
  if (this._currentLine) {
    this.outputBytes += this._currentLine.length;
    this.push(this._currentLine, 'ascii');
  }
  done();
}

var Decoder = function (options) {
  this._options     = options || {};
  this._currentLine = '';

  this.inputBytes   = 0;
  this.outputBytes  = 0;

  Transform.call(this, this._options);
}
util.inherits(Decoder, Transform);

Decoder.prototype._transform = function (chunk, encoding, done) {
  var _qp;
  var _buf;
  
  chunk = chunk.toString('ascii');

  if (!chunk || !chunk.length) return done();

  this.inputBytes += chunk.length;

  _qp  = (this._currentLine + chunk);
  this._currentLine = '';
  
  _qp  = _qp.replace(/=[^\n]?$/, function(lastLine) {
    this._currentLine = lastline;
    return '';
  }.bind(this));

  if (_qp) {
    _buf = _libquoted.decode(_qp);
    this.outputBytes += _buf.length;
    this.push(_buf);
  }
  done();
}

Decoder.prototype._flush = function (done) {
  var _qp;
  var _buf;

  if (this._currentLine) {
    _buf = _libquoted.decode(this._currentLine);
    this.outputBytes += _buf.length;
    this.push(_buf);
  }
  done();
}

exports.wrap    = wrap;
exports.Encoder = Encoder;
exports.Decoder = Decoder;
