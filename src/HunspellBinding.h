#ifndef HunspellBinding_H
#define HunspellBinding_H

#define NAPI_VERSION 8

#include <napi.h>
#include "HunspellContext.h"

class HunspellBinding : public Napi::ObjectWrap<HunspellBinding> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  HunspellBinding(const Napi::CallbackInfo& info);
  ~HunspellBinding();

private:
  HunspellContext* context;

  // (dictionary: string) => void
  Napi::Value addDictionary(const Napi::CallbackInfo& info);
  Napi::Value addDictionarySync(const Napi::CallbackInfo& info);

  // (word: string) => boolean
  Napi::Value spell(const Napi::CallbackInfo& info);
  Napi::Value spellSync(const Napi::CallbackInfo& info);

  // (word: string) => string[] | null
  Napi::Value suggest(const Napi::CallbackInfo& info);
  Napi::Value suggestSync(const Napi::CallbackInfo& info);

  // (word: string) => string[]
  Napi::Value analyze(const Napi::CallbackInfo& info);
  Napi::Value analyzeSync (const Napi::CallbackInfo& info);

  // (word: string) => string[]
  Napi::Value stem(const Napi::CallbackInfo& info);
  Napi::Value stemSync(const Napi::CallbackInfo& info);

  // (word: string, example: string) => string[]
  Napi::Value generate(const Napi::CallbackInfo& info);
  Napi::Value generateSync(const Napi::CallbackInfo& info);

  // (word: string) => void
  Napi::Value add(const Napi::CallbackInfo& info);
  Napi::Value addSync(const Napi::CallbackInfo& info);

  // (word: string, example: string) => void
  Napi::Value addWithAffix(const Napi::CallbackInfo& info);
  Napi::Value addWithAffixSync(const Napi::CallbackInfo& info);

  // (word: string) => void
  Napi::Value remove(const Napi::CallbackInfo& info);
  Napi::Value removeSync(const Napi::CallbackInfo& info);

  // () => string | undefined
  Napi::Value getWordCharacters(const Napi::CallbackInfo& info);
};

#endif
