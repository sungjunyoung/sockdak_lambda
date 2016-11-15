var request = require('request');
var cheerio = require("cheerio");

exports.handler = (event, context, callback) =>{
    // TODO implement

    var j = request.jar();
    request = request.defaults({jar: j});

    request({
            url: "http://klas.khu.ac.kr/user/loginUser.do",
            method: "POST",
            form: {USER_ID: event.id, PASSWORD: event.pw}
        },
        function (error, response, body) {
            var result = {};

            request({
                url: "http://klas.khu.ac.kr/main/viewPopUserConfig.do",
                method: "GET"
            }, function (error, res, body) {
                var $ = cheerio.load(body);
                result.info = {};
                var count = 0;
                $('td').each(function () {
                    if(count == 2){
                        console.log($(this).text()); //department
                        result.info.department = $(this).text();
                    } else if(count == 4){
                        console.log($(this).text());
                        var name_class_num_arr = $(this).text().split("(");
                        var my_name = name_class_num_arr[0];
                        var class_num = name_class_num_arr[1].substring(0,10);
                        result.info.name = name_class_num_arr[0];
                        result.info.class_number = class_num;
                    }

                    count ++;
                });


                request({
                    url: "http://klas.khu.ac.kr/classroom/viewClassroomCourseMoreList.do?courseType=ing",
                    method: "GET"
                }, function (error, res, body) {

                    var $ = cheerio.load(body);

                    result.lectures = [];

                    var count = 0;
                    $('tr').each(function () {
                        if (count !== 0) {
                            console.log($(this).children().eq(1).text()); //name
                            console.log($(this).children().eq(3).text()); //professor

                            var lecture_name_arr = $(this).children().eq(1).text().split("[")
                            var lecture_name = lecture_name_arr[0];
                            var lecture_code = lecture_name_arr[1];
                            console.log(lecture_code);
                            if(lecture_code !== undefined){
                                lecture_code = lecture_code.split("]")[0];
                            }

                            result.lectures.push({
                                lecture_name: lecture_name,
                                lecture_code: lecture_code,
                                professor: $(this).children().eq(3).text()
                            });
                        }
                        count++;
                    });

                    if(result.info.class_number == ')'){
                        result.result = "incorrect";
                    } else if (result.lectures[0].lecture_name == ''){
                        result.result = "rest";
                    } else {
                        result.result = "success";
                    }

                    context.callbackWaitsForEmptyEventLoop = false;
                    callback(null, result);

                });


            });

        });
}
;
