import "dotenv/config";
import cors from "cors";
import express from "express";
import createError from "http-errors";
import ProductRouter from "./routers/products.router.js";

const PORT = process.env.PORT || 4000;

// initialize express app
const app = express();

app.use(cors());
// JSON parse middleware
app.use(express.json());
// routers middlewares
app.use("/products", ProductRouter);

app.use((req, res, next) => {
  next(createError(404, "Not Found!"));
});

// Error handler middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;

  res.status(status);
  res.json({
    error: {
      status,
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log("The server running on port ", PORT);
});
