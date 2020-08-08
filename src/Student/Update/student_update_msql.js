var CONST = require('../../constant.js')

var psw = require(CONST.FILE_PATH);
var s = require('./student_update_sqlString.js');
var utils = require('../../utils.js')

var pool = psw.dbpsw();

module.exports = {
	SetUserEmail: function(id, email) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_SetUserEmail = c.prepare(s.SetUserEmail);
            c.query(sql_SetUserEmail({ id: id, email: email }), function(err) {
                if (err)
                    throw err;
                pool.release(c);
            });
        })
    },
    SetUserGradRuleYear(data, callback){
        if(typeof(data['grad_rule_year']) != 'string')
            data['grad_rule_year'] = data['grad_rule_year'].toString()
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetUserGradRuleYear = c.prepare(s.SetUserGradRuleYear);
            c.query(sql_SetUserGradRuleYear(data), function(err, result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    SetUserOAuth: function(id, str, type) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_setGmail = c.prepare(s.setGmail);
            var sql_setFbId = c.prepare(s.setFbId);
            var sql_setGithubId = c.prepare(s.setGithubId);
            if (type === 1)
                c.query(sql_setGmail({ id: id, gmail: str }), function(err, result) {
                    if (err)
                        throw err;
                    pool.release(c);
                });
            else if (type === 2)
                c.query(sql_setFbId({ id: id, fb_id: str }), function(err, result) {
                    if (err)
                        throw err;
                    pool.release(c);
                });
            else if (type === 3)
                c.query(sql_setGithubId({ id: id, github_id: str }), function(err, result) {
                    if (err)
                        throw err;
                    pool.release(c);
                });
        });
    },
    CreateOffsetApplyForm(data,callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CreateOffsetApplyForm = c.prepare(s.CreateOffsetApplyForm);
            var sql_SetUserPhone = c.prepare(s.SetUserPhone);
            data = utils.stripStrNewLineBreak(data);

            c.query(sql_CreateOffsetApplyForm(data),function(err,result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                c.query(sql_SetUserPhone(data),function(err,result2){
                    if(err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                })
            });
        });
    },
    ModifyOffsetApplyForm(data,callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ModifyOffsetApplyForm = c.prepare(s.ModifyOffsetApplyForm);
            var sql_SetUserPhone = c.prepare(s.SetUserPhone);
            data = utils.stripStrNewLineBreak(data);

            c.query(sql_ModifyOffsetApplyForm(data),function(err,result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                c.query(sql_SetUserPhone(data),function(err,result2){
                    if(err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                })
            });
        });
    },
    DeleteOffsetApplyForm(data,callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_DeleteOffsetApplyForm = c.prepare(s.DeleteOffsetApplyForm);
            c.query(sql_DeleteOffsetApplyForm(data),function(err,result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    CreateOffset(data,callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CreateOffset = c.prepare(s.CreateOffset);
            c.query(sql_CreateOffset(data),function(err,result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);

            });
        });
    },
    SetOffsetApplyFormAgreeStatus(data,callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetOffsetApplyFormAgreeStatus = c.prepare(s.SetOffsetApplyFormAgreeStatus)
            c.query(sql_SetOffsetApplyFormAgreeStatus(data),function(err,result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    SetRecommendCosStar(data, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetRecommendCosStar = c.prepare(s.SetRecommendCosStar);
            var sql_CheckRecommendCosStar = c.prepare(s.CheckRecommendCosStar);
            var sql_UpdataRecommendCosStar = c.prepare(s.UpdataRecommendCosStar);
            c.query(sql_CheckRecommendCosStar(data), function(err, check){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                check = JSON.parse(JSON.stringify(check));
                if(check.length==1){
                    // if exist, update
                    c.query(sql_UpdataRecommendCosStar(data), function(err, result){
                        if(err){
                            callback(err, undefined);
                            pool.release(c);
                            return;
                        }
                        callback(null, JSON.stringify(result));
                        pool.release(c);
                    });
                }
                else{
                    // if not exist, insert
                    c.query(sql_SetRecommendCosStar(data), function(err, result){
                        if(err){
                            callback(err, undefined);
                            pool.release(c);
                            return;
                        }
                        callback(null, JSON.stringify(result));
                        pool.release(c);
                    });
                }
            })
        });
    },
    CreateBulletinMsg(data, callback){
        if(!("link" in data))
            data['link'] = null;
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CreateBulletinMsg = c.prepare(s.CreateBulletinMsg);
            c.query(sql_CreateBulletinMsg(data), function(err, result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    SetBulletinMsg(data, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetBulletinMsg = c.prepare(s.SetBulletinMsg);
            c.query(sql_SetBulletinMsg(data), function(err, result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    DeleteBulletinMsg(data, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_DeleteBulletinMsg = c.prepare(s.DeleteBulletinMsg);
            c.query(sql_DeleteBulletinMsg(data), function(err, result){
                if(err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    SetCPEStatus:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetCPEStatus = c.prepare(s.SetCPEStatus);
            c.query(sql_SetCPEStatus(data), function(err, result){
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c); 
                    throw err;
                }
                callback(null, JSON.stringify(result));
                pool.release(c); 
            });
        });
    },
}