# 🩸 RakhtSaathi - Emergency Blood Donation Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9.9.0-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A life-saving web application that bridges the gap between blood donors and patients during emergencies across India. RakhtSaathi leverages real-time technology to enable instant blood request matching, streamlined communication, and efficient donation coordination.

> **Mission**: To eliminate blood shortage delays by building a community-driven platform that connects donors with those in need within minutes, not hours.

## ✨ Key Features

### For Donors 🩸
- **Smart Matching Algorithm** - Get notified only for compatible blood requests near you
- **Health Verification** - Pre-donation health checklist ensures donor safety
- **Donation Tracking** - Complete history of your life-saving contributions
- **Recognition System** - Earn certificates and badges for your donations
- **Flexible Availability** - Set your status and donation preferences

### For Patients & Attendants 🆘
- **Urgent Request Creation** - Post blood requirements with urgency levels
- **Real-time Status Updates** - Track your request from posting to fulfillment
- **Direct Communication** - Connect instantly with available donors
- **Feedback System** - Rate and thank donors after successful donations
- **Request Management** - View and manage all your blood requests

### For Administrators ⚙️
- **Comprehensive Dashboard** - Real-time analytics and system insights
- **User Management** - Oversee donor and patient profiles
- **Request Monitoring** - Track all blood requests across the platform
- **Quality Control** - Review feedback and handle alerts
- **Certificate Management** - Issue and verify donor certificates

### Platform Capabilities 🚀
- **🌐 Bilingual Interface** - Complete Hindi and English support
- **📍 Location Intelligence** - City-based matching with distance calculation
- **🔐 Secure Authentication** - Firebase-powered security with role-based access
- **📱 Responsive Design** - Seamless experience across desktop and mobile
- **🔧 Developer-Friendly** - Mock mode for testing without Firebase setup

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.3.0
- **State Management**: Context API
- **Styling**: Custom CSS with responsive design
- **HTTP Client**: Axios 0.27.2

### Backend & Services
- **Authentication**: Firebase Auth 9.9.0
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Real-time Communication**: STOMP.js & SockJS

### Internationalization
- **i18next**: 25.7.3
- **React-i18next**: 16.5.1
- **Languages**: English, Hindi (हिंदी)

### Development & Testing
- **Testing Library**: React Testing Library
- **Build Tool**: React Scripts 5.0.1
- **Mock Mode**: Built-in testing environment

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for production deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/utkarsh1303803/RakhtSaathi-BloodDonation.git
cd RakhtSaathi-BloodDonation
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Firebase configuration
# REACT_APP_FIREBASE_API_KEY=your_api_key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. **Start the development server**
```bash
npm start
```

5. **Open your browser**
```
http://localhost:3000
```

### Quick Test (Without Firebase)
Use the mock authentication mode to explore the platform:
```
http://localhost:3000/auth-mode
```

## 🔧 Development & Testing

### Mock Mode (No Firebase Required)
For testing without Firebase setup:

1. **Auth Test Page**: `http://localhost:3000/auth-test`
   - Quick mock authentication testing
   - View current auth state

2. **Auth Mode Page**: `http://localhost:3000/auth-mode`
   - Full mock authentication interface
   - Login as Admin/Donor/Needy

3. **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
   - View with sample data in mock mode

### Firebase Mode
For production with Firebase:

1. **Firebase Test**: `http://localhost:3000/firebase-test`
   - Test Firebase connectivity
   - Diagnose connection issues

2. **Admin Setup**: `http://localhost:3000/create-admin`
   - Create admin accounts
   - Populate test data

## 🎯 User Roles

### 👥 Donors
- Register and manage profile
- Set availability status
- Respond to blood requests
- View donation history
- Earn certificates

### 🆘 Needy (Patients/Attendants)
- Create emergency blood requests
- Track request status
- Communicate with donors
- Provide feedback
- View request history

### ⚙️ Admins
- Monitor platform activity
- Manage users and requests
- View analytics dashboard
- Handle feedback and alerts
- Oversee system health

## 📱 Key Pages & Features

### Public Pages
- **Landing Page** - Platform introduction and navigation
- **Firebase Test** - Connection diagnostics
- **Auth Mode** - Mock authentication for testing

### Donor Portal
- **Registration & Login** - Secure donor onboarding
- **Dashboard** - Personal stats and nearby requests
- **Request Details** - View and respond to blood requests
- **Health Checklist** - Pre-donation health verification
- **Proof Upload** - Upload donation certificates
- **History** - Track donation records

