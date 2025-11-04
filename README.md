# Pinecone JS Nest

A library for defining request/response schemas and handling result responses in NestJS using Zod.

## Installation

```bash
npm install @pinecone-js/nest
```

## Usage

Example controller with input/output validation schemas:

```ts
import { Controller, Get } from '@nestjs/common';
import {
  RequestSchema,
  ResponseSchema,
  HttpResult,
  type HttpResponse,
} from '@pinecone-js/nest';
import { z } from 'zod';

const inputSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const outputSchema = z.object({
  name: z.string(),
  age: z.number(),
  success: z.boolean(),
});

@Controller('users')
export class UserController {
  @Get()
  @ResponseSchema(outputSchema)
  getUsers(
    @RequestSchema(inputSchema) input,
  ): HttpResponse<any> {
    return HttpResult.success({
      name: 'John Doe',
      age: 20,
      success: true,
    });
  }
}
```

## Exports

- `RequestSchema`, `ResponseSchema`: Decorators for validating schemas.
- `AppResult`, `HttpResult`: Helpers to format result responses.
- Works seamlessly with Zod for data validation.

## Build

npm run build && npm version patch && npm publish

## License

MIT

