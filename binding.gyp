{
  "targets": [{
    "target_name": "HunspellBinding",
    "sources": [ "src/index.cc" ],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")"
    ],
    "dependencies": [
      "<!(node -p \"require('node-addon-api').gyp\")",
      "hunspell"
    ],
    "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"]
  }, {
    "target_name": "hunspell",
    "type": "static_library",
    "dependencies": ["apply_patch"],
    "include_dirs": ["src/hunspell/src/hunspell"],
    "defines": ["HUNSPELL_STATIC"],
    "direct_dependent_settings": {
      "include_dirs": ["src/hunspell/src/hunspell"],
      "defines": ["HUNSPELL_STATIC"],
    },
    "sources": [
      "src/hunspell/src/hunspell/affentry.cxx",
      "src/hunspell/src/hunspell/affentry.hxx",
      "src/hunspell/src/hunspell/affixmgr.cxx",
      "src/hunspell/src/hunspell/affixmgr.hxx",
      "src/hunspell/src/hunspell/atypes.hxx",
      "src/hunspell/src/hunspell/baseaffix.hxx",
      "src/hunspell/src/hunspell/csutil.cxx",
      "src/hunspell/src/hunspell/csutil.hxx",
      "src/hunspell/src/hunspell/filemgr.cxx",
      "src/hunspell/src/hunspell/filemgr.hxx",
      "src/hunspell/src/hunspell/hashmgr.cxx",
      "src/hunspell/src/hunspell/hashmgr.hxx",
      "src/hunspell/src/hunspell/htypes.hxx",
      "src/hunspell/src/hunspell/hunspell.cxx",
      "src/hunspell/src/hunspell/hunspell.h",
      "src/hunspell/src/hunspell/hunspell.hxx",
      "src/hunspell/src/hunspell/hunzip.cxx",
      "src/hunspell/src/hunspell/hunzip.hxx",
      "src/hunspell/src/hunspell/langnum.hxx",
      "src/hunspell/src/hunspell/phonet.cxx",
      "src/hunspell/src/hunspell/phonet.hxx",
      "src/hunspell/src/hunspell/replist.cxx",
      "src/hunspell/src/hunspell/replist.hxx",
      "src/hunspell/src/hunspell/suggestmgr.cxx",
      "src/hunspell/src/hunspell/suggestmgr.hxx",
      "src/hunspell/src/hunspell/utf_info.hxx",
      "src/hunspell/src/hunspell/w_char.hxx"
    ]
  }, {
    "target_name": "apply_patch",
    "type": "none",
    "actions": [
      {
        "action_name": "apply_patch",
        "inputs": [
          "patches/001-static-cast.patch",
          "src/hunspell/src/hunspell/affixmgr.cxx"
        ],
        "outputs": [
          "<(SHARED_INTERMEDIATE_DIR)/patch-applied.stamp"
        ],
        "action": [
          "node",
          "scripts/apply-patch.js",
          "<(SHARED_INTERMEDIATE_DIR)/patch-applied.stamp"
        ]
      }
    ]
  }, {
    "target_name": "revert_patch",
    "type": "none",
    "dependencies": ["hunspell"],
    "actions": [
      {
        "action_name": "revert_patch",
        "inputs": [
          "<(SHARED_INTERMEDIATE_DIR)/patch-applied.stamp",
          "src/hunspell/src/hunspell/affixmgr.cxx"
        ],
        "outputs": [
          "<(SHARED_INTERMEDIATE_DIR)/patch-reverted.stamp"
        ],
        "action": [
          "node",
          "scripts/revert-patch.js",
          "<(SHARED_INTERMEDIATE_DIR)/patch-reverted.stamp"
        ]
      }
    ]
  }]
}
