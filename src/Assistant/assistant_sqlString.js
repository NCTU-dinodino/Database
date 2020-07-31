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

exports.SetApplyPeriod = '\
    update apply_period\
    set begin = :begin, end = :end\
    where type = :type\
    ';

exports.ShowApplyPeriod = '\
    select type, begin, end \
    from apply_period';

exports.ShowAllDataLog = '\
    select unique_id, time, status, message, year, semester, log_type as data_type \
    from log_file;'

exports.DeleteDataLog = '\
    delete from log_file \
    where unique_id = :id';
exports.DeleteAllDataLog = '\
    delete from log_file;'