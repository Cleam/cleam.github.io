$(document).ready(function(){
	//二级菜单动画
	$(".subMenu").hide();
	$(".menu>li").hover(function(){
		$(this).children(".subMenu").stop().slideDown();
	},function(){
		$(this).children(".subMenu").stop().slideUp();
	});

	// banner动画
	var index = 1;
	setInterval(function(){
		$('.J-section').eq(index).animate({
			'zIndex': 2,
			'opacity': 1
		}, 'normal', function(){
			index++;
			if(index >= 3){
				index = 0;
			}
		}).addClass('active').siblings('.J-section').animate({
			'zIndex': 1,
			'opacity': 0
		}, 'normal').removeClass('active');
	}, 4000);

	// 以下是返回顶部
	$(window).scroll(function(){
		var st = $("body").scrollTop();
		if(st >= 200){
			$(".gotoTop").fadeIn();
			}else{
				$(".gotoTop").fadeOut();
				};
		});
	
	$(".gotoTop").click(function(){
		$("body").animate({"scrollTop":0});
	});
});