import time
import requests
import threading
from pynput import mouse, keyboard
import pyautogui

# --- Configuration ---
EMPLOYEE_ID = 1  # Replace with the actual employee ID from the server
SERVER_URL = "http://localhost:8000/api/activity"
CHECK_INTERVAL_SECONDS = 5
IDLE_THRESHOLD_SECONDS = 5  # Mark as inactive if no input for 5 seconds

# Global variable to track the last activity time
last_activity_time = time.time()
running = True

def update_activity(x=None, y=None, button=None, pressed=None, key=None):
    """Callback to update the last activity time whenever there's mouse/keyboard input."""
    global last_activity_time
    last_activity_time = time.time()

def monitor_input():
    """Starts the pynput listeners in background threads."""
    mouse_listener = mouse.Listener(
        on_move=update_activity,
        on_click=update_activity,
        on_scroll=update_activity
    )
    keyboard_listener = keyboard.Listener(
        on_press=update_activity,
        on_release=update_activity
    )
    
    mouse_listener.start()
    keyboard_listener.start()

def get_active_window_title():
    """Returns the name of the currently active window using pyautogui.
       NOTE: For some OSes (like macOS), PyAutoGUI's active window feature 
       might require special accessibility permissions or might fallback to generic titles.
    """
    try:
        window = pyautogui.getActiveWindow()
        if window:
            return window.title
        return "Unknown/Desktop"
    except Exception:
        # If pyautogui.getActiveWindow() fails
        return "Unknown/Desktop"

def send_activity_pulse():
    """Timer loop that sends an update to the FastAPI server."""
    global last_activity_time, running
    
    while running:
        time.sleep(CHECK_INTERVAL_SECONDS)
        
        current_time = time.time()
        time_since_last_activity = current_time - last_activity_time
        
        # Determine if active based on recent input
        is_active = 1 if time_since_last_activity <= IDLE_THRESHOLD_SECONDS else 0
        
        # Determine site/window worked on
        site_worked_on = get_active_window_title()
        
        payload = {
            "employee_id": EMPLOYEE_ID,
            "site_worked_on": site_worked_on,
            "active": is_active
        }
        
        try:
            response = requests.post(SERVER_URL, json=payload)
            if response.status_code == 200:
                data = response.json()
                print(f"[Client] Sent active={is_active}. Server determined: {data.get('status')} | Inactive duration: {data.get('inactive_duration')}")
            else:
                print(f"[Client] Server error: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"[Client] Could not connect to server: {e}")

if __name__ == "__main__":
    print(f"Starting Activity Monitor for Employee ID: {EMPLOYEE_ID}")
    print("Press Ctrl+C to stop.")
    
    # Start capturing inputs
    monitor_input()
    
    # Start reporting loop in the main thread
    try:
        send_activity_pulse()
    except KeyboardInterrupt:
        print("\nStopping Activity Monitor...")
        running = False
