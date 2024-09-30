const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const spawn = require('child_process').spawn;

const PORT = '8080';
const app = express();

app.use(cors());
app.use(express.json());

// 기본 테스트용 라우트
app.get('/', (req, res) => {
  res.send('Hello World! Server is running on http://localhost:8080');
});

// /api/weather 엔드포인트 - GET 요청
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city || 'Seoul'; // 쿼리 파라미터에서 city 값을 받음
    const response = await axios.get(
      `http://localhost:8000/weather?city=${city}`
    ); // Python 서버의 GET 방식 호출
    res.json(response.data); // Python 서버로부터 받은 날씨 데이터를 클라이언트로 반환
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch weather data from Python server' });
  }
});

// /api/weather 엔드포인트 - POST 요청
app.post('/api/weather', async (req, res) => {
  try {
    const { city } = req.body; // 요청 본문에서 city 값 받음
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    // Python 서버에 POST 요청으로 도시 이름 전달
    const response = await axios.post(
      'https://pythont.aiprojectt.com/api/weather',
      {
        city,
      }
    );
    res.json(response.data); // Python 서버로부터 받은 날씨 데이터를 클라이언트로 반환
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch weather data from Python server' });
  }
});

// 채팅 문자열 요청 (기존 코드 유지)
app.post('/chat', (req, res) => {
  try {
    const sendedQuestion = req.body.question;
    const scriptPath = path.join(__dirname, 'bizchat.py');
    // 디플로이할때 환경
    const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3');

    // const pythonPath = path.join(__dirname, 'venv', 'Scripts', 'python.exe');

    const result = spawn(pythonPath, [scriptPath, sendedQuestion]);
    let responseData = '';
    result.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    result.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      res.status(500).json({ error: data.toString() });
    });
    result.on('close', (code) => {
      if (code === 0) {
        res.status(200).json({ answer: responseData });
      } else {
        res
          .status(500)
          .json({ error: `Child process exited with code ${code}` });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 서버 실행
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
