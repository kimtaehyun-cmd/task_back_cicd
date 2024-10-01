import os
import json
import requests
from dotenv import load_dotenv
import sys

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

if __name__ == "__main__":
    if len(sys.argv) > 1:
        city = sys.argv[1]  # Node.js에서 전달된 도시명
        weather_data = get_weather(city)
        if weather_data:
            print(json.dumps(weather_data))  # JSON 형식으로 날씨 데이터를 출력
        else:
            print(json.dumps({"error": "City not found"}))
    else:
        print(json.dumps({"error": "City parameter is missing"}))
