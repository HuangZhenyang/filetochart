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
 * 文件请求控制器
 */
@RestController
public class FileController {
    @Value("${fileDirectoryPath}")
    private String fileDirectoryPath;
    /**
     * 处理文件上传,保存文件,返回处理过的数据
     * @param multipartFilePara  文件
     * @return 返回处理完的short数组以及文件信息
     * */
    @PostMapping("/file-upload")
    public String fileUpload(@RequestParam("file") MultipartFile multipartFilePara){
        MultipartFile multipartFile = multipartFilePara;
        String fileName = multipartFile.getOriginalFilename(); // 文件名
        long fileSize = multipartFile.getSize();
        JSONObject jsonObject = new JSONObject(); // 返回的结果
        ArrayList<Short> shortArrayList = null;

        // 保存文件
        Boolean saveFileResult = FileUtil.saveFile(multipartFile, fileName);
        if(!saveFileResult){
            jsonObject.put("ok", "false");
            jsonObject.put("reason", "文件保存失败");
            return jsonObject.toString();
        }

        shortArrayList = processFileToShort(fileDirectoryPath + fileName);

        jsonObject.put("ok", "true");
        jsonObject.put("data", shortArrayList);
        jsonObject.put("fileName", fileName);
        jsonObject.put("fileSize", fileSize);
        return jsonObject.toString();
    }

    private ArrayList<Short> processFileToShort(String filePathPara){
        String filePath = filePathPara;
        // 以二进制形式打开文件，获取short数组
        ArrayList<Short> shortArrayList = FileUtil.readFileAsBinary(filePath);
        return shortArrayList;
    }
}
