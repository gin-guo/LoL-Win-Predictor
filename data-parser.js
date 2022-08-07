// =======================================================================
// Hyperparameters

// Number of matches to retrieve from each of the players, up to 100
const MATCHES_PER_PLAYER = 5;

// =======================================================================

// Import library to make API requests
const axios = require("axios");

// Import library to write array of json object to csv
const ObjectsToCsv = require("objects-to-csv");

// Add api key to all requests
// axios.defaults.headers.common["X-Riot-Token"] = API_KEY;

// Get arguments from command line
region = process.argv[2];
tier = process.argv[3];
division = process.argv[4];
page = process.argv[5];
API_key = process.argv[6];

// Format base url
const base_url = `https://${region}.api.riotgames.com`;

// For some reason matches api takes a different format of region
// I am hard coding americas because I don't know how it really works
const base_url2 = `https://americas.api.riotgames.com`;

// Input and output data structures
let X = [];
let Y = [];

// Helper function for rate limiting
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Main function
(async () => {
  // Variable used to limit rate
  count = 0;

  // Get all players in the selected region, tier, division and page
  let res = await axios.get(
    `${base_url}/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/${division}?page=${page}&api_key=${API_key}`
  );
  const players = res.data;

  for (const player of players) {
    // Structure to hold each record of the input data structure
    let data = {};

    // Store the main player summoner id to later identify it
    main_player_summoner_id = player.summonerId;

    // Get the main player puuid to get their matches
    res = await axios.get(
      `${base_url}/lol/summoner/v4/summoners/${main_player_summoner_id}?api_key=${API_key}`
    );
    summoner_data = res.data;
    main_player_puuid = summoner_data.puuid;

    // Request matches of the player
    res = await axios.get(
      `${base_url2}/lol/match/v5/matches/by-puuid/${main_player_puuid}/ids?start=0&count=${MATCHES_PER_PLAYER}&api_key=${API_key}`
    );
    matches_ids = res.data;

    for (const match_id of matches_ids) {
      // Get match data
      res = await axios.get(
        `${base_url2}/lol/match/v5/matches/${match_id}?api_key=${API_key}`
      );
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
        league_entries = res.data;

        // The above API gets info for all leagues (TFT, flex, ranked)
        // From those select the ranked one
        for (const league_entry of league_entries) {
          if (league_entry.queueType == "RANKED_SOLO_5x5") {
            participant_summoner_data = league_entry;
            break;
          }
        }

        // Add additional data for each player
        participant_data.wins = participant_summoner_data.wins;
        participant_data.miniseries_wins =
          participant_summoner_data.miniseries?.wins ?? 0;
        participant_data.losses = participant_summoner_data.losses;
        participant_data.miniseries_losses =
          participant_summoner_data.miniseries?.losses ?? 0;
        participant_data.tier = participant_summoner_data.tier;
        participant_data.rank = participant_summoner_data.rank;
        participant_data.league_points = participant_summoner_data.leaguePoints;

        // Check if the player is the main player
        if (participant_data.summoner_id == main_player_summoner_id) {
          // Get the team id of the main player to later identify allies
          main_player_team = participant_data.team_id;

          // Get result of match for output data structure

          let result = [];
          if (participant.win == true) {
            result.result = 0;
          } else {
            result.result = 1;
          }

          Y.push(result);
          // console.log(result);

          let csv2 = new ObjectsToCsv([result]);
          await csv2.toDisk("./output.csv", { append: true });
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
          data.main_player_miniseries_wins = participant_data.miniseries_wins;
          data.main_player_losses = participant_data.losses;
          data.main_player_miniseries_losses =
            participant_data.miniseries_losses;
          data.main_player_tier = participant_data.tier;
          data.main_player_rank = participant_data.rank;
          data.main_player_league_points = participant_data.league_points;
          data.main_player_champion_level = participant_data.champion_level;
          data.main_player_champion_experience =
            participant_data.champion_experience;
        } else if (participant_data.team_id == main_player_team) {
          // if the player is an ally
          data[`ally_${ally_count}_wins`] = participant_data.wins;
          data[`ally_${ally_count}_miniseries_wins`] =
            participant_data.miniseries_wins;
          data[`ally_${ally_count}_losses`] = participant_data.losses;
          data[`ally_${ally_count}_miniseries_losses`] =
            participant_data.miniseries_losses;
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
          data[`rival_${rival_count}_miniseries_wins`] =
            participant_data.miniseries_wins;
          data[`rival_${rival_count}_losses`] = participant_data.losses;
          data[`rival_${rival_count}_miniseries_losses`] =
            participant_data.miniseries_losses;
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
      X.push(data);

      let csv1 = new ObjectsToCsv([data]);
      await csv1.toDisk("./input.csv", { append: true });

      // Halt program to avoid rate limit
      // Limits:
      //  20 requests in 1 second
      //  OR 100 requests in 2 min

      // 1600 requests per minute
      if (count < 5) {
        count++;
        await sleep(1000); // time in ms
      } else {
        count = 0;
        await sleep(120 * 1000);
      }
    }
  }
})();
