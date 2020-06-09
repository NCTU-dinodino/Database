var CONST = require('../../constant.js')

var psw = require(CONST.FILE_PATH);
var s = require('./research_update_sqlString.js');

var pool = psw.dbpsw();

module.exports = { 
    SetResearchAddStatus:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetResearchAddStatus = c.prepare(s.SetResearchAddStatus);
            c.query(sql_SetResearchAddStatus(data), function(err, result){
                if(err){
                    callback(err, undefined);
                    pool.release(c); 
                    throw err;
                }
                callback(null, JSON.stringify(result));
                pool.release(c); 
            });
        });
    },
    SetResearchInfo:function(data){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_setResearchTitle = c.prepare(s.setResearchTitle);
            var sql_setResearchFile = c.prepare(s.setResearchFile);
            var sql_setResearchPhoto = c.prepare(s.setResearchPhoto);
            var sql_setResearchFilename = c.prepare(s.setResearchFilename);
            var sql_setResearchIntro = c.prepare(s.setResearchIntro);

            c.query(sql_setResearchTitle({research_title: data['research_title'], tname: data['tname'], first_second:data['first_second'], semester:data['semester'], new_title: data['new_title']}), function(err, result){
                if(err)
                    throw err;
                c.query(sql_setResearchFile({research_title: data['new_title'], tname: data['tname'], first_second:data['first_second'], semester:data['semester'], new_file: data['new_file']}), function(err, result){
                    if(err)
                        throw err;
                    c.query(sql_setResearchPhoto({research_title: data['new_title'], tname: data['tname'], first_second:data['first_second'], semester:data['semester'], new_photo: data['new_photo']}), function(err, result){
                        if(err)
                            throw err;
                    });
                    c.query(sql_setResearchFilename({research_title: data['new_title'], tname: data['tname'], first_second:data['first_second'], semester:data['semester'], new_filename: data['new_filename']}), function(err, result){
                        if(err)
                            throw err;
                    });
                    c.query(sql_setResearchIntro({research_title: data['new_title'], tname: data['tname'], first_second:data['first_second'], semester:data['semester'], new_intro: data['new_intro']}), function(err, result){
                        if(err)
                            throw err;
                        pool.release(c);
                    });
                });
            });
        });
    }, 
    SetResearchScoreComment:function(data){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_setResearchScore = c.prepare(s.setResearchScore);
            var sql_setResearchComment = c.prepare(s.setResearchComment);
            c.query(sql_setResearchScore(data), function(err){
                if(err)
                    throw err;
            });
            c.query(sql_setResearchComment(data), function(err){
                if(err)
                    throw err;
                pool.release(c);
            });
        });
    }, 
    CreateNewResearch:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CreateNewResearch = c.prepare(s.CreateNewResearch);
            c.query(sql_CreateNewResearch(data), function(err, result){
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
    ChangeResearch:function(data){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ChangeResearch = c.prepare(s.ChangeResearch);
            c.query(sql_ChangeResearch(data), function(err){
                if(err)
                    throw err;
                pool.release(c);
            });
        });
    }, 
    DeleteResearch:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_DeleteResearch = c.prepare(s.DeleteResearch);
            c.query(sql_DeleteResearch(data), function(err, result){
                if(err){
                    callback(err, undefined);
                    pool.release(c); 
                    throw err;
                }
                callback(null, JSON.stringify(result));
                pool.release(c); 
            });
        });
    },
    SetResearchTitle:function(data){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetResearchTitle = c.prepare(s.SetResearchTitle);
            c.query(sql_SetResearchTitle(data), function(err){
                if(err)
                    throw err;
                pool.release(c);
            });
        });
    }, 
    SetFirstSecond:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetFirstSecond = c.prepare(s.SetFirstSecond);
            c.query(sql_SetFirstSecond(data), function(err, result){
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
    CreateResearchFile:function(data){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CreateResearchFile = c.prepare(s.CreateResearchFile);
            c.query(sql_CreateResearchFile(data), function(err){
                if(err)
                {
                    pool.release(c);
                    throw err;
                }
                pool.release(c);
            });
        });
    }, 
    CreateResearchApplyForm:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CheckStudentProgram = c.prepare(s.CheckStudentProgram);
            var sql_CreateOtherMajorStudent = c.prepare(s.CreateOtherMajorStudent);
            var sql_AddPhoneEmail = c.prepare(s.AddPhoneEmail);
            var sql_CreateResearchApplyForm = c.prepare(s.CreateResearchApplyForm);
            var sql_CheckCPE = c.prepare(s.CheckCPE);
            var sql_CheckResearchOne = c.prepare(s.CheckResearchOne);

            if(data['first_second'] == 1)
                c.query(sql_CheckStudentProgram(data), function(err, result){
                    if(err)
                    {
                        callback(err, undefined);
                        pool.release(c);
                        throw err;
                    }
                    result = JSON.parse(JSON.stringify(result))
                    if(result == '')
                    {
                        if(data['student_id'] == '' || data['name'] == '' || data['program'] == '')
                        {
                            callback("ERROR! student_id, name, program should not be empty", undefined);
                            pool.release(c);
                        }
                        c.query(sql_CreateOtherMajorStudent(data), function(err, result){
                            if(err)
                            {
                                callback(err, undefined);
                                pool.release(c);
                                throw err;
                            }
                            data['new_first_second'] = 3;
                            c.query(sql_CreateResearchApplyForm(data), function(err, result){
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
                    }
                    else if(result["status"] == 0)
                    {
                        c.query(sql_AddPhoneEmail(data), function(err, result){
                            if(err)
                            {
                                callback(err, undefined);
                                pool.release(c);
                                throw err;
                            }
                            data['new_first_second'] = 3;
                            c.query(sql_CreateResearchApplyForm(data), function(err, result){
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
                    }
                    else
                    {
                        c.query(sql_CheckCPE(data), function(err, result){
                            if(err)
                            {
                                callback(err, undefined);
                                pool.release(c);
                                throw err;
                            }
                            if(result == '')
                                data['new_first_second'] = 3;
                            else
                                data['new_first_second'] = 1;
                            
                            c.query(sql_AddPhoneEmail(data), function(err, result){
                                if(err)
                                {
                                    callback(err, undefined);
                                    pool.release(c);
                                    throw err;
                                }
                                c.query(sql_CreateResearchApplyForm(data), function(err, result){
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
                        });
                    }
                });
            else
                c.query(sql_CheckResearchOne(data), function(err, result){
                    if(err)
                    {
                        callback(err, undefined);
                        pool.release(c);
                        throw err;
                    }
                    if(result == '')
                    {
                        callback(null, JSON.stringify('wrong'));
                        pool.release(c);
                    }
                    else
                    {
                        data['new_first_second'] = 2;
                        c.query(sql_AddPhoneEmail(data), function(err, result){
                            if(err)
                            {
                                callback(err, undefined);
                                pool.release(c);
                                throw err;
                            }
                        
                            c.query(sql_CreateResearchApplyForm(data), function(err, result){
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
                    }
                });
        });
    }, 
    SetResearchApplyFormStatus:function(data){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetResearchApplyFormStatus = c.prepare(s.SetResearchApplyFormStatus);
            c.query(sql_SetResearchApplyFormStatus(data), function(err, result){
                if(err)
                {
                    pool.release(c);
                    throw err;
                }
                pool.release(c);
            });
        });
    }, 
    DeleteResearchApplyForm:function(data){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_DeleteResearchApplyForm = c.prepare(s.DeleteResearchApplyForm);
            c.query(sql_DeleteResearchApplyForm(data), function(err){
                if(err)
                {
                    pool.release(c);
                    throw err;
                }
                pool.release(c);
            });
        });
    },
    SetResearchReplace:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_SetResearchReplace = c.prepare(s.SetResearchReplace);
            c.query(sql_SetResearchReplace(data), function(err, result){
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
    }
};
