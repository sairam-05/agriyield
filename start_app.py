import subprocess
import time
import webbrowser
import sys
import os
import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

print("==================================================================")
print("Starting AI-Powered Crop Yield Prediction & Optimization System")
print("==================================================================")

root_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(root_dir, "frontend")
local_ip = get_local_ip()

# 1. Start Backend FastAPI server
print("Launching Backend API server (http://0.0.0.0:8000)...")
backend_proc = subprocess.Popen([
    sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"
], cwd=root_dir)

# 2. Start Frontend Vite server
print("Launching Frontend React App (http://0.0.0.0:5173)...")
frontend_proc = subprocess.Popen(
    "npx vite --host 0.0.0.0 --port 5173",
    shell=True,
    cwd=frontend_dir
)

time.sleep(3)

url = "http://localhost:5173"
print(f"\nOpening website at {url} ...")
try:
    webbrowser.open(url)
except Exception:
    pass

print("\nWeb Application is live!")
print(f"Local PC Link:           http://localhost:5173")
print(f"Multi-device Wi-Fi Link: http://{local_ip}:5173\n")

try:
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    print("\nShutting down servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
    print("Done.")
