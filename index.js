const express = require('express'); // express 모듈 불러오기
const cors = require('cors'); // cors 모듈 불러오기
const axios = require('axios'); // Axios를 사용하여 Flask 서버 호출
const PORT = '8080';
const path = require('path');
const spawn = require('child_process').spawn;

const app = express(); // express 모듈을 사용하기 위해 app 변수에 할당한다.

app.use(cors()); // http, https 프로토콜을 사용하는 서버 간의 통신을 허용한다.
app.use(express.json()); // express 모듈의 json() 메소드를 사용한다.

app.get('/', (request, response) => {
  response.send('hello World https test completed');
});

// Node.js에서 Flask 서버의 날씨 API 호출
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city || 'Seoul'; // 기본적으로 서울의 날씨 요청
    const response = await axios.get(
      `http://localhost:8000/weather?city=${city}`
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch weather data from Flask server' });
  }
});

// 채팅 문자열 요청
app.post('/chat', (req, res) => {
  try {
    const sendedQuestion = req.body.question;

    // EC2 서버에서 현재 실행 중인 Node.js 파일의 절대 경로를 기준으로 설정.
    const scriptPath = path.join(__dirname, 'bizchat.py');

    // ec2 서버에서 실행하는 절대 경로: 개발 테스트 시 사용 불가(mac)
    const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3');

    // 윈도우 개발 테스트 시 사용하는 절대 경로
    // const pythonPath = path.join(__dirname, 'venv', 'Scripts', 'python.exe');

    // Spawn the Python process with the correct argument
    const result = spawn(pythonPath, [scriptPath, sendedQuestion]);
    let responseData = '';

    // Listen for data from the Python script
    result.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    // Listen for errors from the Python script
    result.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      res.status(500).json({ error: data.toString() });
    });

    // Handle the close event of the child process
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
    return res.status(500).json({ error: error.message });
  }
});

// 라우트 설정
app.use(require('./routes/getRoutes'));
app.use(require('./routes/postRoutes'));
app.use(require('./routes/deleteRoutes'));
app.use(require('./routes/updateRoutes'));

app.listen(PORT, () => console.log(`Server is running on ${PORT}`)); // 서버 실행 시 메시지

// ----------------------------------------------------------------------------
// 기존 코드에서 테스트 및 사용 중지된 부분
// const express = require('express');
// const { spawn } = require('child_process');
// const path = require('path');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 8000;
// app.use(bodyParser.json());

// app.post('/chat', (req, res) => {
//   const sendQuestion = req.body.question;
//   const execPython = path.join(__dirname, 'chat', 'bizchat.py');
//   const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3');

//   const net = spawn(pythonPath, [execPython, sendQuestion]);

//   output = '';

//   //파이썬 파일 수행 결과를 받아온다
//   net.stdout.on('data', function (data) {
//     output += data.toString();
//   });

//   net.on('close', (code) => {
//     if (code === 0) {
//       res.status(200).json({ answer: output });
//     } else {
//       res.status(500).send('Something went wrong');
//     }
//   });

//   net.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//   });
// });

// app.listen(port, () => {
//   console.log('Server is running on port 8000');
// });
