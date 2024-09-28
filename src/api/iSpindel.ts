import express from 'express';
import { requireUser } from './utils';
import { UserAuthInfoRequest } from '.';
const iSpindelRouter = express.Router();
import ShortUniqueId from 'short-unique-id'

iSpindelRouter.get("/", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { id: userId } = req.user || { id: null };
    const { body } = req;
    console.log(body);
    res.send(`Fetching deviceList for user ${userId}`);
  } catch (err) {
    next({ error: err.message })
  }
})

iSpindelRouter.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    console.log(body);
    res.send("iSpindel recipe created successfully!");
  } catch (err) {
    next({ error: err.message })
  }
});

iSpindelRouter.get("/logs", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const queryParams = req.query
    const { id: userId } = req.user || { id: null };
    const { body } = req;
    console.log(body);
    res.send(`Fetching the ${queryParams} most recent logs for user ${userId}`);
  } catch (err) {
    next({ error: err.message })
  }
});
iSpindelRouter.get("/logs/:brewId", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { brewId } = req.params
    const { id: userId } = req.user || { id: null };
    const { body } = req;
    console.log(body);
    res.send(`Fetching user ${userId} logs for brew ${brewId}`);
  } catch (err) {
    next({ error: err.message })
  }
});

iSpindelRouter.get("/:deviceId", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { id: userId } = req.user || { id: null };
    const { deviceId } = req.params;
    const { body } = req;
    console.log(body);
    res.send(`Fetching recent logs for device ${deviceId} from user ${userId}`);
  } catch (err) {
    next({ error: err.message })
  }
})

iSpindelRouter.post("/register", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { id: userId } = req.user || { id: null };
    const { body } = req;
    console.log(body);

    const { randomUUID } = new ShortUniqueId();
    const token = randomUUID(10);

    res.send(`Generating a new token for ${userId}. Your token is ${token}`);
  } catch (err) {
    next({ error: err.message })
  }
});

export default iSpindelRouter