import express from 'express';
const iSpindelRouter = express.Router();

iSpindelRouter.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    console.log(body);
    res.send("iSpindel recipe created successfully!");
  } catch (err) {
    next({ error: err.message })
  }
})

export default iSpindelRouter