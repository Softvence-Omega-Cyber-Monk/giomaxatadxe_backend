
export const notificationSwaggerDocs = {
    "/api/notification/create": {
        post: {
            tags: ["notification"],
            summary: "notification create",
            description: "This is auto generated notification create API",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name"],
                            properties: {
                                name: { type: "string", example: "John Doe" }
                            }
                        }
                    }
                }
            },
            responses: {
                201: { description: "notification created successfully" },
                400: { description: "Validation error" }
            }
        }
    },
  }


