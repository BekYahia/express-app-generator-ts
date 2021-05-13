import { Request, Response, NextFunction } from 'express'
import RequestValidator from './validation'
import winston from 'winston'
import jwt from 'jsonwebtoken'
import config from '../config'


export function error(err: any, _req: Request, res: Response, _next: NextFunction) {
	winston.error(err.message, err)
	return res.status(500).json('Sorry, Something went wrong!').end()
}

export function admin(req: any, res: Response, next: NextFunction) {
	if(req.user.role !== 'admin') return res.status(403).json('Admins Only!')
	next()
}


export function auth(req: any, res: Response, next: NextFunction) {
	const token = req.header('x-auth-token')
	if (!token) return res.status(401).json('Access denied, no provided token!')

	try {
		const decoded = jwt.verify(token, config.jwt_key as string)
		req.user = decoded
		next()
	} catch (ex) {
		res.status(400).json('Invalid token!')
	}
}


export {RequestValidator}