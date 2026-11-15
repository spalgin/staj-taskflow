'use strict';

const express = require('express');
const path = require('node:path');
const { createTasksRouter } = require('./tasks-router');
const { createTaskStore } = require('./task-store');

const app = express();
const port = Number(process.env.PORT || 3000);
const taskFile = process.env.TASKFLOW_DATA_FILE
  || path.join(__dirname, '..', 'data', 'tasks.json');

app.use((request, _response, next) => {
  console.log(`${new Date().toISOString()} ${request.method} ${request.path}`);
  next();
});
app.use(express.json({ limit: '32kb' }));
app.use('/tasks', createTasksRouter(createTaskStore(taskFile)));

app.use((_request, response) => {
  response.status(404).json({ error: 'Uç nokta bulunamadı.' });
});
app.use((error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'İstek gövdesindeki JSON geçersiz.' });
    return;
  }
  if (error.type === 'entity.too.large') {
    response.status(413).json({ error: 'İstek gövdesi çok büyük.' });
    return;
  }
  console.error(error);
  response.status(500).json({ error: 'İşlem sırasında sunucu hatası oluştu.' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`TaskFlow çalışıyor: http://127.0.0.1:${port}`);
});
