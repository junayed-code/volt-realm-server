import slugify from "slugify";
import express from "express";
import createError from "http-errors";
import { ObjectId } from "mongodb";
import { BSONError } from "bson";
import { clientPromise } from "../services/mongodb.js";

// Create a express router
const router = express.Router();

(async function () {
  const database = (await clientPromise).db();
  const products = database.collection("products");
  const options = { projection: {} };

  // Get all products
  router.get("/", async (req, res, next) => {
    try {
      let result;
      const { brand, type, limit } = req.query;
      options.limit = Number(limit);

      if (brand || type) {
        const filter = { $or: [{ brand }, { type }] };
        result = await products.find(filter, options).toArray();
      } else {
        result = await products.find({}, options).toArray();
      }

      // If no products then throw an error
      if (!result.length) {
        throw createError(404, "No products found!");
      }

      const replaceID = result.map(pro => replace_idToid(pro));
      res.json({ data: replaceID });
    } catch (err) {
      next(err);
    }
  });

  // Get a product by name
  router.get("/:nameSlug", async (req, res, next) => {
    try {
      const { nameSlug } = req.params;

      // find a product by the nameSlug into mongodb database
      const query = { nameSlug };
      const result = await products.findOne(query, options);

      // If no product then throw an error
      if (!result) throw createError(404, "No product found!");

      res.json({ data: replace_idToid(result) });
    } catch (err) {
      next(err);
    }
  });

  // Create a new product
  router.post("/", async (req, res, next) => {
    try {
      const { name, image, type, price, brand, rating, description } = req.body;
      const nameSlug = slugify(name, { lower: true });

      // mongodb document
      const doc = {
        name,
        image,
        type,
        price,
        brand,
        rating,
        description,
        nameSlug,
      };
      // insert document into the mongodb
      await products.insertOne(doc);

      res.json({ data: replace_idToid(doc) });
    } catch (error) {
      next(error);
    }
  });

  // Update a product by ID
  router.patch("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };

      // updated document
      const updateDoc = { $set: { ...req.body } };
      const result = await products.findOneAndUpdate(query, updateDoc, {
        returnDocument: "after",
      });

      // If no product then throw an error
      if (!result) throw createError(404, "No products found for update!");

      res.json({ data: replace_idToid(result) });
    } catch (err) {
      if (BSONError.isBSONError(err)) {
        return next(createError(400, "Invalid product ID"));
      }
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      const query = { _id: new ObjectId(id) };
      const result = await products.findOneAndDelete(query);

      if (!result) throw createError(404, "No product found for delete!");

      res.send({ data: replace_idToid(result) });
    } catch (err) {
      if (BSONError.isBSONError(err)) {
        return next(createError(400, "Invalid product ID"));
      }
      next(err);
    }
  });
})();

// Replace _id property to id
function replace_idToid({ _id, ...rest }) {
  return { id: _id, ...rest };
}

export default router;
