import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: process.env.OPENAPI_SCHEMA_PATH || "../django-boilerplate/schema.yml",
  output: "src/shared/api",
  plugins: ["@hey-api/client-axios"],
});
