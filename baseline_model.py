import csv

results = []

# collect true outputs
with open('output.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile)

    for row in spamreader:
        if len(row) == 0: results.append(['0'])
        elif row[0] == 'result': continue
        else: results.append(row)

correct = 0
total = 0

with open('input.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile)

    i = 0
    for row in spamreader:
        if row[0] == "main_player_win":
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

        if(allyrate > rivalrate): results[i].append('1')
        else: results[i].append('0')

        if results[i][0] == results[i][1]: correct += 1
        total += 1

        i += 1

print("CORRECT:", correct, "out of", total)

with open('test_output.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile)

    for row in results:
        spamwriter.writerow(row)

