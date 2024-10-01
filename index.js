const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080; // Node.js 서버는 8080번 포트에서 실행
const app = express();

app.use(cors());
app.use(express.json());

// 기본 테스트용 라우트
app.get('/', (req, res) => {
  res.send('Hello World! Server is running on pythont.aiprojectt.com');
});

// /api/weather 엔드포인트 - GET 요청 (Python 스크립트를 실행)
app.get('/api/weather', (req, res) => {
  const city = req.query.city || 'Seoul'; // 쿼리 파라미터에서 city 값을 받음

  // Python 스크립트를 실행하고 결과를 가져옴
  const pythonProcess = spawn('python3', ['Weather.py', city]);

  let weatherData = '';
  pythonProcess.stdout.on('data', (data) => {
    weatherData += data.toString();
    console.error(`Python Error: ${data.toString()}`);
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

// /api/weather 엔드포인트 - POST 요청 (Python 스크립트를 실행)
app.post('/api/weather', (req, res) => {
  const { city } = req.body; // 요청 본문에서 city 값 받기

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  const scriptPath = path.join(__dirname, 'Weather.py'); // Python 스크립트 경로
  const pythonPath =
    '/home/ubuntu/actions-runner/_work/task_back_cicd/task_back_cicd/venv/bin/python3'; // 가상환경 Python 경로

  // Python 스크립트 실행
  const pythonProcess = spawn(pythonPath, [scriptPath, city]);

  let responseData = '';
  let errorMessage = '';

  pythonProcess.stdout.on('data', (data) => {
    responseData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorMessage += data.toString();
    console.error(`Python Error: ${data.toString()}`); // 오류 메시지 출력
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const parsedData = JSON.parse(responseData);
        res.status(200).json(parsedData);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse Python response' });
      }
    } else {
      res.status(500).json({ error: `Python Error: ${errorMessage}` });
    }
  });
});

// 채팅 문자열 요청 (기존 코드 유지)
app.post('/chat', (req, res) => {
  const sendedQuestion = req.body.question;
  const scriptPath = path.join(__dirname, 'bizchat.py');
  const pythonPath = 'python3'; // Python 가상환경을 사용하는 경우, 경로를 맞추세요

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
      res.status(500).json({ error: `Child process exited with code ${code}` });
    }
  });
});

// 서버 실행
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
