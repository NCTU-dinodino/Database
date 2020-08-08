exports.SetUserEmail = "\
    update student\
    set email = :email \
    where student_id = :id";

exports.SetUserGradRuleYear = "\
    update student\
    set grad_rule_year = :grad_rule_year\
    where student_id = :id";

exports.SetUserGradRuleYearAndProgram = "\
    update student\
    set grad_rule_year = :grad_rule_year, program = :program\
    where student_id = :id";

exports.setGmail = "\
    update student\
    set gmail = :gmail\
    where student_id = :id";

exports.setFbId = "\
    update student\
    set fb_id = :fb_id\
    where student_id = :id";

exports.setGithubId = "\
    update student\
    set github_id = :github_id\
    where student_id = :id";

exports.SetUserPhone = "\
    update student set phone = :phone\
    where student_id = :student_id";

exports.CreateOffsetApplyForm = "\
    insert into offset_apply_form\
    (student_id, apply_year, apply_semester, cos_dep_old, \
    cos_tname_old, cos_cname_old, cos_code_old, cos_cname,\
    cos_code, cos_type, credit, reason, agree, credit_old,\
    file, timestamp, school_old, dep_old, graduation_credit_old, \
    cos_year_old, cos_semester_old, score_old, offset_type,reason_type)\
    values (:student_id, :apply_year, :apply_semester, :cos_dep_old,\
        :cos_tname_old, :cos_cname_old, :cos_code_old, :cos_cname,\
        :cos_code, :cos_type, :credit, :reason, 0, :credit_old,\
        :file, NOW(), :school_old, :dep_old, :graduation_credit_old, \
        :cos_year_old, :cos_semester_old, :score_old, :offset_type, :reason_type)";

exports.ModifyOffsetApplyForm = "\
    update offset_apply_form\
    set apply_year = :apply_year, apply_semester = :apply_semester, cos_dep_old = :cos_dep_old, \
    cos_tname_old = :cos_tname_old, cos_cname_old = :cos_cname_old, cos_code_old = :cos_code_old, cos_cname = :cos_cname,\
    cos_code = :cos_code, cos_type = :cos_type, credit = :credit, reason = :reason, credit_old = :credit_old,\
    file = :file, timestamp = NOW(), school_old = :school_old, dep_old = :dep_old, graduation_credit_old = :graduation_credit_old, \
    cos_year_old = :cos_year_old, cos_semester_old = :cos_semester_old, score_old = :score_old, \
    reason_type = :reason_type, agree = :state, resend = :resend\
    where student_id = :student_id\
    and timestamp = :timestamp\
    ";

exports.DeleteOffsetApplyForm = "\
    delete from offset_apply_form\
    where student_id = :student_id\
    and timestamp = :timestamp";

exports.CreateOffset = "\
    insert into offset\
    values(:student_id, :apply_year, :apply_semester, :cos_code_old,\
        :cos_cname_old, :cos_code, :cos_cname, :credit, '免修',\
        NULL, :cos_type, NULL)";

exports.SetOffsetApplyFormAgreeStatus = "\
    update offset_apply_form\
    set agree = :state, transferto = :transferto,\
    reject_reason = :reject_reason\
    where student_id = :student_id\
    and timestamp = :timestamp";

exports.SetRecommendCosStar = "\
    insert into rs_feedback\
    (student_id, unique_id, star_level)\
    values\
    (:student_id, :unique_id, :star_level)";

exports.CheckRecommendCosStar = "\
    select * \
    from rs_feedback\
    where student_id = :student_id\
    and unique_id = :unique_id";

exports.UpdataRecommendCosStar = "\
    update rs_feedback \
    set star_level = :star_level \
    where student_id = :student_id \
    and unique_id = :unique_id";

exports.CreateBulletinMsg = "\
    insert into bulletin\
    (cont_type, content, link)\
    values\
    (:cont_type, :content, :link)";

exports.SetBulletinMsg = "\
    update bulletin \
    set cont_type = :cont_type, content = :content, link = :link , last_update_time = CURRENT_TIMESTAMP\
    where unique_id = :msg_idx";

exports.DeleteBulletinMsg = "\
    delete from bulletin\
    where unique_id = :msg_idx";

exports.SetCPEStatus="\
    update student set CPEStatus = '1' \
    where student_id = :student_id and CPEStatus = '2'";