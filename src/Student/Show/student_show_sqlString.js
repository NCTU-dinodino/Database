exports.findStudent = "\
    select\
        s.student_id, s.sname, s.program, s.grade,\
        s.email, s.graduate, s.graduate_submit, s.gmail,\
        s.fb_id, s.github_id, s.submit_type, s.net_media, s.grad_rule_year,\
        if(e.pass_code=0,s.en_certificate,e.pass_code) as en_certificate\
    from student as s, en_certificate as e\
    where s.student_id = :id\
    and e.student_id = :id\
    union\
    select\
        s.student_id, s.sname, s.program, s.grade,\
        s.email, s.graduate, s.graduate_submit, s.gmail,\
        s.fb_id, s.github_id, s.submit_type, s.net_media, s.grad_rule_year,\
        NULL as en_certificate\
    from student as s\
    where s.student_id = :id\
    and s.student_id not in\
    (\
        select student_id\
        from en_certificate\
    )";

exports.findStudentFailed = "\
    select concat(s.cos_year,'-',s.semester) as sem,\
        if(sum(if(s.pass_fail = '不通過', cd.cos_credit, 0)*2 )\
        >= sum(if(1, cd.cos_credit, 0)), 'failed', 'not_failed') as failed\
    from\
    (\
        select s.student_id, cs.pass_fail, cs.cos_year, cs.semester, cs.cos_id\
        from student as s, cos_score as cs\
        where s.student_id = :id\
        and cs.student_id = :id\
        and ( cs.pass_fail = '通過' or cs.pass_fail = '不通過' or cs.pass_fail = '修課中或休學')\
        and cs.semester != 3\
    ) as s, cos_data as cd\
    where cd.unique_id = concat(s.cos_year, '-', s.semester, '-', s.cos_id)\
    group by concat(s.cos_year,'-',s.semester);"

exports.findCrossStudent = "\
    select *\
    from student\
    where student_id = :id\
    and program != 'A'\
    and program != 'B'\
    and program != 'C'\
    and program != 'D'";

exports.findProfessor = "\
    select teacher_id, tname\
    from teacher\
    where teacher_id = :id";

exports.findTeacher = "\
    select teacher_id, tname\
    from teacher_cos_relation";

exports.findAssistant = "\
    select assistant_id, aname from assistant\
    where assistant_id=:id";

