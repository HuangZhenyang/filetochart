'use strict';


/**
 * 全局变量
 * */
let initData = null;                                                                // 初始图表数据
let currData = null;                                                                // 当前的图表数据
let dataChart = echarts.init(document.getElementById("dataChart"));                 // 图表dataChart
let originalDataChart = echarts.init(document.getElementById("originalDataChart")); // 原始数据图表
let firstTime = true;                                                              // 判断是不是第一次调用setDataToChart()函数
let initDataZoomStart = 40;                                                         // datazoom范围的起始值
let initDataZoomEnd = 55;                                                           // datazoom范围的结束值
let dataZoomStart = 40;                                                             // datazoom范围的起始值
let dataZoomEnd = 55;                                                               // datazoom范围的结束值

const maxFileSize = 1048576;                                                          // 最大文件限制
const xAxis = "x";                                                                    // x轴
const yAxis = "y";                                                                    // y轴
const compressBtnValue = "compress";                                                  // 压缩按钮的值
const extendBtnValue = "extend";                                                      // 扩展按钮的值
const originalResetBtnVal = "originalResetBtn";                                       // 原始数据图表重置按钮的值
const dataResetBtnVal = "dataResetBtn";                                               // 变化的数据图表重置按钮的值
const resultOkTrue = "true";                                                          // 返回值为真的值
const originalChartName = "原始数据通道";                                              // 原始数据通道图表名称
const dataChartName = "可变数据通道";                                                   // 可变数据通道图表名称
const fileNotSelectedMsg = "请选择文件";                                                // 未选择文件提示信息
const fileOutOfSizeMsg = "文件太大，请选择小一点的文件";                                // 文件过大提示信息


/**
 * 页面加载完成时触发该函数，用于初始化以及绑定
 * */
$(document).ready(function () {
    // 初始化图表
    initDataChart(originalDataChart, originalChartName);
    initDataChart(dataChart, dataChartName);

    // 文件上传按钮绑定点击事件
    $('#fileUploadBtn').on('click', function () {
        // 判断是否有选择文件
        if (!checkFileSelected()) {
            alert(fileNotSelectedMsg);
        } else {
            let f = document.getElementById("fileInput").files;
            // 判断文件大小
            if (f[0].size >= maxFileSize) {
                alert(fileOutOfSizeMsg);
            } else {
                fileFormSubmit();
            }
        }
    });

});


/**
 * 初始化图表
 * @param chartObjPara 图表对象
 * @param chartNamePara 图表名字
 * */
function initDataChart(chartObjPara, chartNamePara) {
    let chartObj = chartObjPara;
    let chartName = chartNamePara;
    let chartOption = {
        title: {
            text: chartName,
            subtext: '',
            x: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                type: 'line' // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (params) {
                let res = "(" + params[0].dataIndex + ", " + params[0].data + ")";
                return res;
            }
        },
        toolbox: {
            feature: {
                magicType: {
                    show: true,
                    type: ['line', 'bar']
                }
            }
        },
        legend: {
            data: ['']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        dataZoom: [{
            show: true,
            realtime: true,
            //orient: 'vertical',   // 'horizontal'
            //x: 0,
            y: 36,
            //width: 400,
            height: 20,
            //backgroundColor: 'rgba(221,160,221,0.5)',
            //dataBackgroundColor: 'rgba(138,43,226,0.5)',
            fillerColor: 'rgba(38,143,26,0.6)',
            handleColor: 'rgba(128,43,16,0.8)',
            //xAxisIndex:[],
            //yAxisIndex:[],
            start: dataZoomStart,
            end: dataZoomEnd,
            filterMode: 'filter'
        }, {
            id: 'dataZoomY',
            type: 'slider',
            yAxisIndex: [0],
            filterMode: 'filter'
        }, {
            type: 'inside',
            xAxisIndex: [0],
            start: 1,
            end: 35
        }, {
            type: 'inside',
            yAxisIndex: [0],
            start: 29,
            end: 36
        }
        ],
        xAxis: [
            {
                type: 'category',
                data: []
            }
        ],
        yAxis: [{
            type: 'value',
            name: ''
        }],
        series: [
            {
                name: 'y-axis-value',
                type: 'line',
                data: []
            }
        ]
    };

    // 设置图表的属性
    chartObj.setOption(chartOption);

}


