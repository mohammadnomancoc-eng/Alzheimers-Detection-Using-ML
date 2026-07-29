# 🧠 AlzheimerAI - Early Alzheimer's Detection System Using Deep Learning

**AlzheimerAI** is an end-to-end, medical-grade web application designed for early detection and stage classification of Alzheimer's disease using Convolutional Neural Networks (CNNs) and deep learning on brain MRI scans. 

The application features a modern, dark void glassmorphism interface built with React and Vite, paired with a robust Flask & PyTorch backend API for high-accuracy inference, Grad-CAM visualization, and PDF report generation.

---

## 🌟 Key Features

- **Automated MRI Brain Scan Analysis**: Analyzes uploaded brain MRI images in seconds and classifies them into diagnostic stages (*Normal / NonDemented*, *Very Mild Demented*, *Mild Demented*, *Moderate Demented*, *Severe Demented*).
- **Confidence Metrics & Clinical Recommendations**: Displays AI model confidence percentages, visual progress meters, and tailored medical recommendations.
- **Heatmap & PDF Report Generation**: Generates downloadable PDF diagnostic reports and visual heatmap overlays for medical review.
- **Secure Researcher Dashboard**: Dedicated dashboard allowing researchers and clinicians to query patient records, search by code/name, and filter by severity class.
- **Authentication**: Built-in login security with pre-filled credentials and password eye visibility toggling.
- **Responsive Dark Void Glassmorphism Design**: High-aesthetic, responsive UI with interactive tooltips and custom branding.

---

## 📁 Project Structure

```
AlzheimersPRoject/
├── backend/
│   ├── app.py                 # Main Flask server entry point (Port 5000)
│   ├── models.py              # SQLAlchemy database models (Patients & Results)
│   ├── config.py              # Backend configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── routes/                # API blueprints
│   │   ├── auth.py            # Authentication endpoints (/auth/login)
│   │   ├── predict.py         # AI MRI scan prediction & PDF generation
│   │   ├── patients.py        # Patient history endpoints (/patients)
│   │   └── health.py          # API health check endpoint
│   └── uploads/               # Saved MRI scans and generated PDFs
│
├── frontend/
│   ├── index.html             # Main HTML entry with custom favicon.jpg
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.js         # Vite build setup & dev server config
│   └── src/
│       ├── favicon.jpg        # App icon asset
│       ├── theme.css          # Central dark void theme tokens
│       ├── App.js             # Router & page layout container
│       ├── components/        # UI components (Header, Footer, Logo, etc.)
│       │   └── ui/            # Reusable UI primitives (modem-animated-footer)
│       ├── pages/             # Page views (Home, Login, Dashboard)
│       ├── services/          # Axios API service client (api.js)
│       └── context/           # AuthContext provider
│
└── README.md                  # Project documentation
```

---

## ⚙️ Prerequisites & System Requirements

Before running the project, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.9` to `v3.11`
- **Git**

---

## 🚀 How to Run the Project

### 1. Run the Backend (Flask API)

Open a terminal window and navigate to the `backend` directory:

```bash
cd backend
```

#### Step 1A: Create and Activate Virtual Environment

- **On Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\activate
  ```

- **On macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### Step 1B: Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Step 1C: Start Flask Server

```bash
python app.py
```

> The backend server will start running at **`http://localhost:5000`** (or `http://127.0.0.1:5000`).

---

### 2. Run the Frontend (Vite + React)

Open a **new** terminal window and navigate to the `frontend` directory:

```bash
cd frontend
```

#### Step 2A: Install Node Packages

```bash
npm install
```

#### Step 2B: Launch Development Server

```bash
npm run dev
```

> The frontend web application will start at **`http://localhost:3000`** (or `http://localhost:5173`). Open this URL in your web browser.

---

### 🌐 Vercel Deployment

- **Root Directory Settings**: In your Vercel Project Settings, set the **Root Directory** to `frontend`. Vercel will automatically detect the Vite React structure.
- **Frontend SPA Routing**: Vercel handles page redirects and rewrites for Vite single-page app routes using the configuration inside [frontend/vercel.json](file:///f:/Projects/AlzheimersPRoject/frontend/vercel.json).

---

## 🔐 How to Login to the Researcher Dashboard

1. Open the application in your browser (`http://localhost:3000`).
2. Click **Login** on the top navigation bar or navigate directly to `http://localhost:3000/login`.
3. Enter the default administrator credentials:

   | Field | Credential |
   | :--- | :--- |
   | **Email** | `admin@login.com` *(Pre-filled / Pinned)* |
   | **Password** | `admin123` |

4. **Password Visibility**: Click the **Eye Icon** button on the right side of the password field to view or hide your password.
5. Click **Sign In**. You will be redirected to the **Researcher Dashboard** (`/dashboard`).

---

## 🔬 How to Analyze MRI Scan Results

1. **Navigate to Analysis Form**:
   - On the homepage (`/`), click the **Start Free Analysis** CTA button or click **Generate Report** in the navbar to scroll down to the MRI upload form.

2. **Fill Patient Information**:
   - **Full Name**: Enter patient's full name.
   - **Age**: Enter patient's age (1 – 120).
   - **Gender**: Select Male, Female, or Other.
   - **Patient Code**: (Optional) Enter patient code (e.g., `P-101`).
   - **Doctor's Name**: (Optional) Enter referring physician's name.
   - **Email**: Enter email address to receive analysis notifications.
   - **City**: Enter city name.
   - **Consent Given**: Select **"Yes, I give consent"** *(Required)*.

3. **Upload MRI Scan Image**:
   - Click the file upload box or drag and drop a brain MRI scan image (`.jpg`, `.png`, or `.jpeg` formats up to 10MB).
   - An image preview will appear.

4. **Submit for Processing**:
   - Click **Analyze MRI Scan**.

5. **Review Diagnostic Results**:
   - View the diagnostic stage (e.g., *Normal / NonDemented*, *Very Mild Demented*, etc.).
   - Check the **AI Confidence Level Meter** (0% – 100%).
   - Read clinical recommendations and next steps.
   - Download the generated **PDF Diagnostic Report** or view generated heatmap visuals.

---

## 👨‍💻 Team & Credits

- **Developed by**: Mohammad Noman and Team
- **Repository**: [Alzheimers-Detection-Using-ML](https://github.com/mohammadnomancoc-eng/Alzheimers-Detection-Using-ML)
- **Contact**: `mohammadnomancoc@gmail.com`

---

*Disclaimer: This tool is intended for research and educational screening purposes. Clinical diagnoses should always be confirmed by qualified medical professionals.*
