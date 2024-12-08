# MeadTools iSpindel Wireframe

- [MeadTools iSpindel Wireframe](#meadtools-ispindel-wireframe)
  - [About](#about)
  - [Tables](#tables)
    - [logs](#logs)
    - [devices](#devices)
    - [brews](#brews)
    - [users](#users)
  - [Endpoints](#endpoints)
    - [Global Types](#global-types)
    - [GET /api/ispindel](#get-apiispindel)
      - [Response Types:](#response-types)
      - [Functions](#functions)
    - [POST /api/ispindel](#post-apiispindel)
      - [Request Types:](#request-types)
      - [Functions](#functions-1)
    - [GET /api/ispindel/logs](#get-apiispindellogs)
      - [Return Types:](#return-types)
      - [Functions](#functions-2)
    - [GET /api/ispindel/logs/:brewId](#get-apiispindellogsbrewid)
      - [Functions](#functions-3)
    - [GET /api/ispindel/:deviceId](#get-apiispindeldeviceid)
      - [Return Types:](#return-types-1)
      - [Functions](#functions-4)
    - [PATCH /api/ispindel/logs/:logId](#patch-apiispindellogslogid)
      - [Return Types:](#return-types-2)
      - [Functions](#functions-5)
    - [POST /api/ispindel/register](#post-apiispindelregister)
      - [Return Types:](#return-types-3)
      - [Functions](#functions-6)
    - [POST /api/ispindel/brew](#post-apiispindelbrew)
      - [Functions](#functions-7)
    - [PATCH /api/ispindel/brew](#patch-apiispindelbrew)
      - [Functions](#functions-8)
  - [UX Walkthrough](#ux-walkthrough)

## About

This details a proposed solution for adding iSpindel support to MeadTools. View the table of contents for more information about each section.

## Tables

### logs

| Key                | Datatype |
| ------------------ | -------- |
| log_id             | PK       |
| brew_id            | FK       |
| device_id          | FK       |
| angle              | FLOAT    |
| temperature        | FLOAT    |
| temp_units         | ENUM     |
| battery            | FLOAT    |
| gravity            | FLOAT    |
| interval           | INT      |
| datetime           | DATETIME |
| calculated_gravity | FLOAT    |

### devices

| Key          | Datatype |
| ------------ | -------- |
| device_id    | PK       |
| device_name  | TEXT     |
| recipe_id    | FK       |
| user_id      | FK       |
| coefficients | INT[4]   |
| brew_id      | FK       |

### brews

| Key            | Datatype |
| -------------- | -------- |
| brew_id        | PK       |
| start_date     | DATETIME |
| end_date       | DATETIME |
| user_id        | FK       |
| latest_gravity | FLOAT    |

### users

| Key         | Datatype |
| ----------- | -------- |
| ...         | ...      |
| hydro_token | TEXT     |

## Endpoints

### Global Types

Several endpoints will return the same data structure. I have listed them here. The types are formatted as typescript types for use later in the frontend.

```typescript
type LogType = {
  id: string;
  brew_id: string | null;
  name: string;
  angle: number;
  temperature: number;
  temp_units: "C" | "F";
  battery: number;
  gravity: number;
  interval: number;
  dateTime: Date;
  calculated_gravity: number | null;
};

type BrewType = {
  id: string;
  start_date: Date;
  end_date: Date | null;
  latest_gravity: number;
};
```

### GET /api/ispindel

- User Required
- Returns users token and a list of registered devises

#### Response Types:

```typescript
type DeviceListType = {
  hydrometerToken: string;
  devices: deviceType[];
};

type DeviceType = {
  deviceId: string;
  currentBrewId: string | null;
  coefficients: number[];
};
```

#### Functions

```typescript
apiRouter.get("/api/ispindel", requireUser, async (req, res) => {
  const { user } = req;
  // fetch token from users table and select devices that are registered to that user. How could I do this in one Query?
  const { devices, token } = await getDeviceList(user.id);

  res.send({
    hydrometerToken: token,
    devices,
  });
});
```

### POST /api/ispindel

- Endpoint that iSpindel will POST to
- Checks to see if device token is registered to a user

#### Request Types:

```typescript
{
  name: string,
  ID: number,
  token: string,
  angle: number,
  temperature: number,
  temp_units: 'C' | 'F',
  battery: number,
  gravity: number,
  interval:number,
  RSSI: number
}
```

#### Functions

```typescript
apiRouter.post("/api/ispindel", async (req, res, next) => {
  try {
    const { body } = req;
    // verify token from request body. Needs to be checked against all tokens in users table
    const userId = await verifyToken(body.token);
    if (!userId) next({ message: "Token invalid." });

    // if token is valid, check if device is registered, if not add device to device table
    const device = await registerDevice(body);

    // if device has coefficients listed, calculate gravity
    const { coefficients } = device;
    let calculated_gravity = null;
    if (!!coefficients.length) calculated_gravity = calcGravity(coefficients);

    // check if device has a current active brew and add log to logs table
    const gravity = calculated_gravity ?? body.gravity;

    await updateBrewGravity(brewId, gravity);

    const log = {
      ...body,
      datetime: new Date(),
      calculated_gravity,
      brew_id: device.currentBrewId,
      deviceId: device.id,
    };
    const log = await createLog(log);

    // Response likely won't be received because this is the device endpoint
    res.send({ message: "Log created successfully.", log });
  } catch (err) {
    next(err);
  }
});
```

### GET /api/ispindel/logs

- User Required
- Returns list of recent logs for a user
- Allows for Query params to determine number, default is 5

#### Return Types:

```
LogType[]
```

#### Functions

```typescript
apiRouter.get("/api/ispindel/logs", requireUser, async (req, res) => {
  const { user } = req;
  // Not sure how to do this. Maybe we should just store the userId on the log too. I can pull the logs that have a brewId easily, but not the ones that aren't tied to a brew.
  const logs = await getLogs(user.id);

  res.send(logs);
});
```

### GET /api/ispindel/logs/:brewId

- User Required
- Returns list of logs for a user's specified brew

```
LogType[]
```

#### Functions

```typescript
apiRouter.get("/api/ispindel/logs/:brewId", requireUser, async (req, res) => {
  const { brewId } = req.params;
  const logs = await getLogsForBrew(brewId);

  res.send(logs);
});
```

### GET /api/ispindel/:deviceId

- User Required
- Returns list of brews for a user's device

#### Return Types:

```
BrewType[]
```

#### Functions

```typescript
apiRouter.get("/api/ispindel/logs/:deviceId", requireUser, async (req, res) => {
  const { deviceId } = req.params;
  const logs = await getLogsForDevice(deviceId);

  res.send(logs);
});
```

### PATCH /api/ispindel/logs/:logId

- User Required

#### Return Types:

```
LogType
```

#### Functions

```typescript
apiRouter.patch("/api/ispindel/logs/:logId", requireUser, async (req, res) => {
  try {
    const { body } = req;
    const { id: userId } = req.user;
    const { logId } = req.params;

    // finds log, checks if user listed on brewId is userRequesting, then updates log
    const log = await updateLog(userId, logId, body);

    res.send(logs);
  } catch (err) {
    next(err.message);
  }
});
```

### POST /api/ispindel/register

- User Required
- Returns token for the device authentication
- Token can be used across multiple devices

#### Return Types:

```typescript
type DeviceToken = {
  token: string;
};
```

#### Functions

```typescript
iSpindelRouter.post("/register", requireUser, async (req, res, next) => {
  try {
    const { id } = req.user;

    let token;
    if (id) token = await createHydrometerToken(id);
    else throw new Error("User ID not found");

    res.send({ token });
  } catch (err) {
    next({ error: err.message });
  }
});
```

### POST /api/ispindel/brew

- User Required
- Starts a recipe for a device

#### Functions

```typescript
iSpindelRouter.post("/brew", requireUser, async (req, res, next) => {
  try {
    const { deviceId } = req.body;

    // create brew and update device to track new brew
    const brew = await startBrew(deviceId);

    res.send(brew);
  } catch (err) {
    next({ error: err.message });
  }
});
```

### PATCH /api/ispindel/brew

- User Required
- Ends a recipe for a device

#### Functions

```typescript
iSpindelRouter.patch("/brew", requireUser, async (req, res, next) => {
  try {
    const { deviceId } = req.body;

    // stop brew and update device table brew_id field to null
    const brew = await endBrew(deviceId);

    res.send(brew);
  } catch (err) {
    next({ error: err.message });
  }
});
```

## UX Walkthrough

1. User Visits account page
2. Account page has an option that links to the iSpindel Dashboard
3. Landing page shows the list of users devices that link to an individual device page.
4. If device is not currently tracking a brew, a button is displayed to start tracking.
5. Link at top allows users to go to page to register token if the user hasn't already
6. This page also has a link to page to view recent logs
7. User clicks on a device link and is linked to a page that shows recent brews for the device.
8. Users can set coefficients on this page.
9. Each brew will have options for editing entries, graphing entries, and linking to a saved MeadTools recipe.
