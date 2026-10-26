import http.server
import socketserver
import os
import webbrowser

os.chdir(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_PORT = 3000

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logs for cleaner output

def find_available_port(start_port=3000, max_attempts=50):
    for port in range(start_port, start_port + max_attempts):
        try:
            server = socketserver.TCPServer(("", port), NoCacheHandler)
            return server, port
        except OSError:
            continue
    raise RuntimeError("Khong tim thay cong trong nao!")

httpd, port = find_available_port(DEFAULT_PORT)
url = f"http://localhost:{port}"

print("=" * 60)
print(f"  [Sudoku Web App]")
print(f"  May chu noi bo dang chay tai: {url}")
print(f"  (Tip: Neu cong {DEFAULT_PORT} bi trung, he thong tu chon cong {port})")
print(f"  (Ban cung co the nhap dup truc tiep file index.html de choi)")
print("  Nhan Ctrl + C de dung may chu.")
print("=" * 60)

try:
    webbrowser.open(url)
except Exception:
    pass

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n[Sudoku] Da tat may chu.")
    httpd.server_close()
