exports.ShowGradeTeacherResearchStudent="\
    select r.teacher_id,r.intro, s.sname, s.CPEStatus, r.student_id, r.class_detail, r.research_title, r.first_second, r.score, r.semester, r.comment, r.add_status,\
    if(substring(s.program, 1, 1)='A' or substring(s.program, 1, 1)='B' or substring(s.program, 1, 1)='C' or substring(s.program, 1, 1)='D',1,0) as status, r.replace_pro, r.unique_id, s.phone, s.email \
    from \
    (\
        select r.intro, t.teacher_id, r.student_id, r.class_detail, r.score, r.research_title, r.first_second, r.semester, r.comment, r.add_status, r.replace_pro, r.unique_id \
        from research_student as r, teacher as t\
        where r.tname = t.tname\
    ) as r, student as s \
    where s.student_id = r.student_id \
    and r.student_id like concat(:grade,'%')\
    and r.teacher_id = :teacher_id \
    order by substring(s.student_id, 1, 2) desc";
    
exports.ShowSingleTeacherInfoResearchCnt="\
    select *\
    from\
    (\
        select r.tname, substring(r.semester, 1, 3) as 'year', count(*) as 'scount'\
        from \
        (\
            select distinct r.student_id, r.tname, t.teacher_id , r.semester \
            from research_student as r, teacher as t\
            where r.tname = t.tname and t.teacher_id = :teacher_id  and first_second = 1 \
        ) as r \
        where r.student_id IN \
        (\
            select student_id \
            from student \
            where (substring(program, 1, 1) = 'A'\
            or substring(program, 1, 1) = 'B'\
            or substring(program, 1, 1) = 'C'\
            or substring(program, 1, 1) = 'D')\
        )and r.student_id NOT IN\
        (\
            select cs.student_id\
            from(\
                select cs.student_id\
                from (select distinct s.student_id, s.cos_year, s.semester \
                        from cos_score as s \
                        where concat(s.cos_year, s.semester) \
                            not in (select concat(c.cos_year, c.semester) \
                                    from cos_score as c \
                                    where c.pass_fail = '修課中或休學' and c.student_id = s.student_id and semester != '3')\
                        and semester != '3') as cs \
                group by cs.student_id having count(distinct cs.student_id, cs.cos_year, cs.semester) >= 8\
            ) as cs\
        )\
        group by substring(r.semester, 1, 3), r.tname \
        order by r.tname, substring(r.semester, 1, 3)\
    ) as o right join \
    (\
        select t.teacher_id, t.phone, t.tname, t.email, t.expertise, t.info, tp.photo\
        from teacher_photo as tp right join\
        (\
            select t.teacher_id, ti.phone, t.tname, ti.email, ti.expertise, ti.info\
            from teacher_info as ti right join teacher as t on ti.tname = t.tname and t.teacher_id = :teacher_id\
        ) as t\
        on t.tname = tp.tname\
    ) as t\
   on o.tname = t.tname\
   where t.teacher_id = :teacher_id";

exports.ShowAllTeacherInfoResearchCnt="\
    select *\
    from\
    (\
        select r.tname, substring(r.semester, 1, 3) as 'year', count(*) as 'scount'\
        from \
        (\
            select distinct r.student_id, r.tname, t.teacher_id , r.semester \
            from research_student as r, teacher as t\
            where r.tname = t.tname  and first_second = 1 \
        ) as r \
        where r.student_id IN \
        (\
            select student_id \
            from student \
            where (substring(program, 1, 1) = 'A'\
            or substring(program, 1, 1) = 'B'\
            or substring(program, 1, 1) = 'C'\
            or substring(program, 1, 1) = 'D')\
        )and r.student_id NOT IN\
        (\
            select cs.student_id\
            from(\
                select cs.student_id\
                from (select distinct s.student_id, s.cos_year, s.semester \
                        from cos_score as s \
                        where concat(s.cos_year, s.semester) \
                            not in (select concat(c.cos_year, c.semester) \
                                    from cos_score as c \
                                    where c.pass_fail = '修課中或休學' and c.student_id = s.student_id and semester != '3')\
                        and semester != '3') as cs \
                group by cs.student_id having count(distinct cs.student_id, cs.cos_year, cs.semester) >= 8\
            ) as cs\
        )\
        group by substring(r.semester, 1, 3), r.tname \
        order by r.tname, substring(r.semester, 1, 3)\
    ) as o right join \
    (\
        select t.teacher_id, t.phone, t.tname, t.email, t.expertise, t.info, tp.photo\
        from teacher_photo as tp right join\
        (\
            select t.teacher_id, ti.phone, t.tname, ti.email, ti.expertise, ti.info\
            from teacher_info as ti right join teacher as t on ti.tname = t.tname\
        ) as t\
        on t.tname=tp.tname\
    ) as t\
        on o.tname = t.tname";

