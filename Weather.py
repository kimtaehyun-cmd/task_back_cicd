import requests
from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)

# OpenWeatherMap API 키
API_KEY = os.getenv('API_KEY')

# 날씨 정보 가져오는 함수
def get_weather(city_name):
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}&units=metric'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "weather": data["weather"][0]["description"]
        }
    else:
        return None

# /weather 경로로 GET 요청 시 날씨 정보 반환
@app.route('/weather', methods=['GET', 'POST'])
def weather():
    # GET 요청 처리
    if request.method == 'GET':
        city = request.args.get('city')
    # POST 요청 처리
    elif request.method == 'POST':
        data = request.get_json()
        city = data.get('city') if data else None

    # 도시가 주어졌는지 확인
    if city:
        weather_data = get_weather(city)
        if weather_data:
            return jsonify(weather_data)
        else:
            return jsonify({"error": "City not found"}), 404
    else:
        return jsonify({"error": "City parameter is required"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8000)
