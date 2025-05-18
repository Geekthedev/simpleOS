
# SimpleOS

A primitive command-line interface operating system simulation built entirely in vanilla JavaScript.

## Overview

SimpleOS is a lightweight JavaScript-based OS simulation that runs in both browser and Node.js environments. It implements core OS functionality including file system operations, process management, and a command-line interface with familiar Unix-like commands.

This project demonstrates fundamental operating system concepts in a pure JavaScript implementation without any dependencies. It's designed to be educational and to illustrate how OS components interact.

## Features

### Core OS Components

- **Kernel**: Central system management and command execution
- **File System**: Hierarchical directory structure with files and folders
- **Process Management**: Process creation, listing, and termination
- **Shell Interface**: Command-line interaction with history navigation

### Command Set

SimpleOS supports the following commands:

| Command | Description | Usage |
|---------|-------------|-------|
| `help` | Display available commands | `help` |
| `echo` | Print text to console | `echo [text]` |
| `ls` | List directory contents | `ls [directory]` |
| `cd` | Change directory | `cd [directory]` |
| `pwd` | Print working directory | `pwd` |
| `cat` | Display file contents | `cat [file]` |
| `mkdir` | Create a new directory | `mkdir [directory]` |
| `touch` | Create an empty file | `touch [file]` |
| `rm` | Remove file or directory | `rm [file/directory]` |
| `write` | Write text to a file | `write [file] [text]` |
| `ps` | List running processes | `ps` |
| `kill` | Terminate a process | `kill [pid]` |
| `whoami` | Display current user | `whoami` |
| `date` | Display current date/time | `date` |
| `uptime` | Show system uptime | `uptime` |
| `clear` | Clear the screen | `clear` |
| `shutdown` | Shut down the system | `shutdown` |

### File System Structure

The file system follows a Unix-like structure:

```
/
├── home/
│   └── user/
│       └── readme.txt
├── bin/
└── etc/
    └── passwd
```

## Getting Started

### Browser Usage

1. Create an HTML file with the following content:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SimpleOS</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #111;
        }
    </style>
</head>
<body>
    <script src="simpleOS.js"></script>
</body>
</html>
```

2. Copy the SimpleOS code into a file named `simpleOS.js`
3. Open the HTML file in any modern browser

### Node.js Usage

1. Copy the SimpleOS code into a file named `simpleOS.js`
2. Run the script using Node.js:

```
node simpleOS.js
```

## How It Works

### Architecture

SimpleOS uses a modular design pattern with two main components:

1. **SimpleOS**: The core OS functionality, implemented as a self-contained module using the revealing module pattern
2. **SimpleShell**: The user interface that interacts with the core OS

### Implementation Details

- The file system is represented as a nested JavaScript object structure
- Processes are tracked using a simple object-based registry
- The shell provides command history navigation using arrow keys
- The OS maintains state including the current working directory and active user

## Educational Value

This project demonstrates several important concepts:

- Basic operating system architecture
- Command parsing and execution
- File system path resolution
- Process management fundamentals
- Terminal UI interaction

## Limitations

As a simulation, SimpleOS has several limitations:

- No true multitasking or process isolation
- Limited security model
- No networking capabilities
- No persistent storage (state is lost on refresh/restart)
- Simplified implementation of many commands

## Future Enhancements

Possible improvements to consider:

- Add user authentication and permissions
- Implement basic text editor
- Add more advanced file operations
- Develop simple programming language interpreter
- Implement basic networking simulation
- Add persistent storage using localStorage or IndexedDB

## License

This project is released under the MIT License.

## Author

Created as a demonstration project for educational purposes. ~ Anointed Joseph (soem)

---

*Note: SimpleOS is intended as an educational tool to understand OS concepts. It does not provide actual operating system functionality and should not be used for production purposes.*
