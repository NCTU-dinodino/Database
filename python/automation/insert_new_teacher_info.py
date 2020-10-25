import pymysql
import csv
import pandas as pd
import numpy as np
import connect
import checkFile
import sys
import os

def validatecsv(file_path, unique_id):
	needed_column = ['電話', '教授姓名', 'email', '研究領域', '簡介', '教授id']
	record_status = 1
	validate_flag = True
	df1 = pd.read_csv(file_path, dtype = str)
	csv_column = df1.keys().tolist()

	all_include = set(needed_column).issubset(csv_column)
	if all_include == False:
		record_status = 0
		err_col = str(set(needed_column) - set(csv_column))
		message = "錯誤：名稱有誤：" + err_col
		validate_flag = False
		checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
		return validate_flag
	df1['是否退休'] = 0
	os.remove(file_path)
	df1.to_csv(file_path, index = False, encoding = 'utf-8')
	df2 = pd.DataFrame(columns = ['教授id', '教授姓名'])
	df2['教授id'] = df1['教授id']
	df2['教授姓名'] = df1['教授姓名']
	output_path = os.getcwd() + "/temp_teacher.csv"
	df2.to_csv(output_path, index = False, encoding = 'utf-8')
	return output_path, validate_flag

def insert2db(file_path, output_path, mycursor, connection):
	record_status = None
	code = None
	message = None
	affect_count1 = None
	affect_count2 = None

	sql1 =  """create temporary table temp_teacher_info(
				phone varchar(30),
				tname varchar(50),
				email varchar(50),
				expertise varchar(100),
				info text,
				teacher_id varchar(10),
				retirement int(2) default 0,
				primary key(tname)
			)DEFAULT CHARSET=utf8mb4;
			"""

	sql2 =  """load data local infile '{}'
			into table temp_teacher_info
			character set 'utf8'
			fields terminated by ','
			enclosed by '"'
			lines terminated by '\n'
			ignore 1 lines;
			"""
	
	sql3 =  """insert into teacher_info
				select * from temp_teacher_info as tt
				on duplicate key update
				phone = tt.phone,
				tname = tt.tname,
				email = tt.email,
				expertise = tt.expertise,
				info = tt.info,
				teacher_id = tt.teacher_id,
				retirement = tt.retirement
				;
			"""

	sql4 =  """drop temporary table temp_teacher_info;
			"""

	sql5 =  """create temporary table temp_teacher(
				teacher_id varchar(10),
				tname varchar(50),
				primary key(teacher_id)
			)DEFAULT CHARSET=utf8mb4;
			"""

	sql6 =  """load data local infile '{}'
			into table temp_teacher
			character set 'utf8'
			fields terminated by ','
			enclosed by '"'
			lines terminated by '\n'
			ignore 1 lines;
			"""
	
	sql7 =  """insert into teacher
				select * from temp_teacher as tt
				on duplicate key update
				teacher_id = tt.teacher_id,
				tname = tt.tname                
				;
			"""

	sql8 =  """drop temporary table temp_teacher;
			"""

	try:
		mycursor.execute(sql1)
		mycursor.execute(sql2.format(file_path))
		affect_count1 = mycursor.execute(sql3)
		mycursor.execute(sql4)
		mycursor.execute(sql5)
		mycursor.execute(sql6.format(output_path))
		affect_count2 = mycursor.execute(sql7)
		mycursor.execute(sql8)
	except pymysql.InternalError as error:
		code, message = error.args
		record_status = 0
		connection.rollback()
	else:
		print("Success")
		connection.commit()
		record_status = 1
	return record_status, code, message, affect_count1, affect_count2

if __name__ == '__main__':
	file_path = sys.argv[1]
	year = file_path.split('/')[-1].split('-')[0]
	semester = file_path.split('/')[-1].split('-')[1]
	global calling_file
	calling_file = __file__
	mycursor, connection = connect.connect2db()

	# Insert pending status (2) into database
	record_status = 2
	unique_id = checkFile.initialLog(calling_file, record_status, year, semester, mycursor, connection)

	# Check csv file
	output_path, validate_flag = validatecsv(file_path, unique_id)

	if validate_flag == True:
		record_status, code, message, affect_count1, affect_count2 = insert2db(file_path, output_path, mycursor, connection)
		if record_status == 0:
			message = "匯入新老師資料錯誤：" + message
			checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
		elif record_status == 1 and affect_count1 == affect_count2:
			message = "已匯入新老師資料共" + str(affect_count1) + "筆"
			checkFile.recordLog(unique_id, record_status, message, mycursor, connection)
	mycursor.close()
	connection.close()
	
	try:
		os.remove(output_path)
	except OSError as e:
		print(e)
