#include "HunspellBinding.h"
#include <napi.h>
#include <hunspell.hxx>
#include "Async/AddDictionaryWorker.cc"
#include "Async/SpellWorker.cc"
#include "Async/SuggestWorker.cc"
#include "Async/AnalyzeWorker.cc"
#include "Async/StemWorker.cc"
#include "Async/GenerateWorker.cc"
#include "Async/AddWorker.cc"
#include "Async/AddWithAffixWorker.cc"
#include "Async/RemoveWorker.cc"

const std::string INVALID_NUMBER_OF_ARGUMENTS = "Invalid number of arguments.";
const std::string INVALID_FIRST_ARGUMENT = "First argument is invalid.";
const std::string INVALID_SECOND_ARGUMENT = "Second argument is invalid.";

// LOGGING
// #include <iostream>
// #include <fstream>
// std::ofstream logFile("log.txt");

Napi::Object HunspellBinding::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func = DefineClass(env, "Hunspell", {
    InstanceMethod("addDictionary", &HunspellBinding::addDictionary),
    InstanceMethod("addDictionarySync", &HunspellBinding::addDictionarySync),
    InstanceMethod("spell", &HunspellBinding::spell),
    InstanceMethod("spellSync", &HunspellBinding::spellSync),
    InstanceMethod("suggest", &HunspellBinding::suggest),
    InstanceMethod("suggestSync", &HunspellBinding::suggestSync),
    InstanceMethod("analyze", &HunspellBinding::analyze),
    InstanceMethod("analyzeSync", &HunspellBinding::analyzeSync),
    InstanceMethod("stem", &HunspellBinding::stem),
    InstanceMethod("stemSync", &HunspellBinding::stemSync),
    InstanceMethod("generate", &HunspellBinding::generate),
    InstanceMethod("generateSync", &HunspellBinding::generateSync),
    InstanceMethod("add", &HunspellBinding::add),
    InstanceMethod("addSync", &HunspellBinding::addSync),
    InstanceMethod("addWithAffix", &HunspellBinding::addWithAffix),
    InstanceMethod("addWithAffixSync", &HunspellBinding::addWithAffixSync),
    InstanceMethod("remove", &HunspellBinding::remove),
    InstanceMethod("removeSync", &HunspellBinding::removeSync),
    InstanceMethod("getWordCharacters", &HunspellBinding::getWordCharacters)
  });

  // Support worker threads
  // See https://github.com/nodejs/node-addon-api/blob/main/doc/object_wrap.md
  auto* constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData<Napi::FunctionReference>(constructor);

  return func;
}

HunspellBinding::HunspellBinding(const Napi::CallbackInfo& info) : Napi::ObjectWrap<HunspellBinding>(info), context(nullptr) {
  Napi::Env env = info.Env();

  std::string affixFile;
  std::string dictionaryFile;

  if (info.Length() == 1 && info[0].IsObject()) {
    Napi::Object dictionary = info[0].As<Napi::Object>();

    if (!dictionary.Has("aff") || !dictionary.Has("dic")) {
      Napi::TypeError::New(env, INVALID_FIRST_ARGUMENT).ThrowAsJavaScriptException();
      return;
    }

    Napi::Value aff = dictionary.Get("aff");
    Napi::Value dic = dictionary.Get("dic");

    if (!aff.IsString() || !dic.IsString()) {
      Napi::TypeError::New(env, INVALID_FIRST_ARGUMENT).ThrowAsJavaScriptException();
      return;
    }

    affixFile = aff.As<Napi::String>().Utf8Value();
    dictionaryFile = dic.As<Napi::String>().Utf8Value();
  } else if (info.Length() == 2) {
    if (!info[0].IsString()) {
      Napi::TypeError::New(env, INVALID_FIRST_ARGUMENT).ThrowAsJavaScriptException();
      return;
    }

    if (!info[1].IsString()) {
      Napi::TypeError::New(env, INVALID_SECOND_ARGUMENT).ThrowAsJavaScriptException();
      return;
    }

    affixFile = info[0].ToString().Utf8Value();
    dictionaryFile = info[1].ToString().Utf8Value();
  } else {
    Napi::TypeError::New(env, INVALID_NUMBER_OF_ARGUMENTS).ThrowAsJavaScriptException();;
    return;
  }

  context = new HunspellContext(
    new Hunspell(affixFile.c_str(), dictionaryFile.c_str(), NULL)
  );
};

HunspellBinding::~HunspellBinding() {
  if (context) {
    delete context;
    context = NULL;
  }
}

Napi::Value HunspellBinding::addDictionarySync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else {
    std::string dictionary = info[0].ToString().Utf8Value();

    context->instance->add_dic(dictionary.c_str());

    return env.Undefined();
  }
}

