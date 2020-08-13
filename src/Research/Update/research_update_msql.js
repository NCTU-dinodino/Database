var CONST = require('../../constant.js')
var CryptoJS = require("crypto-js");
var psw = require(CONST.FILE_PATH);
var s = require('./research_update_sqlString.js');

var pool = psw.dbpsw();

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
    // CreateNewResearch:function(data, callback){
    //     if(typeof(data) === 'string')
    //         data = JSON.parse(data);
    //     const resource = pool.acquire();
    //     resource.then(function(c){
    //         var sql_CreateNewResearch = c.prepare(s.CreateNewResearch);
    //         c.query(sql_CreateNewResearch(data), function(err, result){
    //             if(err)
    //             {
    //                 callback(err, undefined);
    //                 pool.release(c);
    //                 throw err;
    //             }
    //             callback(null, JSON.stringify(result));
    //             pool.release(c);
    //         });                   
    //     });
    // }, 
    CreateNewGroupResearch:function(data, callback) {
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        var group_size = Object.keys(data['student_id']).length;
        var student_list = [];
        var unique_seed = '';
        for(var i = 0; i < group_size; i++){
            student_list.push(data['student_id'][i]);
        }
        student_list.sort();
        for(var i = 0; i < group_size; i++){
            unique_seed += student_list[i];
        }
        unique_seed += (data['tname'] + data['research_title'] + data['first_second'] + data['semester']);
        // MD5 hash to generate unique id
        var unique_id = CryptoJS.MD5(unique_seed).toString();
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CreateNewResearch = c.prepare(s.CreateNewResearch);
            for(var i = 0; i < group_size; i++){
                var new_data = data;
                new_data['student_id'] = student_list[i];
                new_data['unique_id'] = unique_id;
                c.query(sql_CreateNewResearch(new_data), function(err, result){
                    if(err)
                    {
                        callback(err, undefined);
                        pool.release(c);
                        throw err;
                    }
                    callback(null, JSON.stringify(result));
                });
            }
            pool.release(c);  
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
    CreateGroupResearchApplyForm: function(old_data, callback){
        if(typeof(old_data) === 'string')
            old_data = JSON.parse(old_data);
        var student_list = [];
        var unique_seed = '';
        for(var i = 0; i < old_data.length; i++){
            student_list.push(old_data[i]['student_id']);
        }
        student_list.sort();
        for(var i = 0; i < old_data.length; i++){
            unique_seed += student_list[i];
        }
        unique_seed += (old_data[0]['tname'] + old_data[0]['research_title'] + old_data[0]['first_second'] + old_data[0]['semester']);
        // MD5 hash to generate unique id
        var unique_id = CryptoJS.MD5(unique_seed).toString();
        
        const resource = pool.acquire();
        resource.then(async function(c){
            var sql_CheckStudentProgram = c.prepare(s.CheckStudentProgram);
            var sql_CreateOtherMajorStudent = c.prepare(s.CreateOtherMajorStudent);
            var sql_AddPhoneEmail = c.prepare(s.AddPhoneEmail);
            var sql_CreateResearchApplyForm = c.prepare(s.CreateResearchApplyForm);
            var sql_CheckCPE = c.prepare(s.CheckCPE);
            var sql_CheckResearchOne = c.prepare(s.CheckResearchOne);

            for(var k = 0; k < old_data.length; k++){
                var data = old_data[k];
                data['unique_id'] = unique_id;
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
                            data['grade'] = "無資料";
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
                                    // pool.release(c); 
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
                                    // pool.release(c); 
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
                                        // pool.release(c); 
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
                            // pool.release(c);
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
                                    // pool.release(c); 
                                });
                            });
                        }
                    });
                await sleep(1000);
            }
            pool.release(c);
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
    DeleteResearchApplyForm:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_DeleteResearchApplyForm = c.prepare(s.DeleteResearchApplyForm);
            c.query(sql_DeleteResearchApplyForm(data), function(err, result){
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
    }, 
    CreateNewResearchTwoFromOne:function(data, callback){
        if(typeof(data) === 'string')
            data = JSON.parse(data);
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_CreateNewResearchTwoFromOne = c.prepare(s.CreateNewResearchTwoFromOne);
            c.query(sql_CreateNewResearchTwoFromOne(data), function(err, result){
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
