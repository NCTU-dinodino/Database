exports.SetResearchAddStatus="\
    update research_student\
    set add_status = :add_status\
    where student_id = :student_id\
    and research_title = :research_title\
    and first_second = :first_second\
    and semester = :semester";

exports.setResearchTitle="\
    update research_student\
    set research_title = :new_title\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and semester = :semester";

exports.setResearchFile="\
    update research_student set file = :new_file\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and semester = :semester";

exports.setResearchPhoto="\
    update research_student set photo = :new_photo\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and semester = :semester";

exports.setResearchFilename="\
    update research_student set filename = :new_filename\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and semester = :semester";

exports.setResearchIntro="\
    update research_student set intro = :new_intro\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and semester = :semester";

exports.setResearchScore="\
    update research_student set score = :new_score\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and student_id = :student_id\
    and semester = :semester";

exports.setResearchComment="\
    update research_student set comment = :new_comment\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and student_id = :student_id\
    and semester = :semester";

exports.CheckStudentProgram="\
    select if(substring(program,1,1)='A' or substring(program,1,1)='B' or substring(program,1,1)='C' or substring(program,1,1)='D',1,0) as status\
    from student\
    where student_id = :student_id";

exports.CreateOtherMajorStudent="\
    insert into student\
    (student_id, sname, program, email, phone, grade)\
    values\
    (:student_id, :name, :program, :email, :phone, :grade)";

exports.CheckResearchOne="\
    select *\
    from research_student \
    where student_id = :student_id \
    and first_second = 1";


exports.CheckCPE="\
    select * \
    from cos_score \
    where cos_cname like '基礎程式設計%' and student_id = :student_id";

exports.CreateNewResearch="\
    insert into research_student\
    (student_id, tname, research_title, first_second, semester, unique_id)\
    values\
    (:student_id, :tname, :research_title, :first_second, :semester, :unique_id)";

exports.ChangeResearch="\
    insert into research_student\
    (student_id, tname, research_title, first_second, semester)\
    values\
    (:student_id, :tname, :research_title, :first_second, :semester)\
    on duplicate key update\
    tname = :tname, research_title = :research_title,\
    first_second = :first_second";

exports.DeleteResearch="\
    delete from research_student \
    where student_id = :student_id and first_second = :first_second and semester = :semester";


exports.SetResearchTitle="\
    update research_student set research_title = :new_title\
    where research_title = :research_title\
    and tname = :tname\
    and first_second = :first_second\
    and semester = :semester";

exports.SetFirstSecond="\
    update research_student set first_second = '1' \
    where student_id = :student_id and first_second = '3'";

exports.CreateResearchFile="\
    insert into research_file \
    values(:research_title, :tname, :file_name, :first_second, :file_path, :file_type)";

exports.CreateResearchApplyForm="\
    insert into research_apply_form\
    values(:student_id, :research_title, :tname, 2, :new_first_second, :semester, :unique_id)";

exports.AddPhoneEmail="\
    update student set phone = :phone, email = :email\
    where student_id = :student_id";

exports.SetResearchApplyFormStatus="\
    update research_apply_form set agree = :agree \
    where research_title = :research_title and tname = :tname \
    and first_second = :first_second \
    and semester = :semester";

exports.DeleteResearchApplyForm="\
    delete from research_apply_form \
    where research_title = :research_title and \
    tname = :tname and first_second = :first_second \
    and semester = :semester";

exports.SetResearchReplace="\
    update research_student set replace_pro = :replace_pro \
    where student_id = :student_id";

exports.CreateNewResearchTwoFromOne="\
    insert into research_student (class_detail, student_id, tname, research_title, first_second, intro, semester, video, file, photo, filename)\
    select class_detail, student_id, tname, research_title, 2, intro, :semester, video, file, photo, filename \
    from research_student as rs\
    where rs.student_id not in (\
        select student_id\
        from research_student\
        where first_second = 2)\
    ";
    