import express from 'express';
import { requireUser } from './utils';
import { UserAuthInfoRequest } from '.';
const iSpindelRouter = express.Router();
import { calcGravity, createHydrometerToken, createLog, getHydrometerToken, registerDevice, updateBrewGravity, verifyToken } from '../db';

iSpindelRouter.get("/", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { id: userId } = req.user || { id: null };
    let hydrometerToken;
    if (userId) hydrometerToken = await getHydrometerToken(userId);

    res.send({ hydrometerToken, devices: [] });
  } catch (err) {
    next({ error: err.message })
  }
})

iSpindelRouter.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    const userId = await verifyToken(body.token);
    if (!userId) next({ message: "Token invalid." });

    const device = await registerDevice({ userId, device_name: body.name })

    const { coefficients, brew_id } = device;
    let calculated_gravity = null;
    if (!!coefficients.length) calculated_gravity = calcGravity(coefficients, body.angle);
    const gravity = calculated_gravity ?? body.gravity;

    if (!!brew_id) await updateBrewGravity(brew_id, gravity);

    const data = {
      ...body,
      calculated_gravity,
      brew_id,
      device_id: device.id,
    }

    const log = await createLog(data);
    res.send(log);
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

    let token;
    if (userId) token = await createHydrometerToken(userId);
    else throw new Error('User ID not found');

    res.send({ token: token.token });
  } catch (err) {
    next({ error: err.message })
  }
});

export default iSpindelRouter