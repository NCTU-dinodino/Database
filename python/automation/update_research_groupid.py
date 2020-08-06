import pymysql
import csv
import pandas as pd
import connect
import copy

def GetGroupFromDB(mycursor, connection):
    group_research = []
    used_student = []
    sql = "select * from research_student;"
    mycursor.execute(sql)
    research_student = mycursor.fetchall()
    
    for i in range(len(research_student)):
        tmp_group = []
        if i == len(research_student)-1:
            if research_student[i] not in used_student:
                tmp_group.append(research_student[i])
                group_research.append(tmp_group)
            break
        if research_student[i] in used_student:
            continue
        used_student.append(research_student[i])
        tmp_group.append(research_student[i])
        for j in range(i+1, len(research_student)):
            # tname = 2, title = 3, first_second = 4, semester = 8
            if (research_student[i][2] == research_student[j][2] and 
                research_student[i][3] == research_student[j][3] and 
                research_student[i][4] == research_student[j][4] and 
                research_student[i][8] == research_student[j][8]):
                tmp_group.append(research_student[j])
                used_student.append(research_student[j])
        # sort group by student_id
        tmp_group.sort(key=lambda x: x[1])
        group_research.append(copy.deepcopy(tmp_group))
    return group_research

def CreateUniqueIDForGroup(group_research, mycursor, connection):
    sql1 = "select MD5(%s);"
    sql2 = """update research_student
                set unique_id = %s
                where student_id like %s and
                tname like %s and
                research_title like %s and
                first_second like %s and
                semester like %s;
    """
    for g in group_research:
        unique_id = str("")
        for i in range(len(g)):
            unique_id += g[i][1]
        unique_id += str(g[0][2]) + str(g[0][3]) + str(g[0][4]) + str(g[0][8])
        mycursor.execute(sql1, (unique_id,))
        md5 = mycursor.fetchone()
        for i in range(len(g)):
            mycursor.execute(sql2, (md5, g[i][1], g[i][2], g[i][3], g[i][4], g[i][8]))
            connection.commit()


if __name__ == "__main__":
    mycursor, connection = connect.connect2db()
    group_research = GetGroupFromDB(mycursor, connection)
    CreateUniqueIDForGroup(group_research, mycursor, connection)
