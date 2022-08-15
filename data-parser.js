// =======================================================================
// Hyperparameters

// Number of matches to retrieve from each of the players, up to 100
const MATCHES_PER_PLAYER = 7;
const MATCH_LIMIT = 2000;

// =======================================================================

// Import library to make API requests
const axios = require("axios");

// Import library to write array of json object to csv
const ObjectsToCsv = require("objects-to-csv");

// Library for file read
const fs = require("fs");
const { toASCII } = require("punycode");
const { time } = require("console");

// Get arguments from command line
tier = process.argv[2];
division = process.argv[3];
page = process.argv[4];
API_key = process.argv[5];

// Add api key to all requests
axios.defaults.headers.common["X-Riot-Token"] = API_key;

// Format base url
const base_url = `https://na1.api.riotgames.com`;

// For some reason matches api takes a different format of region
// I am hard coding americas because I don't know how it really works
const base_url2 = `https://americas.api.riotgames.com`;

// Input and output data structures
let dataset = [];

// Helper function for rate limiting
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fileLineCount({ fileLocation }) {
  try {
    const data = fs.readFileSync(fileLocation);
    return data.toString().split("\n").length - 1;
  } catch {
    return 0;
  }
}

// Variables used to limit rate
let count = 0;
let paused = false;
let num_requests = 0;

setInterval(() => {
  if (!paused) {
    // Increase seconds count for limit
    // 100 requests per 2 min (120 s)
    count++;

    // If near limit halt till completed limit
    if (num_requests >= 95) {
      paused = true;
    }
  }
}, 1000);

