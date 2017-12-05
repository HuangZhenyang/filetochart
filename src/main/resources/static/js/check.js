'use strict';


/**
 * 检查是否选择文件
 * @return true:有选择文件；  false:没有选择文件
 * */
function checkFileSelected() {
    if ($('#fileInput').val() === "") {
        return false;
    } else {
        return true;
    }
}


/**
 * 检查是否上传了文件
 * @return true:已经上传文件；  false:没有选择文件
 * */
function checkFileUploaded() {
    if (initData === null) {
        return false;
    } else {
        return true;
    }
}
