import csv


correct = 0
total = 0

with open('match-data\dataset.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile)

    rival_win_idx = [0] * 5
    rival_loss_idx = [0] * 5
    rival_rates = [0] * 5

    ally_win_idx = [0] * 5
    ally_loss_idx = [0] * 5
    ally_rates = [0] * 5

    result_idx = 1

    i = 0
    for row in spamreader:
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
            true_result = row[result_idx]

            # get win rate for all allies & rivals
            for j in range(len(ally_win_idx)):
                # rate = win / (win + loss)
                ally_rates[j] = int(row[ally_win_idx[j]]) / (int(row[ally_win_idx[j]]) + int(row[ally_loss_idx[j]]))

            for j in range(len(rival_win_idx)):
                rival_rates[j] = int(row[rival_win_idx[j]]) / (int(row[rival_win_idx[j]]) + int(row[rival_loss_idx[j]]))
                
            ally_rate = sum(ally_rates) / 5
            rival_rate = sum(rival_rates) / 5

            if(ally_rate > rival_rate): result = '1'
            else: result = '0'

            # check against actual output
            if result == true_result: correct += 1
            total += 1

        i += 1

percentage = round(correct/total*100, 2)
print("CORRECT:", correct, "out of", total, "({}%)".format(percentage))


# display results
# with open('test_output.csv', 'w', newline='') as csvfile:
#     spamwriter = csv.writer(csvfile)

#     for row in results:
#         spamwriter.writerow(row)

