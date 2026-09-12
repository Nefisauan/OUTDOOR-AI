import { BadRequestException } from "@nestjs/common";
import { fieldErrors, z } from "@outdoor-ai/shared";
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new BadRequestException({
      message: "Validation failed",
      fields: fieldErrors(result.error),
    });
  return result.data;
}
