import pymysql
import pandas as pd
import connect
import checkFile
import sys

def ValidateCSV(file_path, unique_id, mycursor, connection):
    needed_column = ['學號', '指導老師', '題目', '學期', '專題一或二']
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

    sql1 = """create temporary table trs(
                student_id varchar(10), 
                tname varchar(50), 
                research_title varchar(150), 
                first_second int(11), 
                semester varchar(10)
            )DEFAULT CHARSET=utf8mb4;
    """
    sql2 = """LOAD DATA LOCAL INFILE '{}'
            INTO TABLE trs
            CHARACTER SET 'utf8mb4'
            FIELDS TERMINATED BY ','
            OPTIONALLY ENCLOSED BY '"'
            LINES TERMINATED BY '\n'
            IGNORE 1 LINES;
    """
    sql3 = """insert into research_student(student_id, tname, research_title, first_second, semester)
                select * from trs as t
                on duplicate key update
                student_id = t.student_id,
                tname = t.tname,
                research_title = t.research_title,
                first_second = t.first_second,
                semester = t.semester;
    """
    sql4 = "drop temporary table trs;"

    try:
        mycursor.execute(sql1)
        mycursor.execute(sql2.format(file_path))
        mycursor.execute(sql3)
        affect_count = mycursor.rowcount
        mycursor.execute(sql4)
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
            message = "匯入專題資料錯誤：" + message
            checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
        elif record_status == 1:
            message = "成功匯入專題資料共" + str(affect_count) + "筆"
            checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
    mycursor.close()
    connection.close()
