import logging
import os
import pandas as pd
import sys

#Store in log file
def createlogger():
    dir_path = './autolog/'
    filename = 'autocheck.log'
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    logging.basicConfig(level=logging.INFO)
    logging.captureWarnings(True)               #Capture python warnings
    logger = logging.getLogger()
    formatter = logging.Formatter(
        '%(asctime)s, %(filename)s, %(name)s, %(levelname)s, %(message)s' ,
        datefmt= '%Y-%m-%d %H:%M:%S'
    )
    fh = logging.FileHandler(dir_path + filename)
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    return logger

#Store in DB, 0 : FAIL, 1 : SUCCESS, 2 : PENDING
def recordLog(unique_id, record_status, message, mycursor, connection):
    sql_log = '''UPDATE log_file SET status=%s, message=%s
    WHERE unique_id=%s;
    '''
    check = [record_status, message, unique_id]
    mycursor.execute(sql_log, tuple(check))
    connection.commit()

def initialLog(calling_file, record_status, year, semester, mycursor, connection):
    type_mapping = {
        "cos_score": "課程成績資料",
        "new_teacher_info": "新老師資料",
        "on_cos_data": "當期修課資料",
        "student": "學生資料",
        "offset": "抵免免修資料",
        "en_certificate": "英文換修資料",
        "research_student_list": "專題選課名單"
    }

    calling_file = calling_file.split('/')[-1]
    log_type = '_'.join(calling_file.split('_')[1:]).split('.')[0]
    if log_type in type_mapping:
        log_type = type_mapping[log_type]
    else:
        log_type = "其他"

    sql_log = '''INSERT INTO log_file (calling_file, status, year, semester, log_type)
        VALUES (%s,%s,%s,%s, %s);
        '''
    check = [calling_file, record_status, year, semester, log_type]
    mycursor.execute(sql_log, tuple(check))
    connection.commit()
    return mycursor.lastrowid

def convertExcelToCsv(input_path, output_path):
    convert_type = '抵免' in output_path or 'offset' in output_path
    df = None
    if convert_type == False:
        if 'research_student_list' not in output_path:
            check_column = '當期課號'
            df_varify = pd.read_excel(input_path)
            df_key = list(df_varify.keys())
            if check_column in df_key:
                df = pd.read_excel(input_path, dtype={'學號': object, '當期課號': object})
            else:
                df = pd.read_excel(input_path, dtype={'學號': object})
        else:
            df = pd.read_excel(input_path, dtype={'學號': object, '學期': object, '專題一或二': int})
    else:
        df = pd.read_excel(input_path, encoding = 'utf-8', dtype = {'學號':object, '修課年度':object, '修課學期':object, '修課當期課號':object})
        
    df.to_csv(output_path, index=False, encoding = 'utf-8')

if __name__ == '__main__':
    """./upload/106B、106暑期資訊學院全體學生修課成績資料-資工學院-20181022.xlsx"""
    """./original/on_cos_data_test.csv"""
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    convertExcelToCsv(input_path, output_path)