Napi::Value HunspellBinding::addDictionary(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(info.Env());

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
    } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string dictionary = info[0].ToString().Utf8Value();

    AddDictionaryWorker* worker = new AddDictionaryWorker(
      context,
      deferred,
      dictionary
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::spell(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();

    SpellWorker* worker = new SpellWorker(
      context,
      deferred,
      word
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::spellSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();

    context->lockRead();
    bool correct = context->instance->spell(word);
    context->unlockRead();

    return Napi::Boolean::New(env, correct);
  }
}

Napi::Value HunspellBinding::suggest(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();

    SuggestWorker* worker = new SuggestWorker(
      context,
      deferred,
      word
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::suggestSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();

    context->lockRead();
    bool isCorrect = this->context->instance->spell(word);

    if (isCorrect) {
      context->unlockRead();
      return env.Null();
    }

    std::vector<std::string> suggestions = this->context->instance->suggest(word);
    size_t length = suggestions.size();
    context->unlockRead();

    Napi::Array array = Napi::Array::New(env, length);
    for (int i = 0; i < length; i++) {
      array.Set(i, Napi::String::New(env, suggestions[i]));
    }

    return array;
  }
}

Napi::Value HunspellBinding::analyze(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();

    AnalyzeWorker* worker = new AnalyzeWorker(
      context,
      deferred,
      word
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::analyzeSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();

    char** analysis = NULL;
    this->context->lockRead();
    int length = this->context->instance->analyze(&analysis, word.c_str());
    this->context->unlockRead();

    Napi::Array array = Napi::Array::New(env, length);
    for (int i = 0; i < length; i++) {
      array.Set(i, Napi::String::New(env, analysis[i]));
    }

    context->instance->free_list(&analysis, length);

    return array;
  }
}

Napi::Value HunspellBinding::stem(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();

    StemWorker* worker = new StemWorker(
      context,
      deferred,
      word
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::stemSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();

    char** stems = NULL;
    context->lockRead();
    int length = this->context->instance->stem(&stems, word.c_str());
    context->unlockRead();

    Napi::Array array = Napi::Array::New(env, length);
    for (int i = 0; i < length; i++) {
      array.Set(i, Napi::String::New(env, stems[i]));
    }

    context->instance->free_list(&stems, length);

    return array;
  }
}

Napi::Value HunspellBinding::generate(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  if (info.Length() != 2) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else if (!info[1].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_SECOND_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();
    std::string example = info[1].ToString().Utf8Value();

    GenerateWorker* worker = new GenerateWorker(
      context,
      deferred,
      word,
      example
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::generateSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 2) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else if (!info[1].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_SECOND_ARGUMENT);
    error.ThrowAsJavaScriptException();
    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();
    std::string example = info[1].ToString().Utf8Value();

    char** generates = NULL;
    context->lockRead();
    int length = this->context->instance->generate(
      &generates,
      word.c_str(),
      example.c_str()
    );
    context->unlockRead();

    Napi::Array array = Napi::Array::New(env, length);
    for (int i = 0; i < length; i++) {
      array.Set(i, Napi::String::New(env, generates[i]));
    }

    context->instance->free_list(&generates, length);

    return array;
  }
}

Napi::Value HunspellBinding::addSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();

    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();

    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();

    context->lockWrite();
    context->instance->add(word.c_str());
    context->unlockWrite();

    return env.Undefined();
  }

}

Napi::Value HunspellBinding::add(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(info.Env());

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();

    AddWorker* worker = new AddWorker(
      context,
      deferred,
      word
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::addWithAffixSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 2) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();

    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();

    return error.Value();
  } else if (!info[1].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_SECOND_ARGUMENT);
    error.ThrowAsJavaScriptException();

    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();
    std::string example = info[1].ToString().Utf8Value();

    context->lockWrite();
    context->instance->add_with_affix(word.c_str(), example.c_str());
    context->unlockWrite();

    return env.Undefined();
  }

}

Napi::Value HunspellBinding::addWithAffix(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(info.Env());

  if (info.Length() != 2) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else if (!info[1].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_SECOND_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();
    std::string example = info[1].ToString().Utf8Value();

    AddWithAffixWorker* worker = new AddWithAffixWorker(
      context,
      deferred,
      word,
      example
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::removeSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();

    return error.Value();
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    error.ThrowAsJavaScriptException();

    return error.Value();
  } else {
    std::string word = info[0].ToString().Utf8Value();

    context->lockWrite();
    context->instance->remove(word.c_str());
    context->unlockWrite();

    return env.Undefined();
  }

}

Napi::Value HunspellBinding::remove(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(info.Env());

  if (info.Length() != 1) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    deferred.Reject(error.Value());
  } else if (!info[0].IsString()) {
    Napi::Error error = Napi::Error::New(env, INVALID_FIRST_ARGUMENT);
    deferred.Reject(error.Value());
  } else {
    std::string word = info[0].ToString().Utf8Value();

    RemoveWorker* worker = new RemoveWorker(
      context,
      deferred,
      word
    );

    worker->Queue();
  }

  return deferred.Promise();
}

Napi::Value HunspellBinding::getWordCharacters(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() > 0) {
    Napi::Error error = Napi::Error::New(env, INVALID_NUMBER_OF_ARGUMENTS);
    error.ThrowAsJavaScriptException();
    return error.Value();
  }

  const std::string wordCharacters = this->context->instance->get_wordchars_cpp();

  if (wordCharacters.empty()) {
    return env.Undefined();
  } else {
    return Napi::String::New(env, wordCharacters);
  }
}
