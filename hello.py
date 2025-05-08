import argparse

def say_hello(name="World", language="en"):
    greetings = {
        "en": f"Hello {name}!",
        "zh": f"你好，{name}！",
        "ja": f"こんにちは、{name}さん！"
    }
    return greetings.get(language, greetings["en"])

def validate_language(lang):
    valid_languages = ["en", "zh", "ja"]
    if lang not in valid_languages:
        raise argparse.ArgumentTypeError(
            f"语言'{lang}'不支持。请使用以下语言之一: {', '.join(valid_languages)}"
        )
    return lang

def parse_args():
    parser = argparse.ArgumentParser(
        description="一个多语言问候程序",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s                    # 使用默认值（英文、World）
  %(prog)s --name 张三         # 指定名字
  %(prog)s --name 田中 --lang ja # 日语问候
"""
    )
    
    parser.add_argument(
        "--name",
        default="World",
        help="要问候的名字（默认: World）"
    )
    
    parser.add_argument(
        "--lang",
        default="en",
        type=validate_language,
        help="问候语言：en（英语）、zh（中文）、ja（日语）（默认: en）"
    )
    
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    print(say_hello(args.name, args.lang))