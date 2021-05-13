import express from 'express'
const app = express()
import { router, startServer, logging } from './app'

logging()
router()
startServer()

export {app}