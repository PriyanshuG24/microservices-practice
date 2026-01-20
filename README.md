# Social Media Platform - Microservices Architecture

A scalable and distributed social media platform built with microservices architecture. This project demonstrates a modern approach to building scalable web applications using Node.js, Express, and various supporting technologies.

## 🚀 Features

### Core Services

1. **API Gateway**
   - Single entry point for all client requests
   - Request routing and load balancing
   - Authentication and authorization
   - Rate limiting and request validation

2. **Identity Service**
   - User registration and authentication
   - JWT-based authentication
   - User profile management
   - Role-based access control

3. **Post Service**
   - Create, read, update, and delete posts
   - Timeline generation
   - Post interactions (likes, comments)

4. **Media Service**
   - File upload and storage
   - Image processing and optimization
   - Media content delivery

5. **Search Service**
   - Full-text search capabilities
   - Hashtag and mention search
   - User and content discovery

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Redis** - Caching and rate limiting
- **JWT** - JSON Web Tokens for authentication
- **RabbitMQ** - Message broker for inter-service communication
- **Docker** - Containerization
- **Docker Compose** - Multi-container application management

### Development & Operations
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development server with hot-reload

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/social-media-microservices.git
   cd social-media-microservices
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in each service directory
   - Update the environment variables as needed

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the API at `http://localhost:3000`

## 📦 Project Structure

```
social-media-microservices/
├── api-gateway/          # API Gateway service
├── identity-service/     # User authentication and management
├── post-service/         # Post management
├── media-service/        # Media handling
├── search-service/       # Search functionality
└── docker-compose.yml    # Docker Compose configuration
```

## 🔒 Authentication

All protected routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## 📈 Performance

- **Caching**: Redis is used for caching frequently accessed data
- **Load Balancing**: Built-in load balancing in the API Gateway
- **Rate Limiting**: Protects against abuse and DDoS attacks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Your Name - [@Priyanshu Gautam](https://www.linkedin.com/in/priyanshu-gautam-32a419232)

Project Link: [https://github.com/PriyanshuG24/microservices-practice](https://github.com/PriyanshuG24/microservices-practice)
