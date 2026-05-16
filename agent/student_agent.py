import socketio
import psutil
import time
import os
import sys
import platform
from datetime import datetime

# LAN Server Address (Change to Teacher's IP)
SERVER_URL = "http://localhost:3000"

sio = socketio.Client()

def get_active_app():
    """Simple mockup to get the frontmost process.
    On real Windows, use 'pygetwindow' or 'win32gui'
    """
    try:
        # Mocking active app logic for the code sample
        # In real usage, you'd use something like:
        # import pygetwindow as gw
        # return gw.getActiveWindow().title
        return "Chrome" # Default placeholder
    except:
        return "Unknown"

@sio.event
def connect():
    print("Successfully connected to EduControl Hub")
    sio.emit('identify', {
        'role': 'student',
        'name': os.environ.get('COMPUTERNAME', platform.node()),
        'systemSpecs': {
            'os': f"{platform.system()} {platform.release()}",
            'ram': f"{round(psutil.virtual_memory().total / (1024**3))}GB",
            'cpu': platform.processor()
        }
    })

@sio.on('student_command')
def on_command(data):
    print(f"Received command: {data}")
    if data['type'] == 'lock':
        if data['value']:
            print("LOCKING WORKSTATION...")
            # On Windows: os.system("rundll32.exe user32.dll,LockWorkStation")
        else:
            print("RESTORING ACCESS...")
    
    if data['type'] == 'kill_process':
        target = data['process_name']
        for proc in psutil.process_iter(['name']):
            if target.lower() in proc.info['name'].lower():
                print(f"KILLING {target}...")
                proc.kill()

def main():
    try:
        sio.connect(SERVER_URL)
        while True:
            # Heartbeat and Telemetry
            if sio.connected:
                active = get_active_app()
                sio.emit('update_student_status', {
                    'currentApp': active,
                    'status': 'online',
                    'timestamp': datetime.now().isoformat()
                })
            time.sleep(2)
    except KeyboardInterrupt:
        print("Agent shutting down")
        sio.disconnect()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
