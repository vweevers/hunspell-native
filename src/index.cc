#include <napi.h>
#include "Nodehun.cc"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return Nodehun::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)
