const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs'); 
const multer = require('multer');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;



// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, path.join(__dirname, 'public', 'images'));
    } else if (file.mimetype.startsWith('audio/')) {
      cb(null, path.join(__dirname, 'public', 'sounds'));
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: function (req, file, cb) {
    const objectName = req.body.objectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const extension = path.extname(file.originalname);
    cb(null, objectName + extension);
  }
});

const upload = multer({ storage: storage });
//app.use(express.static(path.join(__dirname, 'public')));


// SERVE STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));




// UPLOADS
app.post('/upload', upload.fields([{ name: 'image' }, { name: 'sound' }]), (req, res) => {
  const objectName = req.body.objectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const imageFile = req.files['image'][0];
  const soundFile = req.files['sound'][0];

  // Paths
  const imagePath = `/images/${imageFile.filename}`;
  const soundPath = `/sounds/${soundFile.filename}`;
  const htmlFilePath = path.join(__dirname, 'public', `${objectName}.html`);

  // Template HTML
  const templatePath = path.join(__dirname, 'public', 'template.html');
  fs.readFile(templatePath, 'utf8', (err, template) => {
    if (err) {
      return res.status(500).send('Error reading template');
    }

    // Replace variables in template
    const newHtml = template
      .replace(/\${name}/g, objectName)
      .replace(/\${image}/g, imagePath)
      .replace(/\${sound}/g, soundPath);

    // Write new HTML file
    fs.writeFile(htmlFilePath, newHtml, (err) => {
      if (err) {
        return res.status(500).send('Error creating HTML file');
      }

      res.send('Upload successful! <a href="/">Go back</a>');
    });
  });
});

// Serve upload form
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});







// Initial log to verify server start
console.log('Server is starting...');

// Test route to check if routes are working
app.get('/test', (req, res) => {
  console.log('GET /test request received');
  res.send('Test route is working');
});



// Serve 'world' subdirectory specifically
app.get('/world', (req, res) => {
  const worldIndexPath = path.join(__dirname, 'public', 'world', 'index.html');
  res.sendFile(worldIndexPath);
});


let connections = [];

const worldNamespace = io.of('/world');

worldNamespace.on('connection', (socket) => {
    socket.on('requestConnections', () => {
      socket.emit('connectionsUpdate', connections);
    });
});

function updateConnections() {
  io.emit('connectionsUpdate', connections); 
  worldNamespace.emit('connectionsUpdate', connections); 
}


io.on('connection', (socket) => {
  
  // IDENTITY
  socket.on('identity', (identity) => {
     socket.user = {
      id: socket.id,
      identity: identity.identity,
      audio: identity.audio, 
      image: identity.image ,
      audioState: {
          playing: identity.audioState.playing,
          playbackRate: identity.audioState.playbackRate,
          preservesPitch: identity.audioState.preservesPitch,
          volume: identity.audioState.volume,
      },
      position: {
        left: identity.position.left,
        top: identity.position.top,
      },
      zindex: identity.zindex,
      };
    connections.push(socket.user); 
    console.log(socket.user);
    updateConnections();
  });
  
  socket.on('disconnect', () => {
    if (socket.user) {
      connections = connections.filter(conn => conn.id !== socket.id); 
      worldNamespace.emit('removeConnection', socket.id); 
      updateConnections(); 
    }
  });
  
  
  
  // BROADCAST DATA
  
  socket.on('sendData', (data) => {
    if (socket.user) {
      socket.broadcast.emit('receiveData', {
        identity: socket.user.identity,
        action: data.action,
        intensity: data.intensity
      });
    }
  });
  
  
  // AUDIO

  socket.on('updateAudio', (audioState) => {
    if (socket.user) {
      socket.user.audioState = audioState;
      updateConnections();
    }
  });
  

  socket.on('changeAudio', (audio) => {
    if (socket.user) {
      socket.user.audio = audio;
      updateConnections();
    }
  });
  
  // VISUALS

  socket.on('updateVisuals', (styles) => {
    if (socket.user) {
      socket.user.styles = styles;
      updateConnections();
    }
  });
  
  socket.on('changeImage', (image) => {
    if (socket.user) {
      socket.user.image = image;
      updateConnections();
    }
  });

  
  socket.on('updatePosition', (data) => {
    if (socket.user) {
      socket.user.position.left = data.x;
      socket.user.position.top = data.y;
      updateConnections();
    }
  });

});


// List HTML files in public directory
app.get('/api/html-files', (req, res) => {
  const publicDir = path.join(__dirname, 'public');
  fs.readdir(publicDir, (err, files) => {
    if (err) {
      console.error('Unable to scan directory:', err);
      return res.status(500).send('Unable to scan directory');
    }

    // Filter out non-HTML files and 'index.html'
    const htmlFiles = files.filter(file => file.endsWith('.html') && file !== 'index.html' && file !== 'upload.html' && file !== 'template.html');
    res.json(htmlFiles);
  });
});


//server.listen(PORT, localIP, () => {
//  console.log(`A beautiful world alive on http://${localIP}:${PORT}`);
//});

//
server.listen(PORT, () => {
  console.log(`A beautiful world alive on ${PORT}`);
});
