# Police Data System - Name Matching Enhancement

A full-stack web application designed to enhance name matching accuracy in police databases, specifically addressing challenges with Hindi names transliterated to English.

## 🚀 Features

- **Advanced Name Matching**: Fuzzy + phonetic algorithms for intelligent name searching
- **Multi-language Support**: Handles Hindi names transliterated to English
- **Name Standardization**: Consistent transliteration rules and auto-correction
- **User Management**: Role-based access control (Admin/Officer)
- **Real-time Search**: Instant results with confidence scoring
- **Admin Dashboard**: System statistics and debugging tools
- **No Database Required**: File-based storage using JSON

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - No frameworks required
- **Responsive Design** - Works on desktop and mobile

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **string-similarity** - Advanced matching algorithms

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/that-guy18/police-data-system.git
cd police-name-matching
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Initialize Demo Data**
```bash
node setup.js
```

4. **Start the Server**
```bash
npm start
```

5. **Access Application**
Open http://localhost:5000 in your browser

### Default Login Credentials
- **Admin**: `admin` / `admin123`
- **Officer 1**: `officer1` / `officer123`
- **Officer 2**: `officer2` / `officer123`

## 🎯 How It Works

### Problem Statement
Police databases often struggle with name variations:
- `Suresh Kumar` vs `Sureesh Kumar` vs `Sursh Kumar`
- Spelling inconsistencies in transliterated Hindi names
- Phonetic variations causing missed matches

### Solution
1. **Fuzzy Matching**: Finds names that look similar despite spelling variations
2. **Phonetic Matching**: Matches names based on pronunciation
3. **Name Standardization**: Applies consistent transliteration rules
4. **Confidence Scoring**: Ranks matches by similarity percentage

### Example Use Cases
```javascript
// Search for "Suresh" finds:
- "Suresh Kumar" (95% match)
- "Sureesh Kumar" (88% match) 
- "Sursh Kumar" (82% match)
- "Suresh Kumar Yadav" (65% match)
```

## 📁 Project Structure

```
police-name-matching/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Dependencies
│   ├── data/              # JSON file storage
│   │   ├── users.json     # User accounts
│   │   └── records.json   # Name records
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication
│   │   ├── names.js       # Name operations
│   │   └── admin.js       # Admin functions
│   ├── utils/             # Utilities
│   │   ├── nameMatching.js # Core algorithms
│   │   └── dataManager.js # File operations
│   └── middleware/        # Auth middleware
├── frontend/
│   ├── index.html         # Main page
│   ├── styles.css         # All styles
│   ├── script.js          # Frontend logic
│   └── package.json       # Frontend dependencies
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Name Operations
- `POST /api/names/search` - Search names with algorithms
- `POST /api/names` - Add new record
- `POST /api/names/standardize` - Standardize a name

### Admin Operations
- `GET /api/admin/stats` - System statistics
- `POST /api/admin/test-matching` - Test algorithms

## 🎨 Features Overview

### 🔍 Smart Search
- **Combined Algorithm**: Fuzzy + phonetic matching
- **Adjustable Threshold**: Set match sensitivity
- **Real-time Results**: Instant search with loading states

### 👮 User Management
- **Role-based Access**: Admin and Officer roles
- **Department Tracking**: Record organization
- **Audit Trail**: Track who added records

### ⚙️ Admin Tools
- **System Statistics**: Records by type and department
- **Algorithm Testing**: Compare name matching
- **Debug Tools**: Development and testing utilities

### 📱 Responsive Design
- **Mobile-friendly**: Works on all devices
- **Modern UI**: Clean, professional interface
- **Accessible**: Proper semantic HTML

## 🚀 Deployment

### Development
```bash
cd backend
npm run dev  # With nodemon for auto-restart
```

### Production
```bash
cd backend
npm start    # Standard node execution
```

The application runs on port 5000 by default. Change the port in `backend/.env` if needed.

## 🔍 Usage Examples

### 1. Basic Search
1. Login as officer
2. Enter name in search box
3. Select algorithm (Combined recommended)
4. View ranked results with confidence scores

### 2. Add New Record
1. Fill in name, type, case number, department
2. System automatically standardizes the name
3. Record becomes searchable immediately

### 3. Admin Functions
1. View system statistics
2. Test matching algorithms
3. Standardize names in bulk

## 🐛 Troubleshooting

### Common Issues

1. **Login fails**
   - Check if backend is running on port 5000
   - Verify demo data was created with `node setup.js`
   - Use correct credentials: admin/admin123

2. **Search not working**
   - Check browser console for errors
   - Verify records exist in the database
   - Try different algorithms and thresholds

3. **Results not displaying**
   - Ensure JavaScript is enabled
   - Check network tab for API errors
   - Use debug tools in admin section

### Debug Tools
The application includes built-in debug tools in the Admin section:
- Test single name matching
- View all records in database
- Run automated search tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Indian police departments for the problem context
- Open-source libraries: Express.js, string-similarity
- Contributors and testers

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the debug tools in the application
- Review the browser console for error details

---

**Note**: This is a demonstration system for showing name matching capabilities. For production use, consider adding a proper database and enhanced security measures.
