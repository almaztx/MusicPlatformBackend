import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export function setupSwagger(app) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Music Platform API",
        version: "1.0.0",
        description: "API documentation for Music Platform project",
      },
      servers: [{ url: "http://localhost:3000" }],
    },
    apis: ["./src/routes/*.js"],
  };

  const specs = swaggerJsdoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}
