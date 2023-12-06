import fastify from 'fastify'
import { env } from './env'
import { usersRoutes } from './routes/users'
import cookie from '@fastify/cookie'
import { snacksRoutes } from './routes/snacks'

const app = fastify()

app.register(cookie)
app.register(usersRoutes, {
  prefix: 'users'
})

app.register(snacksRoutes, {
  prefix: 'snacks'
})

app.listen({
  port: env.PORT
}).then(() => {
  console.log('HTTP Server Running.')
})
