## **FileToChart**
软件构造课程设计项目：将文件以二进制方式打开，每两个（一个为1bytes=8bits,两个为16bits，为一个short的大小）转成一个short，映射到图表中；

## **框架**
1. 后端采用`Spring Boot`；
2. 前端为`html + css + js`, 图形库为`Echarts3.0`

## **功能**
1. 文件二进制转short到图表的映射
2. 对波形的压缩、扩展
3. 对波形的还原

## **使用**
1. git clone git@github.com:HuangZhenyang/filetochart.git
2. 将工程用intellij idea打开，运行
3. 默认运行在8081端口
4. 打开浏览器，访问`localhost:8081/index`，将文件上传即可看到效果（注意，文件有大小限制）

## **不足/TODO**
~~由于需要Echarts的datazoom功能，但是在对x轴进行波形压缩、扩展处理时，datazoom没改变，所以效果看不太出来；~~

## **更新记录**
**2017.12.3更新：**
1. 解决对x轴进行波形压缩/扩展时波形没有变化的问题</br>
通过对dataZoom的起始结束范围重新设置：</br>
```
dataChart.setOption({
    dataZoom: {
        start: dataZoomStart,
        end: dataZoomEnd
    }
});
```
2. 修复对x轴进行波形压缩/扩展时，没有对dataZoom复原的BUG;
**2017.12.5更新：**
3. 增加y轴dataZoom控件