// exports.ShowUserAllScore = "\
//     select if(ISNULL(b.cos_code), a.cos_code, b.cos_code) as cos_code,\
//             if(ISNULL(b.cos_cname), a.cos_cname, b.cos_cname) as cos_cname,\
//             a.cos_ename, b.cos_code_old, b.cos_cname_old, a.pass_fail, a.cos_type,\
//             if(a.score_type='通過不通過', NULL, a.score) as score,\
//             if(a.score_type='通過不通過', NULL, a.score_level) as score_level,\
//             if((a.cos_typeext='' && a.brief like '體育%'), '體育', a.cos_typeext) as cos_typeext,\
//             a.cos_dep, \
//             if(a.brief like '軍訓%', '軍訓', a.brief) as brief, a.brief_new,\
//             a.cos_credit, a.cos_year, a.semester, b.offset_type\
//     from \
//     (\
//         select a.cos_code, a.cos_dep, a.cos_credit, a.cos_year, a.semester, a.cos_cname, a.cos_ename, a.cos_type, a.score_type, a.pass_fail, a.score_level, a.score, a.unique_id, if(ISNULL(cd.brief),'',cd.brief) as brief, if(ISNULL(cd.brief_new),'',cd.brief_new) as brief_new, cd.cos_typeext\
//         from \
//         (\
//             select a.cos_code, a.cos_dep, a.cos_credit, a.cos_year, a.semester, a.cos_cname, n.cos_ename, a.cos_type, a.score_type, a.pass_fail, a.score_level, a.score, a.unique_id\
//             from\
//             (\
//                 select sc.cos_code, sc.cos_dep, sc.cos_credit, sc.cos_year, sc.semester, sc.cos_cname, sc.cos_type, sc.score_type, sc.pass_fail, sc.score_level, sc.score, sc.unique_id\
//                 from \
//                 (\
//                     select cos_code, cos_credit, cos_year, semester, cos_cname, cos_type, score_type, pass_fail, score_level, score, cos_dep,\
//                         case semester\
//                         when '3'\
//                             then concat(cos_year, '-', 'X', '-', cos_id) \
//                             else concat(cos_year, '-', semester, '-', cos_id) \
//                         end as unique_id \
//                     from cos_score \
//                     where student_id = :id\
//                     and pass_fail='通過'\
//                 ) as sc, student as std\
//                 where std.student_id = :id \
//             ) as a\
//             left outer join \
//             (\
//                 select cos_ename, unique_id \
//                 from cos_name\
//             ) as n\
//             on n.unique_id = a.unique_id \
//         ) as a\
//         left outer join cos_data as cd\
//         on a.unique_id = cd.unique_id\
//     ) as a \
//     left outer join\
//     (\
//         select distinct o.offset_type, o.cos_code_old, o.cos_cname_old, o.cos_code, o.cos_cname  \
//         from offset as o\
//         where student_id = :id\
//     ) as b\
//     on a.cos_code = b.cos_code_old\
//     and a.cos_cname = b.cos_cname_old\
//     union\
//     select o.cos_code, o.cos_cname, '' as cos_ename,\
//         if(ISNULL(o.cos_code_old), null, o.cos_code_old) as cos_code_old, \
//         if(ISNULL(o.cos_cname_old), null, o.cos_cname_old) as cos_cname_old, \
//         '' as pass_fail, o.cos_type, '' as score, '' as score_level, \
//         '' as cos_typeext, '' as cos_dep, o.brief, o.brief_new as brief_new,\
//         o.credit as cos_credit, o.apply_year as cos_year,\
//         o.apply_semester as semester, o.offset_type as offset_type\
//     from offset as o\
//     where o.student_id = :id\
//     and (\
//         o.cos_code_old=''\
//         or ISNULL(o.cos_code_old)\
//     )";

