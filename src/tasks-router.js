'use strict';

const express = require('express');
const { randomUUID } = require('node:crypto');

const statuses = ['pending', 'in_progress', 'completed'];
const priorities = ['low', 'medium', 'high'];

function parseTask(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'JSON nesnesi gönderilmelidir.' };
  }
  const { title, description = '', assignee = '', status = 'pending', priority = 'medium' } = body;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) {
    return { error: 'Başlık 1 ile 120 karakter arasında olmalıdır.' };
  }
  if (typeof description !== 'string' || description.length > 1000) {
    return { error: 'Açıklama en fazla 1000 karakterlik metin olmalıdır.' };
  }
  if (typeof assignee !== 'string' || assignee.length > 80) {
    return { error: 'Görev sahibi en fazla 80 karakterlik metin olmalıdır.' };
  }
  if (!statuses.includes(status)) {
    return { error: 'Durum pending, in_progress veya completed olmalıdır.' };
  }
  if (!priorities.includes(priority)) {
    return { error: 'Öncelik low, medium veya high olmalıdır.' };
  }
  return { task: { title: title.trim(), description: description.trim(), assignee: assignee.trim(), status, priority } };
}

function createTasksRouter(store) {
  const router = express.Router();

  router.get('/', (_request, response) => {
    response.json(store.readTasks());
  });
  router.post('/', (request, response) => {
    const { task, error } = parseTask(request.body);
    if (error) return response.status(400).json({ error });

    const now = new Date().toISOString();
    const createdTask = { id: randomUUID(), ...task, createdAt: now, updatedAt: now };
    store.saveTasks([...store.readTasks(), createdTask]);
    return response.location(`/tasks/${createdTask.id}`).status(201).json(createdTask);
  });

  router.param('id', (_request, response, next, id) => {
    const tasks = store.readTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) {
      return response.status(404).json({ error: 'Görev bulunamadı.' });
    }
    response.locals.tasks = tasks;
    response.locals.taskIndex = index;
    return next();
  });

  router.get('/:id', (_request, response) => {
    const { tasks, taskIndex } = response.locals;
    response.json(tasks[taskIndex]);
  });
  router.put('/:id', (request, response) => {
    const { task, error } = parseTask(request.body);
    if (error) return response.status(400).json({ error });

    const { tasks, taskIndex } = response.locals;
    tasks[taskIndex] = { ...tasks[taskIndex], ...task, updatedAt: new Date().toISOString() };
    store.saveTasks(tasks);
    return response.json(tasks[taskIndex]);
  });
  router.delete('/:id', (_request, response) => {
    const { tasks, taskIndex } = response.locals;
    tasks.splice(taskIndex, 1);
    store.saveTasks(tasks);
    response.status(204).end();
  });

  return router;
}

module.exports = { createTasksRouter };
