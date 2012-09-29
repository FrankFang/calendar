/**
* a calendar plugin developed by Frank Fang
* author FrankFang  Tencent, frankfang1990gmail.com
* version 1.0
*/

window.frankGet=function(elem){
	if(typeof elem == "string"){
		return frankGet.elementsCache[elem] || ( frankGet.elementsCache[elem] = document.getElementById(elem) );
	}else if(typeof elem == "object"){
		return elem;
	}else{
		return null;
	} 
};
window.frankGet.elementsCache = [];

function FrankCalendar(id){
	this.config = {
		'mode' : "",
		'lang' : "zh-CN",
		'debug' : false
		//'position': 'top left inside' // top|middle|bottom left|center|right inside|outside
	};
	this._container = null;
	this._errorTip = "";
	this._init(id);
}
FrankCalendar.prototype._setInnerHTML = function(elem,html){
	var oldElem = frankGet(elem);
	if(/msie/.test(navigator.userAgent.toLowerCase())){
		oldElem.innerHTML = html; 
        return oldElem;
	}
	var newElem = oldElem.cloneNode(false);
	newElem.innerHTML = html;
	oldElem.parentNode.replaceChild(newElem,oldElem);
	return newElem;
};

FrankCalendar.prototype._init = function(id){
	this._container = frankGet(id);
	if(!this._container){
		this.errorTip= FrankCalendar.ERRORMSG[0].replace('%id%',id); 
		return false;
	}
	if(this._container.style.position == '' || this._container.style.position == 'static'){
		this._container.style.position = 'relative';
	}
	
	this._createLayout();
	this._bindEvent();
};

FrankCalendar.prototype._createLayout = function(){
	this._container.innerHTML = this.layout;
	this._container = this._container.firstChild;
	this.hide();
	//填充星期几
	var weekHeads = this._container.getElementsByTagName('OL')[0].getElementsByTagName('LI');
	for(var i=0;i<7;++i){
		this._setInnerHTML(weekHeads[i],FrankCalendar.i18n[this.config.lang].DAYOFWEEK[i]);
	}
	this._fillDate();
	
	this.show();
	this._showBottomTip(FrankCalendar.i18n[this.config.lang].DEFAULTTIP);
};

FrankCalendar.prototype._fillDate = function(year,month,date){
	var now = new Date();
	var temp = date ? new Date(year,month-1,date) : new Date();
	var y = temp.getFullYear();
	var M = temp.getMonth()+1;
	var d = temp.getDate();
	var W = temp.getDay();
	this.currentYear = y;
	this.currentMonth = M;
	this.currentDate = d;
	this.currentDay = W;
	//填充日期
	var list = this._container.getElementsByTagName('OL')[1].getElementsByTagName('LI');
	temp.setDate(1);
	var dayOfFirstDate = temp.getDay();
	temp.setDate(0);
	var lastDateOflastMonth = temp.getDate();
	for(var i=0;i<dayOfFirstDate;++i){
		this._setInnerHTML(list[i],lastDateOflastMonth-(dayOfFirstDate-i-1));
		list[i].className = 'date-prev';
	}
	if(M==2){FrankCalendar.DAYOFMONTH[1] = this._isLeapYear(y) ? 29 : 28;}
	var dayOfThisMonth = FrankCalendar.DAYOFMONTH[M-1];
	for(var i=0;i<dayOfThisMonth;++i){
		this._setInnerHTML(list[i+dayOfFirstDate],i+1);
		if(M == now.getMonth()+1 && i+1 == d && y == now.getFullYear()){list[i+dayOfFirstDate].className='date-hl';}
		else{list[i+dayOfFirstDate].className='date-now';}
	}
	for(var i=dayOfFirstDate+dayOfThisMonth,j=1;list[i];++i,++j){
		this._setInnerHTML(list[i],j);
		list[i].className = 'date-next';
	}
	//结束 填充日期
	this._showTopTip(this.currentYear+'.'+this.currentMonth);
};

