import http.server
import socketserver
import sys
import os

PORT = 8000

class FastHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Simplified logging
        host = self.headers.get('Host', f'localhost:{PORT}')
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.client_address[0],
                          self.log_date_time_string(),
                          format % args))

    def end_headers(self):
        # Disable caching for development
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        # Ignore query parameters (e.g. ?v=123) so files can be found
        if '?' in self.path:
            self.path = self.path.split('?')[0]
            
        # Default behavior is highly optimized in standard library
        try:
            super().do_GET()
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass

if __name__ == "__main__":
    # Ensure we are in the directory of the script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Use ThreadingTCPServer for concurrent requests
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        daemon_threads = True
        allow_reuse_address = True

    with ThreadingHTTPServer(("", PORT), FastHandler) as httpd:
        print(f"Serving HTTP on port {PORT} (http://localhost:{PORT}/) [Fast Mode] ...")
        httpd.serve_forever()
