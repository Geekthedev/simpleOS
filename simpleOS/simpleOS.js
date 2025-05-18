/**
 * SimpleOS - A primitive CLI operating system simulation in vanilla JavaScript
 * Built from scratch with no dependencies
 */

// OS Kernel - Core functionality
const SimpleOS = (function() {
  // Private OS state
  const state = {
    running: true,
    currentUser: "user",
    currentDirectory: "/home/user",
    startTime: new Date()
  };

  // File System
  const fileSystem = {
    "/": {
      type: "directory",
      contents: {
        "home": {
          type: "directory",
          contents: {
            "user": {
              type: "directory",
              contents: {
                "readme.txt": {
                  type: "file",
                  content: "Welcome to SimpleOS!\nType 'help' for available commands.",
                  size: 47,
                  created: new Date()
                }
              }
            }
          }
        },
        "bin": {
          type: "directory",
          contents: {}
        },
        "etc": {
          type: "directory",
          contents: {
            "passwd": {
              type: "file",
              content: "user:x:1000:1000:Default User:/home/user:/bin/sh",
              size: 45,
              created: new Date()
            }
          }
        }
      }
    }
  };

  // Process management
  const processes = {
    1: {
      pid: 1,
      name: "init",
      status: "running",
      started: new Date(),
      user: "root"
    },
    2: {
      pid: 2,
      name: "shell",
      status: "running",
      started: new Date(),
      user: "user"
    }
  };

  let nextPid = 3;

  // Event history
  const systemLog = [
    {time: new Date(), level: "INFO", message: "System initialized"}
  ];

  // Helper functions
  function getPathObject(path) {
    if (path === "/") return fileSystem["/"];
    
    const isAbsolute = path.startsWith("/");
    const resolvedPath = isAbsolute ? path : state.currentDirectory + "/" + path;
    const parts = resolvedPath.split("/").filter(p => p.length > 0);
    
    let current = fileSystem["/"];
    for (const part of parts) {
      if (!current.contents || !current.contents[part]) {
        return null;
      }
      current = current.contents[part];
    }
    return current;
  }

  function getParentDirectory(path) {
    const parts = path.split("/").filter(p => p.length > 0);
    if (parts.length === 0) return null;
    
    parts.pop(); // Remove last element
    let parent = fileSystem["/"];
    
    for (const part of parts) {
      if (!parent.contents || !parent.contents[part]) {
        return null;
      }
      parent = parent.contents[part];
    }
    
    return parent;
  }

  function getDirectoryFromPath(path) {
    const isAbsolute = path.startsWith("/");
    const resolvedPath = isAbsolute ? path : state.currentDirectory + "/" + path;
    const parts = resolvedPath.split("/").filter(p => p.length > 0);
    
    let current = fileSystem["/"];
    let currentPath = "/";
    
    for (const part of parts) {
      if (!current.contents || !current.contents[part]) {
        return {dir: current, path: currentPath};
      }
      current = current.contents[part];
      currentPath += part + "/";
    }
    
    return {dir: current, path: currentPath};
  }

  function resolvePath(path) {
    if (path.startsWith("/")) {
      return path; // Absolute path
    }
    
    let result = state.currentDirectory;
    if (!result.endsWith("/")) {
      result += "/";
    }
    return result + path;
  }

  function logEvent(level, message) {
    systemLog.push({
      time: new Date(),
      level,
      message
    });
    
    if (level === "ERROR") {
      console.error(`[${level}] ${message}`);
    }
  }

  // Public API
  return {
    boot: function() {
      logEvent("INFO", "SimpleOS is booting...");
      return "SimpleOS v0.1 - Primitive JavaScript OS Simulation\nType 'help' for available commands.";
    },
    
    execute: function(command) {
      if (!command || !command.trim()) {
        return "";
      }
      
      logEvent("INFO", `Executing: ${command}`);
      
      const parts = command.trim().split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      // Command implementations
      switch(cmd) {
        case "help":
          return [
            "Available commands:",
            "  help                 - Show this help",
            "  echo [text]          - Print text to console",
            "  ls [directory]       - List files in directory",
            "  cd [directory]       - Change directory",
            "  pwd                  - Print working directory",
            "  cat [file]           - Show file contents",
            "  mkdir [directory]    - Create a new directory",
            "  touch [file]         - Create an empty file",
            "  rm [file/directory]  - Remove file or directory",
            "  write [file] [text]  - Write text to file",
            "  ps                   - List running processes",
            "  kill [pid]           - Kill a process",
            "  whoami               - Display current user",
            "  date                 - Display current date/time",
            "  uptime               - Show system uptime",
            "  clear                - Clear the screen",
            "  shutdown             - Shut down the system"
          ].join("\n");
          
        case "echo":
          return args.join(" ");
          
        case "ls":
          const targetDir = args[0] ? getPathObject(args[0]) : getPathObject(state.currentDirectory);
          
          if (!targetDir) {
            return `ls: cannot access '${args[0]}': No such file or directory`;
          }
          
          if (targetDir.type !== "directory") {
            return `ls: cannot list '${args[0]}': Not a directory`;
          }
          
          if (!targetDir.contents || Object.keys(targetDir.contents).length === 0) {
            return ""; // Empty directory
          }
          
          return Object.entries(targetDir.contents).map(([name, obj]) => {
            const isDir = obj.type === "directory";
            return `${isDir ? "[DIR] " : ""}${name}${isDir ? "/" : ""}`;
          }).join("\n");
          
        case "cd":
          if (!args[0]) {
            state.currentDirectory = "/home/user";
            return "";
          }
          
          const newPath = args[0];
          
          if (newPath === "..") {
            // Go up one level
            const parts = state.currentDirectory.split("/").filter(p => p.length > 0);
            if (parts.length > 0) {
              parts.pop();
              state.currentDirectory = "/" + parts.join("/");
              return "";
            } else {
              state.currentDirectory = "/";
              return "";
            }
          }
          
          const targetPath = resolvePath(newPath);
          const target = getPathObject(targetPath);
          
          if (!target) {
            return `cd: ${newPath}: No such file or directory`;
          }
          
          if (target.type !== "directory") {
            return `cd: ${newPath}: Not a directory`;
          }
          
          state.currentDirectory = targetPath;
          return "";
          
        case "pwd":
          return state.currentDirectory;
          
        case "cat":
          if (!args[0]) {
            return "cat: missing file operand";
          }
          
          const file = getPathObject(args[0]);
          
          if (!file) {
            return `cat: ${args[0]}: No such file or directory`;
          }
          
          if (file.type !== "file") {
            return `cat: ${args[0]}: Is a directory`;
          }
          
          return file.content;
          
        case "mkdir":
          if (!args[0]) {
            return "mkdir: missing operand";
          }
          
          const dirName = args[0];
          const parentPath = state.currentDirectory;
          const {dir: parentDir} = getDirectoryFromPath(parentPath);
          
          if (!parentDir || parentDir.type !== "directory") {
            return `mkdir: cannot create directory '${dirName}': No such file or directory`;
          }
          
          const resolvedDirPath = resolvePath(dirName);
          const dirParts = resolvedDirPath.split("/").filter(p => p.length > 0);
          const newDirName = dirParts[dirParts.length - 1];
          
          // Remove the new directory name to get the parent path
          dirParts.pop();
          
          // Navigate to parent directory where we want to create the new dir
          let currentObj = fileSystem["/"];
          for (const part of dirParts) {
            if (!currentObj.contents[part]) {
              return `mkdir: cannot create directory '${dirName}': No such file or directory`;
            }
            currentObj = currentObj.contents[part];
          }
          
          if (currentObj.contents[newDirName]) {
            return `mkdir: cannot create directory '${dirName}': File exists`;
          }
          
          // Create the new directory
          currentObj.contents[newDirName] = {
            type: "directory",
            contents: {}
          };
          
          return "";
          
        case "touch":
          if (!args[0]) {
            return "touch: missing file operand";
          }
          
          const fileName = args[0];
          const parentPathForFile = state.currentDirectory;
          const {dir: parentDirForFile} = getDirectoryFromPath(parentPathForFile);
          
          if (!parentDirForFile || parentDirForFile.type !== "directory") {
            return `touch: cannot touch '${fileName}': No such file or directory`;
          }
          
          const resolvedFilePath = resolvePath(fileName);
          const fileParts = resolvedFilePath.split("/").filter(p => p.length > 0);
          const newFileName = fileParts[fileParts.length - 1];
          
          // Remove the new file name to get the parent path
          fileParts.pop();
          
          // Navigate to parent directory where we want to create the new file
          let currentObjForFile = fileSystem["/"];
          for (const part of fileParts) {
            if (!currentObjForFile.contents[part]) {
              return `touch: cannot touch '${fileName}': No such file or directory`;
            }
            currentObjForFile = currentObjForFile.contents[part];
          }
          
          // Create the new file if it doesn't exist
          if (!currentObjForFile.contents[newFileName]) {
            currentObjForFile.contents[newFileName] = {
              type: "file",
              content: "",
              size: 0,
              created: new Date()
            };
          }
          
          return "";
          
        case "rm":
          if (!args[0]) {
            return "rm: missing operand";
          }
          
          const pathToRemove = args[0];
          const resolvedPathToRemove = resolvePath(pathToRemove);
          const pathParts = resolvedPathToRemove.split("/").filter(p => p.length > 0);
          const nameToRemove = pathParts[pathParts.length - 1];
          
          // Remove the name to get the parent path
          pathParts.pop();
          
          // Navigate to parent directory
          let parentObjForRemove = fileSystem["/"];
          for (const part of pathParts) {
            if (!parentObjForRemove.contents[part]) {
              return `rm: cannot remove '${pathToRemove}': No such file or directory`;
            }
            parentObjForRemove = parentObjForRemove.contents[part];
          }
          
          if (!parentObjForRemove.contents[nameToRemove]) {
            return `rm: cannot remove '${pathToRemove}': No such file or directory`;
          }
          
          // Remove the item
          delete parentObjForRemove.contents[nameToRemove];
          return "";
          
        case "write":
          if (args.length < 2) {
            return "write: missing file operand or content";
          }
          
          const fileToWrite = args[0];
          const contentToWrite = args.slice(1).join(" ");
          const fileObj = getPathObject(fileToWrite);
          
          if (!fileObj) {
            // File doesn't exist, let's create it
            const resolvedWritePath = resolvePath(fileToWrite);
            const writePathParts = resolvedWritePath.split("/").filter(p => p.length > 0);
            const newWriteFileName = writePathParts[writePathParts.length - 1];
            
            // Remove the new file name to get the parent path
            writePathParts.pop();
            
            // Navigate to parent directory
            let currentWriteObj = fileSystem["/"];
            for (const part of writePathParts) {
              if (!currentWriteObj.contents[part]) {
                return `write: cannot write to '${fileToWrite}': No such directory`;
              }
              currentWriteObj = currentWriteObj.contents[part];
            }
            
            // Create the new file
            currentWriteObj.contents[newWriteFileName] = {
              type: "file",
              content: contentToWrite,
              size: contentToWrite.length,
              created: new Date()
            };
          } else {
            // File exists, update its content
            if (fileObj.type !== "file") {
              return `write: cannot write to '${fileToWrite}': Is a directory`;
            }
            
            fileObj.content = contentToWrite;
            fileObj.size = contentToWrite.length;
          }
          
          return "";
          
        case "ps":
          return [
            "PID  USER     STATUS    STARTED             COMMAND",
            ...Object.values(processes).map(proc => 
              `${proc.pid.toString().padEnd(4)} ${proc.user.padEnd(8)} ${proc.status.padEnd(9)} ${proc.started.toLocaleString()} ${proc.name}`
            )
          ].join("\n");
          
        case "kill":
          if (!args[0]) {
            return "kill: missing PID operand";
          }
          
          const pidToKill = parseInt(args[0]);
          
          if (isNaN(pidToKill)) {
            return `kill: invalid PID: ${args[0]}`;
          }
          
          if (pidToKill === 1) {
            return "kill: cannot kill init process";
          }
          
          if (!processes[pidToKill]) {
            return `kill: no process with PID ${pidToKill}`;
          }
          
          processes[pidToKill].status = "terminated";
          setTimeout(() => {
            delete processes[pidToKill];
          }, 1000);
          
          return `Process with PID ${pidToKill} terminated`;
          
        case "whoami":
          return state.currentUser;
          
        case "date":
          return new Date().toString();
          
        case "uptime":
          const uptimeMs = new Date() - state.startTime;
          const uptimeSec = Math.floor(uptimeMs / 1000);
          const uptimeMin = Math.floor(uptimeSec / 60);
          const uptimeHours = Math.floor(uptimeMin / 60);
          
          return `Uptime: ${uptimeHours}h ${uptimeMin % 60}m ${uptimeSec % 60}s`;
          
        case "clear":
          // Special command handled by the shell
          return "__CLEAR__";
          
        case "shutdown":
          state.running = false;
          return "System is shutting down...";
          
        default:
          return `${cmd}: command not found`;
      }
    },
    
    isRunning: function() {
      return state.running;
    },
    
    getSystemInfo: function() {
      return {
        version: "0.1",
        startTime: state.startTime,
        currentUser: state.currentUser,
        processCount: Object.keys(processes).length
      };
    }
  };
})();

