# EduControl: LAN Classroom Management

A localized network control system for Windows-based classrooms.

## Components

1.  **Central Hub (Admin/Teacher Server)**:
    -   Built with Node.js/Express.
    -   Runs on the Teacher workstation.
    -   Handles all WebSocket traffic and state.
2.  **Student UI (Web)**:
    -   Browser-based view for monitoring instructions and status.
3.  **Student Agent (Python)**:
    -   Runs in the background on student Windows machines.
    -   Connects to the Teacher machine's IP.
    -   Monitors processes and enforces restrictions.

## Deployment & Installation

### 1. Generate Windows (.exe) Installer
To package the application as a standalone Windows executable:
1. Clone this repository locally.
2. Install dependencies: `npm install`
3. Generate the installer: `npm run electron:build`
4. The `.exe` installer will be available in the `release/` directory.

### 2. Desktop Mode (Dev)
To run the application in a desktop window during development:
```bash
npm run electron:dev
```

### 3. Deploy Student Agents (Student Machines)
The student machines require the background agent. 
- Install Python 3.
- Install requirements: `pip install "python-socketio[client]" psutil`
- Run `agent/student_agent.py` on the student machines, pointing to the Teacher's LAN IP.

## Security Design
- **No Cloud Required**: All traffic stays within the local subnet.
- **WebSocket Protocol**: Real-time bidirectional control with <5ms latency.
- **Process Isolation**: The Python agent uses privileged hooks to monitor and terminate unauthorized software.
