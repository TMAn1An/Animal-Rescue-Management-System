# Animal Rescue Management System

A comprehensive web application for managing animal rescue operations, built with PHP, MySQL, HTML, CSS, and JavaScript.

## 🐾 Features

- **User Management**: Register and manage users who need rescue services
- **Rescuer Management**: Register and manage volunteer rescuers
- **Rescue Requests**: Create, track, and manage animal rescue requests
- **Assignment System**: Assign rescuers to rescue requests with business logic
- **Print System**: Generate printable slips for users and receipts for rescuers
- **Search Functionality**: Find users by phone number
- **Reports & Analytics**: View system statistics and reports
- **Image Upload**: Upload and manage pet photos with validation
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Backend**: PHP 7.4+ with PDO
- **Database**: MySQL 5.7+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Web Server**: Apache (via XAMPP)
- **Image Handling**: PHP file upload with validation

## 📋 Requirements

- XAMPP (Apache + MySQL + PHP)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation & Setup

### Step 1: Install XAMPP
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start Apache and MySQL services from XAMPP Control Panel

### Step 2: Setup Database
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Import the database schema:
   - Click "Import" tab
   - Choose file: `database/schema.sql`
   - Click "Go" to execute

Alternatively, you can run the SQL commands manually:
```sql
-- Copy and paste the content from database/schema.sql
```

### Step 3: Configure Database Connection
Edit `includes/config.php` if needed to match your MySQL settings:
```php
private $host = 'localhost';
private $db_name = 'animal_rescue_db';
private $username = 'root';
private $password = '';
```

### Step 4: Set Permissions
Ensure the web server can write to the uploads directory:
- Create `uploads/` directory if it doesn't exist
- Set appropriate permissions (755 or 777 for development)

### Step 5: Access the Application
Open your web browser and navigate to:
```
http://localhost/ANA
```

## 📁 Project Structure

```
ANA/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── script.js          # JavaScript functionality
├── includes/
│   ├── config.php         # Database configuration
│   ├── header.php         # Common header template
│   └── footer.php         # Common footer template
├── api/
│   ├── register-user.php  # User registration endpoint
│   ├── register-rescuer.php # Rescuer registration endpoint
│   ├── create-rescue-request.php # Create rescue request
│   ├── search-user.php    # User search endpoint
│   ├── assign-rescuer.php # Rescuer assignment
│   └── ...               # Other API endpoints
├── database/
│   └── schema.sql         # Database schema with sample data
├── uploads/              # Image upload directory
├── index.php             # Homepage
├── register-user.php     # User registration page
├── register-rescuer.php  # Rescuer registration page
├── new-rescue-request.php # Create rescue request page
├── pet-history.php       # Rescue history page
├── users.php             # User management page
├── rescuers.php          # Rescuer management page
├── search.php            # User search page
├── reports.php           # Reports and analytics
├── view-request.php      # Request details page
├── print-slip.php        # User slip printing
├── print-receipt.php     # Rescuer receipt printing
└── README.md             # This file
```

## 🎯 Key Features Explained

### User Code Generation
- Automatic generation of unique user codes (PT_USER00001, PT_USER00002, etc.)
- Zero-padded 5-digit sequential numbering
- Required for creating rescue requests

### Assignment Logic
- Rescuers can only be assigned to the user's LATEST pending request
- Once assigned and approved, requests cannot be reassigned
- Maintains request history for tracking

### Image Upload
- Supports JPG, PNG, GIF formats
- Maximum file size: 5MB
- Server-side validation and error handling
- Automatic file cleanup on errors

### Print System
- User slips: Contains user info, rescuer details, and pet information
- Rescuer receipts: Detailed assignment information with priority levels
- Print-optimized CSS styles

## 🔧 Business Rules

1. **User Registration**: Only name and phone required
2. **Unique Phone Numbers**: Each user must have a unique phone number
3. **User Code Format**: PT_USER + 5-digit number (PT_USER00001)
4. **Latest Request Assignment**: System assigns rescuers to user's most recent pending request
5. **Single Assignment**: Once assigned and approved, requests cannot be reassigned
6. **Pet Conditions**: Exactly three options (Normal, Moderate, Serious)
7. **Request Status Flow**: Pending → Assigned → Approved → Completed

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with breakpoints
- **Sticky Navigation**: Fixed header with smooth navigation
- **Modern Cards**: Clean card-based layout with shadows
- **Status Badges**: Color-coded status indicators
- **Loading States**: Visual feedback during form submissions
- **Modal Dialogs**: Interactive assignment and confirmation modals
- **Print Styles**: Optimized layouts for printing

## 🔒 Security Features

- **SQL Injection Prevention**: Prepared statements for all database queries
- **Input Sanitization**: Server-side validation and sanitization
- **File Upload Security**: Type and size validation for images
- **Session Management**: PHP sessions for state management

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check XAMPP MySQL service is running
   - Verify database credentials in `config.php`
   - Ensure database `animal_rescue_db` exists

2. **Image Upload Issues**
   - Check `uploads/` directory exists and is writable
   - Verify PHP file upload settings in `php.ini`
   - Ensure file size is under 5MB

3. **Navigation Issues**
   - Clear browser cache
   - Check Apache rewrite rules
   - Verify file paths are correct

### Debug Mode
Enable debug mode by setting in `config.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📞 Support Information

**Developer**: Anamika Sarker Keya  
**ID**: 23203128

## 🎉 Sample Data

The system includes sample data:
- 3 sample users with user codes
- 2 sample rescuers
- 4 sample rescue requests in various states

## 🔄 Future Enhancements

- Email notifications for assignments
- SMS integration for urgent requests
- Advanced filtering and search
- Export to CSV/PDF reports
- Multi-language support
- Mobile app companion

---

**Note**: This system is designed for educational purposes and local deployment. For production use, additional security measures should be implemented.
