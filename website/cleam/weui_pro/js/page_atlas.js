/* global $ */
/* global FastClick */
/* global document */

$(function() {
    FastClick.attach(document.body);
    var $tab2 = $('#tab2'),
        $pos = $('#J_pos'), // 地点
        $area = $('#J_area'), // 领域
        $cap = $('#J_cap'), // 职能
        $time = $('#J_time'), // 年限
        $cellList = $('#J_cell_list'),
        loading = false,     //状态标记
        // 滚动加载模拟数据
        data = {
            root: [{
                img: 'img/temp/tx (' + Math.floor(Math.random() * 13 + 1) + ').jpg',
                name: '张三',
                title: '高级前端开发工程师',
                content: '熟练掌握Web前端技术CSS/HTML/Javascript，有html5/css3开发经验。',
                workyear: '3'
            }, {
                img: 'img/temp/tx (' + Math.floor(Math.random() * 13 + 1) + ').jpg',
                name: '李四',
                title: '高级JAVA开发工程师',
                content: '熟练掌握Web前端技术CSS/HTML/Javascript，有html5/css3开发经验。',
                workyear: '5'
            }, {
                img: 'img/temp/tx (' + Math.floor(Math.random() * 13 + 1) + ').jpg',
                name: '王五',
                title: '高级IOS开发工程师',
                content: '熟练掌握Web前端技术CSS/HTML/Javascript，有html5/css3开发经验。',
                workyear: '10'
            }, {
                img: 'img/temp/tx (' + Math.floor(Math.random() * 13 + 1) + ').jpg',
                name: '赵六',
                title: '资深前端开发工程师',
                content: '熟练掌握Web前端技术CSS/HTML/Javascript，有html5/css3开发经验。',
                workyear: '12'
            }]
        };
    $pos.select({
        title: "选择地点",
        items: ["北京", "上海", "武汉", "长沙", "深圳", "成都", "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh"],
        onChange: function(item) {
            console.log(item);
            alert('您选择了：' + item.values);
        }
    });
    $area.select({
        title: "选择领域",
        items: ["XXX", "ZZZ", "RRR", "VVV", "NNN", "EEE"],
        onChange: function(item) {
            console.log(item);
            alert('您选择了：' + item.values);
        }
    });
    $cap.select({
        title: "选择职能",
        items: ["前端", "Java", "Android", "IOS", "C#", ".Net"],
        onChange: function(item) {
            console.log(item);
            alert('您选择了：' + item.values);
        }
    });
    $time.select({
        title: "选择年限",
        items: ["1年", "2年", "3年", "4年", "5年", "6年"],
        onChange: function(item) {
            console.log(item);
            alert('您选择了：' + item.values);
        }
    });

    $tab2.infinite().on("infinite", function() {
        if (loading) return;
        loading = true;
        setTimeout(function() {
            for (var i = 0; i < data.root.length; i++) {
                var item = data.root[i];
                $cellList.append('<a class="weui_cell" href="javascript:;">' +
                    '<div class="weui_cell_hd">' +
                        '<div class="left">' +
                            '<p class="img"><img src="' + item.img + '" alt=""></p>' +
                            '<p class="txt">' + item.name + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="weui_cell_bd weui_cell_primary">' +
                        '<h2 class="title">' + item.title + '<span class="year">工作' + item.workyear + '年</span></h2>' +
                        '<p class="content">' + item.content + '</p>' +
                        '<i class="iconfont">&#xe605;</i>' +
                    '</div>' +
                '</a>');
            }
            loading = false;
        }, 1000); //模拟延迟
    });

});
