import User from '../models/user'
import request from 'supertest'
import { app } from '..'
import { closeServer } from '../app/server'

describe('Users', () => {

	afterEach( async () => {
		await User.destroy({ where: {} })
		closeServer()
	})

	const user = {
		name: 'John Doe',
		email: "j@doe.com",
		password: "1234"
	}

	describe('GET /api/users', () => {
		it('get all users', async() => {
			const res = await request(app).get('/api/users')
			expect(res.status).toBe(200)
			expect(Array.isArray(res.body)).toBe(true)
		})
	})


	describe('POST /api/users', () => {

		it('create new user', async () => {
			const res = await request(app).post('/api/users').send(user)

			expect(res.status).toBe(200)
			expect(res.body.name).toBe('John Doe')
		})

		it('shouldn\'t create new user, email already used', async () => {

			await request(app).post('/api/users').send(user)
			const res = await request(app).post('/api/users').send(user)

			expect(res.status).toBe(400)
			expect(res.body).toBe('Email already been used!')
		})

		it('shouldn\'t create new user, missing fields', async () => {
			const res = await request(app).post('/api/users').send({})
			expect(res.status).toBe(400)
			expect(res.body._original).toBeTruthy()
		})
	})


	describe('GET /api/users/:id', () => {

		it('get user', async () => {
			const usr = await request(app).post('/api/users').send(user)
			const res = await request(app).get(`/api/users/${usr.body.id}`)

			expect(res.status).toBe(200)
			expect(res.body.name).toBe('John Doe')
		})

		it('should\'t get user, invalid id', async () => {
			const res = await request(app).get('/api/users/a4')
			expect(res.status).toBe(400)
			expect(res.body._original.id).toBe('a4')
		})
	})


	describe('PUT /api/users/:id', () => {

		it('update user', async () => {
			const usr = await request(app).post('/api/users').send(user)
			const res = await request(app).put(`/api/users/${usr.body.id}`).send({name: 'JD', password: '1111'})

			expect(res.status).toBe(200)
			expect(res.body.name).toBe('JD')
		})

		it('shouldn\'t update user, no user with this ID', async () => {
			const usr = await request(app).post('/api/users').send(user)
			const res = await request(app).put('/api/users/2').send({name: 'JD'})

			expect(res.status).toBe(404)
			expect(res.body).toBe('No user found')
		})

		it('shouldn\'t update user, email already used', async () => {
			const user2 = {
				name: 'Peter Parker',
				email: 'p@parker.com',
				password: '1234'
			}
			const usr = await request(app).post('/api/users').send(user)
			const usr2 = await request(app).post('/api/users').send(user2)
			const res = await request(app).put(`/api/users/${usr.body.id}`).send({email: 'p@parker.com'})

			expect(res.status).toBe(400)
			expect(res.body).toBe('Email already been used!')
		})

		it('should\'t update user, no data provided', async () => {
			const usr = await request(app).post('/api/users').send(user)
			const res = await request(app).put(`/api/users/${usr.body.id}`).send({})

			expect(res.status).toBe(200)
			expect(res.body.name).toBe('John Doe')
		})

		it('should\'t update user, invalid fields', async () => {
			const usr = await request(app).post('/api/users').send(user)
			const res = await request(app).put(`/api/users/${usr.body.id}`).send({email: 'saff'})

			expect(res.status).toBe(400)
			expect(res.body._original).toBeTruthy()
		})

		it('should\'t update user, invalid id', async () => {
			const res = await request(app).put('/api/users/a4').send({name: 'JD'})
			expect(res.status).toBe(400)
			expect(res.body._original.id).toBe('a4')
		})
	})


	describe('DELETE /api/users/:id', () => {

		it('delete user', async () => {
			const usr = await request(app).post('/api/users').send(user)
			const res = await request(app).delete(`/api/users/${usr.body.id}`)

			expect(res.status).toBe(200)
			expect(res.body.del).toBe(1)
		})

		it('should\'t delete user, invalid id', async () => {
			const res = await request(app).delete('/api/users/a4')
			expect(res.status).toBe(400)
			expect(res.body._original.id).toBe('a4')
		})
	})


	describe('POST /api/users/me check user authenticity', () => {

		it('valid user', async () => {

			let newUsr = await request(app).post('/api/users').send(user)
			let usr = await User.findByPk(newUsr.body.id)
			const token = await usr!.getJwt()
			const res = await request(app).get('/api/users/me').set('x-auth-token', token)

			expect(res.status).toBe(200)
			expect(res.body.name).toBe('John Doe')
		})

		it('invalid user, no provided token', async () => {
			const res = await request(app).get('/api/users/me')
			expect(res.status).toBe(401)
			expect(res.body).toBe('Access denied, no provided token!')
		})

		it('invalid user, invalid token', async () => {
			const res = await request(app).get('/api/users/me').set('x-auth-token', 'IamNotaToken')
			expect(res.status).toBe(400)
			expect(res.body).toBe('Invalid token!')
		})
	})


	describe('POST /api/users/login', () => {

		it('login successfully', async () => {
			const usr = await request(app).post('/api/users').send(user)
			const res = await request(app).post('/api/users/login').send({ email: 'j@doe.com', password: '1234' })

			expect(res.status).toBe(200)
			expect(res.header['x-auth-token']).toBeTruthy()
		})

		it('missing/invalid fields', async () => {
			const res = await request(app).post('/api/users/login').send({ email: 'notEmail' })
			expect(res.status).toBe(400)
			expect(res.body._original).toBeTruthy()
		})

		it('invalid credentionals', async () => {
			const res = await request(app).post('/api/users/login').send({ email: 'j@doe.com', password: '1233' })
			expect(res.status).toBe(400)
			expect(res.body).toBe('Invalid Email or Password!')
		})
	})
})