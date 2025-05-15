import json
import re
import argparse
from datetime import datetime

def parse_sillytavern_timestamp(st_timestamp):
    if not st_timestamp: return ""
    try:
        dt_obj = datetime.strptime(st_timestamp, "%b %d, %Y %I:%M%p") # e.g., "May 13, 2025 8:33pm"
        return dt_obj.isoformat()
    except ValueError:
        try:
            dt_obj = datetime.strptime(st_timestamp, "%Y-%m-%d@%Hh%Mm%Ss") # e.g., "2025-05-13@20h33m37s"
            return dt_obj.isoformat()
        except ValueError:
            return st_timestamp # Return original if parsing fails

def parse_message_content_and_status(mes_html):
    if not isinstance(mes_html, str):
        mes_html = ""

    status_block_yaml = None
    options_text = None
    content_for_processing = mes_html

    # 1. Extract and remove StatusBlock
    status_block_pattern = re.compile(r"<StatusBlock>.*?</StatusBlock>", re.DOTALL | re.IGNORECASE)
    status_block_match = status_block_pattern.search(content_for_processing)
    if status_block_match:
        status_block_outer_html = status_block_match.group(0)
        yaml_match = re.search(r"```yaml\s*(.*?)\s*```", status_block_outer_html, re.DOTALL)
        if yaml_match:
            status_block_yaml = yaml_match.group(1).strip()
        content_for_processing = status_block_pattern.sub("", content_for_processing).strip()
    
    # 2. Extract and remove OptionsText (heuristic, assumes it's a distinct block often at the end)
    # This tries to capture "选项区" and following list-like items.
    options_match_end = re.search(r"(选项区[\s\S]*)$", content_for_processing)
    if options_match_end:
        potential_options = options_match_end.group(1)
        # Check if it genuinely looks like an options block
        if re.search(r"(\r\n|\r|\n)+\s*[1-9A-Za-z][\.\)]", potential_options) or \
           "回复选项数字" in potential_options or "也可直接输入自定义内容回应" in potential_options:
            options_text = potential_options.strip()
            # Be careful with replace, ensure it only removes this specific instance
            # If options_text is complex, simple string replace might fail or replace unintended parts.
            # Using a placeholder if options_text is very long or complex might be safer before final stripping.
            # For simplicity now, direct replace:
            if content_for_processing.endswith(options_text): # More specific removal from end
                 content_for_processing = content_for_processing[:-len(options_text)].strip()
            else: # Fallback, less safe for complex HTML
                 content_for_processing = content_for_processing.replace(options_text, "").strip()

    # 3. Clean up main content HTML
    main_content_html = content_for_processing.strip()
    main_content_html = re.sub(r'(<br\s*/?>\s*){2,}', '<br/>', main_content_html).strip() # Consolidate multiple <br>
    main_content_html = re.sub(r'^\s*<br/>\s*', '', main_content_html) # Remove leading <br/>
    main_content_html = re.sub(r'\s*<br/>\s*$', '', main_content_html) # Remove trailing <br/>
    
    return main_content_html, status_block_yaml, options_text

def extract_chat_data(chat_lines):
    if not chat_lines:
        print("Error: Input chat lines are empty.")
        return None

    # First line is metadata
    metadata_json_str = chat_lines[0].strip()
    processed_data = {"metadata": {}, "messages": []}

    try:
        metadata = json.loads(metadata_json_str)
        processed_data["metadata"] = {
            "user_name": metadata.get("user_name", "User"),
            "character_name": metadata.get("character_name", "Character"),
            "create_date": parse_sillytavern_timestamp(metadata.get("create_date", "")),
            # "chat_metadata": metadata.get("chat_metadata", {}) # Removed as per user request
        }
    except json.JSONDecodeError as e:
        print(f"Error decoding metadata JSON from line 1: {e}\nString: {metadata_json_str[:300]}")
        return None

    # Subsequent lines are messages
    msg_id_counter = 0
    for line_num, msg_json_str in enumerate(chat_lines[1:], start=2): # enumerate from line 2
        msg_json_str = msg_json_str.strip()
        if not msg_json_str:
            continue
        
        try:
            msg_data = json.loads(msg_json_str)
            msg_id_counter += 1
            
            sender_name = msg_data.get("name", "Unknown")
            is_user = msg_data.get("is_user", False)
            is_system_from_log = msg_data.get("is_system", False)
            
            msg_type = "unknown"
            if is_user:
                msg_type = "user"
            elif sender_name == processed_data["metadata"].get("character_name"):
                msg_type = "ai_system" if is_system_from_log else "ai"
            elif is_system_from_log:
                msg_type = "system"
            elif "system" in sender_name.lower() and not is_user:
                msg_type = "system"
            else:
                msg_type = "ai" 

            role_value = "assistant" # Default for AI/character
            if msg_type == "system":
                role_value = "system"
            elif msg_type == "user":
                role_value = "user"

            original_mes_from_log = msg_data.get("mes", "")
            current_swipe_index_from_log = msg_data.get("swipe_id", msg_data.get("display_swipe_id", 0))
            
            swipes_sources_raw_html = []
            if "swipe_info" in msg_data and isinstance(msg_data["swipe_info"], list) and msg_data["swipe_info"] and \
               isinstance(msg_data["swipe_info"][0], dict) and "swipes" in msg_data["swipe_info"][0] and \
               isinstance(msg_data["swipe_info"][0]["swipes"], list):
                swipes_sources_raw_html = msg_data["swipe_info"][0]["swipes"]
            elif "swipes" in msg_data and isinstance(msg_data["swipes"], list):
                swipes_sources_raw_html = msg_data["swipes"]
            elif "all_mes" in msg_data and isinstance(msg_data["all_mes"], list):
                 swipes_sources_raw_html = msg_data["all_mes"]

            parsed_swipes_list = []
            if msg_type.startswith("ai"): # Process swipes only for AI messages
                if swipes_sources_raw_html:
                    for swipe_html_content in swipes_sources_raw_html:
                        s_cleaned_html, s_status_yaml, s_options_text = parse_message_content_and_status(swipe_html_content)
                        parsed_swipes_list.append({
                            "content_html": s_cleaned_html,
                            "status_block": s_status_yaml, # Key changed
                            "options": s_options_text      # Key changed
                        })
                elif original_mes_from_log: # Fallback: if no swipes array, treat 'mes' as the single swipe
                     s_cleaned_html, s_status_yaml, s_options_text = parse_message_content_and_status(original_mes_from_log)
                     parsed_swipes_list.append({
                        "content_html": s_cleaned_html,
                        "status_block": s_status_yaml,
                        "options": s_options_text
                    })
                     current_swipe_index_from_log = 0 # If 'mes' is the only swipe, index must be 0
            
            msg_entry_mes_content = ""
            msg_entry_status_block = None
            msg_entry_options_text = None
            
            if msg_type.startswith("ai"):
                if parsed_swipes_list and 0 <= current_swipe_index_from_log < len(parsed_swipes_list):
                    selected_swipe_data = parsed_swipes_list[current_swipe_index_from_log]
                    msg_entry_mes_content = selected_swipe_data["content_html"]
                    msg_entry_status_block = selected_swipe_data["status_block"]
                    msg_entry_options_text = selected_swipe_data["options"]
                elif parsed_swipes_list: # Index out of bounds but swipes exist, default to first swipe
                    print(f"Warning: swipe_id {current_swipe_index_from_log} out of bounds for {len(parsed_swipes_list)} swipes on line {line_num}. Defaulting to swipe 0.")
                    selected_swipe_data = parsed_swipes_list[0]
                    msg_entry_mes_content = selected_swipe_data["content_html"]
                    msg_entry_status_block = selected_swipe_data["status_block"]
                    msg_entry_options_text = selected_swipe_data["options"]
                    current_swipe_index_from_log = 0 # Correct the index
                else: # No swipes parsed (e.g. empty AI message), use original 'mes' if any
                    msg_entry_mes_content, msg_entry_status_block, msg_entry_options_text = parse_message_content_and_status(original_mes_from_log)
            else: # For user messages
                msg_entry_mes_content, msg_entry_status_block, msg_entry_options_text = parse_message_content_and_status(original_mes_from_log)

            message_entry = {
                "id": f"msg-{msg_id_counter}",
                "name": sender_name,
                "is_user": msg_type == "user",
                "mes": msg_entry_mes_content,
                "create_date": parse_sillytavern_timestamp(msg_data.get("send_date", "")),
                "status_block": msg_entry_status_block,
                "options": msg_entry_options_text,
                "role": role_value,
            }
            
            if msg_type.startswith("ai"):
                message_entry["swipes"] = parsed_swipes_list
                message_entry["selected_swipe_index"] = current_swipe_index_from_log
            
            processed_data["messages"].append(message_entry)

        except json.JSONDecodeError as e:
            print(f"Error decoding message JSON on line {line_num}: {e}\nString: {msg_json_str[:300]}")
        except Exception as e:
            print(f"An unexpected error occurred processing message on line {line_num}: {msg_json_str[:100]}... Error: {e}")
    return processed_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract SillyTavern chat data from JSON or JSONL file.')
    parser.add_argument('input_file', help='Path to the SillyTavern chat log file (JSONL or specific JSON string format).')
    parser.add_argument('output_file', help='Path to save the extracted JSON data.')
    
    args = parser.parse_args()

    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            # Read all lines for JSONL processing
            chat_log_lines = f.readlines() 
    except FileNotFoundError:
        print(f"Error: Input file '{args.input_file}' not found.")
        exit(1)
    except Exception as e:
        print(f"Error reading input file: {e}")
        exit(1)

    if not chat_log_lines:
        print("Error: Input file is empty.")
        exit(1)
        
    # Attempt to determine if it's the old format or JSONL
    # A simple heuristic: if the first line is a valid JSON and contains user_name/character_name, 
    # and the second line is also valid JSON (if exists), assume JSONL.
    # Otherwise, try the old split-based method.
    
    is_jsonl_like = False
    if chat_log_lines:
        try:
            first_line_data = json.loads(chat_log_lines[0])
            if "user_name" in first_line_data or "character_name" in first_line_data:
                if len(chat_log_lines) > 1:
                    try:
                        json.loads(chat_log_lines[1]) # Try to parse second line
                        is_jsonl_like = True
                    except json.JSONDecodeError:
                        # Second line not JSON, might be old format if first line was metadata block
                        is_jsonl_like = False 
                else: # Only one line, assume it's metadata for JSONL
                    is_jsonl_like = True
        except json.JSONDecodeError:
            # First line is not JSON, definitely not our expected JSONL start
            pass # Will fallback to legacy

    if is_jsonl_like:
        print("Attempting to parse as JSONL file.")
        extracted_data = extract_chat_data(chat_log_lines)
    else:
        print("Attempting to parse as legacy string format (metadata === messages -- messages).")
        # Rejoin lines to simulate old input format for the old parser logic path
        # This part needs the old extract_chat_data that takes a single string.
        # For now, we'll assume the new extract_chat_data handles the JSONL and the old one is gone.
        # If we need to support both, we'd need two versions of extract_chat_data or more complex logic.
        # Given the request is to fix for JSONL, we prioritize that.
        # The original script's logic for non-JSONL:
        # chat_log_content_str = "".join(chat_log_lines)
        # parts = chat_log_content_str.split('===', 1)
        # ... and so on.
        # This path will likely fail if the file is truly JSONL and doesn't match the "===" structure.
        # We'll assume the user wants JSONL parsing.

        # Fallback to original parsing method IF needed and if the old function was preserved.
        # For this fix, focusing on JSONL:
        print("Error: File does not appear to be a supported JSONL format starting with metadata or the legacy format parser is not active.")
        print("If this is not a JSONL file where the first line is metadata, the script may not parse it correctly with this modification.")
        extracted_data = None # Force fail for non-JSONL if old parser removed/not compatible

    if extracted_data:
        try:
            with open(args.output_file, 'w', encoding='utf-8') as f:
                json.dump(extracted_data, f, ensure_ascii=False, indent=2)
            print(f"Successfully extracted data to '{args.output_file}'")
        except Exception as e:
            print(f"Error writing output file: {e}")
    else:
        print("Failed to extract data.") 