### Needy Portal
- **Registration & Login** - Patient/attendant access
- **Request Creation** - Submit blood requirements
- **Status Tracking** - Monitor request progress
- **Feedback** - Rate donor experience
- **History** - View past requests

### Admin Portal
- **Dashboard** - System analytics and KPIs
- **Requests Management** - Monitor all blood requests
- **Donor Management** - Oversee donor network
- **Feedback & Alerts** - Handle user feedback
- **Certificates** - Manage donor recognition

## 🌐 Internationalization

Full support for:
- **English** - Primary language
- **Hindi** - हिंदी भाषा समर्थन
- Easy to extend for additional Indian languages

## 🔒 Security Features

- **Firebase Authentication** - Secure user management
- **Role-based Access Control** - Admin/Donor/Needy permissions
- **Data Validation** - Input sanitization and validation
- **Security Rules** - Firestore and Storage security
- **Session Management** - Secure authentication state

## 📊 Firebase Collections

- **users** - User profiles and authentication data
- **donors** - Donor-specific information and availability
- **needy** - Patient/attendant profiles
- **bloodRequests** - Blood request details and matching
- **feedback** - User ratings and comments
- **certificates** - Donor achievement records

## 🚀 Deployment

### Firebase Hosting
```bash
# Build for production
npm run build

# Deploy to Firebase
npm run deploy
# or
firebase deploy
```

### Environment Configuration
Required environment variables in `.env`:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🌟 Impact & Vision

### The Problem
India faces a critical blood shortage with:
- 12 million units needed annually vs 9 million units collected
- Average 30-60 minute delay in finding donors during emergencies
- Language and accessibility barriers in existing systems
- Lack of organized donor networks in tier-2 and tier-3 cities

### Our Solution
RakhtSaathi addresses these challenges through:
- **⚡ Speed**: Instant matching reduces search time from hours to minutes
- **🌐 Accessibility**: Bilingual interface reaches diverse Indian demographics
- **🤝 Community**: Building trusted networks of verified donors
- **📊 Transparency**: Real-time tracking and feedback mechanisms
- **🔒 Safety**: Health verification and quality control systems

### Vision
To create India's largest community-driven blood donation network, ensuring no patient loses their life due to blood unavailability.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/RakhtSaathi.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and commit: `git commit -m 'Add amazing feature'`
5. **Push** to your fork: `git push origin feature/amazing-feature`
6. **Open** a Pull Request with a clear description

### Contribution Ideas
- 🌐 Add support for more Indian languages
- 📱 Improve mobile responsiveness
- 🎨 Enhance UI/UX design
- 🐛 Fix bugs and improve performance
- 📝 Improve documentation
- ✅ Write tests for components
- 🔧 Add new features

### Code Guidelines
- Follow existing code structure and naming conventions
- Write clean, commented code
- Test your changes thoroughly
- Update documentation as needed

### Reporting Issues
Found a bug or have a suggestion? [Open an issue](https://github.com/utkarsh1303803/RakhtSaathi-BloodDonation/issues) with:
- Clear description of the problem or suggestion
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📞 Support

Need help or have questions?

- 📧 Email: support@rakhtsaathi.com
- 🐛 Issues: [GitHub Issues](https://github.com/utkarsh1303803/RakhtSaathi-BloodDonation/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/utkarsh1303803/RakhtSaathi-BloodDonation/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Healthcare Workers**: For their tireless efforts in saving lives
- **Blood Donors**: The real heroes who make this platform meaningful
- **Contributors**: Everyone who has contributed to making RakhtSaathi better
- **Firebase**: For providing reliable backend infrastructure
- **React Community**: For excellent tools and documentation

## 🌟 Show Your Support

If RakhtSaathi has helped you or someone you know, please:
- ⭐ Star this repository
- 🔄 Share with your network
- 🩸 Donate blood and save lives
- 🤝 Contribute to the project

---

<div align="center">

**Made with ❤️ for saving lives across India**

**Every star ⭐ motivates us to save more lives!**

[Report Bug](https://github.com/utkarsh1303803/RakhtSaathi-BloodDonation/issues) • [Request Feature](https://github.com/utkarsh1303803/RakhtSaathi-BloodDonation/issues) • [Contribute](CONTRIBUTING.md)

</div>