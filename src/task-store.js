'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function createTaskStore(filePath) {
  function readTasks() {
    try {
      const tasks = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(tasks)) {
        throw new Error('Görev dosyası bir JSON dizisi olmalıdır.');
      }
      return tasks;
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  function saveTasks(tasks) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporaryPath, JSON.stringify(tasks, null, 2) + '\n', 'utf8');
      fs.renameSync(temporaryPath, filePath);
    } finally {
      fs.rmSync(temporaryPath, { force: true });
    }
  }

  return { readTasks, saveTasks };
}

module.exports = { createTaskStore };
