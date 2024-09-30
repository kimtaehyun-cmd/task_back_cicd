const express = require('express'); // express 모듈 불러오기
const cors = require('cors'); // cors 모듈 불러오기
const PORT = '8080';
const path = require('path');
const spawn = require('child_process').spawn;

const app = express(); // express 모듈을 사용하기 위해 app 변수에 할당한다.

// const corsOptions = {
//   origin: 'http://localhost:3000', // 허용할 주소
//   credentials: true, // 인증 정보 허용
// };

// const corsOption2 = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors()); // http, https 프로토콜을 사용하는 서버 간의 통신을 허용한다.
app.use(express.json()); // express 모듈의 json() 메소드를 사용한다.

app.get('/', (request, response) => {
  response.send('hello World https test completed');
});

// app.get('/get_tasks', async (req, res) => {
//   try {
//     const result = await database.query('SELECT * FROM task');
//     return res.status(200).json(result.rows);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

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
      // console.log(data.toString());
      // res.status(200).json({ answer: data.toString() });
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

app.use(require('./routes/getRoutes'));
app.use(require('./routes/postRoutes'));
app.use(require('./routes/deleteRoutes'));
app.use(require('./routes/updateRoutes'));

app.listen(PORT, () => console.log(`Server is running on ${PORT}`)); // 서버 실행 시 메시지

// ----------------------------------------------------------------------------
// const express = require('express');
// const { spawn } = require('child_process');
// const path = require('path');
// const bodyParser = require('body-parser');

// // console.log(path.join(__dirname)); 루트 경로 확인

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
