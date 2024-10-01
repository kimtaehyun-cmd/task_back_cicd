const express = require('express');
const cors = require('cors');
const path = require('path');
const spawn = require('child_process').spawn;

const PORT = '8080'; // Node.js 서버는 8080번 포트에서 실행
const app = express();

app.use(cors());
app.use(express.json());

// 기본 테스트용 라우트
app.get('/', (req, res) => {
  res.send('Hello World! Server is running on pythont.aiprojectt.com');
});

// /api/weather 엔드포인트 - POST 요청
app.post('/api/weather', (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  // Python 스크립트 경로 설정
  const scriptPath = path.join(__dirname, 'Weather.py'); // 대소문자 구분
  const pythonPath =
    '/home/ubuntu/actions-runner/_work/task_back_cicd/task_back_cicd/venv/bin/python3'; // 가상환경의 Python 경로

  // Python 스크립트 실행
  const pythonProcess = spawn(pythonPath, [scriptPath, city]);

  let responseData = '';
  let errorMessage = '';

  pythonProcess.stdout.on('data', (data) => {
    responseData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorMessage += data.toString();
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

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
