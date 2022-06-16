# LoL-Win-Predictor

## Introduction
![image](https://user-images.githubusercontent.com/72530527/173493464-56178ca8-d420-43ac-afa3-2146b9bcb457.png)
League of Legends (aka LoL, League) is a team-oriented strategy game with an overwhelming total of 150 million registered users and over 117 million active monthly users. This popular video game has two teams each consisting of five players playing different champions, fighting against the other team with the end objective of destroying the enemy’s base through using a combination of mechanical skill and wit. The game has a competitive rank system for team creation and has one of the largest esports scene with various tournaments worldwide and a vast fanbase.

An average round of League takes 30 to 45 minutes. Oftentimes, if players are placed in a lobby against people much below or beyond their skill level, they would be forced to play the entirety of the game on a losing streak with little constructive development on their strategic abilities. This poor gaming experience causes players to spend unproductive time sitting in front of a seat, thus damaging their physical health, and may cause declines in their overall mood which could contribute to a toxic environment for the gaming community as a whole.

The purpose of this project is to enhance the gaming experience and skill improvement efficiency for League players across the world. The deep learning program uses an individual players’ past combat statistics (win rate, champion expertise, etc.) to assign a winning probability to evaluate a team’s performance on an upcoming game in relation to the enemy team. This tool can be used to both help game developers create fairer teams, and provide a scientific feedback system to allow players to self-evaluate their strategic and mechanical skills levels. The ability for players to gauge their strength and weaknesses ultimately improves both the mental and physical health of League players across the globe.

## Game Rules
![image](https://user-images.githubusercontent.com/72530527/173493526-65a75a21-7e7e-4c12-8c64-b0629665e907.png)


## Riot API
The data used in this program is extracted from the Riot Development API, of which the documentation can be found here: https://developer.riotgames.com/docs/lol. The data sample used focuses on Summoners (League players) in the NA1 region, playing ranked games.

## data-parser.js

### Usage

`node data-parser.js [region] [tier] [division] [page]`

Where
* `region` is one of 'br1', 'eun1', 'euw1', 'jp1', 'kr1', 'la1', 'la2', 'na1', 'oc1', 'ru' or 'tr1'.
* `tier` is one of 'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM' or 'DIAMOND'.
* `division` is one of 'I', 'II', 'III' or 'IV'.
* `page` is an integer that starts and 1 and keeps increments till there is no more data for the selected configuration.

Example:
`node data-parser.js na1 II GOLD 1`