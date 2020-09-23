$(function(){
	var $header = $('#J_header'),
		$navHandler = $('#J_nav_handler'),
		$navList = $('#J_nav_list'),
		$navLi = $navList.children('li'),
		$anchor = $('.J-anchor'),
		$details = $('#J_details'),
		//$peopleList = $('#J_people_list'),
		//$popWinBg = $('#J_pop_win_bg'),
		//$popWin = $('#J_pop_win'),
		isIe8 = !!window.ActiveXObject && !!document.documentMode;
	// 菜单收缩功能实现
	$navHandler.click(function(){
		var $this = $(this);
		if(!isIe8){
			if(!$this.hasClass('shrink')){
				$this.addClass('shrink');
				$navList.addClass('shrink');
			} else {
				$this.removeClass('shrink');
				$navList.removeClass('shrink');
			}
		} else {
			if(!$this.hasClass('shrink')){
				$this.addClass('shrink');
				$navList.hide();
			} else {
				$this.removeClass('shrink');
				$navList.show();
			}
		}
	});

	function scrollTo($target){
		$('html,body').animate({
			scrollTop: $target.offset().top
		});
	}

	function scrollToTop(){
		$('html,body').animate({
			scrollTop: 0
		});
	}
	$details.on('click', function(){
		scrollTo($($anchor.get(0)));
	});

	// 滚动监听
	$(window).on('scroll', function(){
		var st = document.documentElement.scrollTop || document.body.scrollTop;
		var $t = getTarget(st);
		showLi($t ? parseInt($t.attr('data-index'), 10) : 0);
	});
	$(window).scroll();

	function getTarget(scrTop){
		var $target = null;
		$anchor.each(function(i, el) {
			var ot = $(el).offset().top - 66;
			if(scrTop >= ot){
				$target = $(el);
			}
		});
		return $target;
	}

	function showLi(index){
		$navLi.removeClass('active');
		$navLi.eq(index).addClass('active');
		if(index > 0){
			$header.addClass('active');
			$header.find('a.logo').children('img').attr('src', 'images/intro/logo.png');
			$header.find('a.logo, .txt').css({
				'color': '#666'
			});
			$header.find('.circle').css({
				'backgroundImage': 'url("images/intro/cl_a.png")'
			});
		} else {
			$header.removeClass('active');
			$header.find('a.logo').children('img').attr('src', 'images/intro/logo.png');
			$header.find('a.logo, .txt').css({
				'color': '#fff'
			});
			$header.find('.circle').css({
				'backgroundImage': 'url("images/intro/cl.png")'
			});
		}
	}

	// 导航菜单点击功能实现
	$navLi.on('click', function(event) {
		//event.preventDefault();
		var $this = $(this),
			index = $this.index();
		$anchor.each(function(i, el) {
			if(index === 0){
				scrollToTop();
				return false;
			} else if(parseInt($(el).attr('data-index'), 10) === index){
				scrollTo($(el));
				return false;
			}
		});
	});

	// 人员信息展示功能实现（弹窗）
	/*$peopleList.find('.icon').on('click', function(){
		var $this = $(this),
			imgSrc = $this.children('img').attr('src'),
			name = $this.siblings('.cn').text(),
			job = $this.siblings('.en').text(),
			$pInfo = $this.siblings('.J-people-info').children().clone();
		$popWinBg.fadeIn();
		$popWin.find('img').attr('src', imgSrc);
		$popWin.find('.name').text(name);
		$popWin.find('.job').text(job);
		setTimeout(function(){
			$popWin.addClass('show');
			$popWin.find('.J-describe').html($pInfo);
			$popWin.find('.close').click(function(){
				$popWin.removeClass('show');
				setTimeout(function(){
					$popWinBg.fadeOut();
				}, 300);
			});
		}, 300);
	});*/

});