/**
 * 表单上传，上传文件
 * */
function fileFormSubmit() {
    /**
     * 表单上传
     * @param data 上传文件后返回的数据
     * */
    $("#fileUploadForm").ajaxSubmit(function (dataPara) {
        let returnData = JSON.parse(dataPara);
        if (returnData.ok === resultOkTrue) {
            // 数据插入图表
            let yAxisData = returnData.data;
            // 生成x轴数据，为y轴数据的索引下标： [0, 1, 2, 3, ……, (xAxisData.length-1)]
            let xAxisData = [];
            for (let i = 0; i < yAxisData.length; i++) {
                xAxisData.push(i);
            }
            // 构造x、y轴数据集
            let data = {"xAxisData": xAxisData, "yAxisData": yAxisData};
            initData = Object.assign({}, data);
            currData = Object.assign({}, data);

            //数据插入图表
            setDataToDataChart(originalDataChart, data);
            setDataToDataChart(dataChart, data);

            // 插入文件名
            let fileName = returnData.fileName;
            setFileName(fileName);

            // 插入文件大小
            let fileSize = returnData.fileSize;
            setFileSize(fileSize);

            // 插入时间
            setTime();
        }
    });
}


/**
 * 数据插入图表中
 * @param chartObjPara 图表的对象
 * @param dataPara 数据
 * */
function setDataToDataChart(chartObjPara, dataPara) {
    dataChart.showLoading();            // 显示loading画面

    let chartObj = chartObjPara;
    let data = dataPara;
    let xAxisData = data.xAxisData;     // 用于存储从data中取出来的x轴数据
    let yAxisData = data.yAxisData;     // 用于存储从data中取出来的y轴数据
    let dataLength = xAxisData.length;  // 两个数组的长度
    // js默认 = 为引用传递而非值传递，因此需要用两个变量来保存数据
    let xArr = [];                     // 存储x轴数据
    let yArr = [];                     // 存储y轴数据

    for (let i = 0; i < dataLength; i++) {
        xArr.push(xAxisData[i]);
        yArr.push(yAxisData[i]);
    }
    //插入数据
    chartObj.setOption({
        xAxis: [{
            data: xArr
        }],
        series: [{
            data: yArr
        }]
    });
    // 设置x/y轴固定值，在压缩时明显一点  TODO:扩展的时候将firstTime设置为true
    if (firstTime === true) {
        let yMax = Math.max.apply(null, yAxisData);
        let yMin = Math.min.apply(null, yAxisData);
        dataChart.setOption({
            yAxis: [{
                max: yMax,
                min: yMin,
            }]
        });
        firstTime = false;
    }

    dataChart.hideLoading();
}


/**
 * 设置时间
 * */
function setTime() {
    let date = new Date();
    let time = date.toLocaleTimeString();

    $('#uploadTime').text(time);
}


/**
 * 插入文件名
 * @param fileNamePara 文件名
 * */
function setFileName(fileNamePara) {
    let fileName = fileNamePara;
    $('#fileName').text(fileName);
}

/**
 * 插入文件大小
 * @param fileSizePara 文件大小
 * */
function setFileSize(fileSizePara) {
    let fileSize = fileSizePara;
    $('#fileSize').text(fileSize + " bytes");
}


/**
 * 压缩：默认为乘以0.5；
 * 扩展：默认为乘以2；如果为y轴，设置firstTime为true，这样的话扩展的时候就可以一起联动
 * @param axisPara 需要压缩/扩展的轴；
 * @param timesPara 倍数，为0.5或者2
 * @return 返回处理好的x轴/y轴数据
 * */