// 第一行會select distinct是因為可能會有學生重複送免修單
exports.ShowUserAllScore = "\
    select distinct if(ISNULL(b.cos_code), a.cos_code, b.cos_code) as cos_code,\
        if(ISNULL(b.cos_cname), a.cos_cname, b.cos_cname) as cos_cname,\
        a.cos_ename, b.cos_cname_old, a.pass_fail, a.cos_type,\
        if(a.score_type='通過不通過', NULL, a.score) as score,\
        if(a.score_type='通過不通過', NULL, a.score_level) as score_level,\
        if((a.cos_typeext='' && a.brief like '體育%'), '體育', a.cos_typeext) as cos_typeext,\
        a.cos_dep, \
        if((a.brief is null), '', if(a.brief like '軍訓%', '軍訓', a.brief)) as brief,\
        if(b.cos_credit is NULL or a.cos_credit<b.cos_credit, a.cos_credit, b.cos_credit) as cos_credit,\
        a.cos_year, a.semester, b.offset_type\
    from \
    (\
        select a.cos_code, a.cos_dep, a.cos_credit, a.cos_year, a.semester, a.cos_cname, a.cos_ename, a.cos_type, a.score_type, a.pass_fail, a.score_level, a.score, a.unique_id, a.brief, cd.cos_typeext\
        from \
        (\
            select a.cos_code, a.cos_dep, a.cos_credit, a.cos_year, a.semester, a.cos_cname, n.cos_ename, a.cos_type, a.score_type, a.pass_fail, a.score_level, a.score, a.unique_id, a.brief\
            from\
            (\
                select sc.cos_code, sc.cos_dep, sc.cos_credit, sc.cos_year, sc.semester, sc.cos_cname, sc.cos_type, sc.score_type, sc.pass_fail, sc.score_level, sc.score, sc.unique_id, sc.brief\
                from \
                (\
                    select cos_code, cos_credit, cos_year, semester, cos_cname, cos_type, score_type, pass_fail, score_level, score, cos_dep, brief, \
                        case semester when '3'\
                            then concat(cos_year, '-', 'X', '-', cos_id) \
                            else concat(cos_year, '-', semester, '-', cos_id) \
                        end as unique_id \
                    from cos_score \
                    where student_id = :id\
                    and pass_fail='通過'\
                ) as sc, student as std\
                where std.student_id = :id \
            ) as a\
            left outer join \
            (\
                select cos_ename, unique_id \
                from cos_name\
            ) as n\
            on n.unique_id = a.unique_id \
        ) as a\
        left outer join cos_data as cd\
        on a.unique_id = cd.unique_id\
    ) as a \
    left outer join\
    (\
        select case semester_old when '3'\
                    then concat(cos_year_old, '-', 'X', '-', cos_id_old) \
                    else concat(cos_year_old, '-', semester_old, '-', cos_id_old) \
                end as unique_id_old, \
            o.cos_cname_old, o.cos_code, o.cos_cname, o.offset_type, o.cos_credit\
        from offset as o\
        where o.student_id = :id\
        and o.offset_type = '免修'\
        and o.cos_year_old != 0\
    ) as b\
    on a.unique_id = b.unique_id_old\
    union all\
    select o.cos_code, o.cos_cname, '' as cos_ename, o.cos_cname_old, \
        '通過' as pass_fail, o.cos_type,\
        NULL as score, NULL as score_level,\
        if(o.brief like '體育%', '體育', '') as cos_typeext, '' as cos_dep, \
        if((o.brief is null), '', if(o.brief like '軍訓%', '軍訓', o.brief)) as brief,\
        0 as cos_credit, \
        '' as cos_year, '' as semester, o.offset_type\
    from offset as o\
    where o.student_id = :id\
    and o.offset_type = '免修'\
    and o.cos_year_old = 0\
    union all\
    select o.cos_code, o.cos_cname, '' as cos_ename, o.cos_cname_old, \
        '通過' as pass_fail, o.cos_type,\
        NULL as score, NULL as score_level,\
        if(o.brief like '體育%', '體育', '') as cos_typeext, '' as cos_dep,\
        if(\
            (\
                o.brief='' and \
                (o.cos_cname like '校基本%' or o.cos_cname like '外院基本%' or o.cos_cname like '核心-%')\
            ), o.cos_cname, if(\
                o.brief is null, '', if(o.brief like '軍訓%', '軍訓', o.brief)\
            )\
        ) as brief,\
        o.cos_credit, \
        '' as cos_year, '' as semester, o.offset_type\
    from offset as o\
    where o.student_id = :id\
    and o.offset_type = '抵免';"

