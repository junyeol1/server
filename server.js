const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const mysql = require('mysql');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// 데이터베이스 연결
const connection = mysql.createConnection({
  host: 'localhost', // 127.0.0.1
  user: 'sangjin', 
  password: 'sangjin', 
  port: '3306',
  database: 'carpooltaxi',
});


// /api/login get 요청부분 수정
// 아이디 비밀번호 입력시 post 요청으로 보내어 아이디는 존재하는지, 비밀번호는 일치한지 확인
app.post('/api/login', (req, res) => {
  const { userId, password: pw } = req.body;

  connection.query(
    'SELECT * FROM users WHERE userId = ?',
    [userId],
    (err, results, field) => {
      if (!results[0]) {
        return res.status(400).send('아이디가 존재하지 않습니다.');
      }

      if (results[0].password !== pw) {
        return res.status(400).send('비밀번호가 일치하지 않습니다.');
      }

      // 아이디와 비밀번호를 제외하고 프론트로 전송
      const { userId, password, ...restResults } = results[0];

      return res.send(restResults);
    }
  );
});

// 회원가입 할 때 ID 중복확인용
app.get('/api/signup/userId', (req, res) => {
  connection.query('SELECT userId FROM users', function (err, rows, fields) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(rows);
  });
});

// 회원가입 입력 정보를 post요청으로 보냄. 
app.post('/api/signup', async (req, res) => {
  const { userId, password, name, birthDate, email, phoneNum, major, sex } =
    req.body;

  // 아이디 중복확인 후 회원가입 처리
  connection.query(
    'SELECT userId FROM users WHERE userId = ?',
    [userId],
    (err, results, field) => {
      if (results[0]) {
        return res.status(400).send('이미 존재하는 아이디입니다.');
      }

      const sql = 'INSERT INTO users VALUES (?,?,?,?,?,?,?,?)';

      const params = [
        userId,
        password,
        name,
        birthDate,
        email,
        phoneNum,
        major,
        sex,
      ];
      connection.query(sql, params, (err, results, fields) => {
        res.sendStatus(201); 
      });
    }
  );
});

// carpool

// 전체 게시물 조회
app.get('/api/carpoolboard', (req, res) => {
  connection.query(
    'SELECT * FROM carpoolBoard',
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
      console.log(rows);
    }
  );
});

// 자신의 게시물 조회
app.get('/api/carpoolboard/:writer', (req, res) => {
  connection.query(
    'SELECT * FROM carpoolBoard WHERE writer = ?',
    req.params.writer,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
    }
  );
});

// 해당 게시물 동승자 조회
app.get('/api/carpoolpassenger/:boardId', (req, res) => {
  connection.query(
    'SELECT * FROM carpoolPassenger WHERE boardId=?',
    req.params.boardId,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
    }
  );
});

// 게시물 추가
app.post('/api/carpoolboard', (req, res) => {
  let sql =
    'INSERT INTO carpoolBoard VALUES (null,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  let title = req.body.title;
  let writer = req.body.writer;

  let startProvince = req.body.startProvince;
  let startCity = req.body.startCity;
  let startDetail = req.body.startDetail;

  let arrivalProvince = req.body.arrivalProvince;
  let arrivalCity = req.body.arrivalCity;
  let arrivalDetail = req.body.arrivalDetail;

  let date = req.body.date;
  let time = req.body.time;

  let driver = req.body.driver;
  let maxPassenger = req.body.maxPassenger;
  let car = req.body.car;

  let content = req.body.content;

  let params = [
    title,
    writer,
    startProvince,
    startCity,
    startDetail,
    arrivalProvince,
    arrivalCity,
    arrivalDetail,
    date,
    time,
    driver,
    maxPassenger,
    car,
    content,
  ];
  console.log(req.body);
  connection.query(sql, params, (err, rows, fields) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(rows);
  });
});

