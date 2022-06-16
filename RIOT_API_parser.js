/* Gets summonerIDs and summonerNames from the League-V4 API and writes them to a .cvs file
 */

const path = "/lol/league/v4/entries/"; // challenger leagues by queue, tier, and division
const queueParam = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_FLEX_TT"];
const tierParam = ["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON"];
const divParam = ["I", "II", "III", "IV"];
const devKey = "RGAPI-d50b9cd3-e3a9-43a3-af6e-c93228f7de46"; // the API key changes frequently (every 2 days?)

async function getData() {
  const url = `https://na1.api.riotgames.com${path}/${queueParam[0]}/${tierParam[0]}/${divParam[0]}?page=1&api_key=${devKey}`;
  const response = await fetch(url);
  // turn return value to json
  let json = await response.json();
  console.log(json);
}

getData();
