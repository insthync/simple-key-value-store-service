import fastify from 'fastify'
import authPlugin from 'fastify-auth'
import bearerAuthPlugin from 'fastify-bearer-auth'
import { Entry, PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import functions from './functions'

const prisma = new PrismaClient()
dotenv.config()

const secretKeys: string = process.env['SECRET_KEYS']!

const server = fastify()
    .register(authPlugin)
    .register(bearerAuthPlugin, {
        keys: JSON.parse(secretKeys),
        addHook: false,
    })
    .after(() => {

        server.get('/:ownerId', async (request, reply) => {
            const params : any = request.params
            const ownerId = params.ownerId
            const entries = await prisma.entry.findMany({
                where: {
                    ownerId: ownerId
                },
                orderBy: [{
                    key: 'asc'
                }]
            })
            reply.code(200).send(entries)
        })

        server.get('/:ownerId/:key', async (request, reply) => {
            const params : any = request.params
            const ownerId = params.ownerId
            const key = params.key
            const entry = await prisma.entry.findFirst({
                where: {
                    ownerId: ownerId,
                    key: key
                }
            })
            reply.code(200).send(entry)
        })

        server.get('/ranking/:key', async (request, reply) => {
            const params : any = request.params
            const key = params.key
            const query : any = request.query
            const orderType = query.orderType !== undefined ? query.orderType : 'desc'
            const skip = query.skip !== undefined ? query.skip : 0
            const take = query.take !== undefined ? query.take : 50
            const entries = await prisma.entry.findMany({
                where: {
                    ownerId: key
                },
                orderBy: [{
                    value: orderType
                }],
                skip: skip,
                take: take
            })
            reply.code(200).send(entries)
        })

        server.post('/', {
            preHandler: server.auth([
                server.verifyBearerAuth!
            ]),
        }, async (request, reply) => {
            // Create or set value 
            const body : any = request.body
            const ownerId = body.ownerId
            const key = body.key
            const value = body.value
            const entry = await functions.postValue(prisma, ownerId, key, value)
            reply.code(200).send(entry)
        })

        server.post('/bulk', {
            preHandler: server.auth([
                server.verifyBearerAuth!
            ]),
        }, async (request, reply) => {
            // Create or set value 
            const body : any = request.body
            let entries : Entry[] = []
            for (let i = 0; i < body.length; ++i) {
                const ownerId = body[i].ownerId
                const key = body[i].key
                const value = body[i].value
                entries.push(await functions.postValue(prisma, ownerId, key, value))
            }
            reply.code(200).send(entries)
        })

        server.patch('/', {
            preHandler: server.auth([
                server.verifyBearerAuth!
            ]),
        }, async (request, reply) => {
            // Increase value if value type is numeric, set value if value type is string
            const body : any = request.body
            const ownerId = body.ownerId
            const key = body.key
            const value = body.value
            const entry = await functions.patchValue(prisma, ownerId, key, value)
            reply.code(200).send(entry)
        })

        server.patch('/bulk', {
            preHandler: server.auth([
                server.verifyBearerAuth!
            ]),
        }, async (request, reply) => {
            // Create or set value 
            const body : any = request.body
            let entries : Entry[] = []
            for (let i = 0; i < body.length; ++i) {
                const ownerId = body[i].ownerId
                const key = body[i].key
                const value = body[i].value
                entries.push(await functions.patchValue(prisma, ownerId, key, value))
            }
            reply.code(200).send(entries)
        })

        server.delete('/:ownerId/:key', {
            preHandler: server.auth([
                server.verifyBearerAuth!
            ]),
        }, async (request, reply) => {
            // Delete value
            const params : any = request.params
            const ownerId = params.ownerId
            const key = params.key
            await prisma.entry.deleteMany({
                where: {
                    ownerId: ownerId,
                    key: key
                }
            })
            reply.code(200).send()
        })
    })


server.listen(Number(process.env['PORT']), String(process.env['ADDRESS']), (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})