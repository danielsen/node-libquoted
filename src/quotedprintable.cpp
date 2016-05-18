/*! \file quotedprintable.cpp The bulk of node-libquoted can be found here.
 *
 * \mainpage
 *
 * \section synopsis Synopsis
 * This module provides simple quoted-printable encoding / decoding as 
 * described in RFC 2045 [http://tools.ietf.org/html/rfc2045#page-19]
 *
 * \section toc Table of Contents
 * - \ref license License
 * - \ref credits Credits
 * 
 * \section license License
  * <div class="license">
 * Copyright (C) 2016 Dan Nielsen <dnielsen@reachmail.com>
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
 * </div>
 *
 *
 * \section credits Credits
 * <div class="license">
 * Portability between NodeJS versions provided by nan 
 *   [ https://www.npmjs.com/package/nan ]
 * </div>
 *
 */
#include <v8.h>
#include <nan.h>
#include <node.h>
#include <string.h>

/*!
 * \brief   Encodes text to quoted-printable
 * \param   String  Source  Text to encode
 * \return  String          QP encoded text
 */
void Encode (const Nan::FunctionCallbackInfo<v8::Value>& fn) {
  if (fn.Length() < 1) {
    Nan::ThrowError(Nan::Error("encode(Source)"));
  }

  v8::String::Utf8Value _source(fn[0]->ToString());
  std::string           _input(*_source);
  std::string           _output;

  char        byte;
  const char  hex[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A',
    'B', 'C', 'D', 'E', 'F'};

  for (unsigned int j = 0; j < _input.length(); j++) {
    byte = _input[j];

    if ((byte == 0x20) || ((byte >= 33) && (byte <= 126) && (byte != 61))) {
      _output.push_back(byte);
    } else {
      _output.push_back('=');
      _output.push_back(hex[((byte >> 4) & 0x0F)]);
      _output.push_back(hex[(byte & 0x0F)]);
    }
  }

  v8::Local<v8::String> _return;
  _return = Nan::New(_output).ToLocalChecked();
  
  fn.GetReturnValue().Set(_return);
}

/*! 
 * \brief   Decodes text from quoted-printable
 * \param   String  Source  Text to decode
 * \return  String          Decoded text
 */
void Decode (const Nan::FunctionCallbackInfo<v8::Value>& fn) {
  if (fn.Length() < 1) {
    Nan::ThrowError(Nan::Error("decode(Source)"));
  }

  v8::String::Utf8Value _source(fn[0]->ToString());
  std::string           _input(*_source);
  std::string           _output;

  if (_input.length() == 0) {
    _output = "";
    v8::Local<v8::String> _return;
    _return = Nan::New(_output).ToLocalChecked();
    fn.GetReturnValue().Set(_return);
    return;
  }

  //                    0  1  2  3  4  5  6  7  8  9  :  ;  <  =  >  ?  @  A   
  //B   C   D   E   F
  const int hexVal[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 10, 
    11, 12, 13, 14, 15};

  for (unsigned int j = 0; j < _input.length(); j++) {
    if (_input.at(j) == '=') {
      if (j == _input.length() - 1) {
        continue;
      }
      unsigned int i = j + 1, l = i + 1;
      _output.push_back((hexVal[_input.at(i) - '0'] << 4) 
        + hexVal[_input.at(l) - '0']);
      j = j + 2;
    } else {
      _output.push_back(_input.at(j));
    }
  }
  v8::Local<v8::String> _return;
  _return = Nan::New(_output).ToLocalChecked();
  
  fn.GetReturnValue().Set(_return);
}

void InitAll (v8::Local<v8::Object> exports) {
  exports->Set(Nan::New("encode").ToLocalChecked(),
    Nan::New<v8::FunctionTemplate>(Encode)->GetFunction());
  exports->Set(Nan::New("decode").ToLocalChecked(),
    Nan::New<v8::FunctionTemplate>(Decode)->GetFunction());
}

NODE_MODULE(libquoted, InitAll)

