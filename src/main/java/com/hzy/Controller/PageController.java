package com.hzy.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Created by huangzhenyang on 2017/11/27.
 * 处理文件上传，处理数据，返回页面等
 */

@Controller
public class PageController {

    /**
     * 返回index页面
     * */
    @GetMapping("/index")
    public String getIndexPage(){
        return "index";
    }

}
