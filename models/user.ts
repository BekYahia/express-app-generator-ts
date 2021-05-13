import { Model, DataTypes, Optional } from 'sequelize'
import { sequelize }  from '.'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../config'
import { omit } from 'lodash'

// We recommend you declare an interface for the attributes, for stricter typechecking
type roleType = 'user' | 'admin'
interface UserAttributes {
  id?: number
  name: string
  email: string
  password: string
  role?: roleType
}

// Some fields are optional when calling UserModel.create() or UserModel.build()
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
	public id!: number	//Note that the `null assertion` `!` is required in strict mode.
	public name!: string
	public email!: string
	public password!: string
	public role!: roleType

	public readonly createdAt!: Date
	public readonly updatedAt!: Date

	static hashPwd: (password: string) => Promise<string>

	verifyPass!: (password: string) => Promise<boolean>
	getJwt!: () => string
	dataValues!: () => User
	dropPwd!: () => Partial<User>
}

User.init (
	{
		name: DataTypes.STRING,
		password: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		role: {
			type: DataTypes.TEXT,
			defaultValue: 'user',
		}
	},
	{
		tableName: 'Users',
		sequelize
	}
)

// built-in
User.beforeCreate(async (user, options) => {
	user.password = await User.hashPwd(user.password)
	user.email = user.email.toLowerCase()
})

User.beforeUpdate(async (user: any, options) => {
	user.email = user.email.toLowerCase()

	if (user._previousDataValues.password != user.password) {
		user.password = await User.hashPwd(user.password)
	}
})


User.hashPwd = async(password) => {
	const salt = await bcrypt.genSalt(10)
	return bcrypt.hash(password, salt)
}

User.prototype.verifyPass = function (password) {
	return bcrypt.compare(password, this.password)
}

User.prototype.dropPwd = function() {
	return omit(this.dataValues, ['password'])
}

User.prototype.getJwt = function () {
	const payload = {
		id: this.id,
		email: this.email,
		role: this.role
	}
	return jwt.sign(payload, config.jwt_key as string)
}

export default User