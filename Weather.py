import os
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import requests
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

API_KEY = os.getenv('API_KEY')  # OpenWeatherMap API 키를 .env 파일에서 로드

# 날씨 정보를 가져오는 함수
def get_weather(city_name):
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}&units=metric'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

# 서버에서 HTTP 요청을 처리하는 클래스
class WeatherRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/weather"):
            query = self.path.split('?', 1)[-1]
            city = query.split('=')[-1]
            
            weather_data = get_weather(city)
            if weather_data:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(weather_data).encode())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'{"error": "City not found"}')
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error": "Bad Request"}')

    def do_POST(self):
        if self.path == "/weather":
            content_length = int(self.headers['Content-Length'])  # 요청 본문 크기
            post_data = self.rfile.read(content_length)  # 요청 본문 데이터 읽기
            post_data = json.loads(post_data.decode('utf-8'))  # JSON 데이터로 변환

            city = post_data.get('city')  # 요청 본문에서 'city' 값 가져오기

            if city:
                weather_data = get_weather(city)
                if weather_data:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(weather_data).encode())
                else:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b'{"error": "City not found"}')
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error": "City parameter is required"}')
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error": "Bad Request"}')

# 서버 실행 함수
def run():
    server_address = ('', 8000)  # 8000번 포트에서 서버 실행
    httpd = HTTPServer(server_address, WeatherRequestHandler)
    print("Python weather server is running on port 8000")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
