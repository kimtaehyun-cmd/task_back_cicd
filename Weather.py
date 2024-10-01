import os
import json
import requests
from dotenv import load_dotenv
import sys
from urllib.parse import quote_plus

# .env 파일에서 환경 변수 로드
load_dotenv()

API_KEY = os.getenv('API_KEY')
if not API_KEY:
    print("API_KEY is missing or not loaded from .env file")
    sys.exit(1)


# 날씨 정보를 가져오는 함수
def get_weather(city_name):
    try:
        city_name_encoded = quote_plus(city_name)  # 도시 이름 인코딩
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name_encoded}&appid={API_KEY}&units=metric'
        response = requests.get(url)
        print(response.status_code)  # 응답 상태 코드 출력
        print(response.text)         # 응답 본문 출력
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"API request failed with status code {response.status_code}", "message": response.text}
    except requests.exceptions.RequestException as e:
        return {"error": "Request failed", "message": str(e)}




if __name__ == "__main__":
    if len(sys.argv) > 1:
        city = sys.argv[1]  # Node.js에서 전달된 도시명
        print(f"City received: {city}")
        weather_data = get_weather(city)
        if weather_data:
            print(json.dumps(weather_data))  # JSON 형식으로 날씨 데이터를 출력
        else:
            print(json.dumps({"error": "City not found"}))
    else:
        print(json.dumps({"error": "City parameter is missing"}))
