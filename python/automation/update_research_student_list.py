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


def InsertToDB(year, semester, file_path, mycursor, connection):
    record_status = None
    code = None
    message = None
    affect_count = None
    empty = False
    semester = year + '-' + semester
    df = pd.read_csv(file_path, dtype={'學號': object, '學期': object, '專題一或二': int})
    first_second = int(df.loc[0, '專題一或二'])
    if df.loc[0, '學號'] == '空':
        empty = True

    sql0 = "DROP TEMPORARY TABLE IF EXISTS trs_on_cos;"
    sql1 = """CREATE TEMPORARY TABLE trs_on_cos(
                student_id varchar(10), 
                semester varchar(10), 
                first_second int(11),
                PRIMARY KEY (student_id, semester, first_second)
            )DEFAULT CHARSET=utf8mb4;
    """
    sql2 = """CREATE TABLE IF NOT EXISTS rs_on_cos(
                student_id varchar(10), 
                semester varchar(10), 
                first_second int(11), 
                PRIMARY KEY (student_id, semester, first_second)
            )DEFAULT CHARSET=utf8mb4;
    """
    sql3 = """LOAD DATA LOCAL INFILE '{}'
            INTO TABLE trs_on_cos
            CHARACTER SET 'utf8mb4'
            FIELDS TERMINATED BY ','
            ENCLOSED BY '"'
            LINES TERMINATED BY '\n'
            IGNORE 1 LINES;
    """
    sql6 = """UPDATE research_student
            SET add_status = 1
            WHERE student_id IN (SELECT student_id FROM trs_on_cos) AND
            semester LIKE %s AND (first_second = %s OR first_second = 3);
    """
    sql7 = """insert into rs_on_cos
                select * from trs_on_cos as t
                on duplicate key update
                student_id = t.student_id,
                semester = t.semester,
                first_second = t.first_second;
    """
    sql8 = "DELETE FROM rs_on_cos WHERE semester like %s AND first_second = %s;"
    sql9 = """UPDATE research_student
            SET add_status = 0
            WHERE semester = %s AND (first_second = %s OR first_second = 3);
    """
    sql10 = """UPDATE research_student
            SET add_status = 0
            WHERE semester = %s AND (first_second = %s OR first_second = 3) AND student_id NOT IN(
                SELECT student_id FROM trs_on_cos
            );
    """

    try:
        mycursor.execute(sql0)
        mycursor.execute(sql1)
        if empty:
            mycursor.execute(sql8, (semester, first_second))
            mycursor.execute(sql9, (semester, first_second))
        else:
            mycursor.execute(sql2)
            mycursor.execute(sql3.format(file_path))
            mycursor.execute(sql8, (semester, first_second))
            mycursor.execute(sql7)
            affect_count = mycursor.rowcount
            mycursor.execute(sql6, (semester, first_second))
            mycursor.execute(sql10, (semester, first_second))
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
        record_status, code, message, affect_count = InsertToDB(year, semester, file_path, mycursor, connection)
        if record_status == 0:
            message = "匯入專題修課名單錯誤：" + message
            checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
        elif record_status == 1:
            message = "成功匯入專題修課名單共" + str(affect_count) + "筆"
            checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
    mycursor.close()
    connection.close()
