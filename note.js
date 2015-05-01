var timeoutID;
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
				fileWriter.onwrite = function() {
					dirty = false;
					showMessage("Saved", true);
				}
				fileWriter.write(blob);
			};
		fileWriter.truncate(0);
      },
      errorHandler)
    });
  }
}


window.onload = function() {
  var persister = new Persister();
  persister.read(function(text) {
        document.querySelector("#textarea").value = text;
  });
  document.querySelector("#save").addEventListener("click", function() {
      var text = document.querySelector('#textarea').value;
      persister.save(text);
  });
};