import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupsController from './app/controllers/MeetupsController';
import RegistrationController from './app/controllers/RegistrationController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/meetups', MeetupsController.store);
routes.get('/meetups', MeetupsController.index);
routes.delete('/meetups/:id', MeetupsController.delete);

routes.post('/register/:meetupId', RegistrationController.store);
routes.get('/registrations', RegistrationController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
