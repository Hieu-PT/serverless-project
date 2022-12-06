import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// ##TODO: Implement businessLogic

const logger = createLogger('businessLogic-todos')

const todosAccess = new TodosAccess()


export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
  const createdAt = new Date().toISOString()  
  const todoId = uuid.v4()
  let newItem: TodoItem = {userId, todoId, createdAt, done: false, ...newTodo, attachmentUrl: ''}
  logger.info('call todos.createTodo: ' + newItem);
  return await todosAccess.createTodo(newItem)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoUpdate> {
  let todoUpdate: TodoUpdate = {...updatedTodo}
  logger.info('call todos.updateTodo: ' + userId + "," + todoId + "," + todoUpdate);
  return todosAccess.updateTodo(userId, todoId, todoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info('call todos.createTodo: ' + userId + "," + todoId);
  return todosAccess.deleteTodo(userId, todoId)
    
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('call todos.getTodosForUser: ' + userId);
  return todosAccess.getTodosForUser(userId)
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<string> {
  logger.info('call todos.updateTodo: ' + userId + "," + todoId + "," + attachmentUrl);
  return todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}
