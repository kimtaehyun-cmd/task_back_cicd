const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const PORT = '8080'; // Node.js 서버는 8080번 포트에서 실행
const app = express();

app.use(cors());
app.use(express.json());

// /api/weather 엔드포인트 - POST 요청 (Python 스크립트를 직접 실행)
app.post('/api/weather', (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  // Python 스크립트를 실행하고 결과를 가져옴
  const pythonProcess = spawn('python3', ['Weather.py', city]);

  let weatherData = '';
  let errorOccurred = false;

  // Python 스크립트의 stdout 데이터를 수집
  pythonProcess.stdout.on('data', (data) => {
    weatherData += data.toString();
  });

  // Python 스크립트의 stderr에서 오류 메시지를 수집
  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    errorOccurred = true; // 오류가 발생했음을 플래그로 설정
    res.status(500).json({ error: `Python Error: ${data.toString()}` });
  });

  // Python 프로세스가 종료된 후 응답 처리
  pythonProcess.on('close', (code) => {
    if (!errorOccurred && code === 0) {
      try {
        res.status(200).json(JSON.parse(weatherData)); // Python 스크립트로부터 받은 데이터를 클라이언트로 반환
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse weather data' });
      }
    }
  });
});

// 서버 실행
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
