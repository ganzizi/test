$(function(){
	//阻止冒泡到获取二级菜单事件
	$(document).on("click",".j-valTxt",function(){return false});

	//双击文本显示input
	$(document).on("dblclick",".j-valTxt",function(){
		$(this).hide();
		$(this).siblings("input.j-val-ipt").show().focus();

		return false;
	});

	//点击编辑按钮显示input
	$(document).on("click",".j-edit",function(){
		$(this).parent("span").siblings(".j-valTxt").hide();
		$(this).parent("span").siblings("input.j-val-ipt").show().focus();

		return false;
	});

	//失去焦点添加、删除类目
	$(document).on("blur",".j-val-ipt",function(){
		var $ipt=$(this),
			id=$ipt.parent("li").data("id"),
			parent_id=$(".j-cateMain .cate-item.selected").data("id"),//一级类目id
			val=$ipt.val(),
			level=$ipt.parents(".cate").data("level");

		switch(level){
			case "main":
				var data={
					id:id,
					val:val
				}
				break;
			case "second":
				var data={
					id:id,
					parent_id:parent_id,
					val:val
				}
				break;
		}

		$ipt.hide();
		$ipt.siblings(".j-valTxt").text(val).show();

		$.ajax({
            url: "/Category/editCategory",
            type: "post",
            dataType: "json",
            data: data,
            success: function(data) {
                if (data.status == 1) {
                    $ipt.hide();
					$ipt.siblings(".j-valTxt").text(val).show();
                } else {
                    HYD.hint("danger", "对不起，更新失败：" + data.msg);
                }
            }
        });

		return false;
	});

	//删除类目
	$(document).on("click",".j-del",function(){
		var	level=$(this).parents("ul.cate").data("level"),
			$item=$(this).parents("li"),
			id=$item.data("id"),
			msg="";

		switch(level){
			case "main":msg="删除一级类目同时会删除其下的二级类目，是否继续？";break;
			case "second":msg="删除后将不可恢复，是否继续？";break;
		}
		$.jBox.show({
            title: "提示",
            content: _.template($("#tpl_jbox_simple").html(), {content: msg}),
            btnOK: {
                onBtnClick: function(jbox) {
                    $.jBox.close(jbox);
                    //删除数据
                    $.ajax({
                        url: "/Category/delCategory",
                        type: "post",
                        dataType: "json",
                        data: {
                            "id": id
                        },
                        beforeSend: function() {
                            $.jBox.showloading();
                        },
                        success: function(data) {
                            if (data.status == 1) {
                                $item.remove();
                                if(level=="main") $(".j-cateSecond .cate-item").remove();
                            } else {
                                HYD.hint("danger", "对不起，删除失败：" + data.msg);
                            }
                            $.jBox.hideloading();
                        }
                    });
                }
            }
        });

		return false;
	});

	//点击一级类目获取并显示二级类目
	$(document).on("click",".j-cateMain .cate-item",function(){
		var	$item=$(this),
			id=$item.data("id");

		$item.addClass("selected").siblings("li").removeClass("selected");

		$.ajax({
            url: "/Category/ajax_category",
            type: "post",
            dataType: "json",
            data: {
                "id": id
            },
            success: function(data) {
            	$(".j-cateSecond li").not(":eq(0)").remove();
                if (data.status == 1) {
					var html=_.template($("#tpl_cate_simple_item").html(),{dataset:data.data});
                   	$(html).insertAfter(".j-addSecond")
                }
            }
        });

		return false;
	});

	//添加一级类目、二级类目
	$(document).on("click",".j-addMain,.j-addSecond",function(){
		var tpl=$("#tpl_cate_simple_item").html(),
			$self=$(this),
			level=$self.data("level"),
			defaults={
				val:""
			};

		//如果是添加二级的话则带入parent_id
		if(level=="second"){
			defaults.parent_id=$(".j-addMain .cate-item.selected").data("id")
		}
        console.log(defaults);
			
		$.ajax({
            url: "/Category/addCategory",
            type: "post",
            dataType: "json",
            data: defaults,
            success: function(data) {
                if (data.status == 1) {
                	var tmpdata=[];//缓存数据
                	defaults.category_id=data.data;//设置ID
                	tmpdata.push(defaults);

					var html=_.template(tpl,{dataset:tmpdata}),
					$render=$(html);

					$self.parent("ul").append($render);

					$render.find(".j-valTxt").hide();
					$render.find(".j-val-ipt").show().focus();

                }
            }
        });

		return false;
	});
	
});