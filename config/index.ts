if(process.env.NODE_ENV !== 'production')
    require('dotenv').config()


export default {

	node_env: process.env.NODE_ENV,
	jwt_key: process.env.EXPRESS_APP_JWT_KEY,

}