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
  


  

  
  function haveNoteDirectory(de) {
    showMessage('haveNoteDirectory invoked', true);
    directoryEntry = de;
    read();
  }


  
  var fileSystemReady = new Promise(function (resolve, reject) {

    var requestFileSystem = window.webkitRequestFileSystem || window.requestFileSystem;
    requestFileSystem(PERSISTENT, 0, resolve, reject);

  });


  // Not sure the best way to chain promises
  var noteDirectoryReady = new Promise(function (resolve, reject) {
      fileSystemReady.then(function(fs) {
        showMessage('fileSystemReady promise fulfilled', true);
        fs.root.getDirectory(
          "Note",
          {
            create: true,
            exclusive: false
          },
          resolve,
          errorHandler
        );
      },
      reject);
  });


  var fileEntryReady = new Promise(function (resolve, reject) {
    noteDirectoryReady.then(function(directoryEntry) {
       showMessage('Directory promise fulfilled', true);
       directoryEntry.getFile(
        'note.txt',
        {
          create: true,
          exclusive: false
        },
        resolve,
        reject
        );
    },
    reject);
  });

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

  
  this.read = function(callback) {
    fileEntryReady.then(function(fileEntry) {
      showMessage('fileReady promise fulfilled', true);

      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onload = function() {
          callback(reader.result);
        };
        reader.readAsText(file);
      }, 
      errorHandler
      );
    },
    errorHandler);
  };
  
  this.save = function(text) {
    showMessage('Persister.save invoked', true);  
    fileEntryReady.then(function (fileEntry) {
      showMessage('Persister.save - fileEntryReady promise fulfilled', true);
      fileEntry.createWriter(function (fileWriter) {
        var blob = new Blob(
                                [text],
                                {type: 'text/plain'}
                            );
        fileWriter.onwrite = function(e) {
            dirty = false;
            showMessage("Saved", true);
          };
        fileWriter.write(blob);
      },
      errorHandler)
    });
    getFileEntry(
        function() {
          showMessage("save: getFileEntry anonymous callback");


        }
      );   
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











var persister = new Persister();

function save(e) {
  
  var text = document.querySelector('#textarea').value;
  persister.save(text);
  
}


window.onload = function() {
  persister.read(function(text) {
        document.querySelector("#textarea").value = text;
  });

  document.querySelector("#save").addEventListener("click", save);
};