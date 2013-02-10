/**
 * a calendar plugin developed by Frank Fang
 * author frankfang1990gmail.com
 * version 1.0
 */
(function () {
    function G(elem) {
        if (typeof elem == "string") {
            return G.elementsCache[elem] || ( G.elementsCache[elem] = document.getElementById(elem) );
        } else if (typeof elem == "object") {
            return elem;
        } else {
            return null;
        }
    }

    G.elementsCache = [];

    function Calendar(id) {
        this.config = {
            'mode':"",
            'lang':"zh-CN",
            'debug':false
        };
        this._container = null;
        this._errorTip = "";
        this._init(id);
    }

    /**
     * 初始化。在 id 对应的元素内增加日历控件
     * @param id
     * @private
     */
    Calendar.prototype._init = function (id) {
        this._container = G(id);
        if (!this._container) {
            this._errorTip = Calendar.errorMassage[0].replace('%id%', id);
            return;
        }
        if (this._container.style.position == '' || this._container.style.position == 'static') {
            this._container.style.position = 'relative';
        }

        this._createLayout();
        this._bindEvent();
    };

    /**
     * 生成 HTML 结构
     * @private
     */
    Calendar.prototype._createLayout = function () {
        this._container.innerHTML = Calendar.layout;
        this._container = this._container.firstChild;
        this.hide();
        //填充星期几
        var weekHeads = this._container.getElementsByTagName('OL')[0].getElementsByTagName('LI');
        for (var i = 0; i < 7; ++i) {
            setInnerHtml(weekHeads[i], Calendar.i18n[this.config.lang].DAYOFWEEK[i]);
        }
        this._fillDate();

        this.show();
        this._showBottomTip(Calendar.i18n[this.config.lang].DEFAULTTIP);
    };

    /**
     *
     * @param _year
     * @param _month
     * @param _date
     * @private
     */
    Calendar.prototype._fillDate = function (_year, _month, _date) {
        var now = new Date();
        var temp = _date ? new Date(_year, _month - 1, _date) : new Date();
        var currentYear = temp.getFullYear();
        var currentMonth = temp.getMonth() + 1;
        var currentDate = temp.getDate();
        var currentDay = temp.getDay();
        this.currentYear = currentYear;
        this.currentMonth = currentMonth;
        this.currentDate = currentDate;
        this.currentDay = currentDay;
        //填充日期
        var list = this._container.getElementsByTagName('OL')[1].getElementsByTagName('LI');
        temp.setDate(1);
        var dayOfFirstDate = temp.getDay();
        temp.setDate(0);
        var lastDateOflastMonth = temp.getDate();
        for (var i = 0; i < dayOfFirstDate; ++i) {
            setInnerHtml(list[i], lastDateOflastMonth - (dayOfFirstDate - i - 1));
            list[i].className = 'date-prev';
        }
        if (currentMonth == 2) {
            Calendar.DAYOFMONTH[1] = isLeapYear(currentYear) ? 29 : 28;
        }
        var dayOfThisMonth = Calendar.DAYOFMONTH[currentMonth - 1];
        for (var i = 0; i < dayOfThisMonth; ++i) {
            setInnerHtml(list[i + dayOfFirstDate], i + 1);
            if (currentMonth == now.getMonth() + 1 && i + 1 == currentDate && currentYear == now.getFullYear()) {
                list[i + dayOfFirstDate].className = 'date-hl';
            }
            else {
                list[i + dayOfFirstDate].className = 'date-now';
            }
        }
        for (var i = dayOfFirstDate + dayOfThisMonth, j = 1; list[i]; ++i, ++j) {
            setInnerHtml(list[i], j);
            list[i].className = 'date-next';
        }
        //结束 填充日期
        this._showTopTip(this.currentYear + '.' + this.currentMonth);
    };

    Calendar.prototype._bindEvent = function () {
        //绑定每日的onMouseover和onMouseout和onClick事件
        var that = this;
        var calendar = this._container.getElementsByTagName('OL')[1];
        calendar.onmouseover = function (event) {
            var event = event || window.event;
            var eventTarget = event.srcElement || event.target;
            if (eventTarget.nodeName.toUpperCase() == 'LI') {
                if (eventTarget.className.indexOf('date-prev') > -1) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].PREVMONTH);
                    return;
                }
                if (eventTarget.className.indexOf('date-next') > -1) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].NEXTMONTH);
                    return;
                }
                if (eventTarget.className.indexOf('date-hl') > -1) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].TODAY);
                    return;
                }
                that._showBottomTip(Calendar.i18n[that.config.lang].DATEFORMAT.replace('%yyyy%', that.currentYear).replace('%M%', Calendar.i18n[that.config.lang].MONTHS[that.currentMonth - 1]).replace('%d%', eventTarget.firstChild.nodeValue || eventTarget.innerText));
            }
            ;
        };
        calendar.onmouseout = function (event) {
            var event = event || window.event;
            var eventTarget = event.srcElement || event.target;
            if (eventTarget.nodeName.toUpperCase() == 'OL') {
                that._showBottomTip(Calendar.i18n[that.config.lang].DEFAULTTIP);
            }
            ;
        };
        calendar.onclick = function (event) {
            var event = event || window.event;
            var eventTarget = event.srcElement || event.target;
            if (eventTarget.nodeName.toUpperCase() == 'LI') {
                if (eventTarget.className == "date-now") {
                    that.onDateSelected(that.currentYear, that.currentMonth, eventTarget.firstChild.nodeValue || eventTarget.innerText);
                } else if (eventTarget.className == "date-next") {
                    that._fillDate(that.currentYear, that.currentMonth + 1, that.currentDate);
                } else if (eventTarget.className == "date-prev") {
                    that._fillDate(that.currentYear, that.currentMonth - 1, that.currentDate);
                }

            }
        };
        //结束 绑定每日的onMouseover和onMouseout和onClick事件

        //绑定上一年、上一月、下一月、下一年的onMouseover和onClick事件
        var control = this._container.getElementsByTagName('DIV')[0];
        control.onmouseover = function (event) {
            var event = event || window.event;
            var eventTarget = event.srcElement || event.target;
            if (eventTarget.nodeName.toUpperCase() == 'BUTTON') {
                if (eventTarget === control.getElementsByTagName('BUTTON')[0]) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].PREVYEAR);
                    return;
                }
                if (eventTarget === control.getElementsByTagName('BUTTON')[1]) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].PREVMONTH);
                    return;
                }
                if (eventTarget === control.getElementsByTagName('BUTTON')[2]) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].NEXTMONTH);
                    return;
                }
                if (eventTarget === control.getElementsByTagName('BUTTON')[3]) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].NEXTYEAR);
                    return;
                }
                if (eventTarget === control.getElementsByTagName('BUTTON')[4]) {
                    that._showBottomTip(Calendar.i18n[that.config.lang].CLOSE);
                    return;
                }
            }
        };
        control.onclick = function (event) {
            var event = event || window.event;
            var eventTarget = event.srcElement || event.target;
            if (eventTarget.nodeName.toUpperCase() == 'BUTTON') {
                if (eventTarget === control.getElementsByTagName('BUTTON')[0]) {
                    that._fillDate(that.currentYear - 1, that.currentMonth, that.currentDate);
                }
                else if (eventTarget === control.getElementsByTagName('BUTTON')[1]) {
                    that._fillDate(that.currentYear, that.currentMonth - 1, that.currentDate);
                }
                else if (eventTarget === control.getElementsByTagName('BUTTON')[2]) {
                    that._fillDate(that.currentYear, that.currentMonth + 1, that.currentDate);
                }
                else if (eventTarget === control.getElementsByTagName('BUTTON')[3]) {
                    that._fillDate(that.currentYear + 1, that.currentMonth, that.currentDate);
                }
                else if (eventTarget === control.getElementsByTagName('BUTTON')[4]) {
                    that.hide();
                }
            }

        };
        //结束 绑定上一年、上一月、下一月、下一年的onMouseover和onClick事件

    };

    Calendar.prototype._showBottomTip = function (tip) {
        setInnerHtml(this._container.lastChild, tip);
    };
    Calendar.prototype._showTopTip = function (tip) {
        setInnerHtml(this._container.firstChild.getElementsByTagName('SPAN')[0], tip);
    };
    Calendar.prototype.show = function () {
        this._container.style.visibility = 'visible';
    };
    Calendar.prototype.hide = function () {
        this._container.style.visibility = 'hidden';
    };
    Calendar.prototype.onDateSelected = function (_year, _month, _date) {
    };

    Calendar.errorMassage = [
        "can't find an element with the id %id%"
    ];
    Calendar.DAYOFMONTH = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    Calendar.i18n = {
        'zh-CN':{
            'DAYOFWEEK':['日', '一', '二', '三', '四', '五', '六'],
            'FULLDAYOFWEEK':['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            'MONTHS':['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
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
            'DAYOFWEEK':['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            'FULLDAYOFWEEK':['Sunday', 'Monday', 'Tuesday', 'wednesday', 'Thursday', 'Friday', 'Saturday'],
            'MONTHS':['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
     * zen coding abbr
     * div.frk-cal-wrap
     *   div.heading.frk-cal-part>button+button+span+button+button
     *   ol.what-day.frk-cal-part.frk-clearfix>li*7>a[href=javascript:void(0)]
     *   ol.calendar.frk-cal-part.frk-clearfix>li*42>a[href=javascript:void(0)]
     *   div>span
     */
    Calendar.layout = '<div class="frk-cal-wrap"><div class="heading frk-cal-part"><button>&lt;&lt;</button><button>&lt;</button><span>2011.10</span><button>&gt;</button><button>&gt;&gt;</button><button>X</button></div>';
    Calendar.layout += '<ol class="what-day frk-clearfix frk-cal-part"><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ol>';
    Calendar.layout += '<ol class="calendar frk-clearfix frk-cal-part"><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ol>';
    Calendar.layout += '<div class="frk-cal-part"><span></span></div></div>';

    window.Calendar = Calendar;

    function setInnerHtml(elem, html) {
        var oldElem = G(elem);
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
            oldElem.innerHTML = html;
            return oldElem;
        }
        var newElem = oldElem.cloneNode(false);
        newElem.innerHTML = html;
        oldElem.parentNode.replaceChild(newElem, oldElem);
        return newElem;
    }

    function isLeapYear(year) {
        return (year % 100 == 0) ? (year % 400 == 0 ? true : false) : (year % 4 == 0 ? true : false);
    }
})();
