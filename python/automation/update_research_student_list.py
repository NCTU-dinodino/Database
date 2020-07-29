import pymysql
import pandas as pd
import connect
import checkFile
import sys

def ValidateCSV(file_path, unique_id, mycursor, connection):
    needed_column = ['學號', '學期', '專題一或二']
    record_status = 1
    validate_flag = True
    df = pd.read_csv(file_path, encoding = 'utf-8')
    csv_column = df.keys().tolist()

    all_include = set(needed_column).issubset(csv_column)
    if all_include == False:
        record_status = 0
        err_col = str(set(needed_column) - set(csv_column))
        message = "錯誤：名稱有誤：" + err_col
        validate_flag = False
        checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
        return validate_flag
    return validate_flag


def InsertToDB(file_path, mycursor, connection):
    record_status = None
    code = None
    message = None
    affect_count = None

    sql1 = "DROP TABLE IF EXISTS rs_on_cos;"
    sql2 = """CREATE TABLE IF NOT EXISTS rs_on_cos(
                student_id varchar(10), 
                semester varchar(10), 
                first_second int(11)
            )DEFAULT CHARSET=utf8mb4;
    """
    sql3 = """LOAD DATA LOCAL INFILE '{}'
            INTO TABLE rs_on_cos
            CHARACTER SET 'utf8mb4'
            FIELDS TERMINATED BY ','
            ENCLOSED BY '"'
            LINES TERMINATED BY '\n'
            IGNORE 1 LINES;
    """
    sql4 = "SELECT * FROM rs_on_cos;"
    sql5 = """SELECT * FROM research_student
            WHERE student_id LIKE %s AND
            semester LIKE %s AND
            first_second LIKE %s;
    """
    sql6 = """UPDATE research_student
            SET add_status = 1
            WHERE student_id LIKE %s AND
            semester LIKE %s AND
            first_second LIKE %s;
    """

    try:
        mycursor.execute(sql1)
        mycursor.execute(sql2)
        mycursor.execute(sql3.format(file_path))
        affect_count = mycursor.rowcount
        mycursor.execute(sql4)
        rs_on_cos = mycursor.fetchall()
        for item in rs_on_cos:
            mycursor.execute(sql5, (item[0], item[1], item[2]))
            tmp = mycursor.fetchall()
            if tmp != ():
                mycursor.execute(sql6, (item[0], item[1], item[2]))
    except pymysql.InternalError as error:
        code, message = error.args
        record_status = 0
        connection.rollback()
    else:
        print("Success")
        connection.commit()
        record_status = 1

    return record_status, code, message, affect_count

if __name__ == '__main__':
    mycursor, connection = connect.connect2db()
    file_path = sys.argv[1]
    year = file_path.split('/')[-1].split('-')[0]
    semester = file_path.split('/')[-1].split('-')[1]
    global calling_file
    calling_file = __file__

    # Insert pending status (2) into database
    record_status = 2
    unique_id = checkFile.initialLog(calling_file, record_status, year, semester, mycursor, connection)

    # Check csv file
    validate_flag = ValidateCSV(file_path, unique_id, mycursor, connection)
    
    if validate_flag:
        record_status, code, message, affect_count = InsertToDB(file_path, mycursor, connection)
        if record_status == 0:
            message = "匯入專題修課名單錯誤：" + message
            checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
        elif record_status == 1:
            message = "成功匯入專題修課名單共" + str(affect_count) + "筆"
            checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
    mycursor.close()
    connection.close()