// 게시글 동승자 추가
app.post('/api/carpoolpassenger', (req, res) => {
  let sql = 'INSERT INTO carpoolPassenger VALUES (?,?,?)';
  let boarduserId = req.body.boarduserId;
  let boardId = req.body.boardId;
  let userId = req.body.userId;

  let params = [boarduserId, boardId, userId];
  connection.query(sql, params, function (error, rows, field) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(rows);
  });
});

// 게시글 삭제
app.delete('/api/carpoolboard/:boardId', (req, res) => {
  console.log(req.params.boardId);
  connection.query(
    'DELETE FROM carpoolBoard WHERE boardId = ?',
    req.params.boardId,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
      console.log(rows);
    }
  );
});

// 게시글 동승자 삭제
app.delete('/api/carpoolboard/:boarduserId', (req, res) => {
  console.log(req.params.boarduserId);
  connection.query(
    'DELETE FROM carpoolPassenger WHERE boarduserId = ?',
    req.params.boarduserId,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
      console.log(rows);
    }
  );
});

// 택시 (driver, car 제외하고 구현하면 됨, 그리고 신청할 때 무조건 동승자임)

// 전체 게시물 조회
app.get('/api/taxiboard', (req, res) => {
  connection.query('SELECT * FROM taxiBoard', function (error, rows, fields) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(rows);
    console.log(rows);
  });
});

// 자신의 게시물 조회
app.get('/api/taxiboard/:writer', (req, res) => {
  connection.query(
    'SELECT * FROM taxiBoard WHERE writer = ?',
    req.params.writer,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
    }
  );
});

// 해당 게시물 동승자 조회
app.get('/api/taxipassenger/:boardId', (req, res) => {
  connection.query(
    'SELECT * FROM taxiPassenger WHERE boardId=?',
    req.params.boardId,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
    }
  );
});

// 게시물 추가
app.post('/api/taxiboard', (req, res) => {
  let sql = 'INSERT INTO taxiBoard VALUES (null,?,?,?,?,?,?,?,?,?,?,?,?)';
  let title = req.body.title;
  let writer = req.body.writer;

  let startProvince = req.body.startProvince;
  let startCity = req.body.startCity;
  let startDetail = req.body.startDetail;

  let arrivalProvince = req.body.arrivalProvince;
  let arrivalCity = req.body.arrivalCity;
  let arrivalDetail = req.body.arrivalDetail;

  let date = req.body.date;
  let time = req.body.time;

  let maxPassenger = req.body.maxPassenger;

  let content = req.body.content;

  let params = [
    title,
    writer,
    startProvince,
    startCity,
    startDetail,
    arrivalProvince,
    arrivalCity,
    arrivalDetail,
    date,
    time,
    maxPassenger,
    content,
  ];
  console.log(req.body);
  connection.query(sql, params, (err, rows, fields) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(rows);
  });
});

// 게시글 동승자 추가
app.post('/api/taxipassenger', (req, res) => {
  let sql = 'INSERT INTO taxiPassenger VALUES (?,?,?)';
  let boarduserId = req.body.boarduserId;
  let boardId = req.body.boardId;
  let userId = req.body.userId;

  let params = [boarduserId, boardId, userId];
  connection.query(sql, params, function (error, rows, field) {
    res.header('Access-Control-Allow-Origin', '*');
    res.send(rows);
  });
});

// 게시글 삭제
app.delete('/api/taxiboard/:boardId', (req, res) => {
  console.log(req.params.boardId);
  connection.query(
    'DELETE FROM taxiBoard WHERE boardId = ?',
    req.params.boardId,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
      console.log(rows);
    }
  );
});

// 게시글 동승자 삭제
app.delete('/api/taxiboard/:boarduserId', (req, res) => {
  console.log(req.params.boarduserId);
  connection.query(
    'DELETE FROM taxiPassenger WHERE boarduserId = ?',
    req.params.boarduserId,
    function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send(rows);
      console.log(rows);
    }
  );
});

app.listen(port, (req, res) => {
  console.log("서버 작동");
});
