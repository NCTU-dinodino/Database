var CONST = require('../constant.js');

var psw = require(CONST.FILE_PATH);
var s = require('./assistant_sqlString.js');

var pool = psw.dbpsw();

var add_result = function(res_a, res_b){
    if(res_a == undefined)
        return res_b
    else if(res_b == undefined)
        return res_a
    res_a['info']['numRows'] = (parseInt(res_a['info']['numRows']) + parseInt(res_b['info']['numRows'])).toString()
    res_a['info']['affectedRows'] = (parseInt(res_a['info']['affectedRows']) + parseInt(res_b['info']['affectedRows'])).toString()
    res_a['info']['insertId'] = (parseInt(res_a['info']['insertId']) + parseInt(res_b['info']['insertId'])).toString()
    return res_a
}

var SetNetMediaStatus = function(c, data, prev_result, callback){
    if(typeof(data)==='string')
        data=JSON.parse(data);
    var sql_SetNetMediaStatus=c.prepare(s.SetNetMediaStatus);
    if(data['net_media']==0 || data['net_media']==1 || data['net_media'] == 2 || data['net_media'] == 3){
        c.query(sql_SetNetMediaStatus(data), function(err, result){
            if(err){
                callback(err, prev_result);
                throw err;
            }
            callback(null, add_result(prev_result, result));
        })
    }
    else
        callback(null, prev_result);
}

var SetSubmitTypeStatus = function(c, data, prev_result, callback){
    if(typeof(data)==='string')
        data=JSON.parse(data);
    var sql_SetSubmitTypeStatus=c.prepare(s.SetSubmitTypeStatus);
    if(data['submit_type']==0 || data['submit_type']==1 || data['submit_type'] == 3){
        c.query(sql_SetSubmitTypeStatus(data), function(err, result){
            if(err){
                callback(err, prev_result);
                throw err;
            }
            callback(null, add_result(prev_result, result));
        })
    }
    else
        callback(null, prev_result);
}

var SetRejectReason = function(c, data, prev_result, callback){
    if(typeof(data)==='string')
        data=JSON.parse(data);
    
    var sql_SetRejectReason=c.prepare(s.SetRejectReason);
    if(data['graduate_submit'] == 3){
        c.query(sql_SetRejectReason(data), function(err, result){
            if(err)
            {
                callback(err, prev_result);
                throw err;
            }
            callback(null, add_result(prev_result, result));
        })
    }
    else
        callback(null, prev_result);
}

var SetGraduateSubmitStatus_local = function(c, data, prev_result, callback){
    if(typeof(data)==='string')
        data=JSON.parse(data);
    
    var sql_SetGraduateSubmitStatus=c.prepare(s.SetGraduateSubmitStatus);
    if(data['graduate_submit'] != 4){
        c.query(sql_SetGraduateSubmitStatus(data), function(err, result){
            if(err)
            {
                callback(err, prev_result);
                pool.release(c); 
                throw err;
            }
            callback(null, add_result(prev_result, result));
        })
    }
    else
        callback(null, prev_result);
}