// exports.ShowUserPartScore = "\
//     select DISTINCT\
//         if(ISNULL(c.cos_code), a.cos_code, c.cos_code) as cos_code,\
//         if(ISNULL(c.cos_cname), a.cos_cname, c.cos_cname) as cos_cname,\
//         c.cos_code_old, cos_cname_old, a.cos_ename, a.pass_fail,a.cos_type,\
//         if(a.score_type='通過不通過', NULL, a.score) as score,\
//         if(a.score_type='通過不通過', NULL, a.score_level) as score_level,\
//         if((a.cos_typeext=''&&a.brief like '體育%'), '體育', a.cos_typeext) as cos_typeext,\
//         b.type, a.brief, a.brief_new, a.cos_credit, a.year,\
//         a.semester, c.offset_type\
//     from\
//     (\
//         select DISTINCT\
//             s.score_type, s.pass_fail, s.score, s.score_level,\
//             d.cos_code, n.cos_cname, n.cos_ename, d.cos_type,\
//             d.cos_typeext, d.brief, d.brief_new, d.cos_credit,\
//             s.year, s.semester\
//         from cos_data as d,\
//         (\
//             select\
//                 score_type, cos_year as year, semester, cos_id as code,\
//                 cos_code, pass_fail, score, score_level,\
//                 concat(cos_year, '-', semester, '-', cos_id) as unique_id\
//             from cos_score\
//             where student_id = :id\
//         ) as s,\
//         cos_name as n\
//         where\
//         d.unique_id = concat(s.year, \'-\', s.semester, \'-\', s.code)\
//         and d.cos_code = n.cos_code\
//         and n.unique_id = d.unique_id\
//     ) as a\
//     left outer join\
//     (\
//         select DISTINCT\
//             s.score_type, s.pass_fail, s.score, s.score_level,\
//             d.cos_code, n.cos_cname, d.cos_type, d.cos_typeext,\
//             t.type, d.brief, d.brief_new, d.cos_credit, s.year,\
//             s.semester\
//         from cos_data as d,\
//         (\
//             select\
//                 score_type, cos_year as year, semester, cos_id as code,\
//                 cos_code, pass_fail, score, score_level,\
//                 concat(cos_year, '-', semester, '-', cos_id) as unique_id\
//             from cos_score\
//             where student_id = :id\
//         ) as s,\
//         cos_name as n, cos_type as t, student as sd\
//         where sd.student_id = :id\
//         and d.unique_id = concat(s.year, '-', s.semester, '-', s.code)\
//         and n.unique_id = d.unique_id\
//         and n.cos_cname like concat(t.cos_cname, '%')\
//         and t.school_year = :year\
//         and sd.program like concat(t.program, '%')\
//     ) as b\
//     on b.cos_code = a.cos_code\
//     and b.cos_cname = a.cos_cname\
//     and b.year = a.year\
//     and b.semester = a.semester\
//     left outer join\
//     (\
//         select\
//             offset_type, cos_code_old, cos_cname_old, cos_code, cos_cname\
//         from offset\
//         where student_id = :id\
//     ) as c\
//     on a.cos_code = c.cos_code_old\
//     and a.cos_cname = c.cos_cname_old\
//     where a.pass_fail = '通過' and a.cos_type = :category\
//     order by a.year, a.semester asc";

exports.ShowRecommendCos = "\
    select cos_name_list\
    from rs\
    where student_id = :id";

exports.ShowCurrentSem = "\
    select distinct concat(cos_year.year, '-',\
        max(convert(substring(cd.unique_id, 5, 1), SIGNED))) as semester\
    from \
    (\
        select max(convert(substring(unique_id, 1, 3), SIGNED)) as year\
        from cos_data\
        where substring(unique_id,5,1) != 'X'\
    ) as cos_year,\
    cos_data as cd\
    where convert(substring(cd.unique_id, 1, 3), SIGNED) = cos_year.year;";

exports.findCurrentCos = "\
    select distinct cd.unique_id, cn.cos_cname, cd.teacher_id, cd.cos_time, cd.cos_code \
    from \
    (\
        select unique_id, teacher_id, cos_time, cos_code \
        from cos_data \
        where unique_id like concat(:semester, '%') \
        and \
        (\
            cos_code like 'DCP%' \
            or cos_code like 'IOC%' \
            or cos_code like 'IOE%' \
            or cos_code like 'ILE%' \
            or cos_code like 'IDS%' \
            or cos_code like 'CCS%' \
            or cos_code like 'ICP%' \
        )\
    ) as cd, \
    (\
        select unique_id, cos_cname\
        from cos_name\
        where unique_id like concat(:semester, '%')\
    ) as cn\
    where cd.unique_id=cn.unique_id";

exports.ShowStudentIdList = "\
    select student_id, sname, program\
    from student";

exports.ShowGradeStudentIdList = "\
    select student_id, sname, program,if(substring(program,1,1)='A' or substring(program,1,1)='B' or substring(program,1,2)='C' or substring(program,1,2)='D',1,0) as status\
    from student\
    where student_id like concat(:grade,'%')";

exports.ShowStudentMentor = "\
    select tname\
    from mentor_list\
    where student_id = :id";

