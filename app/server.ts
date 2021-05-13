import { app } from '..'
import { createServer } from 'http'

const srv = createServer(app)
const PORT = process.env.PORT || 3000

export function startServer(): void {

	srv.listen(PORT, () => {
		console.log(`Listing on port ${PORT}`)
	})
}

export function closeServer(): void {
	srv.close()
}