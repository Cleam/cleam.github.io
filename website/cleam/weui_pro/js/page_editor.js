/* global $ */
/* global FastClick */
/* global document */

$(function(){
    FastClick.attach(document.body);
    // 城市
    $("#city_picker").cityPicker({
        title: "请选择所在城市",
        showDistrict: false
    });
    // 工作年限
    $("#work_time_picker").picker({
        title: "请选择您的工作年限",
        cols: [{
            textAlign: 'center',
            values: ['0年', '1年', '2年', '3年', '4年', '5年', '6年', '7年', '8年', '9年', '10年']
        }]
    });
    // 目前职能
    $("#tech_picker").picker({
        title: "请选择您的目前职能",
        cols: [{
            textAlign: 'center',
            values: ['技术1', '技术2', '技术3', '技术4', '技术5']
        }]
    });
    // 头衔
    $("#job_picker").picker({
        title: "请选择您的头衔",
        cols: [{
            textAlign: 'center',
            values: ['web开发工程师', 'php开发工程师', 'java开发工程师', '前端开发工程师', 'nodejs开发工程师']
        }]
    });
    // 从事多久
    $(".J-howlong-picker").picker({
        title: "从事多久？",
        cols: [{
            textAlign: 'center',
            values: ['0年', '1年', '2年', '3年', '4年', '5年', '6年', '7年', '8年', '9年', '10年']
        }]
    });
    // 结束时间
    $(".J-date-picker").picker({
        title: "请选择结束时间",
        cols: [{
            textAlign: 'center',
            values: ['2013年', '2014年', '2015年', '2016年', '2017年']
            //如果你希望显示文案和实际值不同，可以在这里加一个displayValues: [.....]
        }, {
            textAlign: 'center',
            values: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }]
    });

    // 新增一个亮点
    $('#J_add').on('click', function(){
        var $this = $(this),
            $newStr = $('<div class="weui_cells weui_cells_access">' + 
                '<div class="weui_cell">' + 
                    '<div class="title">' + 
                        '<input class="weui_input" type="text" placeholder="标题：关于什么方面？">' + 
                        '<a class="remove" href="javascript:;"><i class="iconfont">&#xe60e;</i></a>' + 
                    '</div>' + 
                '</div>' + 
                '<div class="weui_cell">' + 
                    '<div class="content">' + 
                        '<textarea class="weui_textarea" placeholder="亮点内容" rows="3" oninput="this.style.height=this.scrollHeight+\'px\';"></textarea>' + 
                    '</div>' + 
                '</div>' + 
                '<div class="weui_cell">' + 
                    '<div class="weui_cell_hd">' + 
                       '<label class="weui_label">从事多久</label>' + 
                    '</div>' + 
                    '<div class="weui_cell_bd weui_cell_primary">' + 
                        '<a class="select" href="javascript:;">' + 
                            '<input class="weui_input J-howlong-picker" type="text" readonly="" value="3年"><i class="iconfont">&#xe605;</i>' + 
                       '</a>' + 
                    '</div>' + 
                '</div>' + 
                '<div class="weui_cell">' + 
                    '<div class="weui_cell_hd">' + 
                        '<label class="weui_label">结束时间</label>' + 
                    '</div>' + 
                    '<div class="weui_cell_bd weui_cell_primary">' + 
                        '<a class="select" href="javascript:;">' + 
                            '<input class="weui_input J-date-picker" type="text" readonly="" value="2016年06月"><i class="iconfont">&#xe605;</i>' + 
                        '</a>' + 
                    '</div>' + 
                '</div>' + 
            '</div>');
        // 新增一个亮点
        $this.parent().before($newStr);
        // 删除一个亮点
        $newStr.find(".remove").on('click', function(){
            $(this).closest('.weui_cells').remove();
        });
        // 从事多久
        $newStr.find(".J-howlong-picker").picker({
            title: "从事多久？",
            cols: [{
                textAlign: 'center',
                values: ['0年', '1年', '2年', '3年', '4年', '5年', '6年', '7年', '8年', '9年', '10年']
            }]
        });
        // 结束时间
        $newStr.find(".J-date-picker").picker({
            title: "请选择结束时间",
            cols: [{
                textAlign: 'center',
                values: ['2013年', '2014年', '2015年', '2016年', '2017年']
                //如果你希望显示文案和实际值不同，可以在这里加一个displayValues: [.....]
            }, {
                textAlign: 'center',
                values: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
            }]
        });
    });
});
