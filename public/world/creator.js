// $(document).ready(function() {
//     // Fetch HTML files from the server using jQuery
//     // URL of the image on your server
//     const imageUrl = '../images/airplane.gif';

//     // Set the image source to the server URL
//     // $('#myImage').attr('src', imageUrl);

//     let stuff = $('#world');

//     let d = $(`<span object><img src='${imageUrl}'></span>`)
//         .css("left", `40%`)
//         .css("top", `20%`)

//     $(d).addClass("fake_obj");

//     $(d).appendTo(stuff);

//     let da = $(`<span object><img src='../images/bunny.gif'></span>`)
//         .css("left", `80%`)
//         .css("top", `40%`)

//     $(da).addClass("fake_obj");

//     $(da).appendTo(stuff);
    
//   });


  $(document).ready(function() {

    let stuff = $('#world');
    let addedImages = []; // Array to keep track of added images
    let maxImages = 13;   // Maximum number of images before we start removing
    let minImages = 5;    // Minimum number of images to keep on the screen

    let imageList = []
    // Fetch HTML files from the server using jQuery
    $.ajax({
      url: '/api/gifs',
      method: 'GET',
      dataType: 'json',
      success: function(files) {
        // Ensure files is an array of strings
        if (Array.isArray(files)) {
          files.forEach(function(file) {
            // Ensure file is a string and ends with '.gif'
            if (typeof file === 'string' && file.endsWith('.gif')) {
                const fileName = file.replace('.gif', '');
            } else {
              console.error('Unexpected file format:', file);
            }
          });
        } else {
          console.error('Expected an array of files:', files);
        }
        imageList = files;
        console.log(imageList)

        function randomImage(images) {
            const randomIndex = Math.floor(Math.random() * images.length); // Generate a random index

            let chosen = images[randomIndex];
            let randX = Math.floor(Math.random() * 90);
            let randY = Math.floor(Math.random() * 90);

            const imageUrl = '../images/' + chosen;

            console.log(randX)
            console.log(randY)
            console.log(chosen)

            // Set the image source to the server URL
            // $('#myImage').attr('src', imageUrl);

            let d = $(`<span object><img src='${imageUrl}'></span>`)
                .css("left", `${randX}%`)
                .css("top", `${randY}%`)

            $(d).addClass("fake_obj");

            $(d).appendTo(stuff);
            addedImages.push(d);

            // If there are more than maxImages, remove the oldest
            if (addedImages.length > maxImages) {
                let oldestImage = addedImages.shift(); // Remove the first added image (oldest)
                $(oldestImage).remove(); // Remove the oldest image from the DOM
            }
        }
        
        // Function to continuously add and remove images
      function startImageCycle() {
        let addingImages = true; // Track if we're in the "adding phase"

        setInterval(function() {
          if (addingImages) {
            randomImage(imageList); // Add a new random image

            // If there are 13 images, switch to the removal phase
            if (addedImages.length >= maxImages) {
              addingImages = false; // Stop adding and start removing
            }
          } else {
            // Remove the oldest image if there are more than 5 images
            if (addedImages.length > minImages) {
              let oldestImage = addedImages.shift(); // Remove oldest image
              $(oldestImage).remove(); // Remove from DOM

              // If we've reached 5 images, switch back to the adding phase
              if (addedImages.length <= minImages) {
                addingImages = true; // Switch back to adding images
              }
            }
          }
        }, 5000); // Repeat every 3 seconds
      }


        // Start the image cycle
        startImageCycle();


      },
      error: function(xhr, status, error) {
        console.error('Error fetching files:', error);
      }
    });


    


  });