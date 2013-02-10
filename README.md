#calendar

js 日历控件

## 使用

### 1. 准备 HTML

``<div id="c" class="cal">2</div>``

### 2. 初始化

``var c = new Calendar('c');``

### 3. 调用

``c.hide();``

``c.show();``

### 4. 获取日期

```
c.onDateSelected = function (year, month, date) {
    alert(year + '年' + month + '月' + date + '日');
};
```

## TODO

1. API 丰富
2. 样式自定义或多样式
