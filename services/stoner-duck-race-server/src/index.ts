import { defineRoom, defineServer } from "colyseus";
import { DUCK_RACE_LIMITS } from "../../../game/stoner-duck-race/config.js";
import { RaceRoom } from "./rooms/RaceRoom.js";
import {
  DUCK_RACE_PROTOCOL_VERSION,
  duckRaceLiveOpsState,
  duckRaceOperationalMetrics,
} from "./liveops.js";

const port = Number(process.env.PORT ?? 2567);

type HealthResponse = {
  status(code: number): HealthResponse;
  json(payload: Record<string, unknown>): void;
};

const server = defineServer({
  express: (app) => {
    app.get("/healthz", (_request: unknown, response: HealthResponse) => {
      const liveops = duckRaceLiveOpsState();
      response.status(200).json({
        ok: true,
        service: "stoner-duck-race",
        protocolVersion: DUCK_RACE_PROTOCOL_VERSION,
        maintenance: liveops.maintenance,
        multiplayerEnabled: liveops.multiplayerEnabled,
        racerCapacity: DUCK_RACE_LIMITS.massRaceMax,
        spectatorTarget: DUCK_RACE_LIMITS.spectatorTarget,
        uptimeSeconds: Math.round(process.uptime()),
        operationalMetrics: duckRaceOperationalMetrics(),
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
