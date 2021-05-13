import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'

export = {

	id(req: Request, res: Response, next: NextFunction) {

		const schema = Joi.object({ id: Joi.number() })

		const { error } = schema.validate(req.params)
		if (error) return res.status(400).send(error)

		next()
	},


	create(req: Request, res: Response, next: NextFunction) {

		const schema = Joi.object({
			name: Joi.string().trim().required(),
			email: Joi.string().lowercase().email().required(),
			password: Joi.string().min(4).required(),
			role: Joi.string().trim()
		})

		const { error } = schema.validate(req.body, { abortEarly: true})
		if (error) return res.status(400).json(error)
		
		next()
	},


	update(req: Request, res: Response, next: NextFunction) {

		const schema = Joi.object({
			id: Joi.number().required(),
			name: Joi.string().trim(),
			email: Joi.string().lowercase().email(),
			password: Joi.string().min(4),
			role: Joi.string().trim()
		})

		const { error } = schema.validate({ ...req.body, ...req.params }, { abortEarly: false, allowUnknown: true })
		if (error) return res.status(400).send(error)

		next()
	},

	
	login(req: Request, res: Response, next: NextFunction) {

		const schema = Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().min(4).required()
		})

		const { error } = schema.validate(req.body, { abortEarly: false })
		if (error) return res.status(400).send(error)

		next()
	}
}