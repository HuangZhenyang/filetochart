package com.hzy.Util;

import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.util.ArrayList;

/**
 * Created by huangzhenyang on 2017/11/28.
 * 文件处理工具类
 */
public class FileUtil {
    private static String fileDirectoryPath = "D:\\课件\\软件构造\\filetochart\\src\\main\\resources\\static\\uploadfile\\";

    /**
     * 以二进制方式读取文件，存入byte数组，
     * 每两个byte转成一个short,存入ArrayList<Short>
     *
     * @param filePathPara 文件路径名
     * @return ArrayList<Short>  返回文件读取后的byte数组
     */
    public static ArrayList<Short> readFileAsBinary(String filePathPara) {

        String filePath = filePathPara;
        File file = new File(filePath);
        int sizeOfEachRead = 1024;                          // 每次读取的字节数
        byte[] fileBytesArray = new byte[sizeOfEachRead];   // 一个byte为8字节，两个为16字节，// 刚刚好为一个short的大小
        int read_num = 0;                                   // 每次读取的个数，为DataInputStream.read()函数的返回值
        ArrayList<Short> shortArrList = new ArrayList<>();  // 存储转换后的short
        Short tempShort = 0;                                // 存储函数返回值的temp变量
        byte b1 = 0;
        byte b2 = 0;

        try {
            // 利用DataInputStream类读取二进制文件要使用到FileInputStream类
            // 构造FileInputStream，字节流读写文本文件
            FileInputStream fileInputStream = new FileInputStream(file);

            // DataInputStream类是FileInputStream的子类，它是FileInputStream类的扩展
            // 构造DataInputStream，二进制读写文件
            DataInputStream dataInputStream = new DataInputStream(fileInputStream);

            try {
                // 循环读取，每次都会从fileBytesArray[0]开始覆盖
                while ((read_num = dataInputStream.read(fileBytesArray, 0, sizeOfEachRead)) != -1) {
                    // 如果是奇数个字节的情况，需要将fileBytesArray[read_num]置为0
                    if (read_num % 2 != 0) {
                        fileBytesArray[read_num] = 0;
                    }
                    // 每两个byte转一个short
                    for (int i = 0; i < read_num; i = i + 2) {
                        b1 = fileBytesArray[i + 1];
                        b2 = fileBytesArray[i];
                        tempShort = getShort(b1, b2);
                        shortArrList.add(tempShort);
                    }
                }

            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            return null;
        }

        return shortArrList;
    }

    /**
     * 将byte数组中的两个byte转到short
     *
     * @param b1Para 第index+1位转换
     * @param b2Para 第index位转换
     * @return short  返回转换后的short值
     */
    private static short getShort(byte b1Para, byte b2Para) {
        byte b1 = b1Para;
        byte b2 = b2Para;
        return (short) (((b1 << 8) | b2 & 0xff));
    }

    /**
     * 保存文件
     *
     * @param multipartFilePara 文件
     * @param fileNamePara      文件名
     * @return 返回存储的结果
     */
    public static Boolean saveFile(MultipartFile multipartFilePara, String fileNamePara) {
        MultipartFile multipartFile = multipartFilePara;
        String fileName = fileNamePara;
        // 存储文件
        if (!multipartFile.isEmpty()) {
            try {

                BufferedOutputStream out = new BufferedOutputStream(
                        new FileOutputStream(new File(fileDirectoryPath + fileName)));//保存图片到目录下

                try {
                    out.write(multipartFile.getBytes());
                    out.flush();
                    out.close();
                } catch (IOException e) {
                    e.printStackTrace();
                    return false;
                }
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                return false;
            }

            return true;

        } else {
            return false;
        }
    }

}
