package com.jing.service;

import com.jing.domain.VerificationType;
import com.jing.model.User;

public interface UserService {

    public User findUserProfileByJwt(String jwt) throws Exception;
    public User findUserProfileByEmail(String email) throws Exception;
    public User findUserProfileById(Long id) throws Exception;

    public User enableTwofactorAuthentication(VerificationType verificationType,
                                              String sendTo, User user);

    User updatePassword(User user, String newPassword);

    


}
