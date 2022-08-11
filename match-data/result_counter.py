import csv

tiers = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]
divisions = ["I", "II", "III", "IV"]

for tier in tiers:
    for division in divisions:
        filename = "match-data\\\\" + tier + "_" + division + ".csv"

        # losses are zeroes
        losses = 0
        # wins are ones
        wins = 0

        try:
            with open(filename, newline='') as csvfile:
                spamreader = csv.reader(csvfile)

                for row in spamreader:
                    if row[0] == "0": losses += 1
                    elif row[0] == "1": wins += 1

            print(wins, "wins and", losses, "losses for", tier, division)

        except FileNotFoundError:
            print("No data for", tier, division, "yet")

    print()


    
