import csv

results = []

# collect true outputs
with open('PLATINUM_IV_output.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile)

    for row in spamreader:
        results.append([row[0]])

correct = 0
total = 0


with open('PLATINUM_IV_input.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile)

    rival_win_idx = [0] * 5
    rival_loss_idx = [0] * 5
    rival_rates = [0] * 5

    ally_win_idx = [0] * 5
    ally_loss_idx = [0] * 5
    ally_rates = [0] * 5

    i = 0
    for row in spamreader:
        if i == 200: print(row)
        if i == 0:
            # get indices of win & loss counts for each player
            for j in range(len(row)):
                column = row[j].split("_")

                if(column[0] == "rival"):
                    if(column[2] == "wins"):
                        rival_win_idx[int(column[1])] = j
                    
                    elif(column[2] == "losses"):
                        rival_loss_idx[int(column[1])] = j

                elif(column[0] == "ally"):
                    if(column[2] == "wins"):
                        ally_win_idx[int(column[1])] = j
                    
                    elif(column[2] == "losses"):
                        ally_loss_idx[int(column[1])] = j

                elif(column[0] == "main"):
                    if(column[2] == "win"):
                        ally_win_idx[4] = j
                    
                    elif(column[2] == "losses"):
                        ally_loss_idx[4] = j

        else:
            # get win rate for all allies & rivals
            for j in range(len(ally_win_idx)):
                # rate = win / (win + loss)
                ally_rates[j] = int(row[ally_win_idx[j]]) / (int(row[ally_win_idx[j]]) + int(row[ally_loss_idx[j]]))

            for j in range(len(rival_win_idx)):
                rival_rates[j] = int(row[rival_win_idx[j]]) / (int(row[rival_win_idx[j]]) + int(row[rival_loss_idx[j]]))
                
            ally_rate = sum(ally_rates) / 5
            rival_rate = sum(rival_rates) / 5

            if(ally_rate > rival_rate): results[i].append('1')
            else: results[i].append('0')

            # check against actual output
            if results[i][0] == results[i][1]: correct += 1
            total += 1

        i += 1

print("CORRECT:", correct, "out of", total)

print(results)

# display results
# with open('test_output.csv', 'w', newline='') as csvfile:
#     spamwriter = csv.writer(csvfile)

#     for row in results:
#         spamwriter.writerow(row)

