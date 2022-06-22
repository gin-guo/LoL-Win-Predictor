/* Gets summonerIDs and summonerNames from the League-V4 API and writes them to a .cvs file
 */

const path = "/lol/league/v4/entries/"; // challenger leagues by queue, tier, and division
const queueParam = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_FLEX_TT"];
const tierParam = ["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON"];
const divParam = ["I", "II", "III", "IV"];
const devKey = "RGAPI-a9b89946-b3d1-46c5-bcf5-f2fd1056c058"; // the API key changes frequently (every 2 days?)

// Import library to make API requests
const axios = require("axios");
const ObjectsToCsv = require("objects-to-csv");

async function getData() {
  // get summonerId
  const url = `https://na1.api.riotgames.com${path}${queueParam[0]}/${tierParam[0]}/${divParam[0]}?page=1&api_key=${devKey}`;

  // // get puuid
  // main_player_summoner_id = "LBkuGf-Iuw4F1tIArvQTM6hohU4ulANqiYW8068Xw3KpHv9c";
  // const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/${main_player_summoner_id}?api_key=${devKey}`;

  // get match ids
  // const main_player_puuid = "T5i80nFtX4bPzq8hoK_3wmzKw8n9KQk0rS85HQ8dNV_9VEJMnotydh7nr_hg50lgdhxSAI20kLub2g"
  // const MATCHES_PER_PLAYER = "20"
  // const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${main_player_puuid}/ids?start=0&count=${MATCHES_PER_PLAYER}&api_key=${devKey}`;

  // // get match data
  // const match_id = "NA1_4345803439";
  // const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${match_id}?api_key=${devKey}`;

  // // get match players summonerId
  // participant_summoner_id = "LBkuGf-Iuw4F1tIArvQTM6hohU4ulANqiYW8068Xw3KpHv9c";
  // const url = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${participant_summoner_id}?api_key=${devKey}`;

  const response = await axios.get(url);
  // turn return value to json
  const data = response.data;

  // console.log(data);

  // Write data to cvs file
  const csv = new ObjectsToCsv(data);
  await csv.toDisk("./test.csv");
}

// run function
getData();
