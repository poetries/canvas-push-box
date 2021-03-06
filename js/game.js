$(function(){
		game.init();
	});
			
	var game = {
		

		box:$("#box"),
		init:function(){
			game.box.empty();

			var $title = $("<div>");
			$title.addClass("title");
			$title.html("打飞机 v1.0版本");
			this.box.append($title);
			
			var $diff = $("<div>");
			$diff.addClass("diff");
			$diff.append("<p>简单模式</p><p>大神附体</p><p>困难模式</p>");
			this.box.append($diff);
			
			$("#box .diff p").hover(function(){
				$(this).addClass("on");
			},function(){
				$(this).removeClass("on");
			}).click(function(e){
				//alert(11);
				var index = $(this).index();

				var e = e || event;
				var eX = e.clientX; //当前鼠标距离浏览器的宽度
				var eY = e.clientY;//当前鼠标距离浏览器的高度
				var ev = {x:eX,y:eY};
				//alert(eX+":"+eY);

				game.start(ev,index);
			});

		},
		
		//游戏困难的等级

		diffGrate:[
			[200,1500],//第一个参数子弹速度 第二个敌军速度
			[40,200],
			[60,250]
		],

		start:function(ev,index){
			game.box.empty();
			game.plane(ev,index);
			var $score = $("<span class='score'></span>");//积分板
			$score.html(0);
			game.start.Num = 0;
			game.box.append($score);
		},
		plane:function(ev,index){
			var $plane = $('<img src="img/plane.png" />');
			$plane.addClass("plane");
			game.box.append($plane);
			
			var cssTop = game.box.offset().top +10 + $('img.plane').height()/2;
			var cssLeft = game.box.offset().left +10 + $('img.plane').width()/2;
			
			var topMax = game.box.height() - $plane.height();
			var leftMin = -$plane.width()/2;
			var leftMax = game.box.width() - $plane.width()/2;

			$plane.css({
				//当前飞机的垂直位置=当前鼠标距离浏览器的高度-盒子box距离浏览器顶部的距离-border-top - 飞机的height/2
				top: ev.y - cssTop  + 'px', 
				//当前飞机的水平位置=当前鼠标距离浏览器的宽度-盒子box距离浏览器左侧的距离-border-left - 飞机的width/2
				left: ev.x - cssLeft +'px'
			});

			//飞机跟着鼠标移动
			$(document).bind('mousemove',function(e){

				var top = e.clientY- cssTop;
				var left = e.clientX - cssLeft;
				
				if (top<0)
				{
					top = 0;
				}else if(top> topMax){
					top = topMax;
				}
				if (left < leftMin)
				{
					left = leftMin;
				}else if(left > leftMax){
					left = leftMax;
				}
				  $plane.css({
				  top: top + 'px',
				  left: left +'px'
				});
			});

			//给plane加一个bTime属性 而这样的话 下面关定时器出现作用域问题 var Time = setInterval()
			game.plane.bTime = setInterval(function(){
			game.bullet();
			},game.diffGrate[index][0]); // 子弹速度

			game.plane.eTime = setInterval(function(){
				game.enemy();
			},game.diffGrate[index][1]);//敌军生成速度

		},

		bullet : function(){
		var $bullet = $('<img class="bullet" src="img/bullet.png">');
		game.box.append($bullet);
		$bullet.css({
			top : $('img.plane').position().top - $('img.bullet').height() + 'px' ,
			left : $('img.plane').position().left + $('img.plane').width()/2 - $('img.bullet').width()/2 + 'px' ,
		}).animate({
			top : - $('img.bullet').height() + 'px',
		},$('img.plane').position().top/0.2,'linear',function(){
			$(this).remove();
		});
	},

		enemy : function(){
			var $enemy = $("<img class='enemy' src='img/enemy.png' />")
			game.box.append($enemy);
			$enemy.css({
				top : -$('img.enemy').height(),
				left : Math.random()*(game.box.width()-$('img.enemy').width())
			}).animate({
				top : game.box.height()
			},Math.random()*4000+3000,'linear',function(){//3-7秒之间变换
				$(this).remove();
			}); // 敌军移速

			$enemy.bTime = setInterval(function(){
				var eT = $enemy.position().top;
				var eB = $enemy.position().top + $enemy.height();//敌军的底部距离box的高度
				var eL = $enemy.position().left;//敌军的左侧距离box的距离
				var eR = $enemy.position().left+$enemy.width();;//敌军的右侧距离box的距离
				$("img.bullet").each(function(i){
					var bB = $(this).position().top + $(this).height();
					var bT = $(this).position().top;//子弹距离box的高度
					var bL = $(this).position().left;//子弹距离左侧宽度
					var bR = $(this).position().left + $(this).width();//子弹的右侧距离box距离
					
					/**
						碰撞检测条件：
							子弹的顶部小于敌军的底部 
							子弹的底部大于敌军的顶部
							子弹的左侧小于敌军的右侧 
							子弹的右侧大于敌军的左侧
					**/

					if (bT < eB && bB > eT && bL < eR && bR > eL)  
					{
						//alert("撞到了!!");
						$(this).remove(); //子弹消失
						$enemy.attr("src","img/boom.png"); //敌军爆炸
						clearInterval($enemy.bTime);//清除定时器
						setTimeout(function(){$enemy.remove()},500);

						//积分
						game.start.Num++;
						$("span.score").html(game.start.Num*10);

					}
				});
					//飞机的参数
					var pB = $("img.plane").position().top + $("img.plane").height();
					var pT = $("img.plane").position().top;//飞机距离box的高度
					var pL = $("img.plane").position().left;//飞机距离左侧宽度
					var pR = $("img.plane").position().left + $("img.plane").width();//飞机的右侧距离box距离

					//飞机检测碰撞

					if (pT+10 < eB && pB > eT && pL+10 < eR && pR-10 > eL)  
					{
						//alert("飞机撞飞了");
						
						$enemy.attr("src","img/boom.png"); //敌军爆炸
						clearInterval($enemy.bTime);//清除定时器
						setTimeout(function(){$enemy.remove()},500);

						$("img.plane").attr("src","img/boom2.png");//战斗机爆炸
						clearInterval(game.plane.bTime); //子弹不发射
						clearInterval(game.plane.eTime); //敌军不在出现
						$(document).unbind('mousemove');
						
						//游戏结束

						game.over();

					}

			},50);
		},
		over:function(){
			var $score = $("span.score").html();
			var $grate = '';
			if ($score < 100)
			{
				$grate = "你太年轻了";
			}else if($score < 1000){
				$grate = "渐入佳境";
			}else if($score < 3000){
				$grate = "江湖老手";
			}else if($score < 6000){
				$grate = "你好666666666";
			}
			game.box.empty();
			var $tip = $('<div class="tip"><p>Game Over</p><span class="showfen">游戏分数：&nbsp;<span id="fen"></span>分<br />获得称号:&nbsp;<span id="grate"></span></span></div>'); 
			var $reStart = $('<div id="reStart">重新开始</div>');
			$tip.append($reStart);
			
			game.box.append($tip);

			$("#fen").html($score);
			$("#grate").html($grate);

			//重新开始

			$("#reStart").click(function(){
				game.init();
			});
		}

};