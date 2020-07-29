exports.SetEnCertificate = '\
    update student set en_certificate = :check\
    where student_id = :id';

exports.SetGraduateSubmitStatus = '\
    update student \
    set graduate_submit = :graduate_submit\
    where student_id = :id';

exports.SetSubmitTypeStatus = '\
    update student \
    set submit_type = \
		if(:submit_type = 3, null, :submit_type) \
    where student_id = :id';
exports.SetNetMediaStatus = '\
	update student\
	set net_media = :net_media\
    where student_id = :id';
exports.SetRejectReason = '\
    update student\
    set reject_reason = :reject_reason\
    where student_id = :id';

exports.CreateApplyPeriod = '\
    insert into apply_period(type, begin, end) \
    values (:type, :begin, :end) \
    on duplicate key update \
    begin = :begin,\
    end = :end';

exports.ShowApplyPeriod = '\
    select type, begin, end \
    from apply_period';

/*
A Scrap of code Before update 2020/07/29

exports.CreateApplyPeriod = '\
    insert into apply_period \
    values (:semester, :type, :begin, :end) \
    on duplicate key update \
    begin = :begin,\
    end = :end';
exports.DeleteApplyPeriod = '\
    delete from apply_period\
    where semester = :semester\
    and type = :type';
exports.ShowApplyPeriod = '\
    select semester, type, begin, end \
    from apply_period \
    where semester = :semester';
*/

exports.ShowAllDataLog = '\
    select unique_id, time, status, message, year, semester, log_type as data_type \
    from log_file;'

exports.DeleteDataLog = '\
    delete from log_file \
    where unique_id = :id';
exports.DeleteAllDataLog = '\
    delete from log_file;'