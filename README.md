# ChowHub - Restaurant Management System

## 📋 Table of Contents

- [Installation Instructions](#-installation-instructions)
- [Test Account Access](#-test-account-access)
- [Deviations from PRJ566](#-deviations-from-prj566)
- [System Features & Functionalities](#-system-features--functionalities)
- [Technology Stack](#-technology-stack)
- [Contact](#-contact)

## 🚀 Installation Instructions

**ChowHub is a web-based application that requires no local installation.**

### Public Access

Simply visit: **https://chowhub.vercel.app/**

The application is fully deployed and accessible through any modern web browser. No downloads, installations, or local setup required.

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled

## 🔐 Test Account Access

### Pre-configured Test Restaurant

- **Test Restaurant Account:**
  - **Username:** `test`
  - **Password:** `Test1234#`
  - **Role:** Manager (Full access to all features)

### Additional Test Staff Accounts

- **Staff Account 1:**
  - **Username:** `test1`
  - **Password:** `Test1234#`
  - **Role:** Staff (Limited access to ordering and basic functions)

### Creating Your Own Restaurant

1. Visit the registration page
2. Fill out restaurant and manager details
3. Check email for activation link
4. Set password and begin using the system

## 📝 Deviations from PRJ566

### Removed Features

- **Employee Scheduling System**: Originally planned for managers to create and manage staff schedules. This feature was removed due to team member departure and resource constraints.

### Added Features (Not in Original PRJ566)

- **AI-Powered Business Intelligence**: Comprehensive AI analysis using OpenRouter (Claude) that provides:
  - Automated business insights and recommendations
  - Performance analysis across all operational areas
  - Strategic recommendations for menu optimization, staffing, and inventory management
  - Predictive analytics for business growth

## 🎯 System Features & Functionalities

### 👥 User Management & Authentication

- **Multi-role Access Control**: Managers and Staff with different permission levels
- **Secure Authentication**: JWT-based authentication with password encryption
- **User Activation System**: Email-based account activation for new users
- **Password Reset**: Secure password reset functionality
- **Profile Management**: User profile updates and emergency contact information

### 🏪 Restaurant Management

- **Multi-location Support**: Support for restaurant chains and multiple locations
- **Restaurant Configuration**: Customizable tax rates, location settings, and branding
- **Owner/Manager Hierarchy**: Clear organizational structure with owner and manager roles

### 📋 Advanced Menu Management

- **Dynamic Menu Creation**: Create menu items with multiple variations and pricing
- **Category Organization**: Organize menu items by categories for better navigation
- **Image Management**: Upload and manage menu item images via Cloudinary integration
- **Inventory Integration**: Link menu items to ingredient inventory for automatic tracking
- **Availability Control**: Real-time menu item availability based on ingredient stock
- **Cost Analysis**: Track ingredient costs and calculate profit margins per item

### 📦 Comprehensive Inventory Management

- **Real-time Stock Tracking**: Monitor ingredient quantities with automatic updates
- **Smart Alert System**: Customizable threshold-based low stock notifications
- **Supplier Management**: Maintain supplier information with ingredient associations
- **Inventory Logging**: Complete audit trail of all inventory changes
- **Image Support**: Visual ingredient identification with image uploads
- **Unit Management**: Flexible unit types for different ingredient measurements
- **Automatic Deduction**: Inventory automatically updated when orders are placed

### 🛒 Point-of-Sale & Order Management

- **Intuitive Order Creation**: Easy-to-use interface for taking customer orders
- **Order Status Tracking**: Complete lifecycle management (pending → fulfilled/cancelled)
- **Order History**: Comprehensive order history with search and filtering
- **Completion Time Tracking**: Monitor order preparation and completion times
- **Staff Attribution**: Track which staff member processed each order
- **Order Modification**: Edit orders before completion
- **Receipt Generation**: Digital order summaries and receipts

### 📊 Advanced Analytics & Reporting

- **Sales Analytics**:

  - Daily, weekly, monthly sales reports
  - Staff performance comparison and rankings
  - Average order value analysis
  - Sales trends and forecasting

- **Operational Analytics**:

  - Peak hours analysis with staffing recommendations
  - Order completion time metrics
  - Kitchen efficiency scoring
  - Service time optimization insights

- **Menu Performance**:

  - Best and worst-selling items analysis
  - Profitability analysis by menu item
  - Food cost percentage tracking
  - Menu optimization recommendations

- **Inventory Analytics**:

  - Stock level trends and patterns
  - Threshold breach tracking
  - Supplier performance metrics
  - Waste reduction insights

- **Dashboard Overview**:
  - Real-time business KPIs
  - Interactive charts and visualizations
  - Mobile-responsive analytics interface
  - Exportable reports and data

### 🤖 AI-Powered Business Intelligence

- **Comprehensive Business Analysis**: AI analyzes all operational data to provide insights
- **Automated Recommendations**:
  - Staff scheduling and performance optimization
  - Menu pricing and item recommendations
  - Inventory management strategies
  - Operational efficiency improvements
- **Strategic Planning**: Long-term business growth recommendations
- **Performance Benchmarking**: Compare performance against industry standards
- **Predictive Analytics**: Forecast trends and potential issues

### 🔔 Smart Notification System

- **Real-time Alerts**: Instant notifications for critical events
- **Low Stock Warnings**: Automatic alerts when inventory falls below thresholds
- **Out-of-stock Notifications**: Immediate alerts when items become unavailable
- **User Activation Alerts**: Notifications when new staff members join
- **Customizable Alert Preferences**: Control notification frequency and types
- **Supplier Contact Integration**: Notifications include relevant supplier information

### 📱 User Experience Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme Interface**: Modern, easy-on-the-eyes design
- **Interactive Charts**: Dynamic data visualization with Chart.js
- **Search & Filtering**: Advanced search capabilities across all modules
- **Bulk Operations**: Efficient bulk editing and management tools
- **Keyboard Shortcuts**: Power-user features for increased efficiency

### 🔒 Security & Compliance

- **Data Encryption**: Secure password hashing and data protection
- **Role-based Access**: Granular permissions based on user roles
- **Audit Trails**: Complete logging of all system actions
- **Secure File Upload**: Protected image and document uploads
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: Protection against abuse and spam
- **Input Validation**: Comprehensive data validation and sanitization

### 🌐 Integration Capabilities

- **Email Integration**: Automated email notifications and communications
- **Cloud Storage**: Cloudinary integration for image management
- **External APIs**: OpenRouter AI integration for business intelligence
- **Database Optimization**: Efficient MongoDB aggregation pipelines
- **Scalable Architecture**: Built for growth and high-traffic scenarios

### 📈 Business Intelligence Features

- **Performance Metrics**: Track KPIs across all business areas
- **Trend Analysis**: Identify patterns in sales, inventory, and operations
- **Comparative Analytics**: Compare performance across time periods
- **Efficiency Scoring**: Quantified performance measurements
- **Growth Tracking**: Monitor business expansion and success metrics
- **Custom Reporting**: Generate tailored reports for specific needs

## 🛠 Technology Stack

### Frontend

- **Next.js 13+**: React-based framework with app router
- **React 18**: Modern React features and hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Interactive data visualizations
- **React Bootstrap**: UI component library
- **Jotai**: State management solution

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Token authentication
- **Cloudinary**: Cloud-based image management
- **Nodemailer**: Email service integration
- **Pino**: High-performance logging

### AI & External Services

- **OpenRouter AI**: Claude AI integration for business insights
- **Vercel**: Deployment and hosting platform
- **MongoDB Atlas**: Cloud database hosting

### Security & Performance

- **Helmet.js**: Security middleware
- **CORS**: Cross-origin resource sharing
- **bcryptjs**: Password hashing
- **Express Rate Limit**: API rate limiting
- **Compression**: Response compression

## 📞 Contact

For support, questions, or feedback:

- **Project Repository**: https://github.com/most4f4/ChowHub-Restaurant-Management-System
- **Live Application**: https://chowhub.vercel.app/
- **Documentation**: https://github.com/most4f4/ChowHub-Restaurant-Management-System/tree/main/Documentation

---

**ChowHub** - Revolutionizing restaurant management through intelligent automation and comprehensive analytics.