exports.ShowGivenGradeStudentResearch="\
    select distinct s1.student_id, s1.sname as name, s1.program, t.teacher_id, s1.tname\
    from teacher as t\
    right outer join\
    (\
        select s.student_id, s.sname, s.program, s.grade, rs.tname\
        from student as s, \
        (\
            select student_id, tname\
            from research_student\
            where student_id LIKE concat(:grade, '%')\
        ) as rs\
        where s.student_id = rs.student_id\
    ) as s1\
    on t.tname = s1.tname";

exports.ShowStudentResearchInfo="\
    select rs.student_id, rs.tname, rs.research_title, rs.first_second, rs.memo, rs.file, rs.photo, rs.filename, rs.intro,\
    rs.score, rs.semester, rs.comment, rs.video, rs.add_status,\
    case a.program when 'A' then 1 when 'B' then 1 when 'C' then 1 when 'D' then 1\
    else 0 end as status, rs.replace_pro, rs.unique_id \
    from research_student as rs, \
    (\
        select student_id, program\
        from student\
        where student_id = :student_id\
    ) as a\
    where rs.student_id = :student_id\
    and rs.student_id = a.student_id";

exports.ShowResearchGroup="\
    select student_id \
    from research_student\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and semester = :semester";

exports.ShowResearchGroupByUniqueID="\
    select student_id \
    from research_student\
    where unique_id = :unique_id";

exports.ShowResearchTitleNumber="\
    select count(distinct t.research_title)+1 as count\
    from\
    (\
        select distinct rs.research_title, rs.tname, rs.semester\
        from research_student as rs\
        union\
        select distinct raf.research_title, raf.tname, raf.semester\
        from research_apply_form as raf\
    ) as t\
    where t.research_title like concat(:research_title, '%')\
    and t.tname = :tname\
    and t.semester = :semester";


exports.ShowResearchFilePath="\
    select * from research_file where \
    research_title = :research_title \
    and tname = :tname \
    and first_second = :first_second;"

exports.ShowResearchScoreComment="\
    select r.tname, r.student_id, r.research_title, r.score, s.sname, r.comment,if(substring(s.program,1,1)='A' or substring(s.program,1,1)='B' or substring(s.program,1,1)='C' or substring(s.program,1,1)='D',1,0) as status\
    from research_student as r, \
    (\
        select student_id, sname,program \
        from student \
    ) as s\
    where s.student_id = r.student_id\
    and r.semester = :semester\
    and r.first_second = :first_second"

exports.ShowTeacherResearchApplyFormList="\
    select tmp.*, rs.replace_pro\
    from\
    (\
        select a.student_id, s.sname, s.program, s.CPEStatus, a.research_title, a.teacher_id, a.tname, a.first_second, a.agree, s.phone, s.email, a.semester, a.unique_id,\
        if(substring(s.program, 1, 1)='A' or substring(s.program, 1, 1)='B' or substring(s.program, 1, 1)='C' or substring(s.program, 1, 1)='D', 1, 0) as status\
        from \
        (\
            select t.teacher_id, r.student_id, r.research_title, r.tname, r.agree, r.first_second, r.semester, r.unique_id\
            from teacher as t, research_apply_form as r\
            where t.tname = r.tname\
            and t.teacher_id = :teacher_id\
        ) as a, \
        (\
            select sname, student_id, phone, email, program, CPEStatus\
            from student\
        ) as s \
        where s.student_id = a.student_id \
    ) as tmp \
    left outer join \
    (\
        select r.student_id, r.semester, r.replace_pro\
        from research_student as r,\
        (\
            select t.tname\
            from teacher as t\
            where t.teacher_id = :teacher_id\
        ) as t\
        where r.tname = t.tname\
    ) as rs\
    on rs.student_id = tmp.student_id \
    and rs.semester = tmp.semester\
    order by tmp.research_title";

