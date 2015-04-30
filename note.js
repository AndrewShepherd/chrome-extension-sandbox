var timeoutID;
var fileEntry;
var fileWriter;
var directoryEntry;
var dirty = false;

function showMessage(msg, good) {
  console.log(msg);
  var messageElement = document.querySelector("#message");
  messageElement.style.color = good ? "green" : "red";
  messageElement.innerHTML = msg;
  if(timeoutID) {
    clearTimeout(timeoutID);
  }
  timeoutID = setTimeout(
        function() {
          messageElement.innerHTML = "&nbsp";
        },
        5000
    );
}

function errorHandler(e) {
  console.dir(e);
  var msg;
  if(e.target && e.target.error) {
    e = e.target.error;
  }
  if(e.message) {
    msg = e.message;
  } else if (e.name) {
    msg = e.name;
  }
  else if (e.code) {
    msg = "Code " + e.code;
  }
  else {
    msg = e.toString();
  }
  showMessage('Error: ' + msg);
}


// We want a persister class
// Has two methods
//   - read(function(text) {});
//   - save(text)

function Persister() {
  
  
  this.read = function(callback) {
    
  }
  
  this.save = function(text) {
    
  }
}





function getFileEntry(callback) {
  showMessage('getFileEntry invoked', true);
  if (fileWriter) {
    callback();
  }
  else if (directoryEntry) {
    var successCallback = function(fe) {
      fileEntry = fe;
      fileEntry.createWriter(
          function(fw) {
            fileWriter = fw;
            callback();
          },
          errorHandler
        );
    };
    directoryEntry.getFile(
      'note.txt',
      {
        create: true,
        exclusive: false
      },
      successCallback,
      errorHandler
      );
  }
}


function haveFile(file) {
  var reader = new FileReader();
  reader.onload = function() {
    document.querySelector("#textarea").value = reader.result;
  };
  reader.readAsText(file);
}

function read() {
  getFileEntry(
      function() {
        if(fileEntry) {
          fileEntry.file(haveFile, errorHandler);
        }
      }
    );
}

function haveNoteDirectory(de) {
  showMessage('haveNoteDirectory invoked', true);
  directoryEntry = de;
  read();
}

function haveFileSystem(fs) {
  showMessage('haveFileSystem invoked!', true);
  fs.root.getDirectory(
    "Note", 
    {
      create: true,
      exclusive: false
    },
    haveNoteDirectory,
    errorHandler
  );
}




var persister = new Persister();

function save(e) {
  showMessage("You clicked save!", true);
  getFileEntry(
      function() {
        showMessage("save: getFileEntry anonymous callback");
        fileWriter.onWrite = function(e) {
          dirty = false;
          showMessage("Saved", true);
        };
        var blob = new Blob(
                              [document.querySelector("#textarea").value],
                              {type: 'text/plain'}
                          );
        fileWriter.write(blob);
      }
    );
}


window.onload = function() {
  
  persister.read(function(text) {
        document.querySelector("#textarea").value = reader.result;
  });
  var requestFileSystem = window.webkitRequestFileSystem || window.requestFileSystem;
  requestFileSystem(PERSISTENT, 0, haveFileSystem, errorHandler);
  document.querySelector("#save").addEventListener("click", save);
};