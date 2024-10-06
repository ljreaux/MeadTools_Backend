import express from 'express';
import { requireUser } from './utils';
import { UserAuthInfoRequest } from '.';
const iSpindelRouter = express.Router();
import { calcGravity, createHydrometerToken, createLog, endBrew, getDevicesForUser, getHydrometerToken, getLogs, getLogsForBrew, registerDevice, startBrew, updateBrewGravity, updateLog, verifyToken } from '../db';

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
    const { body } = req;

    const startDate = new Date(queryParams.start_date as string)
    const endDate = new Date(queryParams.end_date as string)

    const logs = await getLogs(body.device_id, startDate, endDate)

    res.send(logs);
  } catch (err) {
    next({ error: err.message })
  }
});
iSpindelRouter.get("/logs/:brewId", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { brewId } = req.params;
    const logs = await getLogsForBrew(brewId, req.user?.id);

    res.send(logs);
  } catch (err) {
    next({ error: err.message })
  }
});

iSpindelRouter.patch("/logs/:logId", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { body } = req;
    const { logId } = req.params;
    const queryParams = req.query;
    const device_id = queryParams.device_id as string;

    // finds log, checks if user listed on brewId is userRequesting, then updates log
    const logs = await updateLog(logId, body, device_id);

    res.send(logs);
  } catch (err) {
    next(err.message);
  }
});

iSpindelRouter.post("/brew", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { device_id } = req.body;

    const brew = await startBrew(device_id, req.user?.id);

    res.send(brew);
  } catch (err) {
    next({ error: err.message });
  }
});

iSpindelRouter.patch("/brew", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { device_id, brew_id } = req.body;

    // stop brew and update device table brew_id field to null
    const brew = await endBrew(device_id, brew_id, req.user?.id);

    res.send(brew);
  } catch (err) {
    next({ error: err.message });
  }
});

iSpindelRouter.get("/devices", async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { id: userId } = req.user || { id: null };

    if (!userId) throw new Error('User not found');
    const devices = await getDevicesForUser(userId);

    res.send(devices);
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