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
    return {"error": "City not found"}

if __name__ == "__main__":
    city = sys.argv[1]  # Node.js에서 전달한 'city' 이름
    weather_data = get_weather(city)
    print(json.dumps(weather_data))  # Node.js에서 받을 수 있게 출력
