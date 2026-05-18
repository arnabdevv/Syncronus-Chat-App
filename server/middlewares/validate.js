/**
 * validate(schema, source?)
 * Express middleware factory that validates request data against a Zod schema.
 * @param {ZodSchema} schema  - The Zod schema to validate against.
 * @param {"body"|"query"} source - Which part of the request to validate (default: "body").
 * Returns 400 with field-level error details on failure.
 */
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  // Replace the validated source with the parsed (and coerced) data
  req[source] = result.data;
  next();
};
