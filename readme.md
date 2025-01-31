# User Management Application

## Overview

The User Management Application is a MERN (MongoDB, Express.js, React, Node.js)-based web application designed to efficiently manage user information. It offers features such as user registration, authentication, role-based access control, and comprehensive CRUD (Create, Read, Update, Delete) operations and analytics demonstrated in graphs.

## Features

- **User Registration and Authentication**: Secure user sign-up and login functionalities.
- **CSV file uploading**: user can upload a csv file which will be stored in Database and displayed in UI.
- **Role-Based Access Control**: Different permissions and views for admins and regular users.
- **User Profile Management**: Users can view and update their personal information.
- **Admin Dashboard**: Admins can manage user accounts, including activation, Addition, and deletion.
- **Responsive Design**: Optimized for various devices using Tailwind CSS.

## Technologies Used

- **Frontend**: React.js
- **Backend**:  Node.js, Express.js
- **Database**:  MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS

## Project Structure
```bash
user-management-app/
├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── App.js
│   │   ├── index.js
│   ├── package.json
├── server/                 
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
├── README.md
```


## Installation and Setup

To run this application locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sam122001/user-management-app.git
   cd user-management-app
   ```
2. **Install Dependencies**:
    **For backend**
    ```bash
    cd server
    npm install
    ```
    **For frontend**
    ```bash
    cd server..
    npm install
    ```
3. **Start the Application**:

    **For backend**
    ```bash
    cd server
    npm run dev
    ```
    **For frontend**
    ```bash
    cd server..
    npm run dev
    ```

    