// Main function
(async () => {
  // Review the file contents before starting
  total_matches = await fileLineCount({
    fileLocation: `./match-data/${tier}_${division}.csv`,
  });

  // Get all players in the selected region, tier, division and page
  let res = await axios.get(
    `${base_url}/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/${division}?page=${page}&api_key=${API_key}`
  );
  num_requests++;
  const players = res.data;

  // Shuffle players
  players.sort(() => Math.random() - 0.5);

  for (const player of players) {
    // Check every second for api rate limit.
    // Api response time is too slow to consider the first limit:
    // 20 request per second

    try {
      // Structure to hold each record of the input data structure
      let data = {};

      // Store the main player summoner id to later identify it
      main_player_summoner_id = player.summonerId;

      // Get the main player puuid to get their matches
      res = await axios.get(
        `${base_url}/lol/summoner/v4/summoners/${main_player_summoner_id}?api_key=${API_key}`
      );
      num_requests++;
      summoner_data = res.data;
      main_player_puuid = summoner_data.puuid;

      // Request solo ranked matches of the player
      res = await axios.get(
        `${base_url2}/lol/match/v5/matches/by-puuid/${main_player_puuid}/ids?start=0&count=${MATCHES_PER_PLAYER}&queu=420&type=ranked&api_key=${API_key}`
      );
      num_requests++;
      matches_ids = res.data;

      // Request flex ranked matches of player if there are not enought solo ranked
      if (matches_ids.length < MATCHES_PER_PLAYER) {
        res = await axios.get(
          `${base_url2}/lol/match/v5/matches/by-puuid/${main_player_puuid}/ids?start=0&count=${
            MATCHES_PER_PLAYER - matches_ids.length
          }&queu=440&type=ranked&api_key=${API_key}`
        );
        num_requests++;
        matches_ids.concat(res.data);
      }

      for (const match_id of matches_ids) {
        // Halt program
        if (paused) {
          // Add 5 seconds of extra sleep just in case
          let time_left = 120 - count;
          time_left = time_left < 0 ? 0 : time_left;
          console.log(`Waiting ${time_left} seconds for api limit rate`);
          await sleep(time_left * 1000);
          console.log("Resuming");

          // Reset num of request once two minute have pass
          count = 0;
          num_requests = 0;
          paused = false;
        }

        // Get match data
        res = await axios.get(
          `${base_url2}/lol/match/v5/matches/${match_id}?api_key=${API_key}`
        );
        num_requests++;
        match_data = res.data;

        // Variable to hold the main player team id to later identify allies and rivals
        let main_player_team;

        // Initial data structure to hold information of all players in the match
        let participants_data = [];

        // For all players in the match
        const participants = match_data.info.participants;
        for (const participant of participants) {
          // Variable to hold the relevant information of each player
          participant_data = {};

          // Variables that are later use to identify if the player is the main player, an ally or a rival
          participant_data.summoner_id = participant.summonerId;
          participant_data.team_id = participant.teamId;

          // Add player data about their selected champions
          participant_data.champion_level = participant.champLevel;
          participant_data.champion_experience = participant.champExperience;

          // Get additional player information
          res = await axios.get(
            `${base_url}/lol/league/v4/entries/by-summoner/${participant.summonerId}?api_key=${API_key}`
          );
          num_requests++;
          league_entries = res.data;

          // The above API gets info for all leagues (TFT, flex, ranked)
          // From those select the ranked one
          for (const league_entry of league_entries) {
            if (league_entry.queueType == "RANKED_SOLO_5x5") {
              participant_summoner_data = league_entry;
              break;
            }
          }

          if (participant_summoner_data == null) {
            console.error("Player has no ranked profile. Discarting match.");
            continue;
          }

          // Add additional data for each player
          participant_data.wins = participant_summoner_data.wins;
          participant_data.losses = participant_summoner_data.losses;
          participant_data.tier = participant_summoner_data.tier;
          participant_data.rank = participant_summoner_data.rank;
          participant_data.league_points =
            participant_summoner_data.leaguePoints;

          // Check if the player is the main player
          if (participant_data.summoner_id == main_player_summoner_id) {
            // Get the team id of the main player to later identify allies
            main_player_team = participant_data.team_id;

            // Get result of match for output data structure
            if (participant.win == true) {
              data.result = 1;
            } else if (participant.win == false) {
              data.result = 0;
            } else {
              console.error("Discarting match, no outcome");
              continue;
            }
          }

          // Add player data to array
          participants_data.push(participant_data);
        }

        // Final formatting of the data of all participants of the match

        // Variables used to register the ally or rival index
        let ally_count = 0;
        let rival_count = 0;

        for (const participant_data of participants_data) {
          // If the player is the main player
          if (participant_data.summoner_id == main_player_summoner_id) {
            data.main_player_win = participant_data.wins;
            data.main_player_losses = participant_data.losses;
            data.main_player_tier =
              participant_data.tier + "_" + participant_data.rank;
            data.main_player_league_points = participant_data.league_points;
            data.main_player_champion_level = participant_data.champion_level;
            data.main_player_champion_experience =
              participant_data.champion_experience;
          } else if (participant_data.team_id == main_player_team) {
            // if the player is an ally
            data[`ally_${ally_count}_wins`] = participant_data.wins;
            data[`ally_${ally_count}_losses`] = participant_data.losses;
            data[`ally_${ally_count}_tier`] =
              participant_data.tier + "_" + participant_data.rank;
            data[`ally_${ally_count}_league_points`] =
              participant_data.league_points;
            data[`ally_${ally_count}_champion_level`] =
              participant_data.champion_level;
            data[`ally_${ally_count}_champion_experience`] =
              participant_data.champion_experience;

            // Increment ally index
            ally_count++;
          } else {
            // If the player is a rival
            data[`rival_${rival_count}_wins`] = participant_data.wins;
            data[`rival_${rival_count}_losses`] = participant_data.losses;
            data[`rival_${rival_count}_tier`] =
              participant_data.tier + "_" + participant_data.rank;
            data[`rival_${rival_count}_league_points`] =
              participant_data.league_points;
            data[`rival_${rival_count}_champion_level`] =
              participant_data.champion_level;
            data[`rival_${rival_count}_champion_experience`] =
              participant_data.champion_experience;

            // Increment rival index
            rival_count++;
          }
        }
        // Add formatted data into input data structure
        // console.log([data]);
        dataset.push(data);

        try {
          let csv = new ObjectsToCsv([dataset.at(-1)]);
          await csv.toDisk(`./match-data/${tier}_${division}.csv`, {
            append: true,
          });
        } catch (err) {
          console.error("Error on file writting", err);
          process.exit();
        }

        console.log(`[${total_matches + 1}] added match :)`);
        total_matches++;
        if (total_matches > MATCH_LIMIT) {
          console.log("Done with this rank :D");
          process.exit();
        }
      }
    } catch (err) {
      if (err.response?.status == 429) {
        console.log("Too many requests, halting");
        await sleep(120 * 1000);
      } else {
        console.error("Unknown error", err);
      }
      continue;
    }
  }
  console.log(`No more players in this page ${page}`);
})();
