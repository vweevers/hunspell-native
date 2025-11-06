#include <napi.h>
#include "HunspellBinding.cc"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return HunspellBinding::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)