exports.ShowUserOnCos_single = "\
    select on_cn.student_id, on_cn.year as cos_year, on_cn.semester, on_cn.code, on_cn.cos_code, \
        on_cn.cos_type, on_cn.cos_credit, on_cn.cos_cname, \
        on_cn.cos_ename, on_cn.cos_dep, if(on_cn.brief is null, '', on_cn.brief) as brief, \
        cd.cos_typeext\
    from \
    (\
        select onc.student_id, onc.year, onc.semester, LPAD(onc.code,4,'0') as code, onc.cos_code, onc.cos_type, \
            onc.cos_credit, onc.brief, onc.cos_cname, cn.cos_ename, onc.cos_dep\
        from on_cos_data as onc, cos_name as cn\
        where cn.unique_id = concat(onc.year, '-', onc.semester, '-', LPAD(onc.code,4,'0'))\
            and onc.student_id = :id\
    ) as on_cn, cos_data as cd\
    where \
    cd.unique_id = concat(on_cn.year, '-', on_cn.semester, '-', on_cn.code)";

exports.ShowUserOnCos_all = "\
    select on_cn.student_id, on_cn.year as cos_year, on_cn.semester, on_cn.code, on_cn.cos_code, \
        on_cn.cos_type, on_cn.cos_credit, on_cn.cos_cname, \
        on_cn.cos_ename, on_cn.cos_dep, if(on_cn.brief is null, '', on_cn.brief) as brief, \
        cd.cos_typeext\
    from \
    (\
        select onc.student_id, onc.year, onc.semester,  LPAD(onc.code,4,'0') as code, onc.cos_code, onc.cos_type, \
            onc.cos_credit, onc.brief, onc.cos_cname, cn.cos_ename, onc.cos_dep\
        from on_cos_data as onc, cos_name as cn\
        where cn.unique_id = concat(onc.year, '-', onc.semester, '-',  LPAD(onc.code,4,'0'))\
    ) as on_cn, cos_data as cd\
    where \
    cd.unique_id = concat(on_cn.year, '-', on_cn.semester, '-', on_cn.code)";


exports.ShowUserOffsetSingle = "\
    select\
        os.student_id, os.apply_year, os.apply_semester, os.cos_code_old,\
        os.cos_cname_old, os.cos_code, os.cos_cname, os.credit,\
        os.offset_type, os.brief, os.brief_new, os.cos_type, cg.score\
    from offset as os\
    left outer join\
    (\
        select student_id, cos_cname, cos_code, score\
        from cos_score\
        where student_id = :id and pass_fail = '通過' and cos_cname not like '%導師%'\
    ) as cg\
    on cg.student_id = os.student_id\
    and cg.cos_code = os.cos_code_old\
    and cg.cos_cname = os.cos_cname_old\
    where os.student_id = :id";

exports.ShowUserOffsetAll="\
    select\
        os.student_id, os.apply_year, os.apply_semester, os.cos_code_old,\
        os.cos_cname_old, os.cos_code, os.cos_cname, os.credit,\
        os.offset_type, os.brief, os.cos_type, cg.score\
    from offset as os\
    left outer join\
    (\
        select student_id, cos_cname, cos_code, score\
        from cos_score\
        where student_id = :id and pass_fail = '通過' and cos_cname not like '%導師%'\
    ) as cg\
    on cg.student_id = os.student_id\
    and cg.cos_code = os.cos_code_old\
    and cg.cos_cname = os.cos_cname_old";

exports.ShowGraduateStudentListAll = "\
    select\
        student_id, sname, program, graduate_submit,\
        graduate, email, en_certificate\
    from student";

exports.ShowGraduateStudentListSingle = "\
    select\
        student_id, sname, program, graduate_submit,\
        graduate, email, en_certificate\
    from student\
    where student_id like concat(:sem, '%')";

exports.ShowGraduateRule = "\
    select\
        r.require_credit, r.pro_credit, r.free_credit,\
        r.core_credit, r.sub_core_credit, r.foreign_credit\
    from graduate_rule as r, \
        (select \
        case net_media when 0 then '網多' \
                when 1 then '網多' \
                when 2 then '資工' \
                when 3 then '資電' end \
                as professional_field\
        from student\
        where student_id = :id)\
    as s\
    where s.professional_field like concat(r.program, '%')\
    and r.school_year = :year";

