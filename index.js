const express = require('express');
const cors = require('cors');
const path = require('path');
const spawn = require('child_process').spawn;

const PORT = '8080'; // Node.js 서버는 8080번 포트에서 실행
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/weather', (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  // Python 스크립트 경로 설정
  const scriptPath = path.join(__dirname, 'Weather.py');
  const pythonPath =
    '/home/ubuntu/actions-runner/_work/task_back_cicd/task_back_cicd/venv/bin/python3'; // 가상환경의 Python 경로

  // Python 스크립트 실행
  const pythonProcess = spawn(pythonPath, [scriptPath, city]);

  let responseData = '';
  let errorMessage = '';

  pythonProcess.stdout.on('data', (data) => {
    responseData += data.toString();
    console.log(`Python stdout: ${data.toString()}`); // Python 표준 출력 로그 확인
  });

  pythonProcess.stderr.on('data', (data) => {
    errorMessage += data.toString();
    console.error(`Python stderr: ${data.toString()}`); // Python 에러 로그 확인
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Python response: ${responseData}`); // Python 응답 로그 출력
      try {
        const parsedData = JSON.parse(responseData);
        res.status(200).json(parsedData);
      } catch (error) {
        console.error(`Failed to parse JSON: ${error.message}`);
        res.status(500).json({ error: 'Failed to parse Python response' });
      }
    } else {
      res.status(500).json({ error: `Python Error: ${errorMessage}` });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
