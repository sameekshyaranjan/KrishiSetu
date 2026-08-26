const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KrishiSetu API Documentation',
      version: '1.0.0',
      description: 'API documentation for the KrishiSetu B2B AgriTech Marketplace Backend, covering Authentication, Farmers, Traders, Crop Listings, Bidding, Escrow Transactions, Mandi Prices, and Admin Operations.',
      contact: {
        name: 'KrishiSetu Engineering Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server (v1)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;
