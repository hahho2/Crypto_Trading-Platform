# Trading Application

A secure Spring Boot-based trading application with JWT authentication and two-factor authentication (2FA) support.

## Features

- **User Authentication**: Secure login with JWT tokens
- **Two-Factor Authentication**: OTP-based 2FA for enhanced security
- **Role-Based Access Control**: Different user roles (ADMIN, USER, etc.)
- **User Management**: Complete user profile and account management

## Project Structure

```
src/
├── main/
│   ├── java/com/jing/
│   │   ├── TradingApplication.java          # Main application entry point
│   │   ├── config/                          # Configuration classes
│   │   │   ├── AppConfig.java
│   │   │   ├── JwtConstant.java
│   │   │   ├── JwtProvider.java
│   │   │   └── JwtTokenValidator.java
│   │   ├── controller/                      # REST API endpoints
│   │   │   ├── AuthController.java
│   │   │   └── HomeController.java
│   │   ├── domain/                          # Enums and constants
│   │   │   ├── USER_ROLE.java
│   │   │   └── VerificationType.java
│   │   ├── model/                           # Entity models
│   │   │   ├── User.java
│   │   │   ├── TwoFactorAuth.java
│   │   │   └── TwoFactorOTP.java
│   │   ├── reponse/                         # Response DTOs
│   │   │   └── AuthResponse.java
│   │   ├── repository/                      # Database repositories
│   │   │   ├── UserRepository.java
│   │   │   └── TwoFactorOtpRepository.java
│   │   └── service/                         # Business logic
│   │       ├── CustomUserDetailsService.java
│   │       ├── TwoFactorOtpService.java
│   │       └── TwoFactorOtpServiceImpl.java
│   └── resources/
│       └── application.properties            # Application configuration
└── test/                                     # Unit tests
```

## Prerequisites

- Java 8 or higher
- Maven 3.6+
- MySQL or any relational database
- Spring Boot 2.x

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading
   ```

2. **Configure the database**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/trading_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Build the project**
   ```bash
   mvn clean install
   ```

## Running the Application

Using Maven:
```bash
mvn spring-boot:run
```

Or using the executable JAR:
```bash
java -jar target/trading-application.jar
```

The application will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### User
- `GET /home` - Home endpoint

## Security Features

### JWT Authentication
- Token-based stateless authentication
- Configurable token expiration
- Secure token validation

### Two-Factor Authentication
- OTP generation and validation
- Multiple verification types support
- Enhanced account security

## Configuration

Key configuration classes:
- **JwtProvider**: Generates and manages JWT tokens
- **JwtTokenValidator**: Validates incoming JWT tokens
- **CustomUserDetailsService**: Custom user details implementation
- **TwoFactorOtpService**: Handles 2FA OTP operations

## Technologies Used

- **Framework**: Spring Boot
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: JPA/Hibernate
- **Build Tool**: Maven
- **Java Version**: 8+

## Testing

Run tests using Maven:
```bash
mvn test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the repository.

---

**Last Updated**: December 13, 2025
