import subprocess
import sys
import os
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

PORT = 8080
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

def run_analysis():
    print("Executing data analysis pipeline (Netflix, Churn, Spotify, Superstore)...")
    analyze_script = os.path.join(PROJECT_ROOT, "src", "analyze.py")
    try:
        subprocess.check_call([sys.executable, analyze_script])
        print("All data analysis case studies successfully executed.")
    except subprocess.CalledProcessError as e:
        print(f"Error executing analyze.py: {e}")
        sys.exit(1)

def start_server():
    os.chdir(PROJECT_ROOT)
    
    class MyHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    TCPServer.allow_reuse_address = True
    try:
        with TCPServer(("", PORT), MyHandler) as httpd:
            print(f"\n[HTTP SERVER] Local server successfully started on port {PORT}.")
            print(f"Access the interactive portfolio at: http://localhost:{PORT}/src/index.html")
            print("Press Ctrl+C to terminate the server.")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting local HTTP server: {e}")

if __name__ == "__main__":
    os.chdir(PROJECT_ROOT)
    
    run_analysis()
    
    # Start server in a background daemon thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Give the server a moment to spin up
    time.sleep(1.5)
    
    # Open dashboard url in default web browser
    dashboard_url = f"http://localhost:{PORT}/src/index.html"
    print(f"Opening portfolio in your web browser: {dashboard_url}")
    webbrowser.open(dashboard_url)
    
    # Keep the main process running to handle keyboard interrupts
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down server. Goodbye!")
