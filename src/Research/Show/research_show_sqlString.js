exports.ShowGradeTeacherResearchStudent="\
    select r.teacher_id,r.intro, s.sname, r.student_id, r.class_detail, r.research_title, r.first_second, r.score, r.semester, r.comment, r.add_status,\
    if(substring(s.program,1,2)='資工' or substring(s.program,1,2)='網多' or substring(s.program,1,2)='資電',1,0) as status\
    from \
    (\
        select r.intro, t.teacher_id, r.student_id, r.class_detail, r.score, r.research_title, r.first_second, r.semester, r.comment, r.add_status\
        from research_student as r, teacher as t\
        where r.tname = t.tname\
    ) as r, student as s \
    where s.student_id = r.student_id \
    and r.student_id like concat(:grade,'%')\
    and r.teacher_id = :teacher_id \
    order by substring(s.student_id, 1, 2) desc";
    
exports.ShowTeacherInfoResearchCnt="\
    select *\
    from\
    (\
        select r.tname, substring(r.student_id, 1, 2) as 'grade', count(*) as 'scount'\
        from \
        (\
            select distinct r.student_id, r.tname, t.teacher_id \
            from research_student as r, teacher as t\
            where r.tname = t.tname\
        ) as r \
        where r.student_id IN \
        (\
            select student_id \
            from student \
            where student_id NOT IN \
            (\
                select student_id \
                from student \
                where student_id LIKE '__4____' \
            )\
            and (substring(program,1,2) = '資工'\
            or substring(program,1,2) = '資電'\
            or substring(program,1,2) = '網多')\
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
        group by substring(r.student_id, 1, 2), r.tname \
        order by r.tname, substring(r.student_id, 1, 2)\
    ) as o right join \
    (\
        select t.teacher_id,ti.phone, t.tname, ti.email, ti.expertise, ti.info\
        from teacher_info as ti right join teacher as t on ti.tname = t.tname\
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
    select rs.student_id, rs.tname, rs.research_title, rs.first_second, rs.memo, rs.link, rs.intro,\
    rs.score, rs.semester, rs.comment, rs.video, rs.add_status,\
    case a.program when '資工A' then 1 when '資工B' then 1 when '網多' then 1 when '資電' then 1\
    else 0 end as status\
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

exports.ShowResearchFilePath="\
    select * from research_file where \
    research_title = :research_title \
    and tname = :tname \
    and first_second = :first_second;"

exports.ShowResearchScoreComment="\
    select r.tname, r.student_id, r.research_title, r.score, s.sname, r.comment,if(substring(s.program,1,2)='資工' or substring(s.program,1,2)='網多' or substring(s.program,1,2)='資電',1,0) as status\
    from research_student as r, \
    (\
        select student_id, sname,program \
        from student \
    ) as s\
    where s.student_id = r.student_id\
    and r.semester = :semester\
    and r.first_second = :first_second"

exports.ShowTeacherResearchApplyFormList="\
    select a.student_id, s.sname, s.program,a.research_title, a.teacher_id, a.tname, a.first_second, a.agree, s.phone, s.email, a.semester,\
    if(substring(s.program,1,2)='資工' or substring(s.program,1,2)='網多' or substring(s.program,1,2)='資電',1,0) as status\
    from \
    (\
        select t.teacher_id, r.student_id, r.research_title, r.tname, r.agree, r.first_second, r.semester\
        from teacher as t, research_apply_form as r\
        where t.tname = r.tname\
    ) as a, \
    (\
        select sname, student_id, phone, email, program \
        from student\
    ) as s\
    where s.student_id = a.student_id \
    and a.teacher_id = :teacher_id \
    order by a.research_title";

exports.ShowStudentResearchApplyForm="\
    select a.student_id, s.sname, a.research_title, a.tname, a.agree, a.first_second, s.phone, s.email, a.semester,s.status\
    from research_apply_form as a, \
    (\
        select sname, student_id, phone, email,if(substring(program,1,2)='資工' or substring(program,1,2)='網多' or substring(program,1,2)='資電',1,0) as status\
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
        (select raf.student_id\
        from research_apply_form raf\
        where raf.student_id = cs.student_id),'4',\
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
        where c.student_id = cs.student_id and (c.cos_code = 'DCP1236' or c.cos_code = 'DCP2106') and c.pass_fail = '通過'),'3','1')))))\
        as status \
    from cos_score cs \
    where cs.student_id = :student_id\
    ";

exports.ShowStudentResearchList = "\
    select s.phone, s.student_id, rs.research_title, rs.tname, rs.first_second,\
        s.email, rs.semester\
    from student as s, research_student as rs\
    where s.student_id = rs.student_id\
    and rs.first_second = :first_second\
    and rs.semester = :semester";