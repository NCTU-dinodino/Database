import sys
import pymysql
import csv
import pandas as pd
import numpy as np
import checkFile
import connect

def validateCSV(file_path):
    #since score has NaN, so its type will be float64
    needed_column = ['學號', '學年度', '學期', '當期課號', '開課系所', '課程名稱', '永久課號', '課程向度', '學生選別', '學分數', '評分方式', '評分狀態', '成績', '等級成績', 'GP']
    needed_type = [object, np.int64, np.int64, object, object, object, object, object, object, np.float64, object, object, np.float64, object, np.float64]
    record_status = 1
    validate_flag = True
    df = pd.read_csv(file_path, dtype={'學號': object, '當期課號': object})
    csv_column = df.keys().tolist()

    all_include = set(needed_column).issubset(csv_column)
    if all_include == False:
        record_status = 0
        error_column = str(set(needed_column) - set(csv_column))
        message = "錯誤：名稱有誤 : " + error_column
        validate_flag = False
        checkFile.recordLog(calling_file, record_status, message, mycursor, connection)
        return validate_flag
    
    #pandas type : object, int64, float64, bool, datetime64, timedelta[ns], category
    # print(df.info())
    # print(df[0:5])
    for i in range(len(needed_column)):
        if df[needed_column[i]].dtype != needed_type[i]:
            message = "錯誤：" + needed_column[i] + "格式有誤 : " + str(df[needed_column[i]].dtype)
            record_status = 0
            validate_flag = False
            checkFile.recordLog(calling_file, record_status, message, mycursor, connection)
            return validate_flag              
    return validate_flag

def insertDB(file_path, mycursor, connection):
    record_status = None
    code = None
    message = None
    affect_count = None

    dump_sql1 = '''
        create temporary table temp_cos_score(
            student_id varchar(10),
            cos_year int(11),
            semester int(11),
            cos_id varchar(10),
            cos_dep varchar(20),
            cos_cname varchar(50),
            cos_code varchar(20),
            brief varchar(20),
            cos_type varchar(20),
            cos_credit float,
            score_type varchar(10),
            pass_fail varchar(10),
            score int(11),
            score_level varchar(10),
            gp double,
            primary key(student_id, cos_year, semester, cos_id)
        )DEFAULT CHARSET=utf8mb4;
    '''
    dump_sql2 = '''
        load data local infile '{}'
        into table temp_cos_score
        character set 'utf8'
        fields terminated by ','
        enclosed by '"'
        lines terminated by '\r\n'
        ignore 1 lines;
    '''
    dump_sql3 = '''
        insert into cos_score
        select * from temp_cos_score
        on duplicate key update
        cos_id = values(cos_id),
        cos_dep = values(cos_dep),
        cos_cname = values(cos_cname),
        cos_code = values(cos_code),
        brief = values(brief),
        cos_type = values(cos_type),
        cos_credit = values(cos_credit),
        score_type = values(score_type),
        pass_fail = values(pass_fail),
        score = values(score),
        score_level = values(score_level),
        gp = values(gp)
        ;
    '''
    dump_sql4 = '''
        drop temporary table temp_cos_score;
    '''

    try:
        mycursor.execute(dump_sql1)
        mycursor.execute(dump_sql2.format(file_path))
        affect_count = mycursor.execute(dump_sql3)
        mycursor.execute(dump_sql4)
    except pymysql.InternalError as error:
        code, message = error.args
        record_status = 0
        connection.rollback()
    else:
        print('Success')
        connection.commit()
        record_status = 1

    return record_status, code, message, affect_count

if __name__ == "__main__":
    """./original/cos_score.csv"""
    file_path = sys.argv[1]
    global calling_file
    calling_file = __file__
    mycursor, connection = connect.connect2db()

    #Check csv file
    validate_flag = validateCSV(file_path)
    # print(validate_flag)

    if validate_flag == True:
        #Import this semester's on cos data
        record_status, code, message, affect_count = insertDB(file_path, mycursor, connection)
        if record_status == 0:
            message = "匯入成績錯誤：" + message
            checkFile.recordLog(calling_file, record_status, message, mycursor, connection)
        if record_status == 1:
            message = "已匯入成績共 " + str(affect_count) + ' 筆'
            checkFile.recordLog(calling_file, record_status, message, mycursor, connection)
    mycursor.close()  ## here all loops done
    connection.close()  ## close db connection