exports.ShowUserTotalCredit = "\
    select sum(t.cos_credit) as total\
    from\
    (\
        select distinct d.cos_code, d.cos_credit\
        from\
        (\
            select cos_code\
            from cos_score\
            where student_id = :id\
            and pass_fail = '通過'\
        ) as s, cos_data as d\
        where s.cos_code = d.cos_code\
    ) as t";

exports.ShowUserGradYearRule_single = "\
    select grad_rule_year from student where student_id=:id;"

exports.ShowCosGroup = "\
    select\
        p.cos_cname, p.cos_ename, p.cos_codes,\
        IFNULL(a.type, '必修') as type\
    from cos_group as p\
    left outer join\
    (\
        select t.cos_cname, t.type, t.school_year\
        from\
            (select\
            case net_media when 0 then '網多'\
                    when 1 then '網多'\
                    when 2 then '資工'\
                    when 3 then '資電' end\
                    as professional_field\
            from student\
            where student_id = :id)\
        as s, cos_type as t\
        where s.professional_field like concat(t.program, '%')\
        and t.school_year = :year\
    ) as a\
    on p.cos_cname = a.cos_cname\
    and a.school_year = :year\
    where a.type is not null\
    or p.cos_cname in\
    (\
        select cos_cname\
        from cos_require as r,\
            (select\
                case net_media when 0 then '網多'\
                        when 1 then '網多'\
                        when 2 then '資工'\
                        when 3 then '資電' end\
                        as professional_field\
            from student\
            where student_id = :id)\
        as s\
        where r.school_year = :year\
        and s.professional_field like concat(r.program, '%')\
        union\
        select '物化生三選一(一)'\
        union\
        select '物化生三選一(二)'\
        union\
        select '導師時間'\
    )";


exports.ShowCosScore = "\
    select concat(cs.cos_year,'-',cs.semester) as semester,cs.cos_cname as cn,cn.cos_ename as en,cs.score as score,cs.pass_fail as pass\
    from cos_score as cs,cos_name as cn\
    where cs.student_id = :id\
    and cn.unique_id = concat(cs.cos_year, '-', cs.semester, '-', cs.cos_id)\
    and cs.semester != 3\
    ";

exports.ShowSemesterScore = "\
    select concat(s.cos_year,'-',s.semester) as semester,\
    if(sum(if(s.pass_fail = '不通過', cd.cos_credit, 0)*2 )\
    >= sum(if(1, cd.cos_credit, 0)), 'true', 'false') as failed\
    ,sum(s.score*cd.cos_credit)/sum(if(s.score_type='通過不通過',0,cd.cos_credit)) as avg\
    ,sum(if(s.pass_fail = '通過', cd.cos_credit, 0)) as credit\
    from\
    (\
        select s.student_id, cs.pass_fail, cs.cos_year, cs.semester, cs.cos_id, cs.score,cs.score_type\
        from student as s, cos_score as cs\
        where s.student_id = :id\
        and cs.student_id = :id\
        and ( cs.pass_fail = '通過' or cs.pass_fail = '不通過' or cs.pass_fail = '修課中或休學')\
        and cs.semester != 3\
    ) as s, cos_data as cd\
    where cd.unique_id = concat(s.cos_year, '-', s.semester, '-', s.cos_id)\
    group by concat(s.cos_year,'-',s.semester)\
    ";

exports.ShowUserOffsetApplyFormSingle = "\
    select body.*,if(pre.previous=1,1,0) as previous\
    from\
    (\
        select o.*,s.sname,s.program,s.grade,s.phone\
        from offset_apply_form as o,student as s\
        where o.student_id = :student_id\
        and o.student_id = s.student_id\
    ) as body\
    left outer join\
    (\
        select o.cos_cname_old, o.cos_code_old, 1 as previous\
        from offset_apply_form as o\
        where \
        o.cos_cname_old in\
        (\
            select cos_cname_old\
            from offset_apply_form\
            where agree = 6\
        )\
        and o.cos_code_old in\
        (\
            select cos_code_old\
            from offset_apply_form\
            where agree = 6\
        )\
        group by cos_cname_old, cos_code_old\
    ) as pre\
    on pre.cos_cname_old = body.cos_cname_old\
    and pre.cos_code_old = body.cos_code_old";

