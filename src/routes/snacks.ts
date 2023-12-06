import { knex } from "../database"
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"

export async function snacksRoutes(app: FastifyInstance) {
  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getSnacksParamsSchema = z.object({
      id: z.string()
    })

    const { id } = getSnacksParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    const snack = await knex('snacks').where({ session_id: sessionId, id }).first()

    return { snack }
  })

  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies
    
    const snacks = await knex('snacks').where('session_id', sessionId).select()

    return { snacks }
  })

  app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const createSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      type: z.enum(['y', 'n']),
    })

    const { name, description, type } = createSnackBodySchema.parse(request.body)

    const { sessionId } = request.cookies

    await knex('snacks').insert({
      id: randomUUID(),
      name,
      description,
      type,
      session_id: sessionId
    })

    reply.status(201).send()
  })

  app.put('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const getSnackParamsSchema = z.object({
      id: z.string()
    })

    const { id } = getSnackParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    const updateSnackBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      type: z.enum(['y', 'n']),
    })

    const { name, description, type } = updateSnackBodySchema.parse(request.body)

    await knex('snacks').where({ session_id: sessionId, id }).update({
      name,
      description,
      type,
    })

    return reply.status(204).send()
  })

  app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const getSnackParamsSchema = z.object({
      id: z.string()
    })

    const { id } = getSnackParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    await knex('snacks').where({ session_id: sessionId, id }).delete()

    return reply.status(204).send()
  })
}