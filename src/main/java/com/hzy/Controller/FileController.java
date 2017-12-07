package com.hzy.Controller;

import com.hzy.Util.FileUtil;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;

/**
 * Created by huangzhenyang on 2017/12/1.
 * 文件请求Controller
 */
@RestController
public class FileController {
    @Value("${fileDirectoryPath}")
    private String fileDirectoryPath;

    /**
     * 处理文件上传,保存文件,返回处理过的数据
     * @param multipartFilePara 文件
     * @return 返回处理完的short数组以及文件信息
     */
    @PostMapping("/file-upload")
    public String fileUpload(@RequestParam("file") MultipartFile multipartFilePara) {
        MultipartFile multipartFile = multipartFilePara;
        String fileName = multipartFile.getOriginalFilename();  // 文件名
        long fileSize = multipartFile.getSize();
        JSONObject resultJsonObject = new JSONObject();         // 返回的结果
        ArrayList<Short> shortArrayList = null;

        // 保存文件
        Boolean saveFileResult = FileUtil.saveFile(multipartFile, fileName);
        if (!saveFileResult) {
            resultJsonObject.put("ok", "false");
            resultJsonObject.put("reason", "文件保存失败");
            return resultJsonObject.toString();
        }
        // 获取转换后的short数组
        shortArrayList = processFileToShort(fileDirectoryPath + fileName);

        resultJsonObject.put("ok", "true");
        resultJsonObject.put("data", shortArrayList);
        resultJsonObject.put("fileName", fileName);
        resultJsonObject.put("fileSize", fileSize);
        return resultJsonObject.toString();
    }


    /**
     * 将文件处理成short数组
     * @param filePathPara 文件路径
     * @return  ArrayList<Short>  short数组
     * */
    private ArrayList<Short> processFileToShort(String filePathPara) {
        String filePath = filePathPara;

        // 以二进制形式打开文件，获取short数组
        ArrayList<Short> shortArrayList = FileUtil.readFileAsBinary(filePath);
        return shortArrayList;
    }
}
