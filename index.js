const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const PORT = '8080'; // Node.js 서버는 8080번 포트에서 실행
const app = express();

app.use(cors());
app.use(express.json());

// 기본 테스트용 라우트
app.get('/', (req, res) => {
  res.send('Hello World! Server is running on pythont.aiprojectt.com');
});

// /api/weather 엔드포인트 - GET 요청 (Python 스크립트를 직접 실행)
app.get('/api/weather', (req, res) => {
  const city = req.query.city || 'Seoul'; // 쿼리 파라미터에서 city 값을 받음

  // Python 스크립트를 실행하고 결과를 가져옴
  const pythonProcess = spawn('python3', ['Weather.py', city]);

  let weatherData = '';
  pythonProcess.stdout.on('data', (data) => {
    weatherData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    res
      .status(500)
      .json({ error: 'Failed to fetch weather data from Python script' });
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.status(200).json(JSON.parse(weatherData)); // Python 스크립트로부터 받은 데이터를 클라이언트로 반환
    } else {
      res.status(500).json({ error: `Python script exited with code ${code}` });
    }
  });
});

// /api/weather 엔드포인트 - POST 요청 (Python 스크립트를 직접 실행)
app.post('/api/weather', (req, res) => {
  const { city } = req.body; // 요청 본문에서 city 값 받음

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  // Python 스크립트를 실행하고 결과를 가져옴
  const pythonProcess = spawn('python3', ['Weather.py', city]);

  let weatherData = '';
  pythonProcess.stdout.on('data', (data) => {
    weatherData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    res
      .status(500)
      .json({ error: 'Failed to fetch weather data from Python script' });
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.status(200).json(JSON.parse(weatherData)); // Python 스크립트로부터 받은 데이터를 클라이언트로 반환
    } else {
      res.status(500).json({ error: `Python script exited with code ${code}` });
    }
  });
});

// 서버 실행
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
