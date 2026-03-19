const { version } = require('../../../package.json')
const config = require('../../../config/config')

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: config.project,
    version,
    description: `API Library for ${config.project} project`,
    license: {
      name: '',
      url: ''
    }
  },
  securityDefinitions: {
    security: [{ bearerAuth: [] }],
    bearerAuth: {
      type: 'string',
      name: 'x-access-token',
      scheme: 'bearer',
      in: 'headers'
    }
  },
  servers: [
    {
      url: `${config.localhost}:${config.port}/v1`
    }
  ]
}

module.exports = swaggerDef
