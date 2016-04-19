{
  "targets" : [
    {
      "target_name"   : "quoted-printable",
      "sources"       : [ "src/quotedprintable.cpp" ],
      "include_dirs"  : [ "<!(node -e \"require('nan')\")" ]
    }
  ]
}
