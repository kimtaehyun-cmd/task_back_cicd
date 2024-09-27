// const express = require('express'); // express 모듈 불러오기
const cors = require('cors'); // cors 모듈 불러오기
// const PORT = '8080';

// const app = express(); // express 모듈을 사용하기 위해 app 변수에 할당한다.

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

app.use(require('./routes/getRoutes'));
app.use(require('./routes/postRoutes'));
app.use(require('./routes/deleteRoutes'));
app.use(require('./routes/updateRoutes'));

// app.listen(PORT, () => console.log(`Server is running on ${PORT}`)); // 서버 실행 시 메시지

// ----------------------------------------------------------------------------
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');

// console.log(path.join(__dirname)); 루트 경로 확인

const app = express();
const port = 8000;
app.use(bodyParser.json());

app.post('/chat', (req, res) => {
  const sendQuestion = req.body.question;
  const execPython = path.join(__dirname, 'chat', 'bizchat.py');
  const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3');

  const net = spawn(pythonPath, [execPython, sendQuestion]);

  output = '';

  //파이썬 파일 수행 결과를 받아온다
  net.stdout.on('data', function (data) {
    output += data.toString();
  });

  net.on('close', (code) => {
    if (code === 0) {
      res.status(200).json({ answer: output });
    } else {
      res.status(500).send('Something went wrong');
    }
  });

  net.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.listen(port, () => {
  console.log('Server is running on port 8000');
});
