var Client = require('mariasql');
var lineReader = require('line-reader');
var s = require('./sqlString.js');
var psw = require('./dbpsw');


var pool = psw.dbpsw();


function padLeft(str, len) {
    str = '' + str;
    if (str.length >= len) {
        return str;
    } else {
        return padLeft("0" + str, len);
    }
}


module.exports = {

    findPerson: function(id, callback) {
        if (id.match(/^[0-9].*/g)) {
            const resource = pool.acquire();
            resource.then(function(c) {
                var sql_findStudent = c.prepare(s.findStudent);
                c.query(sql_findStudent({ id: id }), function(err, result) {
                    if (err)
                        throw err;
                    if (result.info.numRows != 0)
                        result[0]['status'] = 's';
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                })
            });
        } else if (id.match(/^T.*/g)) {
            const resource = pool.acquire();
            resource.then(function(c) {
                var sql_findProfessor = c.prepare(s.findProfessor);
                c.query(sql_findProfessor({ id: id }), function(err, result) {
                    if (err)
                        throw err;
                    if (result.info.numRows != 0)
                        result[0]['status'] = 'p';
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                });
            })
        } else {
            const resource = pool.acquire();
            resource.then(function(c) {
                var sql_findAssistant = c.prepare(s.findAssistant);
                c.query(sql_findAssistant({ id: id }), function(err, result) {
                    if (err)
                        throw err;
                    if (result.info.numRows != 0)
                        result[0]['status'] = 'a';
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                });
            })
        }
    },
    addEmail: function(id, email) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_addEmail = c.prepare(s.addEmail);
            c.query(sql_addEmail({ id: id, email: email }), function(err) {
                if (err)
                    throw err;
                pool.release(c);
            });
        })
    },
    showCosMap: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_showCosMap = c.prepare(s.showCosMap);
            var year = '1' + id[0] + id[1];
            c.query(sql_showCosMap({ id: id, year: year }), function(err, result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        })
    },
    showCosMapPass: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_showCosMapPass = c.prepare(s.showCosMapPass);
            c.query(sql_showCosMapPass({ id: id }), function(err, result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    a_uploadGrade: function(pt) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_a_uploadGrade = c.prepare(s.a_uploadGrade);
            c.query(sql_a_uploadGrade({pt:pt},function(err){
                if(err)
                    throw err;
                pool.release(c);
            }));
        });
    },
    totalCredit: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_totalCredit = c.prepare(s.totalCredit);
            c.query(sql_totalCredit({ id: id }), function(err, result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result));
                pool.release(c);
            })
        })
    },
    Pass: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_Pass = c.prepare(s.Pass);
            var year = '1' + id[0] + id[1];
            c.query(sql_Pass({ id: id, year: year }), function(err, result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result));
                pool.release(c);
            })
        })
    },
    Group: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_Group = c.prepare(s.Group);
            var year = '1' + id[0] + id[1];
            c.query(sql_Group({ id: id, year: year }), function(err, result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result).replace(/\"\[/g, "\[").replace(/\]\"/g, "\]").replace(/\\\"/g, "\""));
                pool.release(c);
            })
        })
    },
    graduateRule: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_graduateRule = c.prepare(s.graduateRule);
            var year = '1' + id[0] + id[1];
            c.query(sql_graduateRule({ id: id, year: year }), function(err, result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result));
                pool.release(c);
            })
        })
    },
    studentGraduateList: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_studentGraduateList = c.prepare(s.studentGraduateList);
            var sem = id[0] + id[1];
            c.query(sql_studentGraduateList({ sem: sem }), function(err, result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result));
                pool.release(c);
            })
        })
    },
    setStudentGraduate: function(id, graduate) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_setStudentGraduate = c.prepare(s.setStudentGraduate);
            c.query(sql_setStudentGraduate({ id: id, graduate: graduate }), function(err) {
                if (err)
                    throw err;
                pool.release(c);
            })
        })
    },
    setStudentGraduateSubmit: function(id, graduate_submit) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_setStudentGraduateSubmit = c.prepare(s.setStudentGraduateSubmit);
            c.query(sql_setStudentGraduateSubmit({ id: id, graduate_submit: graduate_submit }), function(err) {
                if (err)
                    throw err;
                pool.release(c);
            })
        })
    },
    bindAccount: function(id,str,type){
        const resource=pool.acquire();
        resource.then(function(c){
            var sql_setGmail=c.prepare(s.setGmail);
            var sql_setFbId=c.prepare(s.setFbId);
            var sql_setGithubId=c.prepare(s.setGithubId);
            if(type==1)
                c.query(sql_setGmail({ id: id,gmail:str}), function(err, result) {
                    if (err)
                        throw err;
                    pool.release(c);
                });
            else if(type==2)
                c.query(sql_setFbId({ id: id,fb_id:str}), function(err, result) {
                    if (err)
                        throw err;
                    pool.release(c);
                });
            else if(type==3)
                c.query(sql_setGithubId({ id: id,github_id:str}), function(err, result) {
                    if (err)
                        throw err;
                    pool.release(c);
                });                
        });
    },
    offset: function(callback){
        const resource=pool.acquire();
        resource.then(function(c){
            var sql_offset=c.prepare(s.offset);
            c.query(sql_offset({}), function(err,result) {
                if (err)
                    throw err;
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    on_cos_data: function(callback){
        const resource=pool.acquire();
        resource.then(function(c){
            var sql_on_cos_data=c.prepare(s.on_cos_data);
            c.query(sql_on_cos_data({}),function(err,result){
                if(err)
                    throw err;
                callback(null,JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    general_cos_rule: function(callback){
        const resource=pool.acquire();
        resource.then(function(c){
            var sql_general_cos_rule=c.prepare(s.general_cos_rule);
            c.query(sql_general_cos_rule({}),function(err,result){
                if(err)
                    throw err;
                callback(null,JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    Drain: function() {
        pool.drain().then(function() {
            pool.clear();
        });
    }
    // p_uploadGrade: function(pt) {
    //     const resource = pool.acquire();
    //     resource.then(function(c) {
    //         var sql_p_uploadGrade = c.prepare(s.p_uploadGrade);
    //         var now = 0,
    //             num = "";
    //         lineReader.eachLine(pt, function(line, last) {
    //             if (now == 0) {
    //                 var a = line.match(/[0-9]+/g);
    //                 num = num + a[0] + "-" + a[1] + "-";
    //             } else if (now == 1) {
    //                 var a = line.match(/[0-9]+/g);
    //                 num = num + a[0];
    //             } else if (/[0-9+]/.test(line.split(',')[2])) {
    //                 line = line.split(',');
    //                 c.query(sql_p_uploadGrade({ unique_id: num, id: line[2], score: line[4] }), function(err) {
    //                     if (err)
    //                         throw err;
    //                 });
    //             }
    //             if (last) {
    //                 pool.release(c);
    //                 return false;
    //             }
    //             now++;
    //         });
    //     })
    // },
};