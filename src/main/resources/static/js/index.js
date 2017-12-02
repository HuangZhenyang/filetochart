'use strict';

/*
 * 全局变量
 * */
let initData = null; // 初始图表数据
let currData = null; // 当前的图表数据
let dataChart = echarts.init(document.getElementById("dataChart")); // 图表
let firstTime = true;

$(document).ready(function () {
    // 初始化图表
    initDataChart();

    // 文件上传按钮绑定点击事件
    $('#fileUploadBtn').on('click', function () {
        // 判断是否有选择文件
        if ($('#fileInput').val() === "") {
            alert("请选择文件");
        } else {
            let f = document.getElementById("fileInput").files;
            // 判断文件大小
            if (f[0].size >= 1048576) {
                alert("文件太大，请选择小一点的文件");
            } else {
                fileFormSubmit();
            }
        }
    });

});


/**
 * 初始化图表
 * */
function initDataChart() {
    // 设置dataChart的属性
    dataChart.setOption({
        title: {
            text: 'File To Chart',
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
        dataZoom: {
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
            start: 40,
            end: 55
        },
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
    });
}


/**
 * 文件 表单上传
 * */
function fileFormSubmit() {
    /**
     * 表单上传
     * @param data 上传文件后返回的数据
     * */
    $("#fileUploadForm").ajaxSubmit(function (dataPara) {
        console.log("dataPara:   " + dataPara);
        let returnData = JSON.parse(dataPara);
        if (returnData.ok === "true") {
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

            setDataToDataChart(data);

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
 * @param dataPara 数据
 * */
function setDataToDataChart(dataPara) {
    dataChart.showLoading(); // 显示loading画面

    let data = dataPara;
    let xAxisData = data.xAxisData; // 用于存储从data中取出来的x轴数据
    let yAxisData = data.yAxisData; // 用于存储从data中取出来的y轴数据
    let dataLength = xAxisData.length; // 两个数组的长度
    // js默认 = 为引用传递而非值传递，因此需要用两个变量来保存数据
    let xArr = []; // 存储x轴数据
    let yArr = []; // 存储y轴数据

    for (let i = 0; i < dataLength; i++) {
        xArr.push(xAxisData[i]);
        yArr.push(yAxisData[i]);
    }
    //插入数据
    dataChart.setOption({
        xAxis: [{
            data: xArr
        }],
        series: [{
            data: yArr
        }]
    });
    // 设置x/y轴固定值，在压缩扩展时明显一点
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

    dataChart.hideLoading(); // 隐藏loading画面
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
 * 扩展：默认为乘以2；
 * @param axisPara 需要压缩/扩展的轴；
 * @param timesPara 倍数，为0.5或者2
 * @return 返回处理好的x轴/y轴数据
 * */
function change(axisPara, timesPara) {
    let axis = axisPara;
    let times = timesPara;
    let data = Object.assign({}, currData); // 当前的数据集
    let dataToChange = null; // 需要改变的数据

    if (axis === "x") {
        dataToChange = Object.assign([], data.xAxisData);
    } else if (axis === "y") {
        dataToChange = Object.assign([], data.yAxisData);
    }

    for (let i = 0; i < dataToChange.length; i++) {
        dataToChange[i] = dataToChange[i] * times;
    }

    return dataToChange;
}


/**
 * 压缩、扩展按钮点击事件
 * @param btnValPara 按钮的value
 * */
function changeButtonEvent(btnValPara) {
    let btnVal = btnValPara;
    let axisVal = document.getElementById("axisSelect").value;
    let compressTimes = 0.5;
    let extendTimes = 2;
    let dataChanged = null;
    let data = Object.assign({}, currData);

    if (btnVal === "compress") {
        dataChanged = change(axisVal, compressTimes);

    } else if (btnVal === "extend") {
        dataChanged = change(axisVal, extendTimes);
    }

    if (axisVal === "x") {
        data.xAxisData = Object.assign([], dataChanged);
    } else if (axisVal === "y") {
        data.yAxisData = Object.assign([], dataChanged);
    }
    currData = Object.assign({}, data);
    console.log("btnVal:  ", btnVal);
    console.log("data:  ", data);
    setDataToDataChart(data);

}


/**
 * 重置图表数据为初始数据
 * */
function resetData() {
    let data = Object.assign({}, initData);
    currData = Object.assign({}, initData);
    setDataToDataChart(data);
}