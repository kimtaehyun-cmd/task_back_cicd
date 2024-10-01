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
    
    print(f"API Request URL: {url}")  # 요청 URL 출력
    print(f"Response Status Code: {response.status_code}")  # 응답 상태 코드 출력
    print(f"Response Data: {response.text}")  # 응답 데이터 출력
    
    if response.status_code == 200:
        return response.json()  # JSON 형식으로 날씨 데이터를 반환
    else:
        print(f"Failed to retrieve data: {response.status_code}, {response.text}")  # 오류 메시지 출력
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        city = sys.argv[1]  # Node.js에서 전달된 city 파라미터
        weather_data = get_weather(city)
        if weather_data:
            print(json.dumps(weather_data))  # JSON 형식으로 날씨 데이터를 출력
        else:
            print(json.dumps({"error": "City not found"}))
    else:
        print(json.dumps({"error": "City parameter is missing"}))