function change(axisPara, timesPara) {
    let axis = axisPara;
    let times = timesPara;
    let data = Object.assign({}, currData); // 当前的数据集
    let dataToChange = null;                // 需要改变的数据

    if (axis === xAxis) {
        dataToChange = Object.assign([], data.xAxisData);
    } else if (axis === yAxis) {
        dataToChange = Object.assign([], data.yAxisData);
        if (times === 2) {
            firstTime = true;
        }
    }

    for (let i = 0; i < dataToChange.length; i++) {
        dataToChange[i] = dataToChange[i] * times;
    }

    return dataToChange;
}


/**
 * 压缩、扩展按钮点击事件
 * 调用change()函数得到对应的轴的数据，
 * 调用setDataZoomStartAndEnd()函数设置x轴的dataZoom
 * @param btnValPara 按钮的value
 * */
function changeButtonEvent(btnValPara) {
    if (!checkFileUploaded()) {
        alert("请选择文件上传");
        return;
    }
    let btnVal = btnValPara;
    let axisVal = document.getElementById("axisSelect").value;
    let compressTimes = 0.5;
    let extendTimes = 2;
    let dataChanged = null;
    let data = Object.assign({}, currData);

    if (btnVal === compressBtnValue) {
        dataChanged = change(axisVal, compressTimes);
    } else if (btnVal === extendBtnValue) {
        dataChanged = change(axisVal, extendTimes);
    }

    // 更改当前图表数据currData
    if (axisVal === xAxis) {
        data.xAxisData = Object.assign([], dataChanged);
        setDataZoomStartAndEnd(btnVal); // 改变dataZoom
    } else if (axisVal === yAxis) {
        data.yAxisData = Object.assign([], dataChanged);
    }
    currData = Object.assign({}, data);

    setDataToDataChart(dataChart, data);

}


/**
 * 重置按钮点击函数
 * */
function resetDataFunc(resetBtnValuePara) {
    let resetBtnValue = resetBtnValuePara;

    if (resetBtnValue === originalResetBtnVal) {
        resetData(originalDataChart);
    } else if (resetBtnValue === dataResetBtnVal) {
        resetData(dataChart);
    }
}


/**
 * 重置图表数据为初始数据,重置dataZoom
 * */
function resetData(chartObjPara) {
    if (!checkFileUploaded()) {
        alert("请选择文件上传");
        return;
    }

    let chartObj = chartObjPara;

    let data = Object.assign({}, initData);
    currData = Object.assign({}, initData);
    firstTime = true;

    setDataToDataChart(chartObj, data);

    chartObj.setOption({
        dataZoom: [{
            start: initDataZoomStart,
            end: initDataZoomEnd
        }, {
            start: 0,
            end: 100
        }]
    });

    // 将当前的起始也设置成初始的值
    dataZoomStart = initDataZoomStart;
    dataZoomEnd = initDataZoomEnd;
}


/**
 * 设置dataZoom起始结束范围,只有在x轴数据缩放时才需要
 * @param btnValPara 变化的倍数
 * */
function setDataZoomStartAndEnd(btnValPara) {
    let btnVal = btnValPara;

    // 根据btnVal改变dataZoom范围
    if (btnVal === compressBtnValue) {
        let dataZoomMid = (dataZoomStart + dataZoomEnd) / 2;
        dataZoomStart = 2 * dataZoomStart - dataZoomMid;
        dataZoomEnd = 2 * dataZoomEnd - dataZoomMid;
    } else if (btnVal === extendBtnValue) {
        let dataZoomMid = (dataZoomStart + dataZoomEnd) / 2;
        dataZoomStart = 0.5 * (dataZoomStart + dataZoomMid);
        dataZoomEnd = 0.5 * (dataZoomEnd + dataZoomMid);
    }

    dataChart.setOption({
        dataZoom: [{
            start: dataZoomStart,
            end: dataZoomEnd
        }]
    });

}


