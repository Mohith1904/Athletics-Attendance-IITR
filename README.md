# Athletics Attendance System

## Overview
The **Athletics Attendance System** is a simple web-based application designed to manage attendance efficiently for athletics sessions. The project prioritizes core functionality over design and ensures a strict authentication and attendance marking process.

## Features
1. **Admin Privileges**:
   - Admins are manually set in the database and cannot be modified by others.
   - No user other than the project owner has write permissions to the admin collection.
   
2. **Attendance Management**:
   - Admins can start and stop attendance sessions.
   - If an admin starts attendance within **2 hours of a previous session**, the previous session will be reactivated instead of creating a new one.
   - Admins can view the **total number of attendees** for all sessions on a selected day from the frontend.
   
3. **User Attendance Restrictions**:
   - Users **cannot mark attendance twice** for the same session.
   - Geolocation **must be enabled** for both admins and users.
   - Users **must be within 100m** of the admin to mark their attendance.
   - Users can **view** their total number of attendances till then.
   - Only users with an **IITR email** can log in.

5. **Hosting & Simplicity**:
   - The project focuses solely on attendance tracking without additional UI/UX elements.
   - Hosted on **Firebase** at: [Athletics Attendance](https://athletics-attendance.web.app/)

## Future Enhancements
In future updates, we plan to:
- Improve the website's design and usability.
- Introduce a **leave application** feature where users can upload proof of other priority tasks.
- Expand attendance tracking to **other sports** beyond athletics.

---

## Setup Guide
To use this project on your own, follow these steps:

### **1. Install Node.js**
Ensure that **Node.js** is installed on your local system. You can download it from [Node.js official website](https://nodejs.org/).

### **2. Clone the Repository**
```sh
  git clone https://github.com/yourusername/yourrepository.git
  cd yourrepository
```

### **3. Install Dependencies**
```sh
  npm install
```

### **4. Set Up Firebase**
1. Create a **Firebase** project at [Firebase Console](https://console.firebase.google.com/).
2. Set up **Firestore Database** and configure authentication.
3. Copy the `firebaseConfig` details from your Firebase project and add them to your React project.
4. Set Firestore **security rules** to restrict access. The rules file is included in the repository, so you can use it directly.

### **5. Run the Application Locally**
```sh
  npm start
```

### **6. Build and Deploy (Optional)**
To deploy the project on Firebase Hosting:
```sh
  npm run build
  firebase deploy
```

## Firestore Rules Setup
To ensure data security and correct access control, **Firestore security rules** are provided in the repository. Use them to set up the database restrictions correctly.

## Contribution
This project is currently focused on athletics attendance. However, contributions are welcome for enhancing features, improving design, or adding new sports categories.

Feel free to fork the repository and submit pull requests!

## License
This project is open-source under the **MIT License**. Feel free to use, modify, and distribute it.

---

### 🔗 **Live Website**: [Athletics Attendance](https://athletics-attendance.web.app/)


