
let audio = $("audio")[0];

// change a sound
$("audio")[0].addEventListener("play", function(){
   if (!$("audio")[0].paused) {
        $("#object img").addClass("pulse")
    }
});

$("audio")[0].addEventListener("pause", function(){
   if ($("audio")[0].paused) {
        $("#object img").removeClass("pulse")
    }
});

$("audio")[0].addEventListener("ended", function(){
   if ($("audio")[0].paused) {
        $("#object img").removeClass("pulse")
    }
});


function updateAudio(){
  
  let valplaybackRate = $("audio")[0].playbackRate;
  let valpreservesPitch = $("audio")[0].preservesPitch;
  let valVolume = $("audio")[0].volume;
  let valPlaying = !$("audio")[0].paused;
  
  $("#volume").attr("value", audio.volume);
  $("[volume]").html(audio.volume);
  
  console.log(valplaybackRate, valVolume, valPlaying);
  
  socket.emit('updateAudio', {
    playbackRate: valplaybackRate,
    preservesPitch: valpreservesPitch,
    volume: valVolume,
    playing: valPlaying
  });
}

function updateVisuals(){
  
  let styles = $('#object').css([
    'filter',
    'transform',
    'z-index',
   ]);

  console.log(styles);

  socket.emit('updateVisuals', JSON.stringify(styles));
  
}

function updatePosition(x, y){
  socket.emit('updatePosition', {x: x, y:y});
}


function changeAudio(song){
  
  // so it doesnt pause 
  if(!$("audio")[0].paused){
    $('audio').attr('src', song);
    $("audio")[0].play();
  } else{
    $('audio').attr('src', song);
  }
  
  socket.emit('changeAudio', song);
}

function changeImage(image){
  $('#object img').attr('src', image);
  socket.emit('changeImage', image);
}

$(document).on("input", "#volume", function(){
  let volume = $(this).val();
  $("audio")[0].volume = volume;
  $("[volume]").html(volume);
  updateAudio();
  
});

$(document).on("input", "#left", function(){
  let left = $(this).val();
  $("[left]").html(left);
  updatePosition(left, null);
  
});

$(document).on("input", "#right", function(){
  let right = $(this).val();
  $("[right]").html(right);
  updatePosition(null, right);
  
});


$(document).on("click", "#object", function(){
  let defaultLength = 32;
  
  // Play the sound when clicked
  Actions.play(defaultLength);
  
  updateAudio();
  updateVisuals();

  socket.emit('sendData', {
    action: "play", intensity: defaultLength
  });
  
});

$(document).on("click", "[action]", function(){

  console.log("Performing an action...")
  let action = $(this).attr("action");
  let intensity = $(this).attr("value");
  
//  interact(action, intensity);
  
  if(Actions && Actions[action]){
    write("You " + $(this).html().toLowerCase() + ": " + action);
    
    Actions[action](intensity);
    // update details accordingly
    updateAudio();
    updateVisuals();
  }

  
  socket.emit('sendData', {
    action: action, intensity: intensity
  });
  
});



socket.on('receiveData', (data) => {
  console.log('Received data:', data);
  
  
  console.log(`You are a ${Identity} responding to ${data.action}.`)
  
  if(Reactions && Reactions[data.identity] && Reactions[data.identity][data.action]){
    Reactions[data.identity][data.action](data.intensity);
    
    write("You are affected by a " + data.identity + "'s "  + data.action);
    
    updateAudio();
    updateVisuals();
  }

});




$(document).ready(function(){

  // change default volume
  let audioSource = $('audio').find('source').attr('src');

//  let imageSource = $('#object img').attr('src').replace('images/', '');
  let imageSource = $('#object img').attr('src');
  
  let positionLeft = randInt(LeftMin, LeftMax);
  let positionTop = randInt(TopMin, TopMax);

  let volDefault = $("#volume").val();
   $("audio")[0].volume = volDefault;
  $("[volume]").html(volDefault);

  let zIndexInitial = 1;

  socket.emit('identity', {
    identity: Identity,
    audio: audioSource,
    image: imageSource,
    position: {
      left: positionLeft,
      top: positionTop,
    },
    audioState: {
        playing: false,
        playbackRate: 1,
        preservesPitch: true,
        volume: volDefault
    },
    zindex: zIndexInitial,
  });
  
});

      
function softenAudio() {
  var currentVolume = audio.volume;
  if (currentVolume > 0.01) {
      audio.volume -= 0.005;
      updateAudio();
      setTimeout(softenAudio, 100); 
  } else {
      window.close();
  }
}


// Additional keypresses to make performance more fun

$(document).keydown(function(event){
    if(event.shiftKey && event.which == 68){ // Shift + D
      window.open(window.location.href, "_blank", `popup, width=190, height=200, top=${randInt(0,screen.height)},left=${randInt(0,screen.width)}`);
    }
    if(event.shiftKey && event.which == 69){ // Shift + E
      softenAudio();
    }
});