exports.ShowUserOffsetApplyFormAll = "\
    select body.*,if(pre.previous=1,1,0) as previous\
    from\
    (\
        select o.*,s.sname,s.program,s.grade,s.phone\
        from offset_apply_form as o,student as s\
        where o.student_id = s.student_id\
    ) as body\
    left outer join\
    (\
        select o.cos_cname_old, o.cos_code_old, 1 as previous\
        from offset_apply_form as o\
        where \
        o.cos_cname_old in\
        (\
            select cos_cname_old\
            from offset_apply_form\
            where agree = 6\
        )\
        and o.cos_code_old in\
        (\
            select cos_code_old\
            from offset_apply_form\
            where agree = 6\
        )\
        group by cos_cname_old, cos_code_old\
    ) as pre\
    on pre.cos_cname_old = body.cos_cname_old\
    and pre.cos_code_old = body.cos_code_old";

exports.ShowGivenOffsetApplyForm = "\
    select body.*,if(pre.previous=1,1,0) as previous\
    from\
    (\
        select o.*,s.sname,s.program,s.grade,s.phone\
        from offset_apply_form as o,student as s\
        where o.student_id = :student_id \
        and o.student_id = s.student_id \
        and o.cos_cname_old = :cos_cname_old \
        and o.cos_cname = :cos_cname \
    ) as body\
    left outer join\
    (\
        select o.cos_cname_old, o.cos_code_old, 1 as previous\
        from offset_apply_form as o\
        where \
        o.cos_cname_old in\
        (\
            select cos_cname_old\
            from offset_apply_form\
            where agree = 1 or agree = 2\
        )\
        and o.cos_code_old in\
        (\
            select cos_code_old\
            from offset_apply_form\
            where agree = 1 or agree = 2\
        )\
        group by cos_cname_old, cos_code_old\
    ) as pre\
    on pre.cos_cname_old = body.cos_cname_old\
    and pre.cos_code_old = body.cos_code_old";

exports.ShowGivenGradeStudent = "\
    select sname, student_id, program, graduate, grad_rule_year, \
    if(substring(program,1,1)='A' or substring(program,1,1)='B' or substring(program,1,1)='C' or substring(program,1,1)='D',1,0) as status\
    from student\
    where grade = :grade\
    and study_status ='在學'";

exports.ShowStudentHotCos = "\
    select a.grade, a.unique_id, a.count, a.url, a.cos_credit, a.cos_time, a.depType, a.tname, a.cos_cname \
    from  \
    ( \
        select a.grade, a.unique_id, a.count, a.url, a.cos_credit, a.cos_time, a.depType, a.tname, b.cos_cname \
        from \
        ( \
            select a.grade, a.unique_id, a.count, a.url, a.cos_credit, a.cos_time, a.depType, b.tname \
            from  \
            ( \
                select a.grade, a.unique_id, a.count, a.url, b.cos_credit, b.cos_time, b.depType, b.teacher_id \
                from  \
                ( \
                    select grade, unique_id, count, url \
                    from hot_cos \
                    where grade = :grade \
                ) as a \
                left outer join \
                ( \
                    select unique_id, cos_credit, cos_time, depType, teacher_id \
                    from cos_data \
                ) as b \
                on a.unique_id=b.unique_id \
            ) as a \
            left outer join \
            ( \
                select teacher_id, tname \
                from teacher_cos_relation \
            ) as b \
            on a.teacher_id=b.teacher_id \
        ) as a \
        left outer join \
        ( \
            select unique_id, cos_cname \
            from cos_name \
        ) as b \
        on a.unique_id=b.unique_id \
        order by a.count DESC \
    ) as a \
    where a.cos_cname not in \
    ( \
        select cos_cname \
        from cos_score \
        where student_id = :student_id \
    )";

exports.ShowStudentGrade = "\
    select student_id, grade\
    from student\
    where student_id=:student_id"

exports.ShowAllBulletinMsg = "\
    select *\
    from bulletin";