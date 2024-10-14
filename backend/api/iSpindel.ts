import express from 'express';
import { requireUser } from './utils';
import { UserAuthInfoRequest } from '.';
const iSpindelRouter = express.Router();
import { addBrewRec, calcGravity, createHydrometerToken, createLog, deleteLog, endBrew, getBrews, getDevicesForUser, getHydrometerToken, getLogs, getLogsForBrew, registerDevice, setBrewName, startBrew, updateBrewGravity, updateCoeff, updateLog, verifyToken } from '../db';

iSpindelRouter.get("/", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { id: userId } = req.user || { id: null };

    if (!userId) throw new Error('User not found');
    const hydrometerToken = await getHydrometerToken(userId);
    const devices = await getDevicesForUser(userId);
    res.send({ hydrometerToken, devices });
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


    const startDate = new Date(queryParams.start_date as string)
    const endDate = new Date(queryParams.end_date as string)
    const device_id = queryParams.device_id as string;

    const logs = await getLogs(device_id, startDate, endDate)

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

iSpindelRouter.delete("/logs/:logId", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { logId } = req.params;
    const queryParams = req.query;
    const device_id = queryParams.device_id as string;

    // finds log, checks if user listed on brewId is userRequesting, then updates log
    const logs = await deleteLog(logId, device_id);

    res.send(logs);
  } catch (err) {
    next(err.message);
  }
});



iSpindelRouter.get("/brew", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const brews = await getBrews(req.user?.id);

    res.send(brews);
  } catch (err) {
    next({ error: err.message });
  }
});

iSpindelRouter.post("/brew", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { device_id, brew_name } = req.body;

    const brew = await startBrew(device_id, req.user?.id, brew_name);

    res.send(brew);
  } catch (err) {
    next({ error: err.message });
  }
});

iSpindelRouter.patch("/brew", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { device_id, brew_id, brew_name } = req.body;
    console.log(brew_name)
    // stop brew and update device table brew_id field to null
    let brew;
    if (!brew_name) { brew = await endBrew(device_id, brew_id, req.user?.id); }
    else brew = await setBrewName(brew_id, req.user?.id, brew_name);

    console.log(brew)
    res.send(brew);
  } catch (err) {
    next({ error: err.message });
  }
});
iSpindelRouter.patch("/brew/:brew_id", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { brew_id } = req.params
    const { recipe_id } = req.body;

    // stop brew and update device table brew_id field to null
    const brew = await addBrewRec(recipe_id, brew_id, req.user?.id);

    res.send(brew);
  } catch (err) {
    next({ error: err.message });
  }
});

iSpindelRouter.patch("/device/:device_id", requireUser, async (req: UserAuthInfoRequest, res, next) => {
  try {
    const { device_id } = req.params;

    const device = await updateCoeff(device_id, req.body.coefficients, req.user?.id,)


    res.send(device);
  } catch (err) {
    next({ error: err.message });
  }
});


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