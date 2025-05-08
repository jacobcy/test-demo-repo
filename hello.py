def say_hello(name="World", language="en"):
    greetings = {
        "en": f"Hello {name}!",
        "zh": f"你好，{name}！",
        "ja": f"こんにちは、{name}さん！"
    }
    return greetings.get(language, greetings["en"])

if __name__ == "__main__":
    print(say_hello())  # 默认英文
    print(say_hello("张三", "zh"))  # 中文问候
    print(say_hello("田中", "ja"))  # 日文问候