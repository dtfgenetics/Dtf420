import { defineRoom, defineServer } from "colyseus";
import { DUCK_RACE_LIMITS } from "../../../game/stoner-duck-race/config.js";
import { RaceRoom } from "./rooms/RaceRoom.js";

const port = Number(process.env.PORT ?? 2567);

const server = defineServer({
  express: (app) => {
    app.get("/healthz", (_request, response) => {
      response.status(200).json({
        ok: true,
        service: "stoner-duck-race",
        racerCapacity: DUCK_RACE_LIMITS.massRaceMax,
        spectatorTarget: DUCK_RACE_LIMITS.spectatorTarget,
        uptimeSeconds: Math.round(process.uptime()),
      });
    });
  },
  rooms: {
    stoner_duck_race: defineRoom(RaceRoom),
  },
});

server.listen(port)
  .then(() => {
    console.log(`Stoner Duck Race server listening on :${port}`);
  })
  .catch((error) => {
    console.error("Failed to start Stoner Duck Race server", error);
    process.exitCode = 1;
  });
