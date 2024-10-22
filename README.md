# Gitpfview

Gitpfview was a fun project designed to boost your GitHub README.md profile or repo view counters by simulating multiple visits to a specified GitHub URL. Perfect for users looking to increase visibility.

## Features
- **User Input**: Prompts for a GitHub URL and the number of visits.
- **Random User-Agent Rotation**: Uses a set of User-Agent strings to simulate different browser visits.
- **Retry Mechanism**: Implements a retry mechanism for failed visits.
- **Progress Feedback**: Provides detailed output during execution.

## Installation

### Requirements
- Node.js (>= 12.x)
- Puppeteer
- Chalk
- Ora

### Steps
Clone the repository:
   ```bash
   git clone https://github.com/ScribeAegis/gitpfview.git
   cd Gitpfview
   ```
## Install dependencies:
```
npm install
```
## Run the script:
```
node gitpfview.js
```
## Usage
```
When prompted, enter a valid GitHub URL (e.g., https://github.com/username/repo) then you will be asked to specify the number of visits.
```
## License
```
This project is licensed under the MIT License - see the LICENSE file for details.
```