// Shell - The user interface to the OS
function SimpleShell(os) {
  const history = [];
  let historyIndex = 0;
  let promptText = "$ ";
  
  // Boot the OS
  console.log(os.boot());
  
  // Initialize the command line
  function initializeCommandLine() {
    // Create the DOM structure
    const terminal = document.createElement('div');
    terminal.className = 'terminal';
    terminal.style.fontFamily = 'monospace';
    terminal.style.backgroundColor = '#000';
    terminal.style.color = '#0f0';
    terminal.style.padding = '10px';
    terminal.style.height = '400px';
    terminal.style.overflowY = 'auto';
    terminal.style.whiteSpace = 'pre-wrap';
    terminal.style.margin = '0';
    
    const outputArea = document.createElement('div');
    outputArea.className = 'output-area';
    outputArea.style.marginBottom = '10px';
    
    const inputLine = document.createElement('div');
    inputLine.className = 'input-line';
    inputLine.style.display = 'flex';
    
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = promptText;
    
    const inputField = document.createElement('input');
    inputField.className = 'command-input';
    inputField.type = 'text';
    inputField.style.flexGrow = '1';
    inputField.style.backgroundColor = '#000';
    inputField.style.color = '#0f0';
    inputField.style.border = 'none';
    inputField.style.fontFamily = 'monospace';
    inputField.style.outline = 'none';
    
    inputLine.appendChild(prompt);
    inputLine.appendChild(inputField);
    
    terminal.appendChild(outputArea);
    terminal.appendChild(inputLine);
    
    document.body.appendChild(terminal);
    
    // Set focus
    inputField.focus();
    
    // Handle command input
    inputField.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        const command = inputField.value;
        
        // Add command to history
        if (command.trim()) {
          history.push(command);
          historyIndex = history.length;
        }
        
        // Display the command
        const commandLine = document.createElement('div');
        commandLine.textContent = promptText + command;
        outputArea.appendChild(commandLine);
        
        // Execute the command
        const result = os.execute(command);
        
        // Special case for clear command
        if (result === "__CLEAR__") {
          outputArea.innerHTML = '';
        } else if (result) {
          // Display the result
          const resultElement = document.createElement('div');
          resultElement.textContent = result;
          outputArea.appendChild(resultElement);
        }
        
        // Clear the input
        inputField.value = '';
        
        // Scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
        
        // Check if OS is still running
        if (!os.isRunning()) {
          terminal.style.backgroundColor = '#222';
          terminal.style.color = '#666';
          inputField.disabled = true;
          terminal.removeChild(inputLine);
          
          const shutdownMessage = document.createElement('div');
          shutdownMessage.textContent = 'System has been shut down. Refresh the page to restart.';
          shutdownMessage.style.marginTop = '20px';
          shutdownMessage.style.color = '#fff';
          outputArea.appendChild(shutdownMessage);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          inputField.value = history[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          inputField.value = history[historyIndex];
        } else if (historyIndex === history.length - 1) {
          historyIndex++;
          inputField.value = '';
        }
      }
    });
    
    // Keep focus on input
    terminal.addEventListener('click', function() {
      if (os.isRunning()) {
        inputField.focus();
      }
    });
  }
  
  if (typeof document !== 'undefined') {
    // Browser environment
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeCommandLine);
    } else {
      initializeCommandLine();
    }
  } else {
    // Node.js environment or something else
    console.log("SimpleOS is running in a non-browser environment.");
    console.log("Type commands after the prompt. Type 'help' for available commands.");
    
    let running = true;
    
    // Basic readline implementation for Node.js-like environments
    function readline() {
      return new Promise(resolve => {
        // This part depends on the environment
        // For browser environment, you would use different methods
        process.stdout.write(promptText);
        process.stdin.once('data', data => {
          resolve(data.toString().trim());
        });
      });
    }
    
    (async function loop() {
      while (running && os.isRunning()) {
        const command = await readline();
        const result = os.execute(command);
        
        if (result === "__CLEAR__") {
          console.clear();
        } else if (result) {
          console.log(result);
        }
        
        if (!os.isRunning()) {
          running = false;
        }
      }
    })();
  }
}

// Initialize the shell with the OS
SimpleShell(SimpleOS);

// For standalone script execution or importing as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimpleOS, SimpleShell };
}