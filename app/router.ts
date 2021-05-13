import { urlencoded, json } from 'express'
import 'express-async-errors' // bare import
import { app } from '..'
import  { error }  from '../middlewares'
import users from '../routes/users.route'

export function router(): void {

	app.use(urlencoded({ extended: true }))
	app.use(json())

	app.use('/api/users', users)
	// ...routes
	app.use(error)
}