export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
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

    req.validated = {
      ...(req.validated || {}),
      [source]: result.data,
    };

    next();
  };