exports.ShowStudentResearchApplyForm="\
    select a.student_id, s.sname, a.research_title, a.tname, a.agree, a.first_second, s.phone, s.email, a.semester,s.status\
    from research_apply_form as a, \
    (\
        select sname, student_id, phone, email,if(substring(program, 1, 1)='A' or substring(program, 1, 1)='B' or substring(program, 1, 1)='C' or substring(program, 1, 1)='D', 1, 0) as status\
        from student\
        where student_id = :student_id\
    ) as s\
    where s.student_id = a.student_id\
    ";

exports.ShowStudentResearchStatus="\
    select distinct cs.student_id,\
    if(exists\
        (select c.cos_code\
        from cos_score c\
        where c.student_id = cs.student_id and c.cos_code = 'DCP4121' and c.pass_fail != '不通過'),'5',\
    if(exists\
        (select rs.student_id\
        from research_student rs\
        where rs.student_id = cs.student_id),'4',\
    if(exists\
        (select raf.student_id\
        from research_apply_form raf\
        where raf.student_id = cs.student_id),'7',\
    if(exists\
        (select c.cos_code\
        from cos_score c\
        where c.student_id = cs.student_id and c.cos_code = 'DCP3103' and c.pass_fail = '通過'),'2',\
    if(not exists \
        (select c.cos_code\
        from cos_score c\
        where c.student_id = cs.student_id and (c.cos_code = 'DCP1236' or c.cos_code = 'DCP2106')),'3',\
    if( not exists\
        (select c.cos_code\
        from cos_score c\
        where c.student_id = cs.student_id and (c.cos_code = 'DCP1236' or c.cos_code = 'DCP2106') and c.pass_fail = '通過'),'3','1'))))))\
        as status \
    from cos_score cs \
    where cs.student_id = :student_id\
    ";

exports.ShowStudentResearchList = "\
    select s.sname, s.phone, s.student_id, rs.research_title, rs.tname, rs.first_second,\
        s.email, rs.semester\
    from student as s, research_student as rs\
    where s.student_id = rs.student_id\
    and rs.first_second = :first_second\
    and rs.semester = :semester";

exports.ShowStudentFirstSecond = "\
    select first_second \
    from research_student \
    where student_id = :student_id \
    order by semester desc \
    limit 1";

exports.ShowOnCosButNotInDBStudentList = "\
    select s.student_id, s.sname\
    from student as s, (\
        select roc.student_id\
        from rs_on_cos as roc\
        where roc.student_id not in\
        (\
            select student_id\
            from research_student\
            where semester = :semester\
            and (first_second = :first_second or first_second = 3)\
        )\
        and roc.student_id not in\
        (\
            select student_id\
            from research_apply_form\
            where semester = :semester\
            and (first_second = :first_second or first_second = 3)\
        )\
        and roc.semester = :semester\
        and roc.first_second = :first_second\
    ) as t\
    where s.student_id = t.student_id\
    ";

exports.ShowInDBButNotOnCosStudentList = "\
    select s.student_id, s.sname\
    from student as s, (\
        select distinct student_id from (\
            select rs.student_id\
            from research_student as rs\
            where add_status = 0\
            and semester = :semester\
            and (first_second = :first_second or first_second = 3)\
        union\
            select raf.student_id\
            from research_apply_form as raf\
            where raf.student_id not in (\
                select student_id\
                from rs_on_cos\
                where semester = :semester\
                and first_second = :first_second\
            )\
            and raf.semester = :semester\
            and (raf.first_second = :first_second or raf.first_second = 3)\
        ) t\
    ) as t\
    where s.student_id = t.student_id\
    ";

exports.ShowResearchStudentGivenSemesterCPE = "\
    select s.student_id, s.sname\
    from \
    student as s, \
    research_apply_form as a\
    where s.student_id = a.student_id and a.semester = :semester and s.CPEStatus = :cpe_status\
    ";