import sys
import os
import json
import subprocess
import time

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

OPENSCREEN_EXE = r"C:\Program Files\Openscreen\Openscreen.exe"

def run_mcp_assemble(video_path, audio_path, out_mp4_path, title):
    print(f"\n[OpenScreen] Assembling project: '{title}'...")
    print(f"  Video: {video_path}")
    print(f"  Audio: {audio_path}")
    print(f"  Output: {out_mp4_path}")

    proc = subprocess.Popen(
        [OPENSCREEN_EXE, "mcp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    req_id = 1
    def call(method, params):
        nonlocal req_id
        req = {"jsonrpc": "2.0", "id": req_id, "method": method, "params": params}
        proc.stdin.write(json.dumps(req) + "\n")
        proc.stdin.flush()
        req_id += 1
        line = proc.stdout.readline()
        return json.loads(line)

    # 1. Initialize
    init_res = call("initialize", {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "assembler", "version": "1.0"}
    })

    proc.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}}) + "\n")
    proc.stdin.flush()

    # 2. Create Project
    cp_res = call("tools/call", {
        "name": "createProject",
        "arguments": {
            "title": title,
            "videoPath": os.path.abspath(video_path)
        }
    })
    
    # Parse text from content
    content_text = cp_res["result"]["content"][0]["text"]
    project_info = json.loads(content_text)
    project_id = project_info["projectId"]
    duration_sec = project_info["durationSec"]
    print(f"  * Project created: {project_id} (duration: {duration_sec}s)")

    # 3. Import Audio Media
    im_res = call("tools/call", {
        "name": "importMedia",
        "arguments": {
            "projectId": project_id,
            "path": os.path.abspath(audio_path),
            "kind": "audio"
        }
    })
    im_info = json.loads(im_res["result"]["content"][0]["text"])
    asset_id = im_info["assetId"]
    audio_dur = im_info["durationSec"]
    print(f"  * Audio imported: {asset_id} (duration: {audio_dur}s)")

    # 4. Add Audio Track to Timeline
    aa_res = call("tools/call", {
        "name": "addAudio",
        "arguments": {
            "projectId": project_id,
            "assetId": asset_id,
            "kind": "voiceover",
            "startSec": 0
        }
    })
    print(f"  * Audio track attached to timeline.")

    # 5. Export Video
    os.makedirs(os.path.dirname(os.path.abspath(out_mp4_path)), exist_ok=True)
    exp_res = call("tools/call", {
        "name": "exportVideo",
        "arguments": {
            "projectId": project_id,
            "path": os.path.abspath(out_mp4_path),
            "quality": "good",
            "fps": 60
        }
    })
    exp_info = json.loads(exp_res["result"]["content"][0]["text"])
    print(f"  [SUCCESS] Export complete: {exp_info['path']} ({exp_info['width']}x{exp_info['height']})")

    proc.terminate()
    return exp_info["path"]

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python assemble_section.py <video_path> <audio_path> <out_mp4> <title>")
        sys.exit(1)
    run_mcp_assemble(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
