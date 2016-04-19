{
  "targets" : [
    {
      "target_name"   : "libquoted",
      "sources"       : [ "src/quotedprintable.cpp" ],
      "include_dirs"  : [ "<!(node -e \"require('nan')\")" ]
    }
  ]
}
