import { defineRoom, defineServer } from "colyseus";
import { RaceRoom } from "./rooms/RaceRoom.js";

const port = Number(process.env.PORT ?? 2567);

const server = defineServer({
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
