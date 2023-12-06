import { knex } from "../database"
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

export async function usersRoutes(app: FastifyInstance) {
  app.get('/summary', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const { sessionId } = request.cookies

    const totalSnacks = (await knex('snacks').where('session_id', sessionId)).length

    const offDiet = (await knex('snacks').where({ session_id: sessionId, type: 'n' })).length

    const onDiet = (await knex('snacks').where({ session_id: sessionId, type: 'y' })).length

    const sequence = (await knex('snacks').where('session_id', sessionId)).findIndex((snack) => snack.type === 'n') // review (wrong)

    reply.status(200).send({
      total: totalSnacks,
      offDiet,
      onDiet,
      bestSequence: sequence
    })
  })

  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
    })

    const { username } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId
    
    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      username,
      session_id: sessionId
    })

    return reply.status(201).send()
  })
}