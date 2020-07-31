var CONST = require('../../constant.js')

var psw = require(CONST.FILE_PATH);
var s = require('./student_show_sqlString.js');

var pool = psw.dbpsw();

function parseEng(cos){
    if(cos.indexOf('英文授課')>-1)
        cos=cos.substring(0, cos.length-6);
    else if(cos.indexOf('(英文班')>-1)
        cos=cos.substring(0, cos.length-5);
    else if(cos.indexOf('(英文')>-1 || cos.indexOf('（英文')>-1)
        cos=cos.substring(0, cos.length-4);
    else if(cos.indexOf('(英')>-1 || cos.indexOf('（英')>-1)
        cos=cos.substring(0, cos.length-3);
    return cos;
}

function parseOffsetCos(cos){
    // parse cos_cname blank and parentheses
    if(cos.indexOf('（') > -1){
        let index = cos.indexOf('（')
        cos = cos.substring(0, index) + '(' + cos.substring(index+1);
    }
    if(cos.indexOf('）') > -1){
        let index = cos.indexOf('）')
        cos = cos.substring(0, index) + ')' + cos.substring(index+1);
    }
    while(cos.indexOf(' ') != -1){
        let index = cos.indexOf(' ')
        cos = cos.substring(0, index) + cos.substring(index+1);
    }
    return cos;
}

