/* Gets summonerIDs and summonerNames from the League-V4 API and writes them to a .cvs file
 */

const path = "/lol/league/v4/entries/"; // challenger leagues by queue, tier, and division
const queueParam = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_FLEX_TT"];
const tierParam = ["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON"];
const divParam = ["I", "II", "III", "IV"];
const devKey = "RGAPI-57bfd67f-f777-45fd-9089-345a2e4a249a"; // the API key changes frequently (every 2 days?)

// Import library to make API requests
const axios = require("axios");
//const ObjectsToCsv = require("objects-to-csv");

async function getData() {
  const url = `https://na1.api.riotgames.com${path}${queueParam[0]}/${tierParam[0]}/${divParam[0]}?page=1&api_key=${devKey}`;

  // main_player_summoner_id = "LBkuGf-Iuw4F1tIArvQTM6hohU4ulANqiYW8068Xw3KpHv9c";
  // const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/${main_player_summoner_id}&api_key=${devKey}`;

  const response = await axios.get(url);
  // turn return value to json
  const data = response.data;

  console.log(data);
}

getData();