module.exports = { 
    SetEnCertificate: function(id, check) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_SetEnCertificate = c.prepare(s.SetEnCertificate);
            c.query(sql_SetEnCertificate({ id: id, check: check }), function(err,result) {
                if (err)
                    throw err;
                pool.release(c);
            });
        });
    }, 
    
    SetGraduateSubmitStatus: function(data, callback){
        if(typeof(data)==='string')
            data=JSON.parse(data);
        const resource=pool.acquire();
        resource.then(function(c){
            SetNetMediaStatus(c, data, undefined, function(err, result){
                if(err){
                    pool.release(c);
                    throw err;
                }
                SetSubmitTypeStatus(c, data, result, function(err, result){
                    if(err){
                        pool.release(c);
                        throw err;
                    }
                    SetRejectReason(c, data, result, function(err, result){
                        if(err){
                            pool.release(c);
                            throw err;
                        }
                        SetGraduateSubmitStatus_local(c, data, result, function(err, result){
                            if(err){
                                pool.release(c);
                                throw err;
                            }
                            callback(null, JSON.stringify(result));
                            pool.release(c);
                        });
                    });
                });
            });
        });
    },
    SetApplyPeriod: function(data, callback){
        const resource=pool.acquire();
        resource.then(function(c) {
            var sql_SetApplyPeriod = c.prepare(s.SetApplyPeriod);
            c.query(sql_SetApplyPeriod(data), function(err, result){
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c);
                    return ;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            })  
        })
    },
    ShowApplyPeriod: function(data, callback){
        var period = {
            offset: {
                begin: null, 
                end: null
            },
            research: {
                begin: null,
                end: null
            },
            graduation: {
                begin: null,
                end: null
            }
        }
        const resource=pool.acquire();
        resource.then(function(c) {
            var sql_ShowApplyPeriod = c.prepare(s.ShowApplyPeriod);
                c.query(sql_ShowApplyPeriod(data), function(err, result){
                    if(err)
                    {
                        callback(err, undefined);
                        pool.release(c);
                        return ;
                    }
                    var i;
                    result=JSON.parse(JSON.stringify(result));
                    if(result == '')
                        callback(null, JSON.stringify(result));
                    else
                    {
                        for(i in result){
                            let type = result[i]["type"];
                            if(period.hasOwnProperty(type)){
                                //period[type]["semester"] = result[i]["semester"];
                                period[type]["type"] = result[i]["type"];
                                period[type]["begin"] = result[i]["begin"];
                                period[type]["end"] = result[i]["end"];
                            }
                        }
                        callback(null, JSON.stringify(period));
                    }
                    
                    pool.release(c);
                });  
        });
    },
    InsertNewData: function(data){
        // data => {file_name: 'yoyoabc.xlsx', data_type: "課程成績資料", semester: '108-2'}
        // "課程成績資料" => "cos_score"
        // "新老師資料"   => "new_teacher_info"
        // "學生資料"    => "student"
        // "抵免免修資料"    => "offset"
        // "英文換修資料" => "en_certificate"
        // "專題選課名單" => "research_student_list"
        var type_mapping = {
            "課程成績資料": "cos_score",
            "新老師資料": "new_teacher_info",
            "學生資料": "student",
            "抵免免修資料": "offset",
            "英文換修資料": "en_certificate", 
            "專題選課名單": "research_student_list"
        }

        let exec_sync = require('child_process').execSync;
        let exec = require('child_process').exec;

        let data_path_base = '/home/nctuca/dinodino-extension/automation/data/'
        let program_path = '/home/nctuca/dinodino-extension/automation/'
        let convertProgram = 'checkFile.py'

        if(data['data_type'] == '專題選課名單')
            var program_name = 'update_research_student_list.py';
        else
            var program_name = 'insert_'+type_mapping[data['data_type']]+'.py';
        var data_path = data_path_base+data['semester']+'-'+type_mapping[data['data_type']]+'.csv';

        let convart_file_name = data_path_base+data['semester']+'-'+data['data_type']+'.xlsx'

        if(data_path_base+data['file_name'] != convart_file_name)
            exec_sync('cp '+data_path_base+data['file_name']+' '+convart_file_name)

        exec('python3 '+program_path+convertProgram+' '+convart_file_name+' '+data_path, function(error, stdout, stderr) {
            if(error == null)
            {
                exec('python3 '+program_path+program_name+' '+data_path);
                if(data['data_type'] == '課程成績資料')
                {
                    program_name = 'insert_on_cos_data.py';
                    exec('python3 '+program_path+program_name+' '+data_path);
                }
            }
        });
    },
    ShowAllDataLog: function(callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ShowAllDataLog = c.prepare(s.ShowAllDataLog);
            c.query(sql_ShowAllDataLog({}), function(err, result){
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c);
                    return ;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });  
        });
    },
    DeleteDataLog: function(data, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_DeleteDataLog = c.prepare(s.DeleteDataLog);
            c.query(sql_DeleteDataLog(data), function(err, result){
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    DeleteAllDataLog: function(callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_DeleteAllDataLog = c.prepare(s.DeleteAllDataLog);
            c.query(sql_DeleteAllDataLog({}), function(err, result){
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        });
    },
    Drain: function() {
        pool.drain().then(function() {
            pool.clear();
        });
    }
};