import csv

results = []

with open('test_player_data.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile, delimiter = ' ', quotechar='|')

    for row in spamreader:
        row = row[0]
        row = row.split(",")

        if row[1] == "main_player_miniseries_wins":
            print("skipped first row")
            continue

        allyrate = 0
        rivalrate = 0

        # get win rate for all allies & rivals
        a1rate = int(row[0]) / (int(row[0]) + int(row[2]))
        a2rate = int(row[9]) / (int(row[9]) + int(row[11]))
        a3rate = int(row[18]) / (int(row[18]) + int(row[20]))
        a4rate = int(row[27]) / (int(row[27]) + int(row[29]))
        a5rate = int(row[36]) / (int(row[36]) + int(row[36]))

        r1rate = int(row[45]) / (int(row[45]) + int(row[47]))
        r2rate = int(row[54]) / (int(row[54]) + int(row[56]))
        r3rate = int(row[63]) / (int(row[63]) + int(row[63]))
        r4rate = int(row[72]) / (int(row[72]) + int(row[74]))
        r5rate = int(row[81]) / (int(row[81]) + int(row[83]))

        allyrate = (a1rate + a2rate + a3rate + a4rate + a5rate) / 5
        rivalrate = (r1rate + r2rate + r3rate + r4rate + r5rate) / 5

        if(allyrate > rivalrate): results.append(1)
        else: results.append(0)

print(results)

