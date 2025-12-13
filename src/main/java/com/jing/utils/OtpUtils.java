package com.jing.utils;

import java.util.Random;


//It will generate 6 digit otp
public class OtpUtils {

    public static String generateOTP(){
        int otpLength=6;
        //Random instance
        Random random = new Random();

        //StringBuilder to hold otp
        StringBuilder otp = new StringBuilder(otpLength);


        //Generating random digits and appending to otp
        for(int i=0; i<otpLength;i++){
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}
