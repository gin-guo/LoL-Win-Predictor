import csv

def modify_file(filename):
    fixed_rows = []

    with open(filename, newline='') as csvfile:
        spamreader = csv.reader(csvfile)

        bad_words = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]

        count = 0
        badcount = 0
        for row in spamreader:
            if(count == 0):
                row.remove("main_player_rank")

            for i in range(len(row)):
                if(row[i] in bad_words):
                    badcount += 1
                    good_word = row[i] + "_" + row[i+1]
                    row[i] = good_word
                    row.pop(i+1)
                    break
            fixed_rows.append(row)
            count += 1

    print(filename + ":", badcount, "bad rows out of", count, "rows")
    return fixed_rows


def write_to_new(filename, fixed_rows):
    filename = filename + "_input.csv"
    with open(filename, 'w', newline='') as csvfile:
        spamwriter = csv.writer(csvfile)

        for row in fixed_rows:
            spamwriter.writerow(row)


if __name__ == "__main__":
    my_files_to_fix = ["bronzeI", "bronzeII", "bronzeIV", "ironI", "ironII", "ironIII", "ironIV"]
    ginny_files_to_fix = ["silver1", "silver2", "silver3", "silver4"]


    for file in my_files_to_fix:
        old_filename = "input_" + file + ".csv"
        fixed_rows = modify_file(old_filename)

        if(file == "bronzeI"): new_filename = "BRONZE_I"
        elif(file == "bronzeII"): new_filename = "BRONZE_II"
        elif(file == "bronzeIV"): new_filename = "BRONZE_IV"
        elif(file == "ironI"): new_filename = "IRON_I"
        elif(file == "ironII"): new_filename = "IRON_II"
        elif(file == "ironIII"): new_filename = "IRON_III"
        else: new_filename = "IRON_IV"

        write_to_new(new_filename, fixed_rows)

    for file in ginny_files_to_fix:
        old_filename = file + "_input.csv"
        fixed_rows = modify_file(old_filename)

        if(file == "silver1"): new_filename = "SILVER_I"
        elif(file == "silver2"): new_filename = "SILVER_II"
        elif(file == "silver3"): new_filename = "SILVER_III"
        else: new_filename = "SILVER_IV"

        write_to_new(new_filename, fixed_rows)