FrankCalendar.prototype._bindEvent = function(){
	//绑定每日的onMouseover和onMouseout和onClick事件
	var that = this;
	var calendar = this._container.getElementsByTagName('OL')[1];
	calendar.onmouseover = function(event){
		var event = event || window.event;
		var eventTarget = event.srcElement||event.target; 
		if(eventTarget.nodeName.toUpperCase()=='LI'){
			if(eventTarget.className.indexOf('date-prev')>-1){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].PREVMONTH);
				return;
			}
			if(eventTarget.className.indexOf('date-next')>-1){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].NEXTMONTH);
				return;
			}
			if(eventTarget.className.indexOf('date-hl')>-1){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].TODAY);
				return;
			}
			that._showBottomTip(FrankCalendar.i18n[that.config.lang].DATEFORMAT.replace('%yyyy%',that.currentYear).replace('%M%',FrankCalendar.i18n[that.config.lang].MONTHS[that.currentMonth-1]).replace('%d%',eventTarget.firstChild.nodeValue || eventTarget.innerText));
		};
	};
	calendar.onmouseout = function(event){
		var event = event || window.event;
		var eventTarget = event.srcElement||event.target; 
		if(eventTarget.nodeName.toUpperCase()=='OL'){
			that._showBottomTip(FrankCalendar.i18n[that.config.lang].DEFAULTTIP);
		};
	};
	calendar.onclick = function(event){
		var event = event || window.event;
		var eventTarget = event.srcElement||event.target; 
		if(eventTarget.nodeName.toUpperCase()=='LI'){
			if(eventTarget.className=="date-now"){
				that.onDateSelected(eventTarget);
			}else if(eventTarget.className=="date-next"){
				that._fillDate(that.currentYear,that.currentMonth+1,that.currentDate);
			}else if(eventTarget.className=="date-prev"){
				that._fillDate(that.currentYear,that.currentMonth-1,that.currentDate);
			}
			
			
		};
	};
	//结束 绑定每日的onMouseover和onMouseout和onClick事件
	
	//绑定上一年、上一月、下一月、下一年的onMouseover和onClick事件
	var control = this._container.getElementsByTagName('DIV')[0];
	control.onmouseover = function(event){
		var event = event || window.event;
		var eventTarget = event.srcElement||event.target;
		if(eventTarget.nodeName.toUpperCase()=='BUTTON'){
			if(eventTarget === control.getElementsByTagName('BUTTON')[0]){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].PREVYEAR);
				return;
			}
			if(eventTarget === control.getElementsByTagName('BUTTON')[1]){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].PREVMONTH);
				return;
			}
			if(eventTarget === control.getElementsByTagName('BUTTON')[2]){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].NEXTMONTH);
				return;
			}
			if(eventTarget === control.getElementsByTagName('BUTTON')[3]){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].NEXTYEAR);
				return;
			}
			if(eventTarget === control.getElementsByTagName('BUTTON')[4]){
				that._showBottomTip(FrankCalendar.i18n[that.config.lang].CLOSE);
				return;
			}
		}
	};
	control.onclick = function(event){
		var event = event || window.event;
		var eventTarget = event.srcElement||event.target;
		if(eventTarget.nodeName.toUpperCase()=='BUTTON'){
			if(eventTarget === control.getElementsByTagName('BUTTON')[0]){
				that._fillDate(that.currentYear-1,that.currentMonth,that.currentDate);
			}
			else if(eventTarget === control.getElementsByTagName('BUTTON')[1]){
				that._fillDate(that.currentYear,that.currentMonth-1,that.currentDate);
			}
			else if(eventTarget === control.getElementsByTagName('BUTTON')[2]){
				that._fillDate(that.currentYear,that.currentMonth+1,that.currentDate);
			}
			else if(eventTarget === control.getElementsByTagName('BUTTON')[3]){
				that._fillDate(that.currentYear+1,that.currentMonth,that.currentDate);
			}
			else if(eventTarget === control.getElementsByTagName('BUTTON')[4]){
				that.hide();
			}
		}
		
		
	};
	//结束 绑定上一年、上一月、下一月、下一年的onMouseover和onClick事件
	
	
};

FrankCalendar.prototype._showBottomTip = function(tip){
	this._setInnerHTML(this._container.lastChild,tip);
};
FrankCalendar.prototype._showTopTip = function(tip){
	this._setInnerHTML(this._container.firstChild.getElementsByTagName('SPAN')[0],tip);
};
FrankCalendar.prototype.show = function(){
	this._container.style.visibility = 'visible';
};
FrankCalendar.prototype.hide = function(){
	this._container.style.visibility = 'hidden';
};
FrankCalendar.prototype.onDateSelected = function(obj){
	alert(FrankCalendar.i18n[this.config.lang].DATEFORMAT.replace('%yyyy%',this.currentYear).replace('%M%',FrankCalendar.i18n[this.config.lang].MONTHS[this.currentMonth-1]).replace('%d%',obj.firstChild.nodeValue || obj.innerText));
};
FrankCalendar.prototype._isLeapYear = function(year){
	return (year%100==0) ? (year%400==0 ? true: false) : (year%4==0 ? true : false);
};

FrankCalendar.ERRORMSG = [
	"can't find an element with the id %id%"
];
FrankCalendar.DAYOFMONTH = [31,0,31,30,31,30,31,31,30,31,30,31];
FrankCalendar.i18n = {
	'zh-CN':{
		'DAYOFWEEK':['日','一','二','三','四','五','六'],
		'FULLDAYOFWEEK':['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
		'MONTHS':['1','2','3','4','5','6','7','8','9','10','11','12'],
		'DATEFORMAT':'%yyyy%年%M%月%d%日',
		'DEFAULTTIP':'请点击数字选择日期',
		'PREVMONTH':'上个月',
		'PREVYEAR':'上一年',
		'NEXTMONTH':'下个月',
		'NEXTYEAR':'下一年',
		'CLOSE':'关闭',
		'TODAY':'今天'
	},
	'en-US':{
		'DAYOFWEEK':['S','M','T','W','T','F','S'],
		'FULLDAYOFWEEK':['Sunday','Monday','Tuesday','wednesday','Thursday','Friday','Saturday'],
		'MONTHS':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		'DATEFORMAT':'%M% %d% %yyyy%',
		'DEFAULTTIP':'Click a number to pick a date',
		'PREVMONTH':'last month',
		'PREVYEAR':'last year',
		'NEXTMONTH':'next month',
		'NEXTYEAR':'next year',
		'CLOSE':'close',
		'TODAY':'today'
	}
};
/**
*zen coding abbr
*div.frk-cal-wrap
*	div.heading.frk-cal-part>button+button+span+button+button
*	ol.what-day.frk-cal-part.frk-clearfix>li*7>a[href=javascript:void(0)]
*	ol.calendar.frk-cal-part.frk-clearfix>li*42>a[href=javascript:void(0)]
*	div>span
*/
FrankCalendar.prototype.layout='<div class="frk-cal-wrap"><div class="heading frk-cal-part"><button>&lt;&lt;</button><button>&lt;</button><span>2011.10</span><button>&gt;</button><button>&gt;&gt;</button><button>X</button></div>';
FrankCalendar.prototype.layout+='<ol class="what-day frk-clearfix frk-cal-part"><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ol>';
FrankCalendar.prototype.layout+='<ol class="calendar frk-clearfix frk-cal-part"><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ol>';
FrankCalendar.prototype.layout+='<div class="frk-cal-part"><span></span></div></div>';

