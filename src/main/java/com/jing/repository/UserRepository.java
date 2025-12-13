package com.jing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.jing.model.User;
//mange our database from here
public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

}