module.exports = {
	ShowUserInfo: function(id, callback) {
        if (id.match(/^[0-9].*/g)) {
            const resource = pool.acquire();
            resource.then(function(c) {
                let sql_findStudent = c.prepare(s.findStudent);
                let sql_findCrossStudent = c.prepare(s.findCrossStudent);
                let sql_findStudentFailed = c.prepare(s.findStudentFailed);
                let sql_ShowCurrentSem = c.prepare(s.ShowCurrentSem);
                c.query(sql_findCrossStudent({id}), function(err, result){
                    if(err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    if(result.length)
                    {
                        result[0]['status'] = 'c';
                        callback(null, JSON.stringify(result));
                        pool.release(c);
                    }
                    else
                    {
                        c.query(sql_ShowCurrentSem({id}), function(err, sem){
                            if(err){
                                callback(err, undefined);
                                pool.release(c);
                                return;
                            }
                            c.query(sql_findStudentFailed({id}), function(err, failed){
                                if(err){
                                    callback(err, undefined);
                                    pool.release(c);
                                    return;
                                }
                                c.query(sql_findStudent({id}), function(err, result) {
                                    if(err){
                                        callback(err, undefined);
                                        pool.release(c);
                                        return;
                                    }
                                    if(result.length==0)
                                    {
                                        callback(null, JSON.stringify(result));
                                        pool.release(c);
                                        return;
                                    }
                                    result[0]['failed'] = 'not_failed';
                                    for(let i in failed)
                                        if(failed[i]['failed'] == 'failed'){
                                            result[0]['failed'] = 'failed';
                                            break;
                                        }
                                    result[0]['recent_failed'] = 'false';
                                    sem = sem[0]['semester'].split('-')
                                    let year = sem[0]
                                    sem = sem[1]
                                    let recent_sem = null
                                    if(sem == '2')
                                        recent_sem = year + '-' + '1'
                                    else
                                        recent_sem = (parseInt(year)-1).toString() + '-' + '2'
                                    for(let i in failed)
                                        if(failed[i]['sem'] == recent_sem && failed[i]['failed'] == 'failed'){
                                            result[0]['recent_failed'] = 'true';
                                            break;
                                        }
                                    if(result.info.numRows != 0){
                                        result[0]['status'] = 's';
                                    }
                                    callback(null, JSON.stringify(result));
                                    pool.release(c);
                                })
                            })
                        })
                    }
                })
            });
        } else if (id.match(/^T.*/g)) {
            const resource = pool.acquire();
            resource.then(function(c) {
                var sql_findProfessor = c.prepare(s.findProfessor);
                c.query(sql_findProfessor({ id: id }), function(err, result) {
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
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
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    if (result.info.numRows != 0)
                        result[0]['status'] = 'a';
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                });
            })
        }
    }, 
    ShowUserAllScore: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_ShowUserAllScore = c.prepare(s.ShowUserAllScore);
            c.query(sql_ShowUserAllScore({ id: id}), function(err, data) {
                if (err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }

                let placement_cos_cname = []
                var result = []
                for(let i=0; i<data.length; i+=1)
                {
                    data[i]['brief_new'] = '';
                    if(typeof(data[i]['brief']) == 'string')
                    {
                        if(data[i]['brief'].substring(0, 2) == '核心' || 
                                data[i]['brief'].substring(0, 3) == '校基本' ||
                                data[i]['brief'].substring(0, 4) == '外院基本')
                        {
                            data[i]['brief_new'] = data[i]['brief'];
                            data[i]['brief'] = '';
                        }
                    }
                    if(data[i]['offset_type'] == '免修')
                    {
                        if(data[i]['cos_cname'] != '導師時間' && 
                                data[i]['cos_cname'] != '生涯規劃及導師時間' && 
                                placement_cos_cname.includes(data[i]['cos_cname']))
                        {
                            for(let j=0; j<result.length; j+=1)
                                if(result[j]['cos_cname'] == data[i]['cos_cname'])
                                {
                                    result[j]['score'] += ',' + data[i]['score']
                                    break
                                }
                            continue
                        }
                        placement_cos_cname.push(data[i]['cos_cname'])
                    }
                    
                    result.push(data[i])
                }
                
                callback(null, JSON.stringify(result));
                pool.release(c);
            })
        })
    },
    // ShowUserPartScore: function(id, category, callback) {
    //     const resource = pool.acquire();
    //     resource.then(function(c) {
    //         var sql_PassSpecify = c.prepare(s.ShowUserPartScore);
    //         var year = '1' + id[0] + id[1];
    //         c.query(sql_PassSpecify({id, year, category}), function(err, result) {
    //             if (err){
    //                 callback(err, undefined);
    //                 pool.release(c);
    //                 return;
    //             }
    //             callback(null, JSON.stringify(result));
    //             pool.release(c);
    //         })
    //     })
    // },
    ShowRecommendCos:function(id, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ShowRecommendCos = c.prepare(s.ShowRecommendCos);
            var sql_ShowCurrentSem = c.prepare(s.ShowCurrentSem);
            var sql_findCurrentCos = c.prepare(s.findCurrentCos);
            var sql_findTeacher = c.prepare(s.findTeacher);
            var result = [];
            c.query(sql_ShowRecommendCos({id}), function(err, reclist){
                c.query(sql_ShowCurrentSem({}), function(err, semester){
                    // Get Current Semster
                    semester = semester[0]['semester'];
                    c.query(sql_findCurrentCos({semester}), function(err, cos){
                        c.query(sql_findTeacher({}), function(err, tea){
                            //select all recommend cos to variable rec
                            if(reclist.length == 0)
                            {
                                pool.release(c);
                                callback(null, JSON.stringify([]));
                                return;
                            }
                            reclist = reclist[0]['cos_name_list'];
                            let rec = reclist.split(",");

                            cos = JSON.parse(JSON.stringify(cos));
                            tea = JSON.parse(JSON.stringify(tea));

                            for(let i = 0;i<rec.length;i++){
                                //select all cos info into variable data
                                let data = cos.filter(function(c){return parseEng(c.cos_cname)===rec[i]});
                                //for every cos data
                                for(let d_num = 0;d_num<data.length;d_num++)
                                {
                                    //select all teacher who teach the recommend cos
                                    var tea_list = data[d_num]['teacher_id'].split(",");

                                    //for every teacher
                                    for(let k = 0;k<tea_list.length;k++)
                                        //iterate all teacher list 
                                        for(let j=0;j<tea.length;j++)
                                            //select the teacher name
                                            if(tea_list[k].indexOf(tea[j]['teacher_id'])>-1)
                                            {
                                                tea_list[k] = tea[j]['tname'];
                                                break
                                            }
                                    delete data[d_num]['teacher_id'];
                                    data[d_num]['teacher'] = tea_list.join(',');
                                    data[d_num]['cos_time'] = data[d_num]['cos_time'].split('-')[0];
                                    
                                    let cos_info = data[d_num]['unique_id'].split('-')
                                    let cos_url = 'https://timetable.nctu.edu.tw/?r=main/crsoutline&Acy='+cos_info[0]+'&Sem='+cos_info[1]+'&CrsNo='+cos_info[2]+'&lang=zh-tw';
                                    data[d_num]['cos_url'] = cos_url;
                                    result.push(data[d_num]);
                                }
                            }
                            pool.release(c);
                            callback(null, JSON.stringify(result));
                        });
                    });
                });
            });
        });
    },
    ShowStudentIdList:function(callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ShowStudentIdList = c.prepare(s.ShowStudentIdList);
            c.query(sql_ShowStudentIdList({}), function(err, result){
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
    ShowGradeStudentIdList:function(grade,callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ShowGradeStudentIdList = c.prepare(s.ShowGradeStudentIdList);
            c.query(sql_ShowGradeStudentIdList({grade}), function(err, result){
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
    ShowStudentMentor:function(id, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ShowStudentMentor = c.prepare(s.ShowStudentMentor);
            c.query(sql_ShowStudentMentor({id}), function(err, result){
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
    ShowUserOnCos: function(id, callback) {
        const resource = pool.acquire();
        if(id == 'all')
            resource.then(function(c){
                var sql_ShowUserOnCos_all = c.prepare(s.ShowUserOnCos_all);
                c.query(sql_ShowUserOnCos_all({}), function(err, result) {
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }

                    for(let i=0; i<result.length; i+=1)
                    {
                        result[i]['brief_new'] = '';
                        if(typeof(result[i]['brief']) == 'string')
                        {
                            if(result[i]['brief'].substring(0, 2) == '核心' || 
                                    result[i]['brief'].substring(0, 3) == '校基本' || 
                                    result[i]['brief'].substring(0, 2) == '外院' || 
                                    result[i]['brief'].substring(0, 2) == '跨院')
                            {
                                result[i]['brief_new'] = result[i]['brief'];
                                result[i]['brief'] = '';
                            }
                        }
                    }

                    callback(null, JSON.stringify(result));
                    pool.release(c);
                });
            });
        else
            resource.then(function(c){
                var sql_ShowUserOnCos_single = c.prepare(s.ShowUserOnCos_single);
                c.query(sql_ShowUserOnCos_single({ id: id }), function(err, result) {
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }

                    for(let i=0; i<result.length; i+=1)
                    {
                        result[i]['brief_new'] = '';
                        if(typeof(result[i]['brief']) == 'string')
                        {
                            if(result[i]['brief'].substring(0, 2) == '核心' || 
                                    result[i]['brief'].substring(0, 3) == '校基本' || 
                                    result[i]['brief'].substring(0, 2) == '外院' || 
                                    result[i]['brief'].substring(0, 2) == '跨院')
                            {
                                result[i]['brief_new'] = result[i]['brief'];
                                result[i]['brief'] = '';
                            }
                        }
                    }

                    callback(null, JSON.stringify(result));
                    pool.release(c);
                });
            });
    },
    ShowUserOffset: function(id, callback) {
        callback(null, null);
        // const resource = pool.acquire();
        // resource.then(function(c){
        //     if (id != 'all') {
        //         var sql_ShowUserOffset = c.prepare(s.ShowUserOffsetSingle);
        //         c.query(sql_ShowUserOffset({ id: id }), function(err, result) {
        //             if (err){
        //                 callback(err, undefined);
        //                 pool.release(c);
        //                 return;
        //             }
        //             for(let i in result){
        //                 if(typeof(result[i]['cos_cname'])==='string')
        //                     result[i]['cos_cname'] = parseOffsetCos(result[i]['cos_cname']);
        //             }
        //             callback(null, JSON.stringify(result));
        //             pool.release(c);
        //         });
        //     } else {
        //         var sql_ShowUserOffset = c.prepare(s.ShowUserOffsetAll);
        //         c.query(sql_ShowUserOffset({}), function(err, result) {
        //             if (err){
        //                 callback(err, undefined);
        //                 pool.release(c);
        //                 return;
        //             }
        //             for(let i in result){
        //                 if(typeof(result[i]['cos_cname'])==='string')
        //                     result[i]['cos_cname'] = parseOffsetCos(result[i]['cos_cname']);
        //             }
        //             callback(null, JSON.stringify(result));
        //             pool.release(c);
        //         });
        //     }
        // });
    },
    ShowGraduateStudentList: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c){
            if( id != 'all'){
                var sql_ShowGraduateStudentListSingle = c.prepare(s.ShowGraduateStudentListSingle);
                var sem = id[0] + id[1];
                c.query(sql_ShowGraduateStudentListSingle({ sem: sem }), function(err, result) {
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                })
            } else{
                var sql_ShowGraduateStudentListAll = c.prepare(s.ShowGraduateStudentListAll);
                c.query(sql_ShowGraduateStudentListAll({}), function(err, result) {
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                })
            }
            
        })
    },
    ShowGraduateRule: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_ShowGraduateRule = c.prepare(s.ShowGraduateRule);
            var sql_ShowUserGradYearRule_single = c.prepare(s.ShowUserGradYearRule_single);

            c.query(sql_ShowUserGradYearRule_single({ id: id }),function(err, result){
                let year = result[0]['grad_rule_year'];
                c.query(sql_ShowGraduateRule({ id: id, year: year }), function(err, result) {
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                })
            })
        })
    },
    ShowUserTotalCredit: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_ShowUserTotalCredit = c.prepare(s.ShowUserTotalCredit);
            c.query(sql_ShowUserTotalCredit({ id: id }), function(err, result) {
                if (err){
                    callback(err, undefined);
                    pool.release(c);
                    return;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            })
        })
    },
    ShowCosGroup: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_ShowCosGroup = c.prepare(s.ShowCosGroup);
            var sql_ShowUserGradYearRule_single = c.prepare(s.ShowUserGradYearRule_single);

            c.query(sql_ShowUserGradYearRule_single({ id: id }),function(err, result){
                let year = result[0]['grad_rule_year'];
                c.query(sql_ShowCosGroup({ id: id, year: year }), function(err, result) {
                    if (err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    callback(null, JSON.stringify(result).replace(/\"\[/g, "\[").replace(/\]\"/g, "\]").replace(/\\\"/g, "\""));
                    pool.release(c);
                })
            })
        })
    },
    ShowSemesterScore: function(id, callback) {
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_ShowCosScore = c.prepare(s.ShowCosScore);
            var sql_ShowSemesterScore = c.prepare(s.ShowSemesterScore);
            c.query(sql_ShowSemesterScore({id}), function(err, result) {
                c.query(sql_ShowCosScore({id}), function(err, cos){
                    result = JSON.parse(JSON.stringify(result));
                    cos = JSON.parse(JSON.stringify(cos));
                    var score = JSON.parse(JSON.stringify(cos,["cn","en","score","pass"]));

                    for(let sem_num = 0;sem_num<result.length;sem_num++){
                        result[sem_num]["score"]=[];
                        for(let cos_num = 0;cos_num<cos.length;cos_num++){
                            if(result[sem_num].semester===cos[cos_num].semester){
                                result[sem_num]["score"].push(score[cos_num]);
                            }
                        }
                    }
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                })
            })
        })
    },
    ShowUserOffsetApplyForm: function(data, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ShowUserOffsetApplyFormSingle = c.prepare(s.ShowUserOffsetApplyFormSingle);
            var sql_ShowUserOffsetApplyFormAll = c.prepare(s.ShowUserOffsetApplyFormAll);
            if(data['student_id'])
                c.query(sql_ShowUserOffsetApplyFormSingle(data),function(err,result){
                    if(err){
                        callback(err, undefined);
                        pool.release(c);
                        return;
                    }
                    callback(null, JSON.stringify(result));
                    pool.release(c);
                });
            else if(data['all_student'])
                c.query(sql_ShowUserOffsetApplyFormAll([]),function(err,result){
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
    ShowGivenOffsetApplyForm: function(data, callback){
        const resource = pool.acquire();
        resource.then(function(c){
            var sql_ShowGivenOffsetApplyForm = c.prepare(s.ShowGivenOffsetApplyForm);
            c.query(sql_ShowGivenOffsetApplyForm(data),function(err,result){
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
    ShowGivenGradeStudent: function(data, callback){
        const resource=pool.acquire();
        resource.then(function(c) {
            var sql_ShowGivenGradeStudent = c.prepare(s.ShowGivenGradeStudent);
            c.query(sql_ShowGivenGradeStudent(data), function(err, result){
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c);
                    return ;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        })
    },
    ShowStudentHotCos: function(data, callback){
        const resource=pool.acquire();
        resource.then(function(c) {
            var sql_ShowStudentGrade = c.prepare(s.ShowStudentGrade);
            var sql_ShowStudentHotCos = c.prepare(s.ShowStudentHotCos);
            c.query(sql_ShowStudentGrade(data), function(err, student){
                student = JSON.parse(JSON.stringify(student));
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c);
                    return ;
                }
                if(student.length==1){
                    c.query(sql_ShowStudentHotCos(student[0]), function(err, result){
                        if(err)
                        {
                            callback(err, undefined);
                            pool.release(c);
                            return ;
                        }
                        callback(null, JSON.stringify(result));
                        pool.release(c);
                    });
                }
            })  
        })
    },
    ShowAllBulletinMsg: function(callback){
        const resource = pool.acquire();
        resource.then(function(c) {
            var sql_ShowAllBulletinMsg = c.prepare(s.ShowAllBulletinMsg);
            c.query(sql_ShowAllBulletinMsg([]), function(err, result){
                if(err)
                {
                    callback(err, undefined);
                    pool.release(c);
                    return ;
                }
                callback(null, JSON.stringify(result));
                pool.release(c);
            });
        })
    },
}