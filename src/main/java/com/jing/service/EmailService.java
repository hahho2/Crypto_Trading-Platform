package com.jing.service;


import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;
    @Value("${spring.mail.username}")
    private String mailFrom;

    //method for send verification otp email
    public void sendOtpEmail(String email,
         String otp
        ) throws MessagingException {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper=new MimeMessageHelper(mimeMessage,"utf-8");

            //Email subject and text
            String subject="Your Verification OTP";
            String text="Your OTP for verification is: "+otp;


            //Setting email details
            mimeMessageHelper.setSubject(subject);
            mimeMessageHelper.setFrom(mailFrom);
            mimeMessageHelper.setText(text, false);
            mimeMessageHelper.setTo(email);

            //Exception handling for mail sending

            try{
                javaMailSender.send(mimeMessage);
            }
            catch(MailException e){
                throw new MailSendException(e.getMessage());
            }


        //Implementation for sending email
    }

    public void sendVerificationOtpEmail(String username, String otp) {
        try {
            sendOtpEmail(username, otp);
            System.out.println("===========================================");
            System.out.println("OTP EMAIL SENT to " + username + ": " + otp);
            System.out.println("===========================================");
        } catch (Exception e) {
            // Fallback to console logging if email fails
            System.out.println("===========================================");
            System.out.println("EMAIL FAILED - OTP for " + username + ": " + otp);
            System.out.println("Error: " + e.getMessage());
            System.out.println("===========================================");
        }
    }


    
}
