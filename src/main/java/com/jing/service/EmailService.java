package com.jing.service;


import jakarta.mail.MessagingException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;
public class EmailService {

    private JavaMailSender javaMailSender;

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

            mimeMessageHelper.setText(text);
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

        throw new UnsupportedOperationException("Unimplemented method 'sendVerificationOtpEmail'");
    }


    
}
