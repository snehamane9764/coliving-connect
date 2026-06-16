import "dotenv/config";
import { createApp } from "./app.js";
import { pool } from "./db.js";

const port = Number(process.env.PORT ?? 3001);

createApp(pool).listen(port, () => {
  console.log(`CoLiving Connect API listening on port ${port